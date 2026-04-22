// This is a self-executing anonymous function to encapsulate the script's scope.
( function ( ) {

    // Define the required version of jQuery for this bookmarklet.
    var v = "1.8.0" ;


    // Check if jQuery is not loaded or if its version is older than the required one.
    if ( window.jQuery === undefined || window.jQuery.fn.jquery < v ) {

        // A flag to ensure the initialization function runs only once after jQuery loads.
        var done = false ;
        // Create a new script HTML element dynamically.
        var script = document.createElement( "script" ) ;

        // The original commented out line (alternative CDN for jQuery).
        // This line was previously commented and remains so, with added spacing.
        // script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
        // Set the source URL for the jQuery library.
        script.src = "http://dev.bkmrx.com/js/jquery-1.8.0.min.js" ;

        // Assign event handlers for when the script finishes loading.
        // This covers both standard 'onload' and IE's 'onreadystatechange'.
        script.onload = script.onreadystatechange = function ( ) {
            // Check if the script has not been processed yet and its state indicates completion.
            if ( ! done && ( ! this.readyState || this.readyState == "loaded" || this.readyState == "complete" ) ) {
                done = true ; // Mark as processed to prevent re-execution.
                initBkxMrk ( ) ; // Call the main bookmarklet initialization function.
            }
        } ;

        // Append the newly created script element to the <head> section of the document.
        // This action initiates the download and execution of the jQuery library.
        document.getElementsByTagName( "head" ) [ 0 ] . appendChild( script ) ;

    } else {
        // If jQuery is already available and meets the version requirement,
        // proceed directly to initialize the bookmarklet.
        initBkxMrk ( ) ;
    }


    // This function encapsulates the core logic of the bookmarklet.
    function initBkxMrk ( ) {

        // Assigns an anonymous self-executing function to `window.bkxMrk`.
        // This makes the bookmarklet accessible globally, e.g., for re-running.
        ( window.bkxMrk = function ( ) {

            // Helper function to retrieve the currently selected text on the page.
            function getSelText ( ) {
                var s = '' ; // Initialize an empty string for the selected text.
                // Standard compliant browsers (W3C).
                if ( window.getSelection ) {
                    s = window.getSelection ( ) ;
                }
                // Older Mozilla/Firefox browsers.
                else if ( document.getSelection ) {
                    s = document.getSelection ( ) ;
                }
                // Internet Explorer specific selection method.
                else if ( document.selection ) {
                    s = document.selection.createRange ( ) . text ;
                }
                return s ; // Return the obtained selected text.
            }


            // Check if the bookmarklet's main container iframe is not already present in the DOM.
            if ( $ ( "#bkxframe" ) . length == 0 ) {

                // Declare variables to store page information.
                var s     = "" ;
                var title = document.title ;       // Get the current page's title.
                var url   = document.location ;    // Get the current page's URL.

                // Retrieve any text that the user might have selected on the page.
                s = getSelText ( ) ;

                // Only proceed if the current URL is valid (not empty or null).
                if ( ( url != "" ) && ( url != null ) ) {
                    // Append the HTML structure for the bookmarklet's overlay and iframe to the body.
                    $ ( "body" ) . append ( "\
                    <div id='bkxframe'>\
                        <div id='bkxframe_veil' style=''>\
                            <p>Loading...</p>\
                        </div>\
                        <iframe src='http://dev.bkmrx.com/bklet?url=" + url + "&title=" + title + "&desc=" + s + "' onload=\"$ ( '#bkxframe iframe' ) . slideDown ( 500 ) ; \">Enable iFrames.</iframe>\
                        <style type='text/css'>\
                            #bkxframe_veil { display: none; position: fixed; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,.25); z-index: 900; }\
                            #bkxframe_veil p { color: black; font: normal normal bold 20px/20px Helvetica, sans-serif; position: absolute; top: 50%; left: 50%; width: 10em; margin: -10px auto 0 -5em; text-align: center; }\
                            #bkxframe iframe { display: none; position: fixed; top: 10%; left: 10%; width: 600px; height: 450px; z-index: 999; border: 10px solid rgba(0,0,0,.5); margin: -5px 0 0 -5px; }\
                        </style>\
                    </div>" ) ;

                    // Fade in the semi-transparent veil to indicate loading and block interaction.
                    $ ( "#bkxframe_veil" ) . fadeIn ( 750 ) ;
                }

            } else {
                // If the bookmarklet is already open, this branch handles its closure.
                $ ( "#bkxframe_veil" ) . fadeOut ( 750 ) ;       // Fade out the veil.
                $ ( "#bkxframe iframe" ) . slideUp ( 500 ) ;     // Slide up the iframe to hide it.
                // After a short delay, completely remove the bookmarklet's container from the DOM.
                setTimeout ( "$('#bkxframe').remove()", 750 ) ;
            }


            // Attach a click event listener to the veil, allowing users to close the bookmarklet.
            $ ( "#bkxframe_veil" ) . click ( function ( event ) {
                $ ( "#bkxframe_veil" ) . fadeOut ( 750 ) ;       // Fade out the veil.
                $ ( "#bkxframe iframe" ) . slideUp ( 500 ) ;     // Slide up the iframe.
                // Remove the entire bookmarklet structure after the animations.
                setTimeout ( "$('#bkxframe').remove()", 750 ) ;
            } ) ;

        } ) ( ) ; // Immediately execute the anonymous function assigned to window.bkxMrk.
    }

} ) ( ) ; // Immediately execute the outer anonymous function.