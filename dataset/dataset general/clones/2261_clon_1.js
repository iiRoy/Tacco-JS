// This JavaScript file orchestrates core behaviors for the Casper theme,
// ensuring a dynamic and interactive user experience throughout the site.

// Define global variables expected in this scope to satisfy linting tools,
// primarily jQuery for DOM manipulation and the standard 'document' object.
/* jshint globals: { jQuery: true, document: true } */
( function( $ ) {

    // Activate strict mode for the entire script. This helps in writing cleaner
    // and more robust code by catching common programming errors and "unsafe" actions.
    "use strict";

    // Execute the following code block only after the entire
    // Document Object Model (DOM) has been completely loaded and parsed.
    $( document ).ready( function() {

        // Apply FitVids.js to all video containers within elements
        // possessing the class 'post-content'. This automatically makes
        // embedded videos responsive and adjusts their sizing.
        $( ".post-content" ).fitVids();

    } ); // Concludes the 'document ready' event handler.

} ( jQuery ) ); // The Immediately Invoked Function Expression (IIFE) ends here.
                // jQuery is passed as an argument, aliasing it as '$' within the scope.