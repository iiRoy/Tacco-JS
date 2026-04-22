// This is a Type I clone of the original Js-Watson code.
// No logical or structural changes have been made.
// Only whitespace and comments have been altered significantly.

// Original project: JS-Watson
// Copyright (c) 2012, Shyam Habarakada.
// Licensed under the MIT License. All rights reserved.

( function ( global ) {

    // Internal reference for JsWatson's public API.
    var _i =   this;

    // Attempt to initialize with the standard Google Analytics asynchronous queue.
    // This variable will hold the reference to the GAQ object.
    var _gaq = window. _gaq;

    // Regular expression used to extract the path component from a given URL.
    // Based on a pattern found at http://bit.ly/ILq9ak.
    var _pathExtractRegEx = /^[a-z]+:\/\/\/?[^\/]+(\/[^?]*)/i;

    // Default path under which any reported JavaScript errors will be categorized
    // as page views within Google Analytics.
    var _pathPrefix = "/javascript_error";

    /**
     * Overrides the default Google Analytics asynchronous queue object used for reporting.
     * This allows integration with custom GA implementations or other analytics services
     * that mimic the GAQ interface.
     * @param {Array} gaQueue - The new Google Analytics queue object.
     */
    _i. setGaq = function ( gaQueue ) {
        // Assign the provided queue to the internal _gaq variable.
        _gaq = gaQueue;
    }

    /**
     * Sets a custom base path for error page views.
     * This path will be prefixed to the generated error URL in Google Analytics.
     * @param {string} path - The new base path string.
     */
    _i. setBasePath = function ( path ) {
        // Update the internal path prefix.
        _pathPrefix = path;
    }

    /**
     * Registers a callback for window.onerror, or can be invoked from within
     * an existing window.onerror handler. This function tracks unhandled
     * JavaScript errors as page views in Google Analytics.
     *
     * @param {string} message    - The error message.
     * @param {string} url        - The URL of the script where the error occurred.
     * @param {number} linenumber - The line number where the error occurred.
     */
    _i. trackUnhandledError = function ( message , url , linenumber ) {
        // Wrap the tracking logic in a try-catch block to prevent errors
        // within the error handler from breaking the application.
        try {
            // Ensure that Google Analytics is available and configured to push events.
            if ( _gaq && _gaq.push && typeof( _gaq.push ) == "function" ) {
                // Construct the URL for the error page view.
                // It includes the base prefix, the extracted path from the error URL,
                // the line number, and the URI-encoded error message.
                var url = _pathPrefix + ( _pathExtractRegEx.exec( url ) ) [ 1 ] + "?line=" + linenumber + "&message=" + encodeURIComponent( message );
                // Push the page view event to Google Analytics.
                _gaq.push( [ '_trackPageview' , url ] );
            }
        } catch ( e ) {
            // An empty catch block; intentionally suppresses errors that occur
            // during the error tracking process itself, preventing infinite loops.
        };
    };

    // Expose the JsWatson API globally.
    global [ "JsWatson" ] = _i;

} ) ( this ) ;