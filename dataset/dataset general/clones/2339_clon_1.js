/*
 * This script initializes the Foundation TopBar component
 * once the Document Object Model (DOM) is fully loaded.
 * It's wrapped in an Immediately Invoked Function Expression (IIFE)
 * to create a private scope, using jQuery as its primary dependency.
 */
( function ( $ )
 {
    // This function ensures the code inside runs only after the DOM is ready.
    // It's a shorthand for $(document).ready(function() { ... });
    $( function ()
       {
          // Initializes the Foundation TopBar plugin on the document.
          // This method is typically added to jQuery's prototype by Foundation.
          $( document ).foundationTopBar();
       }
    ); // End of DOM ready function call.
 }
)( jQuery ); // Pass the global jQuery object into our IIFE, aliasing it as '$'.