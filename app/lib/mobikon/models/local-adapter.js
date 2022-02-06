
angular.module('mk.Models').
    factory('LocalAdapter', function() {
        function LocalAdapter() {
            this.name = "local";
        }

        LocalAdapter.prototype = new breeze.AbstractDataServiceAdapter();

        LocalAdapter.prototype.saveChanges = function (saveContext, saveBundle) {
            var defer = Q.defer(),
                localStorage = window.localStorage,
                serviceName = saveContext.dataService.serviceName,
                entities = saveBundle.entities,
                changeCountName = serviceName + "change_count",
                changeCount = +localStorage[changeCountName] || 0,
                changeName = serviceName + "change_" + changeCount,
                changes = saveContext.entityManager.exportEntities(entities);

            localStorage[changeName] = changes;
            localStorage[changeCountName] = changeCount + 1;

            defer.resolve({entities: entities, keyMappings: []});

            return defer.promise;
        };

        LocalAdapter.loadChanges = function(manager, skipImport) {
            var serviceName = manager.dataService.serviceName,
                localStorage = window.localStorage,
                baseName = serviceName + "base",
                base = localStorage[baseName],
                changeCountName = serviceName + "change_count",
                changeCount = +localStorage[changeCountName] || 0;

            delete localStorage[changeCountName];

            if (base && !skipImport) {
                manager.importEntities(base);
            }

            for (var i = 0; i < changeCount; ++i) {
                var changeName = serviceName + "change_" + i,
                    change = localStorage[changeName];

                if (change) {
                    if (!skipImport) manager.importEntities(change, {mergeStrategy: breeze.MergeStrategy.OverwriteChanges});
                    delete localStorage[changeName];
                }
            }

            localStorage[baseName] = manager.exportEntities();
        };

        breeze.config.registerAdapter("dataService", LocalAdapter);

        return LocalAdapter;
    });
