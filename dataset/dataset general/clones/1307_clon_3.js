var _ = require('lodash'); // Changed from underscore to lodash
var crypto = require('crypto');
var querystring = require('querystring'); // Renamed qs to querystring
var reqClient = require('request'); // Renamed request to reqClient
var xml2js = require('xml2js'); // Renamed xml to xml2js

var AWSSESClient = (function() { // Renamed AmazonSES to AWSSESClient and changed IIFE structure

  // Internal configuration storage
  let config = {};

  // Initializes the client with credentials.
  const setupCredentials = function(accessKey, secretKey) { // Renamed init to setupCredentials
    if (!accessKey || !secretKey) { // Added validation
      throw new Error("AWS credentials (accessKey and secretKey) must be provided.");
    }
    config.accessKeyId = accessKey;
    config.secretAccessKey = secretKey;
    config.initialized = true; // Added a flag
  };

  // Generates an HMAC-SHA256 signature.
  const generateSignature = function(signingKey, dataString) { // Renamed hmac to generateSignature
    if (!signingKey || !dataString) { // Added validation
        return ''; // Return empty string for invalid inputs
    }
    const hmacHash = crypto.createHmac('sha256', signingKey);
    return hmacHash.update(dataString).digest('base64');
  };

  // Helper to construct address lists for To, Cc, Bcc.
  const constructRecipientList = function(emailAddresses, listType) { // Renamed getDestinationList to constructRecipientList
    const recipientMap = {};
    if (!_.isArray(emailAddresses) || emailAddresses.length === 0) { // Added validation and early exit
      return recipientMap;
    }
    _.forEach(emailAddresses, (emailAddr, index) => { // Changed _.each to _.forEach
      const paramKey = `Destination.${listType}Addresses.member.${index + 1}`;
      recipientMap[paramKey] = emailAddr;
    });
    return recipientMap;
  };
  
  // Helper to construct ReplyTo address list.
  const constructReplyToList = function(replyToAddresses) { // Renamed getReplyToList to constructReplyToList
    const replyMap = {};
    if (!_.isArray(replyToAddresses) || replyToAddresses.length === 0) { // Added validation and early exit
      return replyMap;
    }
    _.forEach(replyToAddresses, (addressItem, index) => {
      const paramKey = `ReplyToAddresses.member.${index + 1}`;
      replyMap[paramKey] = addressItem;
    });
    return replyMap;
  };
  
  // Builds the full message parameters for SendEmail action.
  const composeEmailParameters = function(options) { // Renamed buildMessage to composeEmailParameters
    // Using a more verbose object creation and conditional assignments
    let emailParams = {
        'Action': 'SendEmail',
        'Source': options.sourceEmail, // Renamed opts.from to options.sourceEmail
        'Message.Subject.Data': options.subjectLine // Renamed opts.subject to options.subjectLine
    };

    // Conditional body parts
    if (options.messageBody && options.messageBody.text) { // Renamed opts.body to options.messageBody
        emailParams['Message.Body.Text.Data'] = options.messageBody.text;
        emailParams['Message.Body.Text.Charset'] = options.messageBody.charsetText || 'UTF-8'; // Added optional charset
    }
    if (options.messageBody && options.messageBody.html) {
        emailParams['Message.Body.Html.Data'] = options.messageBody.html;
        emailParams['Message.Body.Html.Charset'] = options.messageBody.charsetHtml || 'UTF-8'; // Added optional charset
    }

    // Merging recipient lists
    _.assign(emailParams, constructRecipientList(options.recipientsTo, 'To')); // Renamed opts.to to options.recipientsTo, _.extend to _.assign
    _.assign(emailParams, constructRecipientList(options.recipientsCc, 'Cc')); // Renamed opts.cc to options.recipientsCc
    _.assign(emailParams, constructRecipientList(options.recipientsBcc, 'Bcc')); // Renamed opts.bcc to options.recipientsBcc
    _.assign(emailParams, constructReplyToList(options.replyToAddresses)); // Renamed opts.replyTo to options.replyToAddresses
    
    return emailParams;
  };

  // Makes the actual AWS SES API call.
  const executeApiCall = function(operationOptions) { // Renamed call to executeApiCall
    if (!config.initialized) { // Added guard clause
      console.error("AWS SES Client not initialized. Call constructor with credentials first.");
      operationOptions.callback(new Error("Client not initialized"), null);
      return;
    }

    const serviceHost = 'email.us-east-1.amazonaws.com'; // Renamed host to serviceHost
    const apiPath = '/';

    const currentTimestamp = (new Date()).toUTCString(); // Renamed now to currentTimestamp
    const requestBody = querystring.stringify(operationOptions.apiQuery); // Renamed body to requestBody, opts.query to operationOptions.apiQuery

    const authSignature = generateSignature(config.secretAccessKey, currentTimestamp); // Use config.secretAccessKey
    
    // Building authorization header more explicitly
    const authHeaderValue = [
        'AWS3-HTTPS',
        'AWSAccessKeyId=' + config.accessKeyId, // Use config.accessKeyId
        'Algorithm=HmacSHA256',
        'Signature=' + authSignature
    ].join(' ');

    const requestHeaders = { // Renamed headers to requestHeaders
        'Date': currentTimestamp,
        'Host': serviceHost,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Content-Length': Buffer.byteLength(requestBody, 'utf8'), // Changed body.length to Buffer.byteLength for accuracy
        'X-Amzn-Authorization': authHeaderValue
    };

    const requestConfig = { // Renamed options to requestConfig
        method: 'POST',
        uri: `https://${serviceHost}${apiPath}`, // Using template literal
        headers: requestHeaders,
        body: requestBody
    };

    reqClient(requestConfig, (err, httpResponse, responseBody) => { // Renamed error to err, response to httpResponse, body to responseBody
      if (err) {
        return operationOptions.callback(err, null); // Early exit on request error
      }

      const xmlParser = new xml2js.Parser({ explicitArray: false }); // Added explicitArray: false for simpler parsing
      xmlParser.parseString(responseBody, (parseErr, parsedData) => { // Changed addListener to callback in parseString
        if (parseErr) {
          return operationOptions.callback(parseErr, null);
        }

        let apiError = null;
        // Check for AWS error structure
        if (parsedData && parsedData.ErrorResponse && parsedData.ErrorResponse.Error) {
          const awsError = parsedData.ErrorResponse.Error;
          apiError = new Error(awsError.Message || 'Unknown AWS API Error');
          apiError.code = awsError.Code; // Add error code
          apiError.type = awsError.Type; // Add error type
        } else if (httpResponse.statusCode >= 400) { // Check for HTTP errors not caught by XML parsing
            apiError = new Error(`HTTP Error: ${httpResponse.statusCode} - ${httpResponse.statusMessage}`);
            apiError.statusCode = httpResponse.statusCode;
        }

        operationOptions.callback(apiError, parsedData); // Renamed opts.callback to operationOptions.callback
      });
    });
  };

  var ClientConstructor = function(accessKeyIdentifier, secretAccessKeyString) { // Renamed Constructor to ClientConstructor, changed param names
    setupCredentials(accessKeyIdentifier, secretAccessKeyString); // Calls the new setup function
    this.name = 'AWSSESClient'; // Added a name property
  };

  ClientConstructor.prototype = {
    constructor: AWSSESClient, // Reference the outer IIFE name
    /**
     * Initiates the verification process for an email address.
     *
     * @param {String} targetEmail The email address to be verified.
     * @param {Function} completionCallback Callback function (err, result).
     * @throws {Error} If client not initialized or invalid email.
     */
    initiateEmailVerification: function(targetEmail, completionCallback) { // Renamed verifyEmailAddress
      if (!targetEmail || typeof targetEmail !== 'string') { // Added validation
          return completionCallback(new Error("A valid email string is required for verification."), null);
      }
      executeApiCall({ // Renamed call to executeApiCall
          apiQuery: {'Action': 'VerifyEmailAddress', 'EmailAddress': targetEmail}, // Renamed query to apiQuery
          callback: function(err, data) {
            if (err) {
                if (completionCallback) return completionCallback(err); // Pass error directly
                throw err; // Re-throw if no callback to handle
            }
            if (completionCallback) {
              // Extracting RequestId from ResponseMetadata
              const requestId = _.get(data, 'VerifyEmailAddressResponse.ResponseMetadata.RequestId'); // Using lodash get
              completionCallback(null, { success: true, requestId: requestId }); // More structured success response
            }
        }
      });
    },
    /**
     * Retrieves a list of all verified email addresses associated with the AWS account.
     *
     * @param {Function} completionCallback Callback function (err, verifiedAddresses).
     * @throws {Error} If client not initialized or callback missing.
     */
    retrieveVerifiedEmails: function(completionCallback) { // Renamed listVerifiedEmailAddresses
      if (typeof completionCallback !== 'function') { // Added validation
        throw new Error("A callback function must be provided to retrieveVerifiedEmails.");
      }
      executeApiCall({
          apiQuery: {'Action': 'ListVerifiedEmailAddresses'},
          callback: function(err, data) {
            if (err) return completionCallback(err);

            const resultData = _.get(data, 'ListVerifiedEmailAddressesResponse.ListVerifiedEmailAddressesResult.VerifiedEmailAddresses'); // More robust path
            let addressList = [];
            if (resultData && resultData.member) {
                // Ensure member is always an array
                addressList = _.castArray(resultData.member); // Using lodash castArray
            }
            completionCallback(null, addressList); // Return null for error if successful
        }
      });
    },
    /**
     * Removes a specified email address from the list of verified addresses.
     *
     * @param {String} emailToRemove The email address to delete.
     * @param {Function} completionCallback Callback function (err, result).
     */
    removeVerifiedEmail: function(emailToRemove, completionCallback) { // Renamed deleteVerifiedEmailAddress
      if (!emailToRemove || typeof emailToRemove !== 'string') { // Added validation
          return completionCallback(new Error("A valid email string is required for deletion."), null);
      }
      executeApiCall({
          apiQuery: {'Action': 'DeleteVerifiedEmailAddress', 'EmailAddress': emailToRemove},
          callback: function(err, data) {
            if (err) return completionCallback(err);

            const requestId = _.get(data, 'DeleteVerifiedEmailAddressResponse.ResponseMetadata.RequestId');
            completionCallback(null, { success: true, requestId: requestId });
        }
      });
    },
    /**
     * Fetches the current AWS SES sending limits for the account.
     *
     * @param {Function} completionCallback Callback function (err, quotaData).
     */
    fetchSendingQuota: function(completionCallback) { // Renamed getSendQuota
      if (typeof completionCallback !== 'function') {
        throw new Error("A callback function must be provided to fetchSendingQuota.");
      }
      executeApiCall({
          apiQuery: {'Action': 'GetSendQuota'},
          callback: function(err, data) {
            if (err) return completionCallback(err);

            const quotaResult = _.get(data, 'GetSendQuotaResponse.GetSendQuotaResult');
            completionCallback(null, quotaResult);
        }
      });
    },
    /**
     * Retrieves the sending statistics, providing a historical view of sending activity.
     *
     * @param {Function} completionCallback Callback function (err, statisticsData).
     */
    getSendingStatistics: function(completionCallback) { // Renamed getSendStatistics
      if (typeof completionCallback !== 'function') {
        throw new Error("A callback function must be provided to getSendingStatistics.");
      }
      executeApiCall({
          apiQuery: {'Action': 'GetSendStatistics'},
          callback: function(err, data) {
            if (err) return completionCallback(err);

            const statsResult = _.get(data, 'GetSendStatisticsResponse.GetSendStatisticsResult');
            // Ensure DataPoints is an array
            if (statsResult && statsResult.DataPoints && statsResult.DataPoints.member) {
                statsResult.DataPoints = _.castArray(statsResult.DataPoints.member);
            } else {
                statsResult.DataPoints = []; // Initialize if not found
            }
            completionCallback(null, statsResult);
        }
      });
    },
    /**
     * Sends an email message using the specified message components.
     *
     * @param {Object} emailDetails The object containing email components (sourceEmail, subjectLine, messageBody, recipientsTo, etc.).
     * @param {Function} completionCallback Callback function (err, responseData).
     */
    dispatchEmail: function(emailDetails, completionCallback) { // Renamed send
        // Added basic validation for essential email details
        if (!emailDetails || !emailDetails.sourceEmail || !emailDetails.subjectLine || !emailDetails.recipientsTo) {
            return completionCallback(new Error("Missing essential email details (sourceEmail, subjectLine, recipientsTo)."), null);
        }
      executeApiCall({
          apiQuery: composeEmailParameters(emailDetails), // Renamed buildMessage to composeEmailParameters
          callback: function(err, data) {
            if (completionCallback) {
                // Extract MessageId for a more direct success response
                const messageId = _.get(data, 'SendEmailResponse.SendEmailResult.MessageId');
                if (err) {
                    completionCallback(err, null);
                } else {
                    completionCallback(null, { success: true, messageId: messageId });
                }
            }
        }
      });
    }
  };

  return ClientConstructor; // Return the new constructor name

}());
module.exports = AWSSESClient; // Export the new client name