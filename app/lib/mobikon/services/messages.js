'use strict';

angular.module('mk.Services')
    .factory('mkMessages', function(config, $timeout) {
        var OPEN = 1,
            ws,
            ids = 1,
            subscriptions = {},
            queuedChannels = {},
            timeout, closed;

        return {

            init: function() {
                openConnection();
            },

            subscribe: function(channel, callback) {
                if (!subscriptions[channel]) {
                    if (ws && ws.readyState == OPEN) {
                        ws.send("subscribe: " + channel);
                    }
                    queuedChannels[channel] = true;
                }
                var id = ids++;
                mku.getOrSet(subscriptions, channel, {})[id] = callback;
                return {id: id, channel: channel};
            },

            unSubscribe: function(key) {
                delete subscriptions[key.channel][key.id];
                if (!_.any(subscriptions[key.channel])) {
                    delete subscriptions[key.channel];
                    ws.send("unsubscribe: " + channel);
                }

            }
        }

        // ping the connection to keep it alive,
        // heroku will close it after 30 seconds
        function ping() {
            ws.send('ping');
            timeout = $timeout(ping, 20000)
        }

        function openConnection() {
            if (ws) {
                ws.onmessage = ws.onopen = ws.onclose = ws.onerror = null;
            }
            closed = false;
            ws = new WebSocket(config.messages.host);
            ws.onmessage = handleMessage;
            ws.onopen = function() {
                if (closed) return;
                ping();
            };
            ws.onclose = function() {
                if (closed) return;
                closed = true;
                clearTimeout(timeout);
                reopen();
            };
            ws.onerror = function() {
                if (closed) return;
                closed = true;
                clearTimeout(timeout);
                timeout = $timeout(reopen, 1000);
            };
        }

        function handleMessage(event) {
            var split = event.data.split(':'),
                action = split[0],
                argument = split[1] && mku.trim(split[1]),
                channel = argument;

            if (action == 'pong') {
                _.forEach(queuedChannels, function(_, channel) {
                    ws.send("subscribe: " + channel);
                });
            } else if (action == 'subscribed') {
                delete queuedChannels[channel];
            } else if (action == 'message') {
                var message = mku.trim(split[2]),
                    listeners = subscriptions[channel];

                $timeout(function() {
                    _.forEach(listeners, mku.callWith(message));
                });
            }

        }

        function reopen() {
            _.forEach(subscriptions, function(listeners, channel) {
                queuedChannels[channel] = true;
            });
            openConnection();
        }
    });