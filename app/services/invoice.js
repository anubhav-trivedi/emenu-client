'use strict';

angular.module('yoMenu.Services')
    .factory('invoice', function($http, config, mkRenderer, mkPrint, mkEmail, mkBridge) {

        //todo this specific text shouldn't be in here
        var sig =
            "<br />" +
            "<br />" +
            "<b>" +
            "Thank You,<br />" +
            "Yours faithfully,<br />" +
            "For EVORICH MANUFACTURING PTE LTD <br />" +
            "</b>";

        var sigCorp =
            "<br />" +
            "<br />" +
            "<b>" +
            "Thank You,<br />" +
            "Yours faithfully,<br />" +
            "For EVORICH HOLDINGS PRIVATE LIMITED<br />" +
            "</b>";

        var confirmBody = "Dear Sir/Madam,<br />" +
            "We thank you very much for your support and as per your request, we are please to forward our job confirmation as attached." +
            sig;

        var quoteBody = "Dear Sir/Madam,<br />" +
            "We thank you very much for your support and as per your request, we are pleased to forward our quotation as follows:" +
            sig;

        var confirmBodyCorp = "Dear Sir/Madam,<br />" +
            "We thank you very much for your support and as per your request, we are please to forward our job confirmation as attached." +
            sigCorp;

        var quoteBodyCorp = "Dear Sir/Madam,<br />" +
            "We thank you very much for your support and as per your request, we are pleased to forward our quotation as follows:" +
            sigCorp;


        return {
            sendQuote: function(order, doPrint, signaturePath) {
                var company = order.Customer.CompanyName;
                var htmlPath;
                var bodyContent;
                if(company) {
                    htmlPath = "views/emails/quoteCorp.html";
                    bodyContent = quoteBodyCorp;
                } else {
                    htmlPath = "views/emails/quote.html";
                    bodyContent = quoteBody;
                }
                return mkRenderer(htmlPath, {order: order, signaturePath: signaturePath}).then(function(html) {
                    return send(order, doPrint, html, {
                        attachmentName: 'Evorich - Quote.pdf',
                        subject: 'Sales Order Quote',
                        body: bodyContent
                    });
                });
            },
            sendConfirmation: function(order, doPrint, signaturePath) {
                var company = order.Customer.CompanyName;
                var htmlPath;
                var bodyContent;
                if(company) {
                    htmlPath = "views/emails/confirmationCorp.html";
                    bodyContent = confirmBodyCorp;
                } else {
                    htmlPath = "views/emails/confirmation.html";
                    bodyContent = confirmBody;
                }
                return mkRenderer(htmlPath, {order: order, signaturePath: signaturePath}).then(function(html) {
                    var attachedString;
                    if(order.OrderNo && order.OrderNo != null) {
                        attachedString = "Order No -" + order.OrderNo;
                    } else {
                        attachedString = "Confirmation";
                    }

                    return send(order, doPrint, html, {
                        attachmentName: 'Evorich - ' + attachedString + '.pdf',
                        subject: 'New Order Confirmation',
                        body: bodyContent
                    });
                });
            }
        };

        function send(order, doPrint, html, emailParams) {

            // There seems to be a race condition in the pdf code
            // If I try to send the email and print at the same time
            // one of them fails to load the images. So I wait for
            // print to finish before sending emails in the background
            // I spent way to long on this before giving up.
            if (doPrint) {
                return mkPrint.printHtml(html).then(function() {
                    return sendEmail(order, html, emailParams)
                });
            } else {
                return sendEmail(order, html, emailParams);
            }
        }

        function sendEmail(order, html, params) {
            // not returning deferred here as i want it to be async
            var emails = _.union([order.Customer.Email], [config.emailIds]),
                server = order.Server,
                serverEmail = server && (server.Email || server.EmailId);
            if (serverEmail) {
                emails.push(serverEmail);
            }
            mkEmail.sendEmail(_.extend({
                attachmentHtml: html,
                to: emails, // 2nd arg is an array so managers are sent in a single email
                from: 'emenu@mobikontech.com',
                fromName: 'Evorich',
                jobDescription: 'Email Order to ' + order.Customer.Name
            }, params));
        }

    });