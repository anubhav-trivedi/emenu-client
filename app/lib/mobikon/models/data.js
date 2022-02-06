'use strict';

angular.module('mk.Models')
    .provider('mkData', function() {

        var registeredModels = [];

        angular.extend(this, {

            Model: function(modelName) {
                registeredModels.push(modelName);
            },

            $get: function($q, $injector, $window, $document, config, mkClientStore, mkOnlineStatus, mkJobQueue, $interpolate) {

                var metaDataStore = 'meta_' + config.menuId,
                    dataStore = 'data_' + config.menuId,
                    useSaveQueue = config.data.useSaveQueue,
                    isLoaded,
                    loadedDef = $q.defer();

                loadedDef.promise.then(function() {
                    isLoaded = true;
                    window.onunload = storeData;
                    document.addEventListener("pause", storeData, false);
                    if (useSaveQueue) {
                        mkJobQueue.init(self.manager);
                    }
                });

                var self = {
                    getLoaded: function() {
                        return loadedDef.promise;
                    },

                    /**
                     * Initialises the data context for the application
                     *
                     * @param x unused legacy parameter
                     * @param forceRefresh forces a refresh of metadata and base data
                     * @returns {Promise<T>}
                     */
                    init: function(x, forceRefresh) {
                        var modelClasses = _.map(registeredModels, $injector.get),
                            storedMetaData = mkClientStore.get(metaDataStore);

                        // create a map of model name to model class for look-ups
                        self.models = _.object(_.map(modelClasses, function(m) {
                            return m.type.toLowerCase();
                        }), modelClasses);

                        if (!storedMetaData || config.data.autoRefreshDataSet || forceRefresh) {
                            // if we haven't loaded before refresh from server
                            return this.refreshDataSet(modelClasses).then(function() {
                                loadedDef.resolve(self);
                            });
                        } else {
                            // if we have loaded before we try to load from cache
                            if (importData(modelClasses)) {
                                loadedDef.resolve(self);
                                return $q.when();
                            } else {
                                // try again but force a refresh this time
                                return self.init(x, true);
                            }
                        }
                    },

                    /**
                     * Stores the currently loaded data into the localStorage for use on next reload. This
                     * also happens when the app is closed. You should call this when you want to make an important
                     * snapshot, e.g. after a user logs in.
                     *
                     * Ideally this shouldn't be needed, but I'm finding the pause and unload events unpredictable.
                     */
                    cacheData: function() {
                        storeData();
                    },

                    /**
                     * Get the model class for the model name
                     * @param modelName the name of the model, case insenstive e.g. 'customer' or 'Customer'
                     */
                    getModel: function(modelName) {
                        return this.models[modelName.toLowerCase()] || null;
                    },

                    /**
                     * Re-loads the metadata and initial data sets from the server.
                     * This is currently done after a sync.
                     * Should be done on first init of data, or followed by a page refresh
                     *
                     * @returns Promise resolved once complete
                     */
                    refreshDataSet: function(modelClasses) {
                        var manager = createManager();
                        return manager.fetchMetadata().to$q().then(function() {
                            self.manager = manager;
                            // store the fresh metadata from the server
                            mkClientStore.set(metaDataStore, manager.metadataStore.exportMetadata());

                            if (modelClasses) {
                                initModelClasses(modelClasses);
                            }

                            // load the initial data sets defined in config
                            var promises = _.map(config.data.dataSet || [], function(preLoad) {
                                var modelClass = $injector.get(preLoad.rootModel);
                                return modelClass.findAllFromServer(
                                    preLoad.params,
                                    angular.extend({mkData: self}, preLoad.options)
                                );
                            });

                            return $q.all(promises).then(function() {
                                storeData();
                            });
                        }, function(error) {
                            console.log(error);
                            return $q.reject(error);
                        });
                    },

                    saveChanges: function(models) {
                        var managerAndModels = {
                            manager: this.manager,
                            models: models
                        };
                        if (useSaveQueue) {
                            // we need to do the validation now before we queue the save
                            var errors = this.manager.validationOptions.validateOnSave ? validateModels(models) : [];
                            if (errors.length) {
                                return $q.reject({entityErrors: errors});
                            } else {
                                return mkJobQueue.addJob(saveWorker, managerAndModels);
                            }
                        } else {
                            return saveWorker.work(managerAndModels);
                        }
                    }
                };

                var saveWorker = {
                    name: 'mkData.save',
                    module: 'mk.Models',
                    description: function(managerAndModels) {
                        var model = managerAndModels.models[0];

                        if (model.getSaveDescription) {
                            return $interpolate(model.getSaveDescription())(model);
                        } else {
                            //todo i18n
                            return "Saving Changes";
                        }
                    },
                    serialize: function(managerAndModels) {
                        return {
                            metaData: mkClientStore.get(metaDataStore), // use the raw stored metaData
                            models: self.manager.exportEntities(managerAndModels.models, false)
                        }
                    },
                    deserialize: function(json) {
                        return {
                            manager: self.manager,
                            models: self.manager.importEntities(json.models).entities
                        }
                    },
                    work: function(managerAndModels) {
                        var manager = managerAndModels.manager,
                            models = managerAndModels.models;

                        return manager.saveChanges(models).to$q();
                    }
                };
                mkJobQueue.registerWorker(saveWorker);

                return self;

                // imports metadata and models form local storage
                // meta data needs to be loaded first, and then model classes initialised
                // and then model data loaded.
                //
                // the stored metadata must be from the server, not the client side metadata
                function importData(modelClasses) {
                    try {
                        var manager = createManager();
                        var storedMetaData = mkClientStore.get(metaDataStore);
                        var storedData = mkClientStore.get(dataStore);

                        if (storedMetaData) {
                            manager.metadataStore.importMetadata(storedMetaData);
                        }

                        if (!checkCachedManaged(manager)) return false;

                        self.manager = manager; // models expect manager to be set
                        initModelClasses(modelClasses);

                        if (storedData) {
                            manager.importEntities(storedData);
                        }

                        return checkCachedManaged(manager);
                    } catch (e) {a
                        console.log('Error during cache import, forcing refresh. Error was: ' + e.toString());
                        return false;
                    }
                }

                // returns false if the storedMetaData is no longer valid
                // todo, this causes metadata to be parsed twice, which is probably slow on old ios devices
                function checkCachedManaged(manager) {
                    try {
                        var metadataStore = manager.metadataStore,
                            service = metadataStore.dataServices &&
                                metadataStore.dataServices.length == 1 &&
                                metadataStore.dataServices[0].serviceName;

                        // remove the last hash from both
                        if (service && service.replace(/\/$/, '') == config.data.host.replace(/\/$/, '')) {
                            return true
                        } else {
                            console.log('cached data service does not have valid service');
                            return false;
                        }
                    } catch (e) {
                        console.log("Error loading metaDataStore:", e);
                        return false;
                    }
                }

                function initModelClasses(modelClasses) {
                    for (var i = 0; i < modelClasses.length; ++i) {
                        modelClasses[i].initData(self)
                    }
                }

                function storeData() {
                    var entities = config.data.cache == "saved" ?
                        self.manager.getEntities(null, breeze.EntityState.Unchanged) :
                        self.manager.getEntities();

                    mkClientStore.set(dataStore, self.manager.exportEntities(entities));
                }

                function createManager() {
                    var manager = new breeze.EntityManager(config.data.host);
                    manager.setProperties({keyGeneratorCtor: myKeyGenerator});

                    return manager;

                    function myKeyGenerator() {
                        this.generateTempKeyValue = function () {
                            return -(new Date() % Math.pow(2, 31));
                        };
                    }
                }

                function validateModels(models) {
                    var allErrors = [];
                    angular.forEach(models, function(model) {
                        if (!model.entityAspect.validateEntity()) {
                            // this conversion logic is taken from breezejs createEntityErrors
                            var modelErrors = _.map(model.entityAspect.getValidationErrors(), function(error) {
                                return _.extend({
                                    entity: model,
                                    errorName: error.validator.name
                                }, _.pick(error, ["errorMessage", "propertyName", "isServerError"]));
                            });
                            allErrors.push.apply(allErrors, modelErrors);
                        }
                    });
                    return allErrors;
                }

            }
        });

    }).run(function ($q, $rootScope) {
        breeze.core.extendQ($rootScope, $q);
    });

