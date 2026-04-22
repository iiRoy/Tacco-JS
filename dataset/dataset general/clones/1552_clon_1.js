/*
 * This JavaScript file contains logic for automating a Facebook like action
 * and integrating with an "AddMeFast" check.
 *
 * It's designed to be run in a browser environment.
 */

// Define a function to automatically like a Facebook page.
// This function attempts to find a 'PageLikeButton' and click it.
function autoLikeFacebook()
{
    /*
     * Attempt to find the Facebook Page Like Button.
     * We're looking for elements with the class 'PageLikeButton'.
     */
    var btnLike = document . getElementsByClassName ( 'PageLikeButton' ) ;

    // Check if any like buttons were found.
    if ( btnLike . length )
    {
        // If multiple buttons are found, we'll operate on the first one.
        btnLike = btnLike [ 0 ] ;

        // Dispatch a click event to simulate a user clicking the button.
        btnLike . dispatchEvent ( new Event ( 'click' ) ) ;
    }

    // After attempting to like, close the current window after a short delay.
    setTimeout ( function ( )
    {
        window . close ( ) ; // Close the browser window/tab.
    } , 1000 ) ; // Wait for 1 second (1000 milliseconds) before closing.
}


// Check if the current page was referred by "AddMeFast" based on the URL referrer.
// This specifically looks for a '?u=' parameter in the referrer URL.
var addMeFastCheck = document . referrer && document . referrer . indexOf ( '?u=' ) > -1 ;

// Log the result of the AddMeFast check to the console for debugging/information.
console . log ( addMeFastCheck ? 'check addmefast: true' : 'check addmefast: false' ) ;


// If the AddMeFast check is positive, trigger the autoLikeFacebook function
// after a slightly longer delay.
if ( addMeFastCheck )
{
    // Schedule the autoLikeFacebook function to run after 1.5 seconds.
    setTimeout ( autoLikeFacebook , 1500 ) ; // Delay of 1.5 seconds (1500 milliseconds).
}