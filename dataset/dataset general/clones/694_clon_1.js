/*
 * This file provides a robust JavaScript API wrapper
 * for interacting with the Shopify OAuth2 service.
 * It handles authentication, token exchange, and
 * standardized request making, including rate limit
 * and error handling mechanisms.
 *
 * Author: Original developer - Chris
 * Date: 2023-10-27
 * Version: 1.0.1
 * License: MIT
 */

 var md5 = require( 'MD5' ); /* Import the MD5 hashing utility */

 function ShopifyAPI ( config ) {

  // Ensure 'new' keyword is used, if not, instantiate and return
  if ( ! ( this instanceof ShopifyAPI ) ) return new ShopifyAPI ( config ) ;

  // Configuration object is absolutely required for the API to function
  if ( config == null ) { // Equality check for null or undefined values
   var msg = "ShopifyAPI module expects a config object\nPlease see documentation at: https://github.com/sinechris/shopify-node-api\n" ;
   throw new Error ( msg ) ; // Terminate execution with an informative error
  }

  // Store the configuration internally
  this.config = config ;

  // Set verbose logging default if not explicitly set to false
  if ( this.config.verbose !== false ) {
   this.config.verbose = true ;
  }

 } // End of ShopifyAPI constructor

 // Prototype method to construct the Shopify OAuth authorization URL
 ShopifyAPI. prototype . buildAuthURL = function ( ) {
  var auth_url = 'https://' + this.config.shop.split( "." ) [ 0 ] ; // Extract shop subdomain
  auth_url += ".myshopify.com/admin/oauth/authorize?" ; // Base authorization endpoint
  auth_url += "client_id=" + this.config.shopify_api_key ; // Add API key
  auth_url += "&scope=" + this.config.shopify_scope ; // Define required scope
  auth_url += "&redirect_uri=" + this.config.redirect_uri ; // Specify redirect URI
  return auth_url ; // Return the complete authorization URL
 } ;

 // Prototype method to set the access token received after OAuth
 ShopifyAPI. prototype . set_access_token = function ( token ) {
  this.config.access_token = token ; // Store the access token in the config
 } ;

 // Prototype method for conditional console logging based on verbose flag
 ShopifyAPI. prototype . conditional_console_log = function ( msg ) {
  if ( this.config.verbose ) { // Only log if verbose mode is enabled
   console.log ( msg ) ;
  }
 } ;

 // Prototype method to validate the incoming signature from Shopify
 ShopifyAPI. prototype . is_valid_signature = function ( params ) {
  var signature = params [ 'signature' ] , // Extract the signature from parameters
   calculated_signature = [ ] ; // Initialize array for signature components

  // Iterate over all parameters to build the string for hashing
  for ( var key in params ) {
   if ( key != "signature" ) { // The 'signature' itself must not be part of the hash calculation
    calculated_signature.push ( key + '=' + params [ key ] ) ;
   }
  }

  // Calculate MD5 hash using shared secret and sorted parameters
  var hash = md5 ( this.config.shopify_shared_secret + calculated_signature.sort ( ).join ( "" ) ) ;

  return ( hash === signature ) ; // Compare calculated hash with provided signature
 } ;

 // Prototype method to exchange a temporary code for a permanent access token
 ShopifyAPI. prototype . exchange_temporary_token = function ( query_params , callback ) {
  var data = { // Data payload for the access token request
   client_id : this.config.shopify_api_key ,
   client_secret : this.config.shopify_shared_secret ,
   code : query_params [ 'code' ]
  } ,
   self = this ; // Keep a reference to 'this' for callbacks

  // First, validate the signature of the incoming query parameters
  if ( ! self.is_valid_signature ( query_params ) ) {
   return callback ( new Error ( "Signature is not authentic!" ) ) ; // Reject if signature is invalid
  }

  // Make the actual request to Shopify's access token endpoint
  this.makeRequest ( '/admin/oauth/access_token' , 'POST' , data , function ( err , body ) {

   if ( err ) return callback ( new Error ( err ) ) ; // Handle any request errors

   self.set_access_token ( body [ 'access_token' ] ) ; // Store the newly acquired access token
   callback ( null , body ) ; // Call back with success and the response body

  } ) ;
 } ;

 // Prototype method to derive the Shopify hostname
 ShopifyAPI. prototype . hostname = function ( ) {
  return this.config.shop.split ( "." ) [ 0 ] + '.myshopify.com' ; // Construct hostname from shop name
 } ;

 // Prototype method to define the port for HTTPS requests
 ShopifyAPI. prototype . port = function ( ) {
  return 443 ; // HTTPS standard port
 } ;

 // The core method for making HTTP(S) requests to the Shopify API
 ShopifyAPI. prototype . makeRequest = function ( endpoint , method , data , callback , retry ) {

  var https = require ( 'https' ) , // Require the HTTPS module
   dataString = JSON.stringify ( data ) , // Convert data payload to JSON string
   options = { // Configuration object for the HTTPS request
    hostname : this.hostname ( ) ,
    path : endpoint ,
    method : method.toLowerCase ( ) || 'get' , // Default to GET if method is not specified
    port : this.port ( ) ,
    headers : {
     'Content-Type' : 'application/json' // Set content type header
    }
   } ,
   self = this ; // Reference to 'this' for use in nested functions

  // Add X-Shopify-Access-Token header if an access token is available
  if ( this.config.access_token ) {
   options.headers [ 'X-Shopify-Access-Token' ] = this.config.access_token ;
  }

  // Set Content-Length header for methods that send a body
  if ( options.method === 'post' || options.method === 'put' || options.method === 'delete' ) {
   options.headers [ 'Content-Length' ] = new Buffer ( dataString ).length ;
  }

  // Create the HTTPS request object
  var request = https.request ( options , function ( response ) {
   self.conditional_console_log ( 'STATUS: ' + response.statusCode ) ; // Log response status code
   self.conditional_console_log ( 'HEADERS: ' + JSON.stringify ( response.headers ) ) ; // Log response headers

   // Log API call limit if present in headers
   if ( response.headers && response.headers.http_x_shopify_shop_api_call_limit ) {
    self.conditional_console_log ( 'API_LIMIT: ' + response.headers.http_x_shopify_shop_api_call_limit ) ;
   }

   response.setEncoding ( 'utf8' ) ; // Set response encoding to UTF-8

   var body = '' ; // Initialize an empty string to accumulate response data

   // Event listener for incoming data chunks
   response.on ( 'data' , function ( chunk ) {
    self.conditional_console_log ( 'BODY: ' + chunk ) ;
    body += chunk ; // Append chunk to body
   } ) ;

   // Event listener for response end
   response.on ( 'end' , function ( ) {

    var delay = 0 ; // Initialize delay for potential backoff

    // Handle Shopify API rate limiting (HTTP 429 Too Many Requests)
    if ( response.statusCode === 429 ) {
     return setTimeout ( function ( ) {
      // Retry the request after a delay
      self.makeRequest ( endpoint , method , data , callback ) ;
     } , self.config.rate_limit_delay || 10000 ) ; // Default delay of 10 seconds
    }

    // Apply backoff delay if API call limit is approaching
    if ( response.statusCode === 200 && self.has_header ( response , 'http_x_shopify_shop_api_call_limit' ) ) {
     var api_limit = parseInt ( response.headers [ 'http_x_shopify_shop_api_call_limit' ].split ( '/' ) [ 0 ] , 10 ) ;
     if ( api_limit >= ( self.config.backoff || 35 ) ) delay = self.config.backoff_delay || 1000 ; // Default backoff at 35 calls, 1 sec delay
    }

    // Execute callback after any computed delay
    setTimeout ( function ( ) {

     var json = { } , // Initialize JSON object for parsed response
      error ; // Initialize error variable

     try {
      // Only attempt to parse if the body is not empty or just whitespace
      if ( body.trim ( ) != '' ) {
       json = JSON.parse ( body ) ; // Parse the JSON response
       // Check for explicit error messages within the JSON body
       if ( json.hasOwnProperty ( 'error' ) || json.hasOwnProperty ( 'errors' ) ) {
        error = {
         error : ( json.error || json.errors ) , // Extract error message
         code : response.statusCode // Include HTTP status code
        } ;
       }
      }
     } catch ( e ) {
      error = e ; // Catch JSON parsing errors
     }

     callback ( error , json , response.headers ) ; // Invoke the provided callback
    } , delay ) ; // Apply the calculated delay

   } ) ; // End of response 'end' event handler

  } ) ; // End of https.request callback

  // Event listener for request errors (e.g., network issues)
  request.on ( 'error' , function ( e ) {
   self.conditional_console_log ( "Request Error: " , e ) ;
   // If retry_errors is enabled and this is not a retry attempt
   if ( self.config.retry_errors && ! retry ) {
    var delay = self.config.error_retry_delay || 10000 ; // Default error retry delay
    self.conditional_console_log ( "retrying once in " + delay + " milliseconds" ) ;
    setTimeout ( function ( ) {
     // Retry the request with the 'retry' flag set to true
     self.makeRequest ( endpoint , method , data , callback , true ) ;
    } , delay ) ;
   } else {
    callback ( e ) ; // Call back with the error
   }
  } ) ;

  // Write data to the request body for POST, PUT, and DELETE methods
  if ( options.method === 'post' || options.method === 'put' || options.method === 'delete' ) {
   request.write ( dataString ) ;
  }

  request.end ( ) ; // Finalize and send the request

 } ; // End of makeRequest method

 // Convenience method for HTTP GET requests
 ShopifyAPI. prototype . get = function ( endpoint , data , callback ) {
  // Handle optional 'data' parameter
  if ( typeof data === 'function' && arguments.length < 3 ) {
   callback = data ;
   data = null ;
  }
  this.makeRequest ( endpoint , 'GET' , data , callback ) ;
 } ;

 // Convenience method for HTTP POST requests
 ShopifyAPI. prototype . post = function ( endpoint , data , callback ) {
  this.makeRequest ( endpoint , 'POST' , data , callback ) ;
 } ;

 // Convenience method for HTTP PUT requests
 ShopifyAPI. prototype . put = function ( endpoint , data , callback ) {
  this.makeRequest ( endpoint , 'PUT' , data , callback ) ;
 } ;

 // Convenience method for HTTP DELETE requests
 ShopifyAPI. prototype . delete = function ( endpoint , data , callback ) {
  // Handle optional 'data' and 'callback' parameters
  if ( arguments.length < 3 ) {
   if ( typeof data === 'function' ) {
    callback = data ;
    data = null ;
   } else {
    callback = new Function ; // Default empty callback if not provided
    data = typeof data === 'undefined' ? null : data ;
   }
  }
  this.makeRequest ( endpoint , 'DELETE' , data , callback ) ;
 } ;

 // Helper method to check for the existence of a specific header
 ShopifyAPI. prototype . has_header = function ( response , header ) {
  return response.headers.hasOwnProperty ( header ) ? true : false ; // Return true if header exists, false otherwise
 } ;

 // Export the ShopifyAPI constructor as the module's main export
 module.exports = ShopifyAPI ;