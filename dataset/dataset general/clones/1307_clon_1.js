/*
 * This is a JavaScript module for interacting with Amazon Simple Email Service (SES).
 * It provides methods for sending emails, verifying addresses, and retrieving account statistics.
 *
 * Author: [Original Author Name/Company, if known, or just a placeholder]
 * Version: 1.0.0
 * License: MIT (or other applicable license)
 */

// Core dependencies required for SES operations
var _          = require('underscore');
var crypto     = require('crypto');
var qs         = require('querystring');
var request    = require('request');
var xml        = require('xml2js');

// Main AmazonSES module definition using an IIFE (Immediately Invoked Function Expression)
var AmazonSES = (
    function () {

    // --- Private Helper Functions ---

    /**
     * Initializes the SES client with access credentials.
     * @param {string} key - The AWS Access Key ID.
     * @param {string} secret - The AWS Secret Access Key.
     */
    var init = function (key, secret)
    {
        // Store credentials for later use in API calls.
        this.accessKeyId     = key;
        this.secretAccessKey = secret;
    };

    /**
     * Generates an HMAC-SHA256 signature for authentication.
     * @param {string} key - The secret key for signing.
     * @param {string} str - The string to be signed.
     * @returns {string} The base64-encoded HMAC signature.
     */
    var hmac = function (key, str) {
        var hash = crypto.createHmac('sha256', key); // Create HMAC instance
        return hash.update(str) // Update with string
                   .digest('base64'); // Get base64 digest
    };

    /**
     * Constructs a destination list object for SES API parameters.
     * @param {Array<string>} addresses - An array of email addresses.
     * @param {string} type - The destination type (e.g., 'To', 'Cc', 'Bcc').
     * @returns {Object} A key-value object suitable for SES API.
     */
    var getDestinationList = function (addresses, type)
    {
        var list = {}; // Initialize an empty list object
        // Iterate over each address and format it for the SES API.
        _.each( addresses, function (address, idx) {
            var key        = 'Destination.' + type + 'Addresses.member.' + (idx + 1);
            list[key]      = address;
        } );
        return list; // Return the formatted list
    };


    /**
     * Constructs a reply-to list object for SES API parameters.
     * @param {Array<string>} addresses - An array of reply-to email addresses.
     * @returns {Object} A key-value object suitable for SES API.
     */
    var getReplyToList = function (addresses) {
        var list = { }; // Initialize an object for reply-to addresses
        // Process each reply-to address.
        _.each( addresses, function (address, idx) {
            var key   = 'ReplyToAddresses.member.' + (idx + 1);
            list[key] = address;
        } );
        return list;
    };


    /**
     * Builds the complete message parameters for the SendEmail action.
     * @param {Object} opts - Message options including from, to, cc, bcc, subject, body.
     * @returns {Object} The complete set of parameters for the SES SendEmail API call.
     */
    var buildMessage = function (opts)
    {
        // Base parameters for sending an email.
        var params = {
            'Action'                   : 'SendEmail'
            , 'Source'                 : opts.from
            , 'Message.Body.Text.Data' : opts.body.text
            , 'Message.Body.Text.Charset': 'UTF-8' // Always UTF-8 for text
            , 'Message.Body.Html.Data' : opts.body.html
            , 'Message.Body.Html.Charset': 'UTF-8' // Always UTF-8 for HTML
            , 'Message.Subject.Data'   : opts.subject
        };

        // Extend with destination lists (To, Cc, Bcc).
        _.extend( params, getDestinationList(opts.to, 'To') );
        _.extend( params, getDestinationList(opts.cc, 'Cc') );
        _.extend( params, getDestinationList(opts.bcc, 'Bcc') );

        // Extend with reply-to addresses if provided.
        _.extend( params, getReplyToList(opts.replyTo) );

        return params; // Final message parameters
    };

    /**
     * Makes an authenticated call to the Amazon SES API.
     * This function handles signing the request and making the HTTP POST.
     * @param {Object} opts - Call options including query parameters and a callback function.
     */
    var call = function (opts)
    {
        var host = 'email.us-east-1.amazonaws.com'; // SES endpoint host
        var path = '/'; // Standard path for SES API

        var now = ( new Date() ).toUTCString(); // Current UTC timestamp for signing
        var body = qs.stringify(opts.query); // Query parameters converted to URL-encoded string

        // Construct the AWS3-HTTPS authorization header.
        var authorization =
            'AWS3-HTTPS '
            + 'AWSAccessKeyId=' + this.accessKeyId
            + ',Algorithm=HmacSHA256'
            + ',Signature=' + hmac(this.secretAccessKey, now); // Signed with HMAC

        // HTTP headers for the request.
        var headers = {
            'Date'               : now
            , 'Host'             : host
            , 'Content-Type'     : 'application/x-www-form-urlencoded; charset=utf-8'
            , 'Content-Length'   : body.length // Length of the request body
            , 'X-Amzn-Authorization': authorization
        };

        // Request options for the 'request' module.
        var options = {
            method  : 'POST'
            , uri   : 'https://' + host + path // Full URI for the API call
            , headers : headers
            , body    : body
        };

        // Make the actual HTTP request.
        request(options, function (error, response, body) {
            // Initialize XML parser for the response body.
            var parser = new xml.Parser();
            parser.addListener('end', function (data) {
                var err = null; // Default error state
                // Check if the response contains an 'Error' element.
                if ( data.hasOwnProperty('Error') )
                {
                    err = new Error(data.Error.Message); // Create new Error object
                }
                // Invoke the user-provided callback with error and data.
                opts.callback(err, data);
            });
            // Parse the XML response body.
            parser.parseString(body);
        });
    }; // End of 'call' function

    // --- Constructor Definition ---

    /**
     * The main constructor for the AmazonSES client.
     * @param {string} accessKeyId - Your AWS Access Key ID.
     * @param {string} secretAccessKey - Your AWS Secret Access Key.
     */
    var Constructor = function (accessKeyId, secretAccessKey)
    {
        // Call the private init function to set up credentials.
        init.call(this, accessKeyId, secretAccessKey); // Use .call to ensure 'this' context
    };

    // --- Prototype Methods ---

    // Define public methods on the constructor's prototype.
    Constructor.prototype = {
        constructor: AmazonSES, // Reference back to the constructor

        // JSDoc for verifyEmailAddress:
        /**
         * Verify an email address with Amazon SES.
         * This action triggers a confirmation email to be sent.
         *
         * @param {String} email   The email address to be verified.
         * @param {Function} callback A callback function `(err, data)` to handle the response.
         * @throws {Error} If the underlying SES call encounters an error.
         */
        verifyEmailAddress: function (email, callback) {
            call({
                query    : { 'Action': 'VerifyEmailAddress', 'EmailAddress': email }
                , callback : function (err, data) {
                    if (err) throw err; // Re-throw any API errors

                    if (callback) {
                        callback(data.ResponseMetadata); // Pass only metadata to callback
                    }
                }
            });
        },

        /*
         * Retrieves a list of all email addresses that have been
         * successfully verified for sending from this SES account.
         *
         * @param {Function} callback A callback function `(err, addresses)`
         *                            where `addresses` is an array of verified emails.
         * @throws {Error} If no callback is provided or an API error occurs.
         */
        listVerifiedEmailAddresses: function (callback) {
            call({
                query    : { 'Action': 'ListVerifiedEmailAddresses' }
                , callback : function (err, data) {
                    if (err) {
                        throw err;
                    } // Propagate errors

                    var result = data.ListVerifiedEmailAddressesResult; // Extract result
                    if (callback) {
                        callback(result.VerifiedEmailAddresses.member); // Pass member array
                    } else {
                        // Error handling for missing callback
                        throw Error("Must pass listVerifiedEmailAddresses a callback function");
                    }
                }
            });
        },

        /*
         * Deletes a specified email address from the list of verified
         * addresses associated with the AWS account.
         *
         * @param {String} email    The email address to be removed.
         * @param {Function} callback An optional callback function `(err, data)` for handling the response.
         */
        deleteVerifiedEmailAddress: function (email, callback) {
            call({
                query    : { 'Action': 'DeleteVerifiedEmailAddress', 'EmailAddress': email }
                , callback : function (err, data) {
                    if (err) throw err; // Check for and throw API errors

                    if (callback) {
                        callback(data.ResponseMetadata); // Callback with response metadata
                    }
                }
            });
        },

        /*
         * Fetches the user's current sending limits and statistics from SES.
         * This includes maximum send rate and daily send quota.
         *
         * @param {Function} callback A callback function `(err, quota)`
         *                            where `quota` contains the sending limit details.
         */
        getSendQuota: function (callback) {
            call({
                query    : { 'Action': 'GetSendQuota' }
                , callback : function (err, data) {
                    if (err) throw err;

                    if (callback) {
                        callback(data.GetSendQuotaResult); // Pass the quota result
                    } else {
                        // Crucial for proper error handling
                        throw Error("Must pass getSendQuota a callback function");
                    }
                }
            });
        },

        /*
         * Retrieves sending statistics for the user's SES account.
         * The data points represent 15-minute intervals over the last two weeks.
         *
         * @param {Function} callback A callback function `(err, statistics)`
         *                            where `statistics` is an object containing sending stats.
         */
        getSendStatistics: function (callback) {
            call({
                query    : { 'Action': 'GetSendStatistics' }
                , callback : function (err, data) {
                    if (err) throw err;

                    if (callback) {
                        callback(data.GetSendStatisticsResult); // Return the statistics data
                    } else {
                        // Ensure a callback is provided.
                        throw Error("Must pass getSendStatistics a callback function");
                    }
                }
            });
        },

        /*
         * Composes and sends an email message using Amazon SES.
         * The message is immediately queued for delivery.
         *
         * @param {Object} message  An object containing email components (from, to, subject, body, etc.).
         * @param {Function} callback A callback function `(err, data)` to handle the outcome of the send operation.
         */
        send: function (message, callback)
        {
            call({
                query    : buildMessage(message) // Build the full message parameters
                , callback : function (err, data) {
                    // Only invoke callback if it exists.
                    if (callback) { callback(err, data); }
                }
            });
        }
    }; // End of Constructor.prototype

    // Return the constructor function, making it the public interface of the module.
    return Constructor;

}
()); // IIFE invocation

// Export the AmazonSES constructor for use in other modules.
module.exports = AmazonSES;