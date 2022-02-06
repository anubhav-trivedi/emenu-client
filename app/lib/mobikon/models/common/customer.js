angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Customer');
    })
    .factory('Customer', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    // a very dirty hack to fix the server sending back country ids instead of
                    // actual cell codes
                    var callingCodeProp = {
                        get: function() {
                            var backingStore = this._backingStore,
                                val = backingStore && (backingStore.CellCountryCode || backingStore.cellCountryCode);

                            if (val == '98') return '65';
                            if (val == '1') return '91';
                            else return val;
                        },
                        set: function(value) {
                            if (this._backingStore) {
                                this._backingStore.CellCountryCode = value;
                            }
                        },
                        configurable: true
                    };
                    Object.defineProperty(this.prototype, 'CellCountryCode', callingCodeProp);
                    Object.defineProperty(this.prototype, 'cellCountryCode', callingCodeProp);
                    this.initialize('Customer');
                },

                properties: {
                    CompanyName: {
                        displayName: "Company Name",
                        validations: [
                            new breeze.Validator("companyName",
                                function (companyName, context) {
                                    return !context.entity.IsCorporate || companyName;
                                },
                                {
                                    messageTemplate: "Enter Company Name"
                                })
                        ]
                    },
                    UniqueId: {
                        displayName: "UniqueId",
                        validations: [
                            breeze.Validator.required()
                        ]
                    },
                    Name: {
                        displayName: "Name",
                        validations: [
                            breeze.Validator.required()
                        ]
                    },
                    CellNumber: {
                        displayName: "Mobile Number",
                        validations: [
                            breeze.Validator.required(),
                            breeze.Validator.makeRegExpValidator(
                                "CellNumber",
                                /^\d*$/,
                                "'%value%' is not valid")
                        ]
                    },
                    Email: {
                        displayName: "Email Address",
                        validations: [
                            breeze.Validator.required(),
                            breeze.Validator.emailAddress()
                        ]
                    },
                    DateOfBirth: {
                        displayName: "Birthday",
                        validations: [
                            breeze.Validator.required(),
                            breeze.Validator.date()
                        ]
                    },
                    Address: {
                        displayName: "Address",
                        validations: [
                            breeze.Validator.required()
                        ]
                    },
                    Zip: {
                        displayName: "Zip",
                        validations: [
                            breeze.Validator.required()
                        ]
                    }
                }
            },
            /* Instance Methods */
            {
                getSaveDescription: function() {
                    //todo i18n
                    return "Saving customer {{Name}}";
                }
            }
        );
    });