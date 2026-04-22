'use strict';
// This file contains the logic for Google API authentication.

  var jsonWebSign = require('jws'); // Module for signing JSON Web Tokens
  var fileSystem = require('fs'); // Node.js file system module for reading keys
  var httpRequest = require('request'); // Module for making HTTP requests


/*
 * AuthServiceClient Constructor
 * Initializes the authentication service with configuration.
 * @param {object} config - Configuration options for the service.
 * @param {function} completionHandler - Callback function to invoke after initialization.
 */
var AuthService = function(config, completionHandler) {
  this.accessToken = null; // Stores the current access token
  this.expiryTimestamp = null; // Stores the expiration time of the access token

  // Assign configuration properties to the instance
  this.issuerId = config.iss;
  this.scopeValue = config.scope;
  this.subjectId = config.sub;
  this.principalName = config.prn;

  // Determine the key source: file, direct string, or missing.
  if (config.privateKeyFilePath) {
    let instanceRef = this; // Capture 'this' for the nested callback
    process.nextTick(function() { // Defer file reading to the next event loop tick
      fileSystem.readFile(config.privateKeyFilePath, function(operationError, readContent) {
        if (operationError) {
          return completionHandler(operationError);
        }
        instanceRef.privateKey = readContent; // Store the read key
        completionHandler();
      });
    });
  } else if (config.key) {
    this.privateKey = config.key;
    process.nextTick(completionHandler); // Key is directly provided, just defer callback
  } else {
    // If no key source is provided, throw an error
    completionHandler(new Error('Authentication key missing. Please provide either "key" or "privateKeyFilePath" configuration option.'));
  }
};


// Prototype method: retrieveToken
// Fetches a valid access token, using a cached one if available and not expired.
AuthService.prototype.retrieveToken = function(completionHandler) {
  const currentTime = (new Date()).getTime();
  const tokenExpirationThreshold = this.expiryTimestamp * 1000;

  // Check if a token exists, has an expiry, and is still valid
  if (this.accessToken && this.expiryTimestamp && currentTime < tokenExpirationThreshold) {
    completionHandler(null, this.accessToken); // Return cached token
  } else {
    this.fetchAccessToken(completionHandler); // Obtain a new token
  }
};


/*
 * Prototype method: fetchAccessToken
 * Obtains a fresh access token from the Google OAuth2 endpoint.
 * This involves signing a JWT and exchanging it for an access token.
 */
AuthService.prototype.fetchAccessToken = function(completionHandler) {
  const instanceRef = this; // Preserve context for callbacks
  const issuedAtTime = Math.floor(new Date().getTime() / 1000); // Current UNIX timestamp in seconds

  // Construct the JWT payload
  var jwtPayload = {
    iss: this.issuerId, // Issuer identifier
    scope: this.scopeValue, // Access scope
    aud: 'https://accounts.google.com/o/oauth2/token', // Audience
    exp: issuedAtTime + 3600, // Expiration time (1 hour from now)
    iat: issuedAtTime // Issued at time
  };

  // Conditionally add subject and principal name to payload
  if (this.subjectId) {
    jwtPayload.sub = this.subjectId;
  }

  if (this.principalName) {
    jwtPayload.prn = this.principalName;
  }

  // Sign the JSON Web Token
  var signedAssertion = jsonWebSign.sign({
    header: {
      alg: 'RS256', // Algorithm for signing
      typ: 'JWT' // Type of token
    },
    payload: jwtPayload, // The constructed payload
    secret: this.privateKey // The private key for signing
  });


  // Prepare HTTP request options for token exchange
  var requestOptions = {
    url: 'https://accounts.google.com/o/oauth2/token',
    method: 'POST',
    strictSSL: false, // For development/testing, production should be true
    form: {
      'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer', // OAuth grant type
      'assertion': signedAssertion // The signed JWT assertion
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded' // Request content type
    }
  };

  // Execute the HTTP request to get the access token
  httpRequest(requestOptions, function(commError, serverResponse, responseBody) {
    if (commError) { // Handle network or request errors
      instanceRef.accessToken = null;
      instanceRef.expiryTimestamp = null;
      completionHandler(commError, null);
    } else {
      try {
        const parsedData = JSON.parse(responseBody); // Attempt to parse the JSON response

        if (parsedData.error) { // Check for an error message within the parsed JSON
          instanceRef.accessToken = null;
          instanceRef.expiryTimestamp = null;
          completionHandler(parsedData.error, null);
        } else {
          // Successfully obtained access token
          instanceRef.accessToken = parsedData.access_token;
          instanceRef.expiryTimestamp = issuedAtTime + 3600; // Set new expiry time
          completionHandler(null, instanceRef.accessToken);
        }
      } catch (parseError) { // Handle JSON parsing errors
        completionHandler(parseError, null);
      }
    }
  });
};


// Export the AuthService constructor for external use.
module.exports = AuthService;