'use strict' ;


/*
 * This file implements the GAPI class,
 * which is responsible for handling Google API
 * authentication using JSON Web Tokens (JWT).
 */

var jws     = require ( 'jws' ) ; // JSON Web Token signing library.
var fs      = require ( 'fs' ) ;  // Node.js file system module for reading keys.
var request = require ( 'request' ) ; // HTTP request library.



/**
 * GAPI Constructor Function.
 * Initializes a new GAPI instance with provided options.
 *
 * @param {object} options - Configuration options for the GAPI client.
 *                           Expected properties: iss, scope, sub (optional), prn (optional), keyFile (path to key) or key (key string).
 * @param {Function} callback - A callback function to be executed after initialization.
 *                              It is called with an error if key loading fails, or with no arguments on success.
 */
var GAPI = function ( options , callback ) {

  // Initialize internal state variables for token management.
  this . token         =  null ;
  this . token_expires =  null ;


  // Assign core identity and scope options from the constructor arguments.
  this . iss   = options . iss ;   // Issuer claim.
  this . scope = options . scope ; // Scopes for which to request access.
  this . sub   = options . sub ;   // Subject claim (optional).
  this . prn   = options . prn ;   // Principal claim (optional, often used for delegated authority).


  /*
   * Handle the private key loading.
   * The key can be provided either as a file path or directly as a string.
   */
  if  ( options . keyFile )
  {
    var self = this ; // Preserve 'this' context for asynchronous operations.
    // Read the private key from the specified file asynchronously.
    process . nextTick ( function ( ) {
      fs . readFile ( options . keyFile , function ( err , res ) {
        if ( err ) {
          // If an error occurs during file reading, invoke the callback with the error.
          return callback ( err ) ;
        }
        self . key = res ; // Store the read key.
        callback ( ) ;     // Indicate successful initialization.
      } ) ;
    } ) ;
  }
  else if ( options . key )
  {
    this . key = options . key ; // Key is provided directly as a string.
    process . nextTick ( callback ) ; // Proceed with initialization immediately.
  }
  else
  {
    // If no key or keyFile is provided, throw an error indicating missing configuration.
    callback ( new Error ( "Missing key, key or keyFile option must be provided!" ) ) ;
  }
} ;


/**
 * GAPI.prototype.getToken
 *
 * Method to retrieve a Google API access token.
 * It checks for a valid, cached token first to minimize API calls.
 * If no valid token is found, it calls `getAccessToken` to obtain a new one.
 *
 * @param {Function} callback - The callback function to call with (err, token).
 */
GAPI . prototype . getToken = function ( callback ) {

  // Check if a token exists, has an expiration time, and is not yet expired.
  if ( this . token
      && this . token_expires
      && ( new Date ( ) ) . getTime ( ) < this . token_expires * 1000 )
  {
    // If the token is valid and not expired, return it immediately.
    callback ( null , this . token ) ;
  }
  else
  {
    // Otherwise, obtain a new access token.
    this . getAccessToken ( callback ) ;
  }
} ;


/**
 * GAPI.prototype.getAccessToken
 *
 * This method is responsible for obtaining a fresh access token from Google's OAuth2 endpoint.
 * It constructs and signs a JWT, then exchanges it for an access token via an HTTP POST request.
 *
 * @param {Function} callback - The callback function to call with (err, accessToken).
 */
GAPI . prototype . getAccessToken = function ( callback ) {
  var self = this ; // Capture 'this' for use within the asynchronous request callback.
  // Calculate the 'issued at' timestamp (in seconds since epoch) for the JWT.
  var iat = Math . floor ( new Date ( ) . getTime ( ) / 1000 ) ;


  // Construct the JWT payload with required claims.
  var payload = {
    iss   : this . iss ,                                 // Issuer (client email).
    scope : this . scope ,                               // Scopes requested.
    aud   : 'https://accounts.google.com/o/oauth2/token' , // Audience (Google token endpoint).
    exp   : iat + 3600 ,                                 // Expiration time (1 hour from 'iat').
    iat   : iat                                          // Issued at time.
  } ;


  // Conditionally add 'sub' and 'prn' claims if they are present in the options.
  if ( this . sub )
    payload . sub = this . sub ; // Subject (user email for delegation).

  if ( this . prn )
    payload . prn = this . prn ; // Principal (user email for delegation, older term).


  // Sign the JWT using the private key.
  var signedJWT = jws . sign ( {
    header  : { alg : 'RS256' , typ : 'JWT' } , // JWT header specifies algorithm and type.
    payload : payload ,                          // The constructed payload.
    secret  : this . key                         // The private key used for signing.
  } ) ;


  // Define the options for the HTTP POST request to the token endpoint.
  var post_options = {
    url        : 'https://accounts.google.com/o/oauth2/token' , // Google token exchange URL.
    method     : 'POST' ,                                       // Must be a POST request.
    strictSSL  : false ,                                        // Controls SSL certificate validation.
    form       : {
      'grant_type' : 'urn:ietf:params:oauth:grant-type:jwt-bearer' , // OAuth2 grant type.
      'assertion'  : signedJWT                                     // The signed JWT assertion.
    } ,
    headers    : {
      'Content-Type' : 'application/x-www-form-urlencoded' // Specify content type for form data.
    }
  } ;


  // Execute the HTTP POST request.
  request ( post_options , function ( error , response , body ) {

    if ( error ) {
      // Handle network or request-level errors.
      self . token         = null ; // Clear any potentially invalid token.
      self . token_expires = null ; // Clear expiration.
      callback ( error , null ) ;  // Invoke callback with the error.
    } else {
      // If the request itself was successful, try to parse the response body.
      try {
        var d = JSON . parse ( body ) ; // Parse the JSON response.

        if ( d . error ) {
          // If the Google API returned an error in the response body.
          self . token         = null ; // Clear token.
          self . token_expires = null ; // Clear expiration.
          callback ( d . error , null ) ; // Invoke callback with the API error.
        } else {
          // Successfully received an access token.
          self . token         = d . access_token ;      // Store the new access token.
          self . token_expires = iat + 3600 ;            // Calculate and store its expiration time.
          callback ( null , self . token ) ;            // Invoke callback with the new token.
        }
      } catch ( e ) {
        // Handle JSON parsing errors if the response body is not valid JSON.
        callback ( e , null ) ;
      }
    }
  } ) ;
} ;


// Export the GAPI constructor so it can be used by other modules.
module . exports = GAPI ;