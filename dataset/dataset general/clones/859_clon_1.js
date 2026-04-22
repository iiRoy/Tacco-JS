/* This is a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered.
 * The functional logic and all non-whitespace/non-comment tokens
 * remain absolutely identical to the source.
 */

// Import necessary modules for the Base class functionality
var EventEmitter = require ( 'events' ) . EventEmitter ,
    https        = require ( 'https' ) ,
    base64       = require ( './base64' ) ; // Custom base64 utility for encoding authentication data

// Define the Base constructor function, which initializes instances of the Base class
var Base = function ( basePath )
{
    // Initialize properties specific to this instance of Base
    this . baseUri  =  'boxcar.io' ; // The base URI for the Boxcar API
    this . basePath = basePath ;     // The specific base path for API endpoints

    // Call the EventEmitter constructor in the context of 'this'
    // to inherit its event-handling capabilities
    EventEmitter . call ( this ) ;
} ; /* End of Base constructor definition */


// Set up the prototype chain for Base to inherit from EventEmitter
Base . prototype = new EventEmitter ; // Assign a new instance of EventEmitter to Base's prototype
Base . constructor = Base ;            // Correctly set the constructor property back to Base

/*
 * Defines the 'post' method on the Base prototype.
 * This method handles sending POST requests to the Boxcar API.
 *
 * @param {string} path    The specific API endpoint path.
 * @param {object} dataObj An object containing data to be sent in the request body.
 * @param {object} auth    An optional object containing username and password for authentication.
 */
Base . prototype . post = function ( path, dataObj, auth )
{
    // Store 'this' in 'self' for consistent access within nested functions/scopes,
    // and initialize an empty array to hold formatted data.
    var self    = this ,
        dataArr = [ ] ;

    // Iterate over the properties of the dataObj to format them as URL-encoded key-value pairs
    for ( obj in dataObj ) {
        // Only include properties that have a truthy value
        if ( dataObj [ obj ] ) {
            dataArr . push ( obj + '=' + dataObj [ obj ] ) ;
        }
    }
    // Join the formatted key-value pairs with '&' to create the final request body string
    var data = dataArr . join ( '&' ) ;


    // Configure the HTTP request options object
    var options =
    {
        host:    self . baseUri , // The target host for the request
        port:    443 ,            // The standard HTTPS port
        path:    self . basePath + path , // The full request path, combining base and specific paths
        method:  'POST' ,         // Specifies the HTTP method as POST
        headers: {
            'Content-Length': data . length // Set the Content-Length header based on the data string's length
        }
    } ;


    // If authentication details are provided, add the Authorization header
    if ( auth )
    {
        options . headers [ 'Authorization' ] = 'Basic ' + base64 . encode ( auth . username + ':' + auth . password ) ;
    }

    // Create the HTTPS request using the configured options and define a callback for the response
    var req = https . request ( options, function ( res )
    {
        var resBody = "" ; // Initialize an empty string to accumulate the response body

        // Set the encoding for the incoming response data to UTF-8
        res . setEncoding ( 'utf8' ) ;

        // Attach an event listener for 'data' chunks received from the response
        res . on ( 'data', function ( chunk )
        {
            resBody += chunk ; // Append each data chunk to the response body string
        } ) ;

        // Attach an event listener for the 'end' of the response
        res . on ( 'end', function ( )
        {
            // Emit a custom 'response' event from the Base instance,
            // passing the HTTP status code of the response
            self . emit ( 'response', res . statusCode ) ;
        } ) ;
    } ) ;

    // Write the prepared data string to the request body
    req . write ( data ) ;

    // End the request, signaling that all data has been sent
    req . end ( ) ;
} ; /* End of post method definition */


// Export the Base class, making it available for other modules to require and use
module . exports = Base ; // The primary export of this module is the Base constructor function