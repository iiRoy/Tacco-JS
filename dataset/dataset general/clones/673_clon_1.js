/*
 * This JavaScript snippet is designed for integrating Google Analytics
 * into a web page. It initializes the `_gaq` array and asynchronously
 * loads the Google Analytics tracking library.
 *
 * It is a standard asynchronous tracking code provided by Google.
 */

// Initialize the Google Analytics queue.
// If `_gaq` is already defined, use it; otherwise, create an empty array.
var     _gaq    =       _gaq    ||      [];

// Push the command to set the Google Analytics account ID.
// 'UA-11959882-3' is a placeholder and should be replaced with a real ID.
_gaq.push(  [   '_setAccount'   ,   'UA-11959882-3'   ]   );


// Push the command to track a pageview.
// This records a visit to the current page in Google Analytics.
_gaq.push(  [   '_trackPageview'    ]   );


/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It creates a private scope to avoid polluting the global namespace.
 * Its primary purpose is to dynamically load the Google Analytics script.
 */
(   function()
    {
        // Create a new script element for the Google Analytics library.
        var ga      =       document.createElement( 'script' );

        // Set the type attribute of the script element.
        ga.type     =       'text/javascript'       ;

        // Enable asynchronous loading for the script.
        ga.async    =       true                    ;

        // Determine the correct protocol (HTTPS or HTTP) for the Google Analytics script source.
        ga.src      =       (
                                'https:'    ==      document.location.protocol
                                    ?       'https://ssl'
                                    :       'http://www'
                            )
                            +
                            '.google-analytics.com/ga.js'
                            ;

        // Get a reference to the first script tag in the document.
        var s       =       document.getElementsByTagName( 'script' )[ 0 ];

        // Insert the newly created Google Analytics script element
        // before the first existing script tag in the document.
        s.parentNode.insertBefore(      ga      ,       s       )       ;

    }
)(); // Execute the function immediately after its definition.