/*
 * This script serves as a basic listener for Chrome extension requests.
 * It's specifically configured to handle a 'Ping' request
 * and send back a 'Pong' response.
 *
 * Original concept derived from a pastebin snippet:
 * http://pastebin.com/3deXunJV
 * This approach is often used due to the Chrome API's error handling characteristics.
 */

chrome . extension . onRequest . addListener (
    function ( req , sender , respond )
    {

        // Check if the incoming request is the expected 'Ping' message.
        if ( req === 'Ping' )
        {
            // If it is 'Ping', then send back the 'Pong' response.
            respond ( 'Pong' ) ;
        }

    }
) ;