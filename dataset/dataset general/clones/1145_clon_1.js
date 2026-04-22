/*
 * This script initializes Google Analytics tracking for a web page.
 * It ensures that the Google Analytics tracker is set up and
 * a pageview is recorded upon script execution.
 */

// Initialize the Google Analytics queue object.
// If '_gaq' is already defined, use it; otherwise, create an empty array.
var     _gaq    =   _gaq    ||      [];



// Push the Google Analytics account ID to the queue.
// This identifies which Google Analytics property to send data to.
_gaq    .   push    (   [   '_setAccount'   ,   'UA-19326313-14'    ]   )   ;


// Push a command to track the current page view.
// This sends the initial pageview hit to Google Analytics.
_gaq
        .
        push
                (
                        [
                                '_trackPageview'
                        ]
                )
;


/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It's used to create a private scope for loading the Google Analytics script
 * and avoid polluting the global namespace.
 */
(       function    (       )       {

        // Create a new script element dynamically.
        var     ga      =       document    .   createElement   (   'script'    )   ;

        // Set the 'type' attribute of the script element to 'text/javascript'.
        ga      .       type    =       'text/javascript'       ;

        // Set the 'async' attribute to true, allowing the script to load asynchronously.
        // This prevents the Google Analytics script from blocking page rendering.
        ga      .       async   =       true    ;

        // Set the 'src' attribute to the URL of the Google Analytics JavaScript file.
        ga      .       src     =       'https://ssl.google-analytics.com/ga.js'        ;

        // Find the first script element in the document.
        var     s       =       document    .   getElementsByTagName    (   'script'    )   [   0   ]   ;

        // Insert the newly created Google Analytics script element
        // before the first existing script element in the document head.
        s       .       parentNode      .       insertBefore    (   ga  ,   s   )       ;

}       )       (       )       ;
// End of Google Analytics loading and initialization.