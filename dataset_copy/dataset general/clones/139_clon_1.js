/*
 * This file contains the implementation for a PayPal API client.
 * It handles both Adaptive Accounts and Adaptive Payments APIs.
 *
 * Author: Original Developer
 * Date: 2023-10-27
 * Version: 1.0.1
 */

// Core Node.js modules for HTTPS requests and utility functions.
var https = require('https')
  , util = require('util');


// --- PayPal Adaptive Accounts API Methods ---
/*
 * Defines an array of method names available for the
 * PayPal Adaptive Accounts API. These will be dynamically
 * added to the Paypal prototype.
 */
var adaptiveAccountsMethods =
  [
    'AddBankAccount'
  , 'AddPaymentCard'
  , 'CheckComplianceStatus'
  , 'CreateAccount'
  , 'GetUserAgreement'
  , 'GetVerifiedStatus'
  , 'SetFundingSourceConfirmed'
  , 'UpdateComplianceStatus'
  ]
;


// --- PayPal Adaptive Payments API Methods ---
/*
 * Defines an array of method names available for the
 * PayPal Adaptive Payments API. These will also be dynamically
 * added to the Paypal prototype.
 */
var adaptivePaymentsMethods =
  [
    'CancelPreapproval'
  , 'ConvertCurrency'
  , 'ExecutePayment'
  , 'GetFundingPlans'
  , 'GetShippingAddresses'
  , 'PreapprovalDetails'
  , 'SetPaymentOptions'
  ]
;


// --- Utility Function: Deep Merge Objects ---
/*
 * Merges properties from object 'b' into object 'a'.
 * Performs a deep merge for nested objects.
 *
 * @param {Object} a - The target object to merge into.
 * @param {Object} b - The source object to merge from.
 * @returns {Object} The merged object 'a'.
 */
function merge(a, b)
{
  // Iterate over all properties in the source object 'b'.
  for (var p in b)
  {
    try
    {
      /*
       * If the property in 'b' is itself an object,
       * recursively merge it into the corresponding property in 'a'.
       */
      if (b[p].constructor === Object)
      {
        a[p] = merge(a[p], b[p]);
      }
      else
      {
        // Otherwise, simply assign the value from 'b' to 'a'.
        a[p] = b[p];
      }
    }
    catch (e)
    {
      // If an error occurs during property access (e.g., 'a[p]' is undefined),
      // just assign the value from 'b'.
      a[p] = b[p];
    }
  }

  // Return the modified target object.
  return a;
}


// --- Utility Function: Generate Default Request Payload ---
/*
 * Creates a standard request envelope for PayPal API calls.
 * This ensures consistent error language and detail level.
 *
 * @returns {Object} A default payload structure.
 */
function defaultPayload()
{
  return {
    requestEnvelope: {
      errorLanguage: 'en_US' // Default error language.
      , detailLevel: 'ReturnAll' // Request all details in the response.
    }
  };
}


// --- Core HTTP POST Request Function ---
/*
 * Performs an HTTPS POST request to a specified endpoint.
 * Handles data serialization, headers, and response parsing.
 *
 * @param {Object} options - Request options including hostname, path, data, and headers.
 * @param {Function} callback - Callback function (error, response) to handle the result.
 */
function httpsPost(options, callback)
{
  // Set the HTTP method to POST.
  options.method = 'POST';

  // Ensure headers object exists, initialize if not.
  options.headers = options.headers || {};

  // Serialize data to JSON string if it's not already a string.
  var data = (typeof options.data !== 'string')
    ? JSON.stringify(options.data)
    : options.data;

  // Set the Content-Length header for the request body.
  options.headers['Content-Length'] = Buffer.byteLength(data);


  // Create the HTTPS request object.
  var req = https.request(options);

  // --- Event Listener for Response ---
  req.on('response', function(res)
  {
    var response = ''; // Initialize an empty string to accumulate response data.
    res.setEncoding('utf8'); // Set the encoding for the response data.

    // --- Event Listener for Data Chunks ---
    res.on('data', function(chunk)
    {
      response += chunk; // Append incoming data chunks to the response string.
    });

    // --- Event Listener for End of Response ---
    res.on('end', function()
    {
      // Once all data is received, call the callback with the full response.
      return callback(null, {
        statusCode: res.statusCode // HTTP status code of the response.
        , body: response // The complete response body.
      });
    });
  });

  // --- Event Listener for Request Errors ---
  req.on('error', function(e)
  {
    // If an error occurs during the request, pass it to the callback.
    callback(e);
  });

  // Write the request body data if available.
  if (data)
  {
    req.write(data);
  }

  // End the request.
  req.end();
}


// --- Main PayPal API Client Constructor ---
/*
 * Initializes a new PayPal API client instance.
 * Validates configuration and sets up default parameters.
 *
 * @param {Object} config - Configuration object for PayPal API credentials and settings.
 * @throws {Error} If required configuration parameters are missing.
 */
var Paypal = function(config)
{
  // --- Configuration Validation ---
  if (!config) throw new Error('Config is required');
  if (!config.userId) throw new Error('Config must have userId');
  if (!config.password) throw new Error('Config must have password');
  if (!config.signature) throw new Error('Config must have signature');
  // Either appId or sandbox must be provided.
  if (!config.appId && !config.sandbox) throw new Error('Config must have appId');


  // --- Default Configuration Settings ---
  var defaultConfig = {
    requestFormat: 'JSON' // Default request data format.
    , responseFormat: 'JSON' // Default response data format.
    , sandbox: false // Whether to use sandbox environment by default.
    , productionHostname: 'svcs.paypal.com' // Production API hostname.
    , sandboxHostname: 'svcs.sandbox.paypal.com' // Sandbox API hostname.
    , appId: 'APP-80W284485P519543T' // Default application ID (for production).
    , approvalUrl: 'https://www.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s' // Production approval URL.
    , sandboxApprovalUrl: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s' // Sandbox approval URL.
    , preapprovalUrl: 'https://www.paypal.com/webscr?cmd=_ap-preapproval&preapprovalkey=%s' // Production preapproval URL.
    , sandboxPreapprovalUrl: 'https://www.sandbox.paypal.com/webscr?cmd=_ap-preapproval&preapprovalkey=%s' // Sandbox preapproval URL.
  };

  // Merge provided config with default config, prioritizing provided values.
  this.config = merge(defaultConfig, config);
};


// --- Prototype Method: Generic API Call Handler ---
/*
 * Handles making generic calls to PayPal's Adaptive APIs.
 * Constructs the request options, sends the request, and processes the response.
 *
 * @param {string} apiMethod - The specific API method to call (e.g., 'AdaptivePayments/Pay').
 * @param {Object} data - The request payload for the API method.
 * @param {Function} callback - Callback function (error, result) for API response.
 */
Paypal.prototype.callApi = function(apiMethod, data, callback)
{
  // Retrieve the client's configuration.
  var config = this.config;

  // Prepare options for the HTTPS request.
  var options = {
    hostname: config.sandbox ? config.sandboxHostname : config.productionHostname // Select hostname based on sandbox setting.
    , path: '/' + apiMethod // Construct the API endpoint path.
    , data: data // The request data to be sent.
    , headers: {
      'X-PAYPAL-SECURITY-USERID': config.userId // PayPal API user ID.
      , 'X-PAYPAL-SECURITY-PASSWORD': config.password // PayPal API password.
      , 'X-PAYPAL-SECURITY-SIGNATURE': config.signature // PayPal API signature.
      , 'X-PAYPAL-APPLICATION-ID': config.appId // PayPal application ID.
      , 'X-PAYPAL-REQUEST-DATA-FORMAT': config.requestFormat // Expected request format (JSON/NV).
      , 'X-PAYPAL-RESPONSE-DATA-FORMAT': config.responseFormat // Expected response format (JSON/NV).
    }
  };

  // Add optional headers if present in config.
  if (config.sandboxEmailAddress)
  {
    options.headers['X-PAYPAL-SANDBOX-EMAIL-ADDRESS'] = config.sandboxEmailAddress;
  }

  if (config.deviceIpAddress)
  {
    options.headers['X-PAYPAL-DEVICE-IPADDRESS'] = config.deviceIpAddress;
  }


  // Make the HTTPS POST request using the helper function.
  httpsPost(options, function(error, response)
  {
    // If an HTTP-level error occurred, return it immediately.
    if (error) { return callback(error); }

    var body = response.body; // The raw response body.
    var statusCode = response.statusCode; // The HTTP status code.

    // --- Response Body Parsing ---
    // If JSON format is expected, attempt to parse the body.
    if (config.responseFormat === 'JSON')
    {
      try
      {
        body = JSON.parse(body); // Parse JSON string to object.
      }
      catch (e)
      {
        // Handle JSON parsing errors.
        var err = new Error('Invalid JSON Response Received');
        err.response = body;
        err.httpStatusCode = response.statusCode;
        return callback(err);
      }
    }


    // --- HTTP Status Code Check ---
    // Check if the HTTP status code indicates an error (outside 2xx range).
    if (statusCode < 200 || statusCode >= 300)
    {
      error = new Error('Response Status: ' + statusCode);
      error.response = body;
      error.httpStatusCode = statusCode;
      return callback(error);
    }

    // Attach the HTTP status code to the parsed body for convenience.
    body.httpStatusCode = statusCode;


    // --- PayPal API Acknowledge (ACK) Check ---
    // Check the 'ack' field in the response envelope for success.
    if (/^(Success|SuccessWithWarning)$/.test(body.responseEnvelope.ack))
    {
      callback(null, body); // Call back with no error and the parsed body.
    }
    else
    {
      // If ACK is not 'Success' or 'SuccessWithWarning', indicate an API-level error.
      var err = new Error('Response ack is ' + body.responseEnvelope.ack + '. Check the response for more info');
      return callback(err, body); // Call back with the error and the parsed body.
    }
  });
};


// --- Specific PayPal Adaptive Payments API Methods ---
// These methods provide a more convenient interface for common operations.

/*
 * Retrieves payment options for a given payKey.
 *
 * @param {string} payKey - The key of the payment to retrieve options for.
 * @param {Function} callback - Callback function (error, result).
 */
Paypal.prototype.getPaymentOptions = function(payKey, callback)
{
  // Ensure payKey is provided.
  if (!payKey)
  {
    return callback(new Error('Required "payKey"'));
  }

  // Create a default payload and add the payKey.
  var data = defaultPayload();
  data.payKey = payKey;

  // Call the generic API handler.
  this.callApi('AdaptivePayments/GetPaymentOptions', data, callback);
};


/*
 * Retrieves details for a specific payment.
 *
 * @param {Object} params - Object containing payKey, transactionId, or trackingId.
 * @param {Function} callback - Callback function (error, result).
 */
Paypal.prototype.paymentDetails = function(params, callback)
{
  // Ensure at least one identifier is provided.
  if (!params.payKey && !params.transactionId && !params.trackingId)
  {
    return callback(new Error('Required "payKey" or "transactionId" or "trackingId" on first param'));
  }

  // Merge default payload with provided parameters.
  var data = merge(defaultPayload(), params);

  // Call the generic API handler.
  this.callApi('AdaptivePayments/PaymentDetails', data, callback);
};


/*
 * Initiates a payment.
 *
 * @param {Object} data - Payment request data.
 * @param {Function} callback - Callback function (error, result).
 */
Paypal.prototype.pay = function(data, callback)
{
  var config = this.config; // Get client configuration.

  // Call the generic API handler for the 'Pay' method.
  this.callApi('AdaptivePayments/Pay', data, function(err, res)
  {
    // If an error occurred, propagate it.
    if (err) { return callback(err, res); }

    // If the payment was created successfully, generate the approval URL.
    if (res.paymentExecStatus === 'CREATED')
    {
      // Select the correct approval URL based on sandbox setting.
      var url = config.sandbox ? config.sandboxApprovalUrl : config.approvalUrl;
      // Format the URL with the payKey.
      res.paymentApprovalUrl = util.format(url, res.payKey);
    }

    // Return the result.
    return callback(null, res);
  });
};


/*
 * Initiates a preapproval.
 *
 * @param {Object} data - Preapproval request data.
 * @param {Function} callback - Callback function (error, result).
 */
Paypal.prototype.preapproval = function(data, callback)
{
  var config = this.config; // Get client configuration.

  // Call the generic API handler for the 'Preapproval' method.
  this.callApi('AdaptivePayments/Preapproval', data, function(err, res)
  {
    // If an error occurred, propagate it.
    if (err) { return callback(err, res); }

    // If a preapproval key was returned, generate the preapproval URL.
    if (res.preapprovalKey)
    {
      // Select the correct preapproval URL based on sandbox setting.
      var url = config.sandbox ? config.sandboxPreapprovalUrl : config.preapprovalUrl;
      // Format the URL with the preapprovalKey.
      res.preapprovalUrl = util.format(url, res.preapprovalKey);
    }

    // Return the result.
    return callback(null, res);
  });
};


/*
 * Processes a refund.
 *
 * @param {Object} params - Object containing payKey, transactionId, or trackingId.
 * @param {Function} callback - Callback function (error, result).
 */
Paypal.prototype.refund = function(params, callback)
{
  // Ensure at least one identifier is provided.
  if (!params.payKey && !params.transactionId && !params.trackingId)
  {
    return callback(new Error('Required "payKey" or "transactionId" or "trackingId" on first param'));
  }

  // Merge default payload with provided parameters.
  var data = merge(defaultPayload(), params);

  // Call the generic API handler.
  this.callApi('AdaptivePayments/Refund', data, callback);
};


// --- Dynamic Method Generation for Adaptive Payments API ---
// This loop automatically creates prototype methods for each Adaptive Payments method.
adaptivePaymentsMethods.forEach(function(method)
{
  // Convert method name to camelCase for the prototype method name (e.g., 'PaymentDetails' -> 'paymentDetails').
  var prototypeMethodName = method.charAt(0).toLowerCase() + method.slice(1);
  // Construct the full API method path (e.g., 'AdaptivePayments/PaymentDetails').
  var apiMethodName = 'AdaptivePayments/' + method;

  // Add the method to the Paypal prototype.
  Paypal.prototype[prototypeMethodName] = function(data, callback)
  {
    // These dynamically generated methods simply call the generic callApi.
    this.callApi(apiMethodName, data, callback);
  };
});


// --- Dynamic Method Generation for Adaptive Accounts API ---
// This loop automatically creates prototype methods for each Adaptive Accounts method.
adaptiveAccountsMethods.forEach(function(method)
{
  // Convert method name to camelCase for the prototype method name (e.g., 'CreateAccount' -> 'createAccount').
  var prototypeMethodName = method.charAt(0).toLowerCase() + method.slice(1);
  // Construct the full API method path (e.g., 'AdaptiveAccounts/CreateAccount').
  var apiMethodName = 'AdaptiveAccounts/' + method;

  // Add the method to the Paypal prototype.
  Paypal.prototype[prototypeMethodName] = function(data, callback)
  {
    // These dynamically generated methods simply call the generic callApi.
    this.callApi(apiMethodName, data, callback);
  };
});


// Export the Paypal constructor for use in other modules.
module.exports = Paypal;