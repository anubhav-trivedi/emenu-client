angular.module('mk.Services')
    .factory('mkJobQueue', function(mkOnlineStatus, mkClientStore, $interpolate, $q) {


        var startIndex = +mkClientStore.get('mkJobQueue.startIndex') || 0,
            endIndex = +mkClientStore.get('mkJobQueue.endIndex') || 0,
            queuedJobs = [],
            errors = [],
            workers = {},
            onlineRefresh = 3000;

        var self = {
            queuedJobs: queuedJobs,

            /**
             * Called by mkData once the models are setup. Maybe move this responsibility to app.js?
             */
            init: function() {
                for (var i = startIndex; i < endIndex; ++i) {
                    queuedJobs.push(JSON.parse(mkClientStore.get('mkJobQueue.job-' + i)));
                }
                doJob(self);
            },

            /**
             * Register a worker for executing jobs
             * @param worker the object for executing tasks that can be queued in local storage, e.g.
             *
             * {
             *     // The name the worker can be called with
             *     name: 'mkData.save',
             *
             *     // the version of the worker, may be used in the future for handling changed
             *     // serialized forms
             *     version: '1.0',
             *
             *     // (required) does the actual work, passed the data parameter of addJob.
             *     // returns a promise
             *     work: function(foo) {
             *
             *     }
             *
             *     // (optional) called with the jobs data object, returns a form that can JSONified for storing
             *     serialize: function(foo) {
             *          return {bar: foo}
             *     };
             *
             *     // (optional) called with the result of serialize, returns the original form of the data for passing to work
             *     deserialize: function(bar) {
             *          return bar.foo;
             *     }
             * }
             *
             */
            registerWorker: function(worker) {
                workers[worker.name] = worker;
            },

            /**
             * Adds a job to the queue. If the device is online, the job will be attempted immediately.
             * If the job fails, the online status will be re-checked, if it is discovered the device has gone offline
             * the job will be added to the queue, otherwise the original failed promise will be returned.
             *
             * If the device is offline, the job is immediately added to the queue.
             *
             * @param worker either the worker object or name of a previously added worker
             * @param data the data that will be passed into the workers methods
             * @param description a human readable description that will be displayed in the job queue. If not present the workers description attribute will be used.
             * @returns {promise} If the job is executed immediately the promise of the worker.work method is returned. Otherwise a promise resolved with 'queued'.
             */
            addJob: function(worker, data, description) {
                backupJob(worker, data, description);
                var self = this;
                worker = worker.name ? worker : workers[worker];
                if (mkOnlineStatus.status == 'online') {
                    return tryJob(worker, data, {
                        error: function(error) {
                            return $q.reject(error);
                        },
                        offline: queueJob.bind(this, self, worker, data, description)
                    });
                } else {
                    return queueJob(self, worker, data, description);
                }
            }
        };

        return self;


        // add a job to the queue for future execution
        // adds it to the in memory queue, and also the localstorage queue
        // starts the worker queue if it's the first job in the queue
        function queueJob(self, worker, data, description) {
            description = angular.isFunction(worker.description) ?
                worker.description(data) :
                worker.description || description;

            if (description) {
                description = $interpolate(description)({data: data});
            }

            var job = {
                workerName: worker.name,
                data: worker.serialize ? worker.serialize(data) : data,
                description: description,
                index: endIndex++
            };

            mkClientStore.set('mkJobQueue.job-' + job.index, JSON.stringify(job));
            mkClientStore.set('mkJobQueue.endIndex', endIndex);
            queuedJobs.push(job);

            if (queuedJobs.length == 1) {
                doJob(self);
            }

            return $q.when('queued');
        }

        // recursively execute the jobs one at a time until there is none left
        // handles waiting for the device to go back online
        function doJob(self) {
            if (!queuedJobs.length) {
                self.state = 'empty';
                return;
            }

            var job = queuedJobs[0];

            try {
                var worker = workers[job.workerName],
                    data = worker.deserialize ? worker.deserialize(job.data) : job.data;

                mkOnlineStatus.waitForOnline().then(function() {
                    job.state = 'working';
                    self.state = 'working';

                    tryJob(worker, data, {
                        success: function() {
                            next();
                            job.state = 'saved';
                        },
                        error: handleError,
                        exception: handleError,
                        offline: doJob.bind(this, self)
                    });
                });
            } catch (e) {
                handleError(e);
            }

            function handleError(error) {
                console.log(error);
                errors.push({error: error, job: job});
                next();
            }

            function next() {
                queuedJobs.shift();
                mkClientStore.remove('mkJobQueue.job-' + startIndex);
                mkClientStore.set('mkJobQueue.startIndex', ++startIndex);
                doJob(self);
            }
        }

        // Attempts to execute the worker.work(data) method, Calls:
        // callbacks.success if ok
        // callbacks.error if promise fails
        // callbacks.offline if the job fails and its detected the device has gone offline
        // callbacks.exception if the worker throws an exception
        // N.b. the call will only be wrapped in a try/catch if callbacks.exception is present
        function tryJob(worker, data, callbacks) {
            if (callbacks.exception) {
                try {
                    return tryJob(worker, data, _.omit(callbacks, 'exception'));
                } catch (e) {
                    return callbacks.exception(e);
                }
            } else {
                return worker.work(data).then(callbacks.success, function() {
                    var errorArgs = arguments;
                    return mkOnlineStatus.refresh(onlineRefresh).then(function(status) {
                        if (status == 'offline') { // it failed because we're offline
                            return callbacks.offline();
                        } else { // it really did fail
                            return callbacks.error.apply(callbacks, errorArgs);
                        }
                    });
                });
            }
        }

        // this function is a hack to back up all queued orders, just in case bad stuff happens
        function backupJob(worker, data, description) {
            data = worker.serialize ? worker.serialize(data) : data;
            if (data.metaData) {
                data = _.omit(data, 'metaData');
                description = angular.isFunction(worker.description) ?
                    worker.description(data) :
                    worker.description || description;
                if (window.WebViewJavascriptBridge) {
                    WebViewJavascriptBridge.send({method: 'writeData', data: '----' + description + '--' + new Date() + '-----\n' + JSON.stringify(data)});
                }
            }
        }

    });