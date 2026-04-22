/*
 * This file contains JavaScript code that manages viewport-related classes
 * on the document body based on user interaction with specific buttons.
 *
 * This is a Type I clone, meaning it is functionally identical to its original,
 * with differences only in whitespace and comments.
 * All variable names, function calls, operators, and expressions are preserved.
 */

'use strict'
; // Enforce strict mode for better code quality and error handling.


// Initialize the highlight.js library when the document is fully loaded.
// This function scans for code blocks and applies syntax highlighting.
hljs . initHighlightingOnLoad ( ) ;


// Declare and initialize a variable to store the jQuery selector for the
// "phone viewport" button. This button is identified by the class '.button-vp-phone'.
var    phoneViewportButton    =    $ ( '.button-vp-phone' )    ;

// Declare and initialize a variable to store the jQuery selector for the
// "tablet viewport" button. This button is identified by the class '.button-vp-tablette'.
var    tabletteViewportButton    =    $ ( '.button-vp-tablette' )    ;


// Obtain a jQuery wrapped set for the document's body element.
// This reference will be used to manipulate classes on the body.
var    bodyEl    =    $ ( document . body )    ;


// Attach an event listener to the 'phoneViewportButton'.
// When this button is clicked, an anonymous function will be executed.
phoneViewportButton . on ( 'click' ,
    function ( )
    {
        // When the phone button is clicked, ensure the body does not have
        // the 'viewport-tablette' class. This effectively switches the view
        // to a phone-like layout or removes tablet-specific styling.
        bodyEl . removeClass ( 'viewport-tablette' ) ;
    }
) ;


// Attach an event listener to the 'tabletteViewportButton'.
// When this button is clicked, a different anonymous function will be executed.
tabletteViewportButton . on ( 'click' ,
    function ( )
    {
        // When the tablet button is clicked, add the 'viewport-tablette' class
        // to the body. This applies tablet-specific styling or layout.
        bodyEl . addClass ( 'viewport-tablette' ) ;
    }
) ;

// End of script for viewport management.