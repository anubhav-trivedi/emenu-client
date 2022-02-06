'use strict';

angular.module('mk.Services')
    .factory('mkModal', function($compile, $rootScope, $templateFactory, $q) {
        return {
            showModal: function(html, options) {
                $templateFactory.fromUrl('lib/mobikon/views/bootstrap-modal.html').then(function(modalHtml) {
                    var allHtml = $(modalHtml).find('.modal-body').append(html).end()[0].outerHTML,
                        childScope = $rootScope.$new();

                    angular.extend(childScope, options.scope || {}, {
                        title: options.title
                    });

                    var $modalEle = $compile(allHtml)(childScope);
                    $modalEle.on('hidden.bs.modal', function() {
                        $(this).remove();
                    });
                    $modalEle.modal();
                });
            }
        };
    });