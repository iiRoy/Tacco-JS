/*
 * This is a self-executing anonymous function (IIFE)
 * It encapsulates the entire server logic to prevent global variable pollution.
 */
( function ( ) {

    "use strict"; /* Enforce strict mode for cleaner code and fewer errors. */

    // --- Module Imports ---
    var url         =   require ( 'url'         ) ; // Core Node.js 'url' module for URL parsing.
    var http        =   require ( 'http'        ) ; // Core Node.js 'http' module for creating an HTTP server.
    var querystring =   require ( 'querystring' ) ; // Core Node.js 'querystring' module for parsing query strings.
    var Pusher      =   require ( 'node-pusher' ) ; // Third-party 'node-pusher' library for interacting with Pusher API.

    // --- Configuration Constants ---
    var IP          =   '127.0.0.1' ; // The IP address the server will listen on.
    var PORT        =   1337        ; // The port number the server will listen on.

    // --- Global Variables ---
    var pusher      ; // Variable to hold the Pusher client instance.

    // Retrieve API credentials from command-line arguments.
    var client_id   =   process.argv[2] ; // First argument: Pusher App ID.
    var api_key     =   process.argv[3] ; // Second argument: Pusher API Key.
    var api_secret  =   process.argv[4] ; // Third argument: Pusher API Secret.

    /*
     * Check if required API credentials are provided.
     * If not, display usage instructions and exit the process.
     */
    if  ( ! api_key  ||  ! api_secret )
    {
        console . error ( 'Usage: src.js [client_id] [api_key] [api_secret]' ) ;
        process . exit  ( 1 ) ; /* Exit with an error code. */
    }
    else
    {
        /*
         * Initialize the Pusher client with the provided credentials.
         * This instance will be used for triggering events and authenticating private channels.
         */
        pusher = new Pusher ( {
            appId   :   client_id   ,
            key     :   api_key     ,
            secret  :   api_secret
        } ) ;
    }


    /**
     * Sends an HTTP response with the specified status, data, and headers.
     *
     * @param {http.ServerResponse} response - The HTTP response object.
     * @param {number} status - The HTTP status code to send (e.g., 200, 400, 500).
     * @param {object} [data] - The data payload to send, will be JSON.stringified.
     * @param {object} [headers] - Additional headers to include in the response.
     */
    function respond ( response , status , data , headers )
    {
        headers = headers || { } ; /* Ensure headers object exists. */

        headers [ 'Content-Type' ] = 'application/json' ; // Default content type is JSON.

        if ( data !== undefined )
        {
            data = JSON . stringify ( data ) ; /* Convert data object to JSON string. */
            console . log ( 'RESPONSE' , data ) ; /* Log the outgoing response data. */
            headers [ 'Content-Length' ] = data . length ; /* Set content length header. */
        }

        response . writeHead ( 200 , headers ) ; /* Write the HTTP response head. */
        response . end ( data ) ; /* End the response, sending the data. */
    }


    /**
     * Sets CORS (Cross-Origin Resource Sharing) headers on the response.
     * This allows requests from different origins to access the server.
     *
     * @param {http.IncomingMessage} request - The HTTP request object.
     * @param {http.ServerResponse} response - The HTTP response object.
     */
    function cors ( request , response )
    {
        // Allow requests from the original origin or any origin ('*') for simplicity.
        response . setHeader ( 'Access-Control-Allow-Origin' , request . headers . origin || '*' ) ;
        // Specify allowed HTTP headers for preflight requests.
        response . setHeader ( 'Access-Control-Allow-Headers' , 'origin, content-type, accept' ) ;
        // Cache preflight request results for 2 hours (7200 seconds).
        response . setHeader ( 'Access-Control-Max-Age' , 7200 ) ;
    }


    /**
     * Parses arguments from an incoming HTTP request, supporting both JSON and form-urlencoded content types.
     * The parsed arguments are then passed to a callback function.
     *
     * @param {http.IncomingMessage} request - The HTTP request object.
     * @param {function(object)} callback - The callback function to receive the parsed arguments.
     */
    function getargs ( request , callback )
    {
        var postdata = '' , json ; /* Initialize postdata string. */

        /*
         * Event listener for 'data' chunks received from the request body.
         * Appends each chunk to the postdata string.
         */
        request . on ( 'data' , function ( chunk )
        {
            postdata += chunk ;
        } ) ;

        /*
         * Event listener for the 'end' of the request body.
         * Parses the collected postdata based on the 'Content-Type' header.
         */
        request . on ( 'end' , function ( )
        {
            // Check if the content type is JSON.
            if  ( request . headers [ 'content-type' ] === 'application/json' )
            {
                try
                {
                    callback ( JSON . parse ( postdata ) ) ; /* Parse JSON and pass to callback. */
                }
                catch ( e )
                {
                    callback ( { } ) ; /* On error, pass an empty object. */
                }
            }
            else /* Assume form-urlencoded if not JSON. */
            {
                try
                {
                    callback ( querystring . parse ( postdata ) ) ; /* Parse query string and pass to callback. */
                }
                catch ( e )
                {
                    callback ( { } ) ; /* On error, pass an empty object. */
                }
            }
        } ) ;
    }


    /**
     * Handles POST requests, primarily for Pusher event triggering or channel authentication.
     *
     * @param {http.IncomingMessage} request - The HTTP request object.
     * @param {http.ServerResponse} response - The HTTP response object.
     */
    function post ( request , response )
    {
        getargs ( request , function ( args )
        {
            console . log ( 'REQUEST' , args ) ; /* Log the incoming request arguments. */

            // Normalize channel name, handling both 'channel' and 'channel_name' keys.
            args . channel = args . channel || args . channel_name ; /// ugh... c'mon Pusher...

            if ( args . channel )
            {
                if ( args . event )
                {
                    /*
                     * If an event is specified, trigger a Pusher event on the channel.
                     */
                    return pusher . trigger (
                        args . channel      , // The channel to trigger the event on.
                        args . event        , // The name of the event.
                        args . data         , // The data payload for the event.
                        args . socket_id    , // Optional: exclude this socket from receiving the event.
                        function ( error , sent , received )
                        {
                            if ( error )
                            {
                                respond ( response , 500 , { error : error } ) ; /* Respond with server error if trigger fails. */
                            }
                            else
                            {
                                respond ( response , received . statusCode , args ) ; /* Respond with Pusher's status code and original args. */
                            }
                        }
                    ) ;
                }
                else if ( args . socket_id )
                {
                    /*
                     * If a socket_id is specified (and no event), perform Pusher channel authentication.
                     * This is typically for private or presence channels.
                     */
                    var auth = pusher . auth ( args . socket_id , args . channel , {
                        user_id :   0                               , // Example user_id, could be dynamic.
                        ip      :   request . connection . remoteAddress  , // Client IP address.
                        port    :   request . connection . remotePort     // Client port.
                    } ) ;
                    return respond ( response , 200 , auth ) ; /* Respond with the authentication data. */
                }
            }

            /*
             * If required arguments (channel, event/socket_id) are missing,
             * respond with a 400 Bad Request error.
             */
            return respond ( response , 400 , {
                error       : 'Missing required arguments' ,
                required    : [ 'channel' , 'event' , 'data' , 'socket_id (for auth)' ]
            } ) ;
        } ) ;
    }


    /**
     * The main HTTP request handler function.
     * It applies CORS headers and routes requests based on the HTTP method.
     *
     * @param {http.IncomingMessage} request - The HTTP request object.
     * @param {http.ServerResponse} response - The HTTP response object.
     */
    function handler ( request , response )
    {
        cors ( request , response ) ; // Apply CORS headers to all responses.

        if ( request . method === 'POST' )
        {
            post ( request , response ) ; // Handle POST requests for Pusher operations.
        }
        else
        {
            // For non-POST requests (e.g., GET), simply return the API key as a status check.
            respond ( response , 200 , { api_key : api_key } ) ;
        }
    }


    /*
     * Create an HTTP server using the 'handler' function and start listening
     * on the configured IP address and port.
     */
    http . createServer ( handler ) . listen ( PORT , IP ) ;

    /*
     * Log a message to the console indicating that the server has started.
     */
    console . log ( 'Running on ' + IP + ':' + PORT + '...' ) ;

} ) ( ) ;