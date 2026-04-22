/*
 *  History.js Core - Client-Side History Management
 *  @author Benjamin Arthur Lupton <contact@balupton.com>
 *  @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 *  @license New BSD License <http://creativecommons.org/licenses/BSD/> - This license allows free use, modification, and redistribution.
 */


( function  (  window, undefined  )
{
    "use strict"; /* Enforce strict mode for cleaner code */

    // ====================================================================================
    // Section: Initialisation of Global Variables and Compatibility Fixes

    // Localize global objects for performance and to prevent JSLint complaints.
    var
          console           = window.console    || undefined, // Console object, or undefined if not available
          document          = window.document,                // Reference to the document object
          navigator         = window.navigator,               // Reference to the navigator object
          sessionStorage    = window.sessionStorage || false, // sessionStorage, or false if not supported
          setTimeout        = window.setTimeout,              // Reference to setTimeout
          clearTimeout      = window.clearTimeout,            // Reference to clearTimeout
          setInterval       = window.setInterval,             // Reference to setInterval
          clearInterval     = window.clearInterval,           // Reference to clearInterval
          JSON              = window.JSON,                    // Reference to JSON object
          alert             = window.alert,                   // Reference to alert function
          History           = window.History    = window.History || {}, // The main History object, create if it doesn't exist
          history           = window.history    ;             // Original browser history object


    // Ensure JSON.stringify and JSON.parse are available for MooTools compatibility.
    // Some older MooTools versions might use JSON.encode/decode.
    JSON.stringify      = JSON.stringify    || JSON.encode;
    JSON.parse          = JSON.parse        || JSON.decode;


    // Check if History.js Core has already been loaded.
    // If it has, throw an error to prevent re-initialization issues.
    if  ( typeof History.init !== 'undefined' )
    {
        throw  new Error( 'History.js Core has already been loaded...' );
    }


    // The primary initialization function for History.js.
    // This function orchestrates the loading of various components.
    History.init = function ( )
    {
        // Check if the History.Adapter is available.
        // The adapter provides cross-browser event handling.
        if  (  typeof History.Adapter === 'undefined'  )
        {
            return false; // Adapter not found, initialization failed.
        }

        // Initialize the core functionality if it hasn't been already.
        if  (  typeof History.initCore !== 'undefined'  )
        {
            History.initCore( );
        }

        // Initialize HTML4 compatibility features if they are present.
        if  (  typeof History.initHtml4 !== 'undefined'  )
        {
            History.initHtml4( );
        }

        // Return true to indicate successful initialization.
        return true;
    };



    // ====================================================================================
    // Section: Core Initialization Logic

    // Initialize the core internal components of History.js.
    History.initCore = function ( )
    {
        // Prevent multiple initializations of the core.
        if  ( typeof History.initCore.initialized !== 'undefined' )
        {
            // Core already loaded, exit.
            return false;
        }
        else
        {
            History.initCore.initialized = true; // Mark as initialized.
        }


        // ================================================================================
        // Sub-Section: Configuration Options

        /**
         * History.options
         * An object containing configurable options for History.js.
         * Default values are set here.
         */
        History.options = History.options || {}; // Ensure options object exists.

        /**
         * History.options.hashChangeInterval
         * The frequency (in milliseconds) at which the hashchange event is polled
         * for browsers that do not natively support it.
         */
        History.options.hashChangeInterval = History.options.hashChangeInterval || 100;

        /**
         * History.options.safariPollInterval
         * The frequency (in milliseconds) at which Safari is polled for state changes,
         * due to specific bugs in older Safari versions.
         */
        History.options.safariPollInterval = History.options.safariPollInterval || 500;

        /**
         * History.options.doubleCheckInterval
         * The interval (in milliseconds) for a double-check mechanism, particularly
         * for IE bugs where hash changes might not apply consistently.
         */
        History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;

        /**
         * History.options.storeInterval
         * The interval (in milliseconds) at which the history state is stored
         * to sessionStorage, helping with persistence across sessions.
         */
        History.options.storeInterval = History.options.storeInterval || 1000;

        /**
         * History.options.busyDelay
         * The delay (in milliseconds) between busy events, used to throttle
         * rapid state changes and prevent UI thrashing.
         */
        History.options.busyDelay = History.options.busyDelay || 250;

        /**
         * History.options.debug
         * A boolean flag. If set to true, debug messages will be logged to the console.
         */
        History.options.debug = History.options.debug || false;

        /**
         * History.options.initialTitle
         * The title to use for the initial state of the document.
         * Defaults to the current document title.
         */
        History.options.initialTitle = History.options.initialTitle || document.title;


        // ================================================================================
        // Sub-Section: Interval Management

        /**
         * History.intervalList
         * An array to keep track of all setInterval instances created by History.js.
         * This allows them to be cleared systematically when the document unloads.
         */
        History.intervalList = [];

        /**
         * History.clearAllIntervals
         * A utility function to clear all active setInterval instances that were
         * registered with History.js. This is crucial for preventing memory leaks.
         */
        History.clearAllIntervals = function ( )
        {
            var i, il = History.intervalList; // Loop variables
            if  ( typeof il !== "undefined"  &&  il !== null )
            {
                for  ( i = 0;  i < il.length;  i++ )
                {
                    clearInterval( il[i] ); // Clear each interval.
                }
                History.intervalList = null; // Reset the list after clearing.
            }
        };


        // ================================================================================
        // Sub-Section: Debugging and Logging Utilities

        /**
         * History.debug(message,...)
         * Logs messages to the console (or an alert if no console) only if
         * History.options.debug is set to true.
         * Accepts multiple arguments, similar to console.log.
         */
        History.debug = function ( )
        {
            if  (  ( History.options.debug || false )  )
            {
                History.log.apply( History, arguments ); // Call History.log with current arguments.
            }
        };

        /**
         * History.log(message,...)
         * Logs messages to the console or a textarea, or falls back to alert.
         * This function is always active, regardless of the debug option.
         */
        History.log = function ( )
        {
            // Prepare variables for logging.
            var
                  consoleExists = !( typeof console === 'undefined' || typeof console.log === 'undefined' || typeof console.log.apply === 'undefined' ),
                  textarea      = document.getElementById( 'log' ), // Attempt to find a textarea with id 'log'
                  message,
                  i, n,
                  args, arg;

            // Log to console if available.
            if  ( consoleExists )
            {
                args = Array.prototype.slice.call( arguments ); // Convert arguments to a real array.
                message = args.shift( ); // First argument is the main message.
                if  ( typeof console.debug !== 'undefined' )
                {
                    console.debug.apply( console, [message, args] ); // Use console.debug if available.
                }
                else
                {
                    console.log.apply( console, [message, args] ); // Otherwise, use console.log.
                }
            }
            else
            {
                message = ( "\n" + arguments[0] + "\n" ); // Fallback message format for alert.
            }

            // Append additional arguments to the message.
            for  (  i = 1, n = arguments.length;  i < n;  ++i  )
            {
                arg = arguments[i];
                // Attempt to stringify objects for better readability.
                if  (  typeof arg === 'object'  &&  typeof JSON !== 'undefined'  )
                {
                    try
                    {
                        arg = JSON.stringify( arg );
                    }
                    catch  ( Exception )
                    {
                        // Handle circular references or other JSON stringify errors.
                        // Do nothing, arg remains as is.
                    }
                }
                message += "\n" + arg + "\n";
            }

            // Write to a textarea if found.
            if  ( textarea )
            {
                textarea.value += message + "\n-----\n"; // Append message to textarea.
                textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight; // Scroll to bottom.
            }
            // If no textarea and no console, use alert as a last resort.
            else if  ( !consoleExists )
            {
                alert( message );
            }

            // Indicate success.
            return true;
        };


        // ================================================================================
        // Sub-Section: Browser Capabilities and Emulation Status

        /**
         * History.getInternetExplorerMajorVersion()
         * Detects the major version of Internet Explorer.
         * @return {integer} The major IE version number, or false if not IE or version < 5.
         * @license Public Domain
         * @author Benjamin Arthur Lupton <contact@balupton.com>
         * @author James Padolsey <https://gist.github.com/527683> (original inspiration)
         */
        History.getInternetExplorerMajorVersion = function ( )
        {
            var result = History.getInternetExplorerMajorVersion.cached =
                  ( typeof History.getInternetExplorerMajorVersion.cached !== 'undefined' )
                ? History.getInternetExplorerMajorVersion.cached // Use cached result if available.
                : ( function ( )
                    {
                        var v = 3,
                            div = document.createElement( 'div' ),
                            all = div.getElementsByTagName( 'i' );
                        // Loop through IE conditional comments to find the version.
                        while  (  ( div.innerHTML = '<!--[if gt IE ' + ( ++v ) + ']><i></i><![endif]-->' )  &&  all[0]  )
                        {
                            /* empty */
                        }
                        return ( v > 4 )  ? v : false; // Return version or false.
                    } ) ( )
                ;
            return result;
        };

        /**
         * History.isInternetExplorer()
         * Checks if the current browser is Internet Explorer.
         * @return {boolean} True if IE, false otherwise.
         * @license Public Domain
         * @author Benjamin Arthur Lupton <contact@balupton.com>
         */
        History.isInternetExplorer = function ( )
        {
            var result =
                History.isInternetExplorer.cached =
                ( typeof History.isInternetExplorer.cached !== 'undefined' )
                ? History.isInternetExplorer.cached // Use cached result if available.
                : Boolean( History.getInternetExplorerMajorVersion( ) ) // Determine from IE version.
                ;
            return result;
        };

        /**
         * History.emulated
         * An object that describes which features need to be emulated due to
         * lack of native browser support or known bugs.
         */
        History.emulated = {
            // Determines if pushState needs to be emulated.
            // It's emulated if window.history.pushState is not available,
            // or if specific iOS/WebKit versions are detected due to known bugs.
            pushState: !Boolean(
                window.history && window.history.pushState && window.history.replaceState
                && !(
                      ( / Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i ).test( navigator.userAgent ) /* disable for versions of iOS before version 4.3 (8F190) */
                      || ( /AppleWebKit\/5([0-2]|3[0-2])/i ).test( navigator.userAgent ) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
                    )
            ),
            // Determines if hashChange event needs to be emulated.
            // Emulated if 'onhashchange' isn't supported natively, or for older IE versions.
            hashChange: Boolean(
                !( ( 'onhashchange' in window ) || ( 'onhashchange' in document ) )
                ||
                ( History.isInternetExplorer( ) && History.getInternetExplorerMajorVersion( ) < 8 )
            )
        };

        /**
         * History.enabled
         * A boolean indicating whether the History API (pushState) is effectively enabled.
         * It is enabled if pushState emulation is NOT required.
         */
        History.enabled = !History.emulated.pushState;

        /**
         * History.bugs
         * An object detailing specific browser bugs that History.js needs to work around.
         */
        History.bugs = {
            /**
             * Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call
             * https://bugs.webkit.org/show_bug.cgi?id=56249
             * This bug requires special handling for setting the hash.
             */
            setHash: Boolean( !History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test( navigator.userAgent ) ),

            /**
             * Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions
             * https://bugs.webkit.org/show_bug.cgi?id=42940
             * This bug necessitates a polling mechanism for Safari.
             */
            safariPoll: Boolean( !History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test( navigator.userAgent ) ),

            /**
             * MSIE 6 and 7 sometimes do not apply a hash even if it was told to (requiring a second call to the apply function)
             * This bug requires a double-check mechanism for older IE.
             */
            ieDoubleCheck: Boolean( History.isInternetExplorer( ) && History.getInternetExplorerMajorVersion( ) < 8 ),

            /**
             * MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event
             * This bug affects hash encoding in IE6 specifically.
             */
            hashEscape: Boolean( History.isInternetExplorer( ) && History.getInternetExplorerMajorVersion( ) < 7 )
        };

        /**
         * History.isEmptyObject(obj)
         * Checks if a given object is empty (has no enumerable properties).
         * @param {Object} obj The object to check.
         * @return {boolean} True if the object is empty, false otherwise.
         */
        History.isEmptyObject = function ( obj )
        {
            for  ( var name in obj )
            {
                return false; // If any property is found, it's not empty.
            }
            return true; // No properties found, it's empty.
        };

        /**
         * History.cloneObject(obj)
         * Creates a deep clone of an object, ensuring no references to the original context remain.
         * Uses JSON.stringify and JSON.parse for a simple deep clone.
         * @param {Object} obj The object to clone.
         * @return {Object} A new, independent copy of the object.
         */
        History.cloneObject = function ( obj )
        {
            var hash, newObj;
            if  ( obj )
            {
                hash = JSON.stringify( obj ); // Convert object to JSON string.
                newObj = JSON.parse( hash ); // Parse JSON string back to a new object.
            }
            else
            {
                newObj = {}; // If input is null/undefined, return an empty object.
            }
            return newObj;
        };


        // ================================================================================
        // Sub-Section: URL Manipulation and Helper Functions

        /**
         * History.getRootUrl()
         * Extracts the root URL (e.g., "http://mysite.com") from the current document location.
         * @return {String} The root URL of the current domain.
         */
        History.getRootUrl = function ( )
        {
            // Construct the root URL from protocol, hostname, and optional port.
            var rootUrl = document.location.protocol + '//' + ( document.location.hostname || document.location.host );
            if  ( document.location.port || false )
            {
                rootUrl += ':' + document.location.port;
            }
            rootUrl += '/'; // Ensure a trailing slash.

            return rootUrl; // Return the constructed root URL.
        };

        /**
         * History.getBaseHref()
         * Retrieves the `href` attribute from the `<base>` HTML element, if one exists.
         * This is important for resolving relative URLs correctly.
         * @return {String} The base href, or an empty string if no base element is found.
         */
        History.getBaseHref = function ( )
        {
            // Find all <base> elements.
            var
                  baseElements    = document.getElementsByTagName( 'base' ),
                  baseElement     = null,
                  baseHref        = '';

            // If a base element is found (expecting only one).
            if  ( baseElements.length === 1 )
            {
                baseElement = baseElements[0];
                // Extract href and remove filename part.
                baseHref = baseElement.href.replace( /[^\/]+$/, '' );
            }

            // Adjust trailing slash for consistency.
            baseHref = baseHref.replace( /\/+$/, '' );
            if  ( baseHref )
            {
                baseHref += '/';
            }

            return baseHref; // Return the base href.
        };

        /**
         * History.getBaseUrl()
         * Determines the most appropriate base URL for resolving relative paths.
         * It prioritizes `baseHref`, then `basePageUrl`, then `rootUrl`.
         * @return {String} The determined base URL.
         */
        History.getBaseUrl = function ( )
        {
            // Prioritize baseHref, then basePageUrl, then rootUrl.
            var baseUrl = History.getBaseHref( ) || History.getBasePageUrl( ) || History.getRootUrl( );

            return baseUrl; // Return the determined base URL.
        };

        /**
         * History.getPageUrl()
         * Fetches the URL of the current page, possibly modified by History.js state.
         * It ensures a consistent format (trailing slash for directories, no trailing slash for files unless specific).
         * @return {String} The current page's URL.
         */
        History.getPageUrl = function ( )
        {
            // Get current state URL or fallback to document.location.href.
            var
                  State       = History.getState( false, false ),
                  stateUrl    = ( State || {} ).url || document.location.href,
                  pageUrl     ;

            // Normalize the URL: remove trailing slashes for files, add for directories.
            pageUrl = stateUrl.replace( /\/+$/, '' ).replace( /[^\/]+$/, function ( part, index, string )
            {
                return ( /\!/ ).test( part ) ? part : part + '/'; // If it contains '!', it's likely a file, otherwise assume directory.
            } );

            return pageUrl; // Return the normalized page URL.
        };

        /**
         * History.getBasePageUrl()
         * Retrieves the URL of the directory containing the current page.
         * (e.g., for "http://example.com/dir/page.html", it returns "http://example.com/dir/").
         * @return {String} The base page URL.
         */
        History.getBasePageUrl = function ( )
        {
            // Remove hash and query, then remove filename, ensuring a trailing slash.
            var basePageUrl = document.location.href.replace( /[#\?].*/, '' ).replace( /[^\/]+$/, function ( part, index, string )
            {
                return ( /[^\/]$/ ).test( part ) ? '' : part; // If it ends without '/', it's a file, so remove it.
            } ).replace( /\/+$/, '' ) + '/';

            return basePageUrl; // Return the base page URL.
        };

        /**
         * History.getFullUrl(url, allowBaseHref)
         * Converts a potentially relative URL into an absolute URL.
         * @param {string} url The URL to convert.
         * @param {Boolean} allowBaseHref If true, uses <base href> for relative paths; otherwise, uses current page's directory.
         * @return {string} The full, absolute URL.
         */
        History.getFullUrl = function ( url, allowBaseHref )
        {
            // Prepare variables.
            var fullUrl = url, firstChar = url.substring( 0, 1 );
            allowBaseHref = ( typeof allowBaseHref === 'undefined' ) ? true : allowBaseHref; // Default to true.

            // Check URL type and convert accordingly.
            if  ( /[a-z]+\:\/\//.test( url ) )
            {
                // Already a full URL, no change needed.
            }
            else if  ( firstChar === '/' )
            {
                // Root-relative URL (e.g., /path/to/resource).
                fullUrl = History.getRootUrl( ) + url.replace( /^\/+/, '' );
            }
            else if  ( firstChar === '#' )
            {
                // Anchor URL (e.g., #section).
                fullUrl = History.getPageUrl( ).replace( /#!*/, '' ) + url;
            }
            else if  ( firstChar === '?' )
            {
                // Query string URL (e.g., ?param=value).
                fullUrl = History.getPageUrl( ).replace( /[\?#]!*/, '' ) + url;
            }
            else
            {
                // Relative URL (e.g., path/to/resource).
                if  ( allowBaseHref )
                {
                    fullUrl = History.getBaseUrl( ) + url.replace( /^(\!\/)+/, '' );
                }
                else
                {
                    fullUrl = History.getBasePageUrl( ) + url.replace( /^(\!\/)+/, '' );
                }
                // The `allowBaseHref` condition is important:
                // We don't want hashes relative to `baseHref` as it can change,
                // making bookmarks unreliable. `basePageUrl` is more stable.
            }

            return fullUrl.replace( /\#$/, '' ); // Remove any trailing hash symbol.
        };

        /**
         * History.getShortUrl(url)
         * Attempts to convert an absolute URL back into a relative URL if possible,
         * relative to the base URL of the site.
         * @param {string} url The absolute URL to shorten.
         * @return {string} The shortened, relative URL, or the original URL if it cannot be shortened.
         */
        History.getShortUrl = function ( url )
        {
            // Placeholder for implementation.
            // This function is defined but not yet implemented in the provided snippet.
            // Prepare