'use strict';

angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Answer');
    })
    .factory('Answer', function(Model) {
        return Model(
            {
                init: function() {
                    this.initialize('Answer', 'Answers', {
                        localOnly: true
                    });
                },

                initData: function(mkData) {
                    var DT = breeze.DataType;
                    Model.initData.call(this, mkData, {
                        dataProperties: {
                            id:             { dataType: DT.String, isPartOfKey: true },                            
                            questionId: { dataType: DT.String },
                            feedbackResponseId: { dataType: DT.String },
                            value: { dataType: DT.String }
                        },
                        navigationProperties: {
                            question: {
                                entityTypeName:  "Question:#KonektData.Models", isScalar: true,
                                associationName: "Question_Answer", foreignKeyNames: ["questionId"]
                            },
                            feedbackResponse: {
                                entityTypeName:  "FeedbackResponse:#KonektData.Models", isScalar: true,
                                associationName: "FeedbackResponse_Answers", foreignKeyNames: ["feedbackResponseId"]
                            }
                        }
                    });
                }
            },
            {
            });
    });
