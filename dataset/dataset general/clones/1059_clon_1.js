/*
 * This is a Type I clone of the jQuery Browser Plugin, version 0.0.7.
 * The original source can be found at: https://github.com/gabceb/jquery-browser-plugin
 *
 * This file maintains exact logical and structural identity with the original.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * to create a visually distinct, yet functionally identical, code artifact.
 *
 * Original copyright information:
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * http://jquery.org/license
 *
 * Modifications made by Gabriel Cebrian in 2014:
 * https://github.com/gabceb
 *
 * Released under the MIT license, as per the original.
 *
 * Date of original plugin: 12-12-2014
 */

/*
 * Global variable declaration for 'window' to satisfy JSHint/ESLint
 * if such linters are configured to check for undefined globals.
 * It indicates that 'window' is an expected global object.
 */
/*global window: false */

// This is a Universal Module Definition (UMD) wrapper.
// It allows the plugin to be used in various JavaScript environments:
// AMD (Asynchronous Module Definition), CommonJS (Node.js), and browser globals.
( function ( factory ) {

    // Check if AMD loader (like RequireJS) is present and 'define' is a function.
    if ( typeof define === 'function' && define.amd ) {

        // AMD environment: Register as an anonymous module.
        // The module declares a dependency on 'jquery'.
        define( [ 'jquery' ], function ( $ ) {
            // Once jQuery is loaded, invoke the factory function with it.
            factory( $ );
        } );

    } else if ( typeof module === 'object' && typeof module.exports === 'object' ) {

        // CommonJS environment (e.g., Node.js).
        // Export the result of the factory function, passing in the 'jquery' module.
        module.exports = factory( require( 'jquery' ) );

    } else {

        // Browser global environment.
        // The 'jQuery' object is expected to be available on the 'window' scope.
        factory( window.jQuery );
    }

// The core logic of the plugin is encapsulated within this anonymous function,
// which will be passed to the UMD wrapper as the 'factory' argument.
}( function ( jQuery ) {

    "use strict"; // Enforce strict mode for safer JavaScript.

    /**
     * Matches the user agent string against a series of regular expressions
     * to determine the browser and platform information.
     *
     * @param {string} ua The user agent string to parse.
     *                    If not provided, defaults to `window.navigator.userAgent`.
     * @returns {object} An object containing browser and platform details.
     */
    function uaMatch( ua ) {

        // If no user agent string is explicitly provided,
        // fall back to the current browser's user agent.
        if ( ua === undefined ) {

            ua = window.navigator.userAgent;
        }

        // Convert the user agent string to lowercase for case-insensitive matching.
        ua = ua.toLowerCase();

        // Regular expressions to identify various browsers and their versions.
        // The order of these checks is important as some UAs can match multiple patterns.
        var match = /(edge)\/([\w.]+)/.exec( ua ) || // Microsoft Edge browser detection.
                    /(opr)[\/]([\w.]+)/.exec( ua ) || // Opera browser (version 15+).
                    /(chrome)[ \/]([\w.]+)/.exec( ua ) || // Google Chrome.
                    /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) || // Safari (with version info).
                    /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) || // WebKit-based browsers.
                    /(webkit)[ \/]([\w.]+)/.exec( ua ) || // Generic WebKit.
                    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) || // Older Opera versions.
                    /(msie) ([\w.]+)/.exec( ua ) || // Microsoft Internet Explorer (older versions).
                    ( ua.indexOf( "trident" ) >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ) || // Internet Explorer 11 (Trident engine).
                    ( ua.indexOf( "compatible" ) < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ) || // Mozilla-based browsers (e.g., Firefox).
                    []; // Default to an empty array if no matches are found.

        // Regular expressions to identify various operating system platforms or devices.
        var platform_match = /(ipad)/.exec( ua ) ||
                             /(ipod)/.exec( ua ) ||
                             /(iphone)/.exec( ua ) ||
                             /(kindle)/.exec( ua ) ||
                             /(silk)/.exec( ua ) ||
                             /(android)/.exec( ua ) ||
                             /(windows phone)/.exec( ua ) ||
                             /(win)/.exec( ua ) || // Generic Windows.
                             /(mac)/.exec( ua ) || // Generic Mac OS.
                             /(linux)/.exec( ua ) || // Generic Linux.
                             /(cros)/.exec( ua ) || // Chrome OS.
                             /(playbook)/.exec( ua ) || // BlackBerry PlayBook.
                             /(bb)/.exec( ua ) || // BlackBerry 10.
                             /(blackberry)/.exec( ua ) || // Older BlackBerry devices.
                             []; // Default to an empty array if no matches.

        // Initialize the browser information object.
        var browser = {},
            // Extract matched browser and version details.
            matched = {
                browser: match[ 5 ] || match[ 3 ] || match[ 1 ] || "", // Browser name.
                version: match[ 2 ] || match[ 4 ] || "0", // Full version string.
                versionNumber: match[ 4 ] || match[ 2 ] || "0", // Numeric part of the version.
                platform: platform_match[ 0 ] || "" // Platform name.
            };

        // Populate the `browser` object if a browser was successfully matched.
        if ( matched.browser ) {
            browser[ matched.browser ] = true; // Set a flag for the specific browser.
            browser.version = matched.version; // Assign the full version string.
            browser.versionNumber = parseInt( matched.versionNumber, 10 ); // Parse version to integer.
        }

        // Populate the `browser` object if a platform was successfully matched.
        if ( matched.platform ) {
            browser[ matched.platform ] = true; // Set a flag for the specific platform.
        }


        // Determine if the browser is running on a mobile platform.
        // This is based on a list of known mobile operating systems/devices.
        if ( browser.android || browser.bb || browser.blackberry || browser.ipad || browser.iphone ||
             browser.ipod || browser.kindle || browser.playbook || browser.silk || browser[ "windows phone" ] ) {
            browser.mobile = true;
        }

        // Determine if the browser is running on a desktop platform.
        // This is based on a list of known desktop operating systems.
        if ( browser.cros || browser.mac || browser.linux || browser.win ) {
            browser.desktop = true;
        }

        // Identify WebKit-based browsers.
        // Chrome, Opera 15+, and Safari are all built on WebKit (or its forks like Blink).
        if ( browser.chrome || browser.opr || browser.safari ) {
            browser.webkit = true;
        }


        // Special handling for Internet Explorer 11 and Microsoft Edge.
        // IE11 (Trident) is identified by 'rv' in the UA.
        // Edge uses its own 'edge' token.
        // These are mapped to 'msie' for compatibility with older jQuery.browser expectations.
        if ( browser.rv || browser.edge ) {
            var ie = "msie"; // Use 'msie' as the canonical name.

            matched.browser = ie;
            browser[ ie ] = true;
        }


        // Special handling for BlackBerry browsers.
        // Some BlackBerry devices report as Safari.
        if ( browser.safari && browser.blackberry ) {
            var blackberry = "blackberry"; // Use 'blackberry' as the canonical name.

            matched.browser = blackberry;
            browser[ blackberry ] = true;
        }


        // Special handling for Playbook browsers.
        // Playbook devices also report as Safari.
        if ( browser.safari && browser.playbook ) {
            var playbook = "playbook"; // Use 'playbook' as the canonical name.

            matched.browser = playbook;
            browser[ playbook ] = true;
        }


        // Special handling for BlackBerry 10 (BB10).
        // BB10 uses 'bb' in the UA.
        if ( browser.bb ) {
            var bb = "blackberry"; // Map 'bb' to 'blackberry'.

            matched.browser = bb;
            browser[ bb ] = true;
        }


        // Special handling for Opera 15+ browsers.
        // These are identified by 'opr' in the UA.
        if ( browser.opr ) {
            var opera = "opera"; // Map 'opr' to 'opera'.

            matched.browser = opera;
            browser[ opera ] = true;
        }


        // Special handling for Stock Android browsers.
        // These often report as Safari on Android.
        if ( browser.safari && browser.android ) {
            var android = "android"; // Map to 'android'.

            matched.browser = android;
            browser[ android ] = true;
        }


        // Special handling for Kindle browsers.
        // Kindle devices may report as Safari.
        if ( browser.safari && browser.kindle ) {
            var kindle = "kindle"; // Map to 'kindle'.

            matched.browser = kindle;
            browser[ kindle ] = true;
        }

        // Special handling for Kindle Silk browsers.
        // Kindle Silk also reports as Safari.
        if ( browser.safari && browser.silk ) {
            var silk = "silk"; // Map to 'silk'.

            matched.browser = silk;
            browser[ silk ] = true;
        }

        // Assign the determined browser name and platform to the final browser object.
        browser.name = matched.browser;
        browser.platform = matched.platform;

        // Return the comprehensive browser information object.
        return browser;
    }

    // Immediately run the user agent matching process upon plugin load.
    // The result is stored globally on the `window` object as `jQBrowser`.
    // This allows access to browser information even without jQuery.
    window.jQBrowser = uaMatch( window.navigator.userAgent );

    // Also expose the `uaMatch` function itself as a property of `jQBrowser`.
    // This enables manual testing or use with arbitrary user agent strings.
    window.jQBrowser.uaMatch = uaMatch;

    // Conditionally assign the browser information to `jQuery.browser`.
    // This happens only if jQuery is actually loaded and available.
    if ( jQuery ) {
        jQuery.browser = window.jQBrowser;
    }

    // The factory function returns the `jQBrowser` object,
    // which will be used by the UMD wrapper for module exports.
    return window.jQBrowser;

} ) ); // End of the UMD factory function.