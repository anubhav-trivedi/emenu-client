angular.module('mk.Models')
    .factory('mkModelUtils', function($filter, $parse, mkData) {

        var self = {

            // Sets a property to be used as JSON
            // issues:
            // breeze cant detect changes, so you need to use save({forceModified: true})
            // Also breeze will replace the entire object after saving
            JSONDataType: {
                dataType: breeze.DataType.Undefined,
                properties: {
                    custom: {
                        parserFn: function(val) {
                            if (val == null || val == '') return {};
                            if (typeof val == 'string') return JSON.parse(val);
                            return val;
                        },
                        serializerFn: function(val) {
                            if (typeof val == 'object') return JSON.stringify(val);
                            return val;
                        }
                    }
                }
            },

            /**
             * Takes a model, and a list of fields and flattens the model into a single
             * flat object of the form { model: <model>, save: <save fn>, <field-name>: {value: <the value>}... }
             * Used by only mk-grid at the moment to simplify complex model graphs into a single editable object.
             *
             * The field value is a property that will get and set the original value from the model.
             *
             * E.g. for parseModels({filters: [{id: 'customer_name', value: 'customer.name'}]}, order), the result will be
             *
             * {model: order, customer_name: {value: 'Bob'}}
             *
             * parsed.customer_name.value = 'Terry' will set order.customer.name to 'Terry'
             *
             * @param options
             * @param model
             * @returns {{}}
             */
            parseModel: function(options, model) {
                var row = {},
                    joins = getJoins(options.joins, model);

                _.forEach(options.fields, function(field) {
                    var value = field.value,
                        fieldName = field.id || field.displayName,
                        fieldObj = row[fieldName] = {},
                        getter = null,
                        setter = null;

                    if (_.isFunction(value)) {
                        getter = function() {
                            return value(model, joins);
                        }
                    } else if (_.isString(value)) {
                        var getterSetter = createGetterSetter(value, model, joins);

                        // this code is to handle refreshing the getters and setters
                        // in case the model strucure has changed.
                        // e.g. a setter/getter for order.customer.name will break if the customer object is changed
                        // (the getter/setter will still be pointing at the old customer).
                        // But refreshing all the time is SLOW, so its disabled by default, unless options.deep is true
                        getter = getterSetter.getter && function() {
                            return refresh().getter();
                        };

                        setter = getterSetter.setter && function(value) {
                            return refresh().setter(value);
                        };

                        function refresh() {
                            if (options.deep) return createGetterSetter(value, model, joins);
                            else return getterSetter;
                        }
                    }

                    var property = {};
                    if (getter) property.get = getter;
                    if (setter) property.set = setter;

                    applyDefault(property, field);

                    Object.defineProperty(fieldObj, 'value', property);
                });

                row.model = model;
                row.save = function() {
                    return model.save();
                };

                return row;
            },

            parseModels: function(options, models) {
                return _.map(models, this.parseModel.bind(this, options));
            },

            makeQuery: function(options) {
                var orderBys = mku.normaliseArray(options.orderBy),
                    filters = mku.normaliseArray(options.filters),
                    joins = mku.normaliseArray(options.joins || options.include),
                    Model = options.model && mkData.getModel(options.model), // not needed if there is a baseQuery
                    query = options.baseQuery || breeze.EntityQuery
                        .from(Model && Model.resource)
                        .toType(Model.type),
                    predicates = [],
                    expands = [],
                    orders = [],
                    asNames = {};

                query.queryOptions = new breeze.QueryOptions({
                    mergeStrategy: options.mergeStrategy || breeze.MergeStrategy.OverwriteChanges
                });

                _.forEach(filters, function(filter) {
                    if (filter instanceof breeze.Predicate) {
                        predicates.push(filter);
                    } else if (_.isObject(filter)) {
                        _.forEach(filter, function(val, key) {
                            if (val.not !== undefined) {
                                predicates.push(breeze.Predicate.create(key, '!=', val.not));
                            } else {
                                var isArray = angular.isArray(val),
                                    predicate = breeze.Predicate.create(key, '==', isArray ? val[0] : val);
                                if (isArray) {
                                    for (var i = 1; i < val.length; ++i) {
                                        predicate = predicate.or(key, '==', val[i])
                                    }
                                }
                                predicates.push(predicate);
                            }
                        });
                    }
                });

                _.forEach(joins, function(join) {
                    expands.push(join.relation || join);
                    if(join.as) asNames[join.as] = true;
                });

                _.forEach(orderBys, function(orderBy) {
                    if (_.isString(orderBy)) {
                        orders.push(orderBy);
                    } else {
                        orders.push(orderBy.field + ' ' + orderBy.direction);
                    }
                });

                _.forEach(options.fields, function(field) {
                    var value = field.value;
                    if (_.isString(value)) {
                        var match = value.match(/(.*)\.[^\.]+$/); // get everything before the last dot
                        // todo: handle as relationships with joins, e.g. dollarMembership.loyaltyProgram.name
                        if (match && !asNames[match[1]]) expands.push(match[1]);
                    }
                    if (field.expand) expands.push(field.expand);
                });

                query = query.where(breeze.Predicate.and(predicates));
                if (orders.length) query = query.orderBy(_.uniq(orders).join(', '));
                if (expands.length) query = query.expand(_.uniq(expands).join(', '));
                query = query.inlineCount();


                return query;
            },

            /**
             * makes sure any models that are removed from an association on the server
             * are also removed from the association on the client
             *
             * @param queryResponse the response object returned by breeze manager.executeQuery
             */
            updateAssociations: function(queryResponse) {
                if (!queryResponse.query.expandClause) return;

                var properyPaths = mku.removePrefixes(queryResponse.query.expandClause.propertyPaths),
                    jsonTrees = queryResponse.httpResponse.data.Results;

                _.each(jsonTrees, function(jsonTree, i) {
                    var modelTree = queryResponse.results[i];
                    _.each(properyPaths, function(properyPath) {
                        var parts = properyPath.split('.');
                        pruneTree(queryResponse.entityManager, jsonTree, modelTree._backingStore, parts);
                    });
                });

            }

        };

        return self;

        // recursively find elements in modelTree that are not in jsonTree
        // could probably right a faster iterative solution
        function pruneTree(manager, jsonTree, modelTree, path) {
            var step = path[0],
                rest = _.rest(path),
                more = rest.length > 0,
                tail = step.substr(1),
                head = step.substr(0,1),
                upperStep = head.toUpperCase() + tail,
                lowerStep = head.toLowerCase() + tail,
                jsons = jsonTree[upperStep] || jsonTree[lowerStep],
                models = modelTree[lowerStep] || modelTree[upperStep],
                jsonIsArray = _.isArray(jsons),
                modelsIsArray = _.isArray(models),
                serverKey, localKey;

            if (!jsons && models && !modelsIsArray) {
                manager.detachEntity(models)
            } else if (jsons && models) {
                if (jsonIsArray && modelsIsArray) {
                    if (!models.length) return;

                    serverKey = models[0].entityType.keyProperties[0].nameOnServer;
                    localKey = models[0].entityType.keyProperties[0].name;

                    var keys = {}, i, length;

                    for (i = 0, length = jsons.length; i < length; ++i) {
                        keys[jsons[i][serverKey]] = jsons[i];
                    }
                    for (i = 0, length = models.length; i < length; ++i) {
                        var model = models[i]._backingStore,
                            json = keys[model[localKey]];
                        if (!json) {
                            manager.detachEntity(models[i]);
                        } else if (more) {
                            pruneTree(manager, json, model, rest);
                        }
                    }
                } else {
                    serverKey = models.entityType.keyProperties[0].nameOnServer;
                    localKey = models.entityType.keyProperties[0].name;

                    if (jsons[serverKey] != models._backingStore[localKey]) {
                        manager.detachEntity(models);
                    } else if (more) {
                        pruneTree(manager, jsons, models, rest);
                    }
                }
            }
        }

        // recursively finds the join values on the model and set them on object with the 'as' value as key
        // e.g. getJoins([{as: 'dollarMembership', relation: 'loyaltyMemberships', filter: [..], joins: [..]}], <customer> )
        // returns {dollarMembership: {value: <loyaltyMembership>, joins: {..}}
        function getJoins(joinOptions, model) {
            var joins = {};
            _.forEach(joinOptions || {}, function(option) {
                if (!option.as) return;
                var allModels = model[option.relation];
                if (allModels && allModels.length) {
                    var baseQuery = breeze.EntityQuery.fromEntities(allModels),
                        query = self.makeQuery({baseQuery: baseQuery, filters: option.filters}),
                        filteredModels = mkData.manager.executeQueryLocally(query),
                        join = filteredModels[0];
                    joins[option.as] = {value: join, joins: getJoins(option.joins, join)};
                }
            });

            return joins;
        }

        // wrap the getter so that it returns the default value instead of nulls and undefineds
        function applyDefault(property, field) {
            if (field.defaultValue != null)  {
                property.get = _.wrap(property.get, function(org) {
                    var val = org();
                    return val != null ? val : field.defaultValue;
                });
            }
        }

        /**
         * @param value a string of the form 'customer.name' which will be evaluated in context of the object
         * @param object the object to create ther setter/getter for
         * @param joins the joins of object, created by getJoins
         * @returns {*} a getter and a setter for the expression defined in @value on @Object
         */
        function createGetterSetter(value, object, joins) {
            var match = value.match(/^([^\.]+)\.(.*)$/),
                join = match && joins[match[1]];
            if (join) {
                return createGetterSetter(match[2], join.value, join.joins);
            } else {
                var getter = $parse(value);
                return {
                    getter: getter.bind(this, object),
                    setter: getter.assign && getter.assign.bind(this, object)
                }
            }
        }
    });