'use strict';

angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('FeedbackResponse');
    })
    .factory('FeedbackResponse', function(Model, $q, $http, config) {
        return Model(
            {
                init: function() {
                    this.initialize('FeedbackResponse', 'FeedbackResponse', {
                        localOnly: true
                    });
                },

                initData: function(mkData) {
                    var DT = breeze.DataType;
                    Model.initData.call(this, mkData, {
                        dataProperties: {
                            id:             { dataType: DT.String, isPartOfKey: true },
                            feedbackSettingId:       { dataType: DT.String },
                            customerId: { dataType: DT.String }
                        },
                        navigationProperties: {
                            feedbackSetting: {
                                entityTypeName:  "FeedbackSetting:#KonektData.Models", isScalar: true,
                                associationName: "FeedbackSetting_FeedbackResponses", foreignKeyNames: ["feedbackSettingId"]
                            },
                            customer: {
                                entityTypeName:  "Customer:#KonektData.Models", isScalar: true,
                                associationName: "Customer_FeedbackResponses", foreignKeyNames: ["customerId"]
                            },
                            answers: {
                                entityTypeName:  "Answer:#KonektData.Models", isScalar: false,
                                associationName: "FeedbackResponse_Answers"
                            }
                        }
                    });
                }
            },
            {

                save: function() {
                    var self = this;

                    return $http({
                        method: 'POST',
                        url: config.features.feedback.api + '/konekt/service/KonektAPI.asmx/FeedbackContentSync',
                        data: {
                            LoginId: '',
                            Data: getSaveXML(this),
                            Source: 'User App'
                        }
                    }).success(function(data, status, headers, config) {
                        self.entityAspect.acceptChanges();
                        angular.forEach(self.answers, function(a) { a.entityAspect.acceptChanges() });
                    }).error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        console.log(status);
                    });

                    return $q.when(this);
                },

                getAverage: function() {
                    var count = 0,
                        total = 0;

                    angular.forEach(this.answers, function(answer) {
                        if (answer.question.type == "Stars" && answer.value) {
                            count++;
                            total += +answer.value;
                        }
                    });

                    return count ? roundHalf(total / count) : null;

                    function roundHalf(num) {
                        num = Math.round(num*2)/2;
                        return num;
                    }
                }

            });


        function getSaveXML(response) {
            var xml = '<Response id="' + breeze.core.getUuid() + '">' +
                '   <Form id="' + response.feedbackSetting.id  + '" />' +
                '   <DeviceTime value="' + moment().format('MM/DD/YYYY h:mm A') + '" />';


            angular.forEach(response.answers, function(answer) {
                xml += getAnswerSaveXML(answer);
            }) ;

            xml += getPersonelBlock(response.customer, '');
            xml += '</Response>';

            return xml;

        }

        function getAnswerSaveXML(answer) {
            var type = answer.question.type == "Stars" ? 'type="s"' : '';
            return '<Question id="' + answer.questionId + '" ' + type + ' >' +
                '<Value>' + answer.value + '</Value>' +
            '</Question>';
        }

        function getPersonelBlock(customer, comment) {
            return "<PersonalBlock>" +
                "<Name>" + customer.name + "</Name>" +
                "<CountryCallingCode>" + customer.cellCountryCode + "</CountryCallingCode>" +
                "<CellNo>" + customer.cellNumber + "</CellNo>" +
                "<Email>" + customer.email + "</Email>" +
                "<TableNo></TableNo>" +
                "<ServerName></ServerName>" +
                "<DOB>1900-01-04</DOB>" +
                "<Annv>1900-2-06</Annv>" +
                "<Comment><Value>" + (comment || '') + "</Value></Comment>" +
                "<Gender>" + customer.gender + "</Gender>" +
                "<BillNo></BillNo>" +
                "<AgeGroup></AgeGroup>" +
                "<Preference></Preference>" +
                "<Beverages></Beverages>" +
            "</PersonalBlock>";

        }
    });
