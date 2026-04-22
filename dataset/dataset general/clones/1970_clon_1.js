/*
 * This file contains logic for retrieving video clip information.
 * It primarily interacts with the YouTube mobile API to fetch stream URLs.
 */


var    http    =require('http') ; // Import the Node.js HTTP module for making web requests.


/*
 * Defines the main function `get_clip` which retrieves a video stream URL.
 * @param {object} params - An object containing parameters for the request,
 *                           e.g., `params.os` for operating system and
 *                           `params.videoId` for the YouTube video identifier.
 * @param {function} callback - The callback function to be executed once
 *                               the stream URL is obtained or an error occurs.
 *                               It follows the Node.js convention: `callback(error, result)`.
 */
var get_clip    =   function    (   params  ,   callback    )   {


    // Initialize a variable to hold HTTP headers.
    // The headers will vary based on the detected operating system.
    var headers ;

    // Check if the operating system specified in parameters is 'android'.
    if  (   params  .   os  ==  'android'   )
    {
        // Headers for an Android user agent.
        headers =   {
            'User-Agent'    :   'Mozilla/5.0 (Linux; U; Android 2.2.1; en-gb; GT-I9003 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'  ,   // Mimics an Android browser.
            'Referer'       :   'http://www.youtube.com/watch?v='   +   params  .   videoId                                                                                     // Refers to the YouTube watch page for the video.
        }
    }
    else
    {
        // Default headers for a non-Android user agent (e.g., Desktop/iOS).
        headers =   {
            'User-Agent'    :   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/536.26.14 (KHTML, like Gecko) Version/6.0.1 Safari/536.26.14'  ,   // Mimics a Safari browser on macOS.
            'Referer'       :   'http://www.youtube.com/watch?v='   +   params  .   videoId                                                                                     // Refers to the YouTube watch page for the video.
        }
    }

    // Define the options for the HTTP request to YouTube's mobile site.
    var options =   {
        hostname    :   'm.youtube.com'  ,                                                                                                           // Target YouTube mobile hostname.
        path        :   '/watch?ajax=1&layout=mobile&tsp=1&utcoffset=330&v='    +   params  .   videoId  ,                                          // Specific path including AJAX parameters and video ID.
        method      :   'GET'            ,                                                                                                           // HTTP request method.
        headers     :   headers                                                                                                                      // Headers determined above.
    }   ;

    // Initialize an empty string to accumulate the response data from the HTTP request.
    var out =   ''  ;

    // Create the HTTP request object.
    // It uses the 'options' defined earlier and provides a callback for the response.
    var req =   http  .   request (   options ,   function    (   res )   {
        // Set the encoding for the response data to UTF-8.
        res .   setEncoding  (   'utf8'  )   ;

        // Attach an event listener for 'data' chunks received during the response.
        res .   on  (   'data'  ,   function    (   chunk   )   {
            // Append each data chunk to the 'out' string.
            out +=  chunk   ;
        }   )   ;

        // Attach an event listener for the 'end' of the response.
        res .   on  (   'end'   ,   function    (   )   {
            // Attempt to parse the accumulated response data.
            try {
                // YouTube's mobile API sometimes prepends ')]}\'' to JSON responses.
                // This line removes that prefix before parsing the JSON.
                var data    =   JSON  .   parse (   out .   substring (   4   ,   out .   length    )   )   ;

                // Check if the parsed data contains the expected video content.
                if  (   data    &&  data  .   content &&  data  .   content .   video   )
                {
                    // Determine the stream URL from player data.
                    // It checks for 'fmt_stream_map' first, then falls back to 'stream_url'.
                    var streamUrl   =   data    .   content .   player_data .   fmt_stream_map  ?   response    .   content .   player_data .   fmt_stream_map  [   0   ]   .   url :   response    .   content .   player_data .   stream_url  ;

                    // Call the main callback with null for error and the stream URL as result.
                    callback    (   null    ,   streamUrl   )   ;
                }   else    {
                    // If expected data structure is not found, indicate a 'wrong_reply' error.
                    callback    (   'wrong_reply'   )   ;
                }
            }
            // Catch any errors that occur during JSON parsing or data access.
            catch   (   err )   {
                // Pass the caught error to the main callback.
                callback    (   err )   ;
            }

        }   )
    }   )   ;

    // Attach an event listener for 'error' events on the request.
    req .   on  (   'error' ,   function    (   e   )   {
        // Log the problem message to the console.
        console .   log (   'problem with request: '    +   e   .   message )   ;
        // Log the stack trace for debugging.
        console .   log (   e   .   stack   )   ;
    }   )   ;

    // End the request. This sends the request to the server.
    req .   end (   )   ;
}

// Export the `get_clip` function so it can be used by other modules.
exports .   get_clip    =   get_clip    ;