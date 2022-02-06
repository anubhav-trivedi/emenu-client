angular.module('mk.Services')
    .factory('mkPayment', function($q, $timeout, config, mkMessages) {

        var paymentListeners = {},
            defer;

        return {

            makePayment: function(options) {
                defer = $q.defer();
                var conf = config.payment.paypal,
                    customerId = options.customerId ||
                        (options.customer && options.customer.customerId) ||
                        (options.order && options.order.customerId),
                    orderId = options.orderId ||
                        (options.order && options.order.id),
                    notifyUrl = config.payment.paypal.notifyUrl +
                        "?customerId=" + encodeURIComponent(customerId) +
                        "&orderId=" + encodeURIComponent(orderId) +
                        (conf.sandbox ? '&sandbox=true' : ''),
                    postUrl = conf.sandbox ?
                            'https://www.sandbox.paypal.com/cgi-bin/webscr' :
                            'https://www.paypal.com/cgi-bin/webscr',
                    configOptions = _.extend({},
                        conf,
                        _.omit(options, 'customer', 'order'), {
                            notifyUrl: encodeURIComponent(notifyUrl)
                        });

                var listener = paymentListeners[orderId] = {
                    deferred: $q.defer(),
                    key: mkMessages.subscribe('payment-' + orderId, function(message) {
                        if (message == 'received') listener.deferred.resolve();
                    })
                };

                window.MKBrowserModal.open({
                    post: postUrl,
                    params: {
                        cmd: '_xclick',
                        business: configOptions.account,
                        lc: configOptions.locality,
                        item_name: configOptions.itemName,
                        item_number: configOptions.itemNumber,
                        amount: configOptions.amount,
                        currency_code: configOptions.currency,
                        notify_url: configOptions.notifyUrl,
                        button_subtype: 'services',
                        no_type: '1',
                        no_shipping: '1',
                        rm: '1',
                        tax_rate: configOptions.tax,
                        bn: 'PP-BuyNowBF:btn_buynowCC_LG.gif:NonHosted'
                    },
                    watches: [
                        { type: 'contains', content: '<p>Processing ...</p>', showCancel: false, showDone: false },
                        { type: 'contains', content: '<p>Processing...</p>', showCancel: false, showDone: false },
                        { type: 'contains', content: 'Transaction ID:', showCancel: false, showDone: true },
                        { type: 'contains', content: 'Receipt number:', showCancel: false, showDone: true }
                    ]
                }, function(result) {
                    $timeout(function() {
                        if (result.message == 'success') {
                            defer.resolve(result.message);
                        } else {
                            defer.reject(result.message);
                        }
                    });
                });

                return defer.promise;
            },

            waitForPayment: function(orderId) {
                orderId = orderId.id || orderId;
                return paymentListeners[orderId].deferred.promise;
            }
        };
    });