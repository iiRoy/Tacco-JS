/*
 *  This file provides a wrapper for the DNSimple API interactions.
 *  Specifically, it facilitates the updating of a domain's IP address.
 *  It leverages Node.js's native 'https' module for secure communication
 *  and extends 'EventEmitter' for custom event handling.
 *
 *  Note: This implementation is focused on a specific use case (IP update)
 *        and does not cover the full breadth of the DNSimple API.
 */


 var   https   =   require ( "https" ) ;
 var   events  =   require ( "events" ) ;


 // The main constructor for the DNSimple client.
 // It expects a settings object containing necessary configuration.
 var   DNSimple   =   function ( settings ) {
     this . settings   =   settings ;
 } ;


 // Make DNSimple an EventEmitter, allowing it to emit custom events.
 DNSimple . prototype   =   new   events . EventEmitter ( ) ;


 /*
  *  Generates the authentication token required for API requests.
  *  This token is a combination of username and API token, separated by a colon.
  */
 DNSimple . prototype . token   =   function ( ) {
     return   dnsimple . settings . username   +   ":"   +   dnsimple . settings . token ;
 } ;


 /**
  *  Initiates an update operation for a domain's IP address.
  *  The domain and record ID are retrieved from the instance's settings.
  * @param {string} new_ip - The new IP address to set for the domain's record.
  */
 DNSimple . prototype . update   =   function ( new_ip ) {
     // Store 'this' in a local variable for use within nested functions/callbacks.
     var   dnsimple   =   this ;

     // Construct the API path for the specific record update.
     var   path   =   "/domains/"   +   dnsimple . settings . domain   +   "/records/"   +   dnsimple . settings . recordID ;

     // Prepare the payload for the PUT request.
     // The 'record' object contains the content (new IP) and a default TTL.
     var   record   =   JSON . stringify ( {
         record : {
             content :   new_ip ,
             ttl :   86400
         }
     } ) ;

     // Execute the PUT request using the internal 'put' method.
     dnsimple . put ( path ,   record ) ;
 } ;


 /**
  *  Handles sending HTTP PUT requests to the DNSimple API.
  *  This is a convenience method abstracted for reusability.
  * @param {string} path - The API endpoint path.
  * @param {string} data - The JSON stringified data to send in the request body.
  */
 DNSimple . prototype . put   =   function ( path ,   data ) {
     // Cache 'this' (the DNSimple instance) for access within callbacks.
     dnsimple   =   this ;

     // Define the HTTP request options.
     var   options   =   {
         host :   "dnsimple.com" ,
         path :   path ,
         method :   "PUT" ,
         headers :   {
             "Accept" :   "application/json" ,
             "Content-Type" :   "application/json" ,
             "X-DNSimple-Token" :   dnsimple . token ( ) , // Use the generated token for authentication.
             "Content-Length" :   data . length               // Specify content length for the request body.
         }
     } ;

     // Create the HTTP request.
     var   req   =   https . request ( options ,   function ( res ) {
         // Capture the HTTP status code from the response.
         var   status   =   res . statusCode ;

         // Listen for incoming data from the response.
         res . on ( "data" ,   function ( d ) {
             // Check if the update was successful (HTTP 200 OK).
             if (   status   ==   200   ) {
                 // Emit an 'updated' event with the response data.
                 dnsimple . emit ( "updated" ,   d ) ;
             }   else   {
                 // If not 200, emit an 'error' event with the response data.
                 dnsimple . emit ( "error" ,   d ) ;
             }
         } ) ;
     } ) ;

     // Handle errors that occur during the request itself (e.g., network issues).
     req . on ( "error" ,   function ( e ) {
         // Emit an 'error' event with the error object.
         dnsimple . emit ( "error" ,   e ) ;
     } ) ;

     // Write the data to the request body.
     req . write ( data ) ;

     // End the request, sending it off.
     req . end ( ) ;
 } ;


 // Export the DNSimple constructor for use in other modules.
 module . exports   =   DNSimple ;