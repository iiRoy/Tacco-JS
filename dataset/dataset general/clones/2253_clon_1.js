/*
 * This script serves as a Web Worker message handler.
 * It processes incoming data, formats it, and sends back the result.
 */
onmessage = function ( event )
{

    // The incoming data is expected to be a JSON string.
    // We parse it to obtain the 'plan' object.
    var   plan   =   JSON.parse( event.data ) ;

    // From the 'plan' object, we extract the 'following' array.
    var   following   =   plan.following ;

    // Initialize an empty string which will accumulate HTML content.
    var   followingText   =   '' ; // This variable will hold the generated list items.

    /*
     * Iterate through each item in the 'following' array.
     * For each item, construct an HTML list item (<li>) with
     * the 'nick' and 'address' properties.
     */
    for   ( i   in   following )
    {
        // Concatenate the HTML string for each follower.
        // It includes their nick and address, wrapped in paragraph tags with specific classes.
        followingText   +=   '<li><p class="name">'   +   following[i].nick   +   '</p><p class="address"> '   +   following[i].address   +   '</p></li>' ;
    }

    // Once the HTML string is fully constructed, post it back to the main thread.
    postMessage( followingText ) ;

    // After processing and sending the message, the worker can be safely closed.
    close() ; // Terminates the current Web Worker.

}