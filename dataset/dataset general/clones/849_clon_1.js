/*
 * This file implements a gallery navigation system
 * utilizing the HTML5 History API for a smoother user experience.
 *
 * Author: Clone Generator v1.0
 * Date: 2023-10-27
 * License: MIT (or whatever the original code's license was)
 */


  // Function to check if the browser supports the History API.
  // This is a crucial check before attempting to use pushState.
function supports_history_api ( )
{
    // Returns true if window.history and history.pushState are both available.
    // The double negation (!!) converts the truthy/falsy value to a boolean.
    return !! ( window . history && history . pushState ) ;
}


// -----------------------------------------------------------------------------
// Function: swapPhoto
// Description: Fetches a new photo fragment and updates the gallery content.
// Parameters:
//   href - The URL fragment representing the photo to load.
// Returns:
//   true if the photo was successfully loaded and swapped, false otherwise.
// -----------------------------------------------------------------------------
function   swapPhoto (   href   )
{
    // Create a new XMLHttpRequest object to fetch the photo content.
    var   req   =   new   XMLHttpRequest ( ) ;

    // Configure the request:
    // Method: GET
    // URL: Constructs the full URL for the photo fragment.
    // Async: false (synchronous request, blocks the main thread until complete)
    req . open (   "GET"   ,
                   "http://diveintohtml5.org/examples/history/gallery/"   +
                     href . split ( "/" ) . pop ( )   ,
                   false   ) ;

    // Send the request. No body is needed for a GET request.
    req . send (   null   ) ;


    // Check if the request was successful (HTTP status 200 OK).
    if   (   req . status   ==   200   )
    {
        // Update the innerHTML of the 'gallery' element with the fetched response.
        document . getElementById (   "gallery"   ) . innerHTML   =   req . responseText ;

        // Re-setup click handlers for any new navigation elements that might have been loaded.
        setupHistoryClicks ( ) ;

        // Indicate success.
        return   true ;
    }

    // Indicate failure.
    return   false ;
}



// -----------------------------------------------------------------------------
// Function: addClicker
// Description: Attaches an event listener to a link to handle photo swapping
//              and History API pushState.
// Parameters:
//   link - The DOM element (anchor tag) to which the click listener will be added.
// -----------------------------------------------------------------------------
function   addClicker (   link   )
{
    // Add a click event listener to the provided link element.
    // The third argument 'true' means it will be captured during the capturing phase.
    link . addEventListener (   "click"   ,   function (   e   )
    {
        // Attempt to swap the photo using the link's href.
        if   (   swapPhoto (   link . href   )   )
        {
            // If the photo swap was successful, update the browser's history.
            // null, null, link.href: state object (none), title (none), URL.
            history . pushState (   null   ,   null   ,   link . href   ) ;

            // Prevent the default link behavior (i.e., navigating directly).
            e . preventDefault ( ) ;
        }
    }   ,   true   ) ;
}


// -----------------------------------------------------------------------------
// Function: setupHistoryClicks
// Description: Initializes click handlers for the photo navigation buttons.
// -----------------------------------------------------------------------------
function   setupHistoryClicks ( )
{
    // Add a click handler to the 'photonext' element.
    addClicker (   document . getElementById (   "photonext"   )   ) ;

    // Add a click handler to the 'photoprev' element.
    addClicker (   document . getElementById (   "photoprev"   )   ) ;
}



// -----------------------------------------------------------------------------
// Event Handler: window.onload
// Description: Executed when the entire page has loaded.
//              Sets up initial history API functionality.
// -----------------------------------------------------------------------------
window . onload   =   function ( )
{
    // First, check if the browser supports the History API.
    if   (   !   supports_history_api ( )   )
    {
        // If not supported, simply return and do nothing further.
        return   ;
    }

    // Set up the initial click handlers for the navigation buttons.
    setupHistoryClicks ( ) ;

    // Use a small timeout to ensure the popstate listener is added
    // *after* the initial page load has fully settled in the history stack.
    window . setTimeout (   function ( )
    {
        // Add an event listener for the 'popstate' event.
        // This event fires when the active history entry changes (e.g., back/forward buttons).
        window . addEventListener (   "popstate"   ,   function (   e   )
        {
            // When popstate occurs, swap the photo based on the current URL's pathname.
            swapPhoto (   location . pathname   ) ;
        }   ,   false   ) ;
    }   ,   1   ) ; // A minimal delay of 1 millisecond.
}