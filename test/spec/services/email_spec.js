'use strict';

describe('yoMenu.Services', function() {
    describe('emailService', function() {

        var http, config, $factory;

        describe('sendOrderQuote', function() {
            var order;
            beforeEach(function() {
                config = {
                    addOnMenuTypeId: '121',
                    mainMenuTypeId: '324'
                };
                order = {
                    Customer: {Name: 'anubhav', Email:'anubhav@mobikontech.com'},
                    OrderItems: [
                        {
                            Item: {
                                MenuTypeId: config.mainMenuTypeId,
                                Name: 'Burger',
                                Price: '10.3'
                            }
                        }, {
                            Item: {
                                MenuTypeId: config.addOnMenuTypeId,
                                Name: 'Hacking',
                                Price: '4'
                            }
                        }
                    ],
                    getTotal: jasmine.createSpy('order.getTotal').andReturn(999)
                };

                http = jasmine.createSpy('http');

                module('yoMenu.Services', function($provide) {
                    $provide.value('$http', http);
                    $provide.value('config', config);
                });


            });

            it('creates an order quote', inject(function(email) {
                http.andReturn({
                    success: function() {return this;},
                    error: function() { return this;}
                });
                email.sendOrderQuote(order);

                var xml = http.calls[0].args[0].data.data;
                var expectedXml = '<?xml version="1.0"?> ' +
                    '<Request type="simple">   ' +
                    '   <Message>         ' +
                    '       <EntityId>9e3ef2ee-be23-4c5f-89e7-1797bb691413</EntityId>         ' +
                    '       <CampaignId></CampaignId>         ' +
                    '       <MsgType>General</MsgType>         ' +
                    '       <AcquireCust>No</AcquireCust>         ' +
                    '       <AuthKey>743A8F1B-C33F-48DC-9B3E-93BA4DD2E280</AuthKey>         ' +
                    '       <FollowTemplate>True</FollowTemplate>         ' +
                    '       <Text><![CDATA[ ]]></Text>         ' +
                    '       <EmailText><![CDATA[' +
                    '           Dear anubhav, <br> ' +
                    '           Below is your Order Quote <br><br>  ' +
                    '           Items<br>' +
                    '           Burger Price : $10.3 <br> <br>' +
                    '           AddOns <br>' +
                    '           Hacking Price : $4 <br> <br>' +
                    '           Total : $999 ]]></EmailText>         ' +
                    '       <EmailSubject><![CDATA[ New Order ]]></EmailSubject>         ' +
                    '       <MessageTo FromEmail="emenu@mobikontech.com" FromName="Evorich" Seq="1" CellNo="" CallingCode="" EmailId="anubhav@mobikontech.com" />    ' +
                    '   </Message>  ' +
                    '</Request>';

                expect(xml.replace(/\s/g, '')).toEqual(expectedXml.replace(/\s/g, ''))

            }));
        });

    });
});