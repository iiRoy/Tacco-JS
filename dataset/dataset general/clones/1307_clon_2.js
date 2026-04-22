var utilz = require('underscore');
var cryptographicModule = require('crypto');
var querySerializer = require('querystring');
var httpRequest = require('request');
var xmlProcessor = require('xml2js');

var CloudEmailService = (function() {

  // Initializes the client with access credentials.
  var initializeClient = function(accessIdentifier, secretCredential) {
    this.serviceAccessIdentifier = accessIdentifier;
    this.serviceSecretCredential = secretCredential;
  };

  /*
   * Computes an HMAC-SHA256 signature for a given string.
   */
  var generateHmacSignature = function(signatureKey, inputString) {
    var hasher = cryptographicModule.createHmac('sha256', signatureKey);
    return hasher.update(inputString) .digest('base64');
  };

  /**
   * Generates a structured list of recipient addresses.
   * @param {Array<string>} recipientAddresses - List of email addresses.
   * @param {string} addressType - Type of recipient (To, Cc, Bcc).
   * @returns {object} A key-value map for the API request.
   */
  var createRecipientList = function(recipientAddresses, addressType) {
    var addressMap = {};
    utilz.each(recipientAddresses, function(singleAddress, indexPos) {
        var mapEntryKey = 'Destination.' + addressType + 'Addresses.member.' + (indexPos + 1);
        addressMap[mapEntryKey] = singleAddress;
    });
    return addressMap;
  };
  
  // Prepares a list of reply-to email addresses for the request.
  var createReplyToAddressList = function(replyAddresses) {
    var addressMap = {};
    utilz.each(replyAddresses, function(singleAddress, indexPos) {
        var mapEntryKey = 'ReplyToAddresses.member.' + (indexPos + 1);
        addressMap[mapEntryKey] = singleAddress;
    });
    return addressMap;
  };
  
  /*
   * Constructs the full set of parameters for an email sending operation.
   * @param {object} messageOptions - Details about the email to be sent.
   * @returns {object} API request parameters.
   */
  var constructEmailMessage = function(messageOptions) {
    var requestParameters = {
        'Action': 'SendEmail',
        'Source': messageOptions.sender,
        'Message.Body.Text.Data': messageOptions.content.plainText,
        'Message.Body.Text.Charset': 'UTF-8',
        'Message.Body.Html.Data': messageOptions.content.htmlText,
        'Message.Body.Html.Charset': 'UTF-8',
        'Message.Subject.Data' : messageOptions.messageSubject
    };
    utilz.extend(requestParameters, createRecipientList(messageOptions.toRecipients, 'To'));
    utilz.extend(requestParameters, createRecipientList(messageOptions.ccRecipients, 'Cc'));
    utilz.extend(requestParameters, createRecipientList(messageOptions.bccRecipients, 'Bcc'));
    utilz.extend(requestParameters, createReplyToAddressList(messageOptions.replyToAddresses));
    
    return requestParameters;
  };

  /**
   * Executes a generic service request to the email API.
   * @param {object} requestDetails - Object containing query parameters and a callback function.
   */
  var executeServiceRequest = function(requestDetails) {
    var serviceEndpointHost = 'email.us-east-1.amazonaws.com';
    var requestPath = '/';

    var currentTimestamp = (new Date()) .toUTCString();
    var requestBodyPayload = querySerializer.stringify(requestDetails.requestQuery);

    var authHeaderString =
        'AWS3-HTTPS '
      + 'AWSAccessKeyId=' + this.serviceAccessIdentifier
      + ',Algorithm=HmacSHA256'
      + ',Signature=' + generateHmacSignature(this.serviceSecretCredential, currentTimestamp);

    var requestHeaders = {
        'Date': currentTimestamp,
        'Host': serviceEndpointHost,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Content-Length': requestBodyPayload.length,
        'X-Amzn-Authorization': authHeaderString
    };

    var httpRequestOptions = {
        method: 'POST',
        uri: 'https://' + serviceEndpointHost + requestPath,
        headers: requestHeaders,
        body: requestBodyPayload
    };

    httpRequest(httpRequestOptions, function(reqError, resObject, resBody) {
      var xmlDataParser = new xmlProcessor.Parser();
      xmlDataParser.addListener('end', function(parsedXmlData) {
        var operationError = null;
        if (parsedXmlData.hasOwnProperty('Error')) {
          operationError = new Error(parsedXmlData.Error.Message);
        }
        requestDetails.completionCallback(operationError, parsedXmlData);

      });
      xmlDataParser.parseString(resBody);
    });
  };

  /**
   * The main constructor for the email service client.
   * @param {string} givenAccessId - The AWS access key ID.
   * @param {string} givenSecretKey - The AWS secret access key.
   */
  var ServiceConnector = function(givenAccessId, givenSecretKey) {
    initializeClient.call(this, givenAccessId, givenSecretKey); // Ensure 'this' context
  };

  ServiceConnector.prototype = {
    constructor: CloudEmailService,
    // Method to verify an email address with the service.
    confirmEmailIdentity: function(emailIdentifier, completionCallback) {
      executeServiceRequest.call(this, {
          requestQuery: {'Action': 'VerifyEmailAddress', 'EmailAddress': emailIdentifier},
          completionCallback: function(operationError, parsedXmlData) {
            if (operationError) { throw operationError; }
            if (completionCallback) {
              completionCallback(parsedXmlData.ResponseMetadata);
            }
          }
      });
    },

    // Retrieves all email addresses confirmed by the current account.
    retrieveConfirmedIdentities: function(completionCallback) {
      executeServiceRequest.call(this, {
          requestQuery: {'Action': 'ListVerifiedEmailAddresses'},
          completionCallback: function(operationError, parsedXmlData) {
            if (operationError) { throw operationError; }

            var operationResult = parsedXmlData.ListVerifiedEmailAddressesResult;
            if (completionCallback) {
              completionCallback(operationResult.VerifiedEmailAddresses.member);
            } else {
              throw new Error("A callback function must be supplied to retrieveConfirmedIdentities");
            }
          }
      });
    },

    // Removes a previously confirmed email address.
    removeConfirmedIdentity: function(emailIdentifier, completionCallback) {
      executeServiceRequest.call(this, {
          requestQuery: {'Action': 'DeleteVerifiedEmailAddress', 'EmailAddress': emailIdentifier},
          completionCallback: function(operationError, parsedXmlData) {
            if (operationError) { throw operationError; }

            if (completionCallback) {
              completionCallback(parsedXmlData.ResponseMetadata);
            }
          }
      });
    },

    // Fetches the current email sending quota for the account.
    fetchSendingLimits: function(completionCallback) {
      executeServiceRequest.call(this, {
          requestQuery: {'Action': 'GetSendQuota'},
          completionCallback: function(operationError, parsedXmlData) {
            if (operationError) { throw operationError; }

            if (completionCallback) {
              completionCallback(parsedXmlData.GetSendQuotaResult);
            } else {
              throw new Error("A callback function must be supplied to fetchSendingLimits");
            }
          }
      });
    },

    // Obtains detailed statistics about sending activity.
    obtainSendingMetrics: function(completionCallback) {
      executeServiceRequest.call(this, {
          requestQuery: {'Action': 'GetSendStatistics'},
          completionCallback: function(operationError, parsedXmlData) {
            if (operationError) { throw operationError; }

            if (completionCallback) {
              completionCallback(parsedXmlData.GetSendStatisticsResult);
            } else {
              throw new Error("A callback function must be supplied to obtainSendingMetrics");
            }
          }
      });
    },

    // Sends an email message using the configured service.
    dispatchEmail: function(emailMessageDetails, completionCallback) {
      executeServiceRequest.call(this, {
          requestQuery: constructEmailMessage(emailMessageDetails),
          completionCallback: function(operationError, parsedXmlData) {
            if (completionCallback) { completionCallback(operationError, parsedXmlData); }
          }
      });
    }
  };

  return ServiceConnector;

}());
module.exports = CloudEmailService;