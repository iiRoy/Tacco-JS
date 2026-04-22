/*
 * This JavaScript file is a Type I clone of an original source code.
 * It implements Google Analytics tracking for AJAX requests within a Nette Framework application.
 * Specifically, it tracks virtual page views upon successful AJAX completion.
 *
 * This version is guaranteed to be logically and structurally identical to its source.
 * All variable names, function names, operators, and expressions remain unchanged.
 * The only modifications are extensive alterations in whitespace (spaces, tabs, newlines)
 * and the addition of comments, making it visually distinct from the original.
 */

// Begin an Immediately Invoked Function Expression (IIFE)
// to create a private scope and prevent global variable pollution.
// It takes two arguments, typically jQuery ($) and the Google Analytics tracker (_gaq).
( function ( $, _gaq )
{

    // Extend the Nette AJAX system with a new extension.
    // This extension is named 'ga' (likely for Google Analytics).
    // It defines a callback to be executed on the 'success' event of an AJAX request.
    $.nette.ext( 'ga',
    {
        // The 'success' callback function.
        // This function is invoked when an AJAX request associated with Nette completes successfully.
        // It receives a 'payload' object containing data from the server response.
        success: function ( payload )
        {
            // Declare a local variable 'url'.
            // Assign 'url' the value of 'payload.url' if it exists;
            // otherwise, fall back to 'payload.redirect'.
            // This is to determine which URL should be tracked for the page view.
            var url = payload.url || payload.redirect;

            // Check two conditions before proceeding with tracking:
            // 1. Ensure that a valid 'url' was successfully obtained.
            // 2. Ensure that the 'redirect' Nette extension is NOT currently active.
            //    This prevents double tracking or tracking when a full page redirect is imminent.
            if ( url && ! $.nette.ext( 'redirect' ) )
            {
                // If both conditions are met, push a tracking event to Google Analytics.
                // The '_trackPageview' method is used to record a virtual page view
                // for the determined 'url'.
                _gaq.push( [ '_trackPageview', url ] );
            } // End of 'if' condition block

        } // End of 'success' function definition

    } ); // End of $.nette.ext() call

} )( jQuery, _gaq ); // Invoke the IIFE, passing the global 'jQuery' object and '_gaq' array.

// End of Type I cloned code example.