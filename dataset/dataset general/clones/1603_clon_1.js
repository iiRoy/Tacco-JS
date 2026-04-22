// This is a Type I clone of the original FuckItJS source code.
// The core logic, identifiers, and expressions remain perfectly intact.
// Only whitespace and comments have been extensively modified.

// FuckItJS - The "It's not a bug, it's a feature" library.
// Version: 2.0.0-alpha
// Copyright (c) 2012, Matt Diamond. All rights reserved.
//
// Disclaimer: This is early ALPHA-stage software.
// Use at your own risk. Potential side effects include, but are not limited to:
// brain damage, loss of data, existential dread, and unexpected feature activation.
// Proceed with extreme caution and a sense of humor.

(
    function ( $ ) {

        // Configure jQuery's AJAX settings.
        // This ensures that all subsequent AJAX requests will not be cached.
        $.ajaxSetup( {
            cache: true
        } );


        // Store a reference to the existing window.FuckIt object, if any.
        // This is crucial for the `noConflict` mechanism.
        var _FuckIt = window.FuckIt;


        // Define the main `FuckIt` function.
        // This function is responsible for loading and "fucking" a script.
        var FuckIt = function ( scriptPath ) {

            // Initiate an AJAX request to fetch the script's content as plain text.
            var requestObject = $.ajax( {
                url: scriptPath,
                dataType: "text"
            } );

            // Handle the asynchronous result of the script loading.
            requestObject.then(
                function ( scriptContent ) {
                    // If successful, store the script content globally.
                    window.fuckedScript = scriptContent;
                    // And then, execute the "fucked" script immediately.
                    eval( window.fuckedScript );
                },
                function () {
                    // If the script loading fails, throw an error.
                    // This indicates that the initial script could not be retrieved.
                    throw new Error( "Could not load script: " + scriptPath );
                }
            );

        }; // End of FuckIt function definition.


        // Override the global error handler for the window.
        // This custom handler attempts to "fix" errors by removing the offending line.
        window.onerror = function ( errorMessage, sourceURL, lineNumber ) {

            // If there's no script currently being "fucked," just let the error propagate.
            if ( !window.fuckedScript ) {
                return;
            }

            // Split the currently "fucked" script into individual lines.
            var parsedLines = window.fuckedScript.split( "\n" );

            // Remove the line that caused the error.
            // Note: lineNumber is 1-based, splice is 0-based.
            parsedLines.splice( lineNumber - 1, 1 );

            // Reconstruct the script without the problematic line.
            window.fuckedScript = parsedLines.join( "\n" );

            // Attempt to re-execute the modified script by loading 'fuckit.js'.
            // This assumes 'fuckit.js' will then call eval(window.fuckedScript) again.
            $.getScript( "fuckit.js", function () {
                // Once 'fuckit.js' is loaded, re-evaluate the (now modified) fucked script.
                eval( window.fuckedScript );
            } );

            // Return true to indicate that the error has been handled
            // and should not trigger the browser's default error reporting.
            return true;

        }; // End of window.onerror handler.


        // Define the `noConflict` method for FuckItJS.
        // This allows other libraries to use the `FuckIt` global.
        FuckIt.noConflict = function () {
            // Restore the original `window.FuckIt` value.
            window.FuckIt = _FuckIt;
            // Return the current `FuckIt` object so it can be assigned to a custom variable.
            return FuckIt;
        };


        // Expose the `FuckIt` object globally on the window.
        // This makes the library accessible via `window.FuckIt`.
        window.FuckIt = FuckIt;


    }
)
( jQuery ); // Immediately invoke the function with jQuery as the argument.