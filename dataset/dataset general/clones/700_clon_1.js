/**
 * easyXDM
 * http://easyxdm.net/
 * Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This is a cloned version of the original source, with extensive whitespace and comment modifications.
 */
( function ( window, document, location, setTimeout, decodeURIComponent, encodeURIComponent ) {


/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global JSON, XMLHttpRequest, window, escape, unescape, ActiveXObject */

//
// easyXDM - Cross-domain messaging library
// http://easyxdm.net/
//
// Copyright (c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// License: MIT
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//


var global = this; // Reference to the global object (window in browsers)

var channelId = Math.floor( Math.random() * 10000 ); // Randomize initial ID for multiple easyXDM instances

var emptyFn = Function.prototype; // A reference to an empty function prototype

var reURI = /^((http.?:)\/\/([^:\/\s]+)(:\d+)*)/; // Regex to parse URI components: protocol (2), domain (3), port (4)

var reParent = /[\-\w]+\/\.\.\//; // Regex to match and reduce 'foo/../' patterns in paths

var reDoubleSlash = /([^:])\/\//g; // Regex to replace double slashes, except in the protocol part

var namespace = ""; // Stores the namespace under which easyXDM is exposed; empty if global

var easyXDM = {}; // The main easyXDM object

var _easyXDM = window.easyXDM; // Save existing easyXDM reference to avoid conflicts

var IFRAME_PREFIX = "easyXDM_"; // Prefix for generated iframe names/IDs

var HAS_NAME_PROPERTY_BUG; // Flag for IE's iframe name property bug

var useHash = false; // Determines whether to use URL hash or query string for communication

var flashVersion; // Stores the detected Flash player version

var HAS_FLASH_THROTTLED_BUG; // Flag for Flash throttling bug (e.g., in Chrome background tabs)


// --- Feature Detection Utilities ---

// http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
function isHostMethod( object, property ) {

    var t = typeof object[ property ]; // Get the type of the property
    return t == 'function' || // It's a function
           ( !!( t == 'object' && object[ property ] ) ) || // It's an object that evaluates to true
           t == 'unknown'; // Or it's an 'unknown' type (common for host objects in IE)
}

function isHostObject( object, property ) {

    // Check if the property exists and is an object
    return !!( typeof( object[ property ] ) == 'object' && object[ property ] );
}

// end of feature detection helpers


// http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
function isArray( o ) {

    // Use Object.prototype.toString for robust array detection
    return Object.prototype.toString.call( o ) === '[object Array]';
}

// end of array detection


// --- Flash Detection ---
function hasFlash( ) {
    var name = "Shockwave Flash",
        mimeType = "application/x-shockwave-flash";
    
    // Check for Flash plugin in Netscape-style browsers (Firefox, Chrome, Safari)
    if ( !undef( navigator.plugins ) && typeof navigator.plugins[ name ] == "object" ) {
        // Adapted from the SWFObject library
        var description = navigator.plugins[ name ].description;
        if ( description && !undef( navigator.mimeTypes ) && navigator.mimeTypes[ mimeType ] && navigator.mimeTypes[ mimeType ].enabledPlugin ) {
            flashVersion = description.match( /\d+/g ); // Extract version numbers
        }
    }

    // Check for Flash ActiveX control in IE
    if ( !flashVersion ) {
        var flash;
        try {
            flash = new ActiveXObject( "ShockwaveFlash.ShockwaveFlash" );
            // Extract version from $version variable
            flashVersion = Array.prototype.slice.call( flash.GetVariable( "$version" ).match( /(\d+),(\d+),(\d+),(\d+)/ ), 1 );
            flash = null; // Release the object
        }
        catch ( notSupportedException ) {
            // Flash ActiveX not supported or disabled
        }
    }

    // If no Flash version was detected, return false
    if ( !flashVersion ) {
        return false;
    }

    // Parse major and minor version numbers
    var major = parseInt( flashVersion[ 0 ], 10 ),
        minor = parseInt( flashVersion[ 1 ], 10 );

    // Check for Flash throttling bug (e.g., in Chrome background tabs)
    HAS_FLASH_THROTTLED_BUG = major > 9 && minor > 0;

    return true; // Flash is available
}

/*
 * Cross-browser implementation for adding and removing event listeners.
 * Uses W3C standard `addEventListener` or IE's `attachEvent`.
 */
var on, un; // Declare event handler functions

if ( isHostMethod( window, "addEventListener" ) ) {
    // W3C standard model
    on = function ( target, type, listener ) {
        target.addEventListener( type, listener, false );
    };
    un = function ( target, type, listener ) {
        target.removeEventListener( type, listener, false );
    };
} else if ( isHostMethod( window, "attachEvent" ) ) {
    // IE proprietary model
    on = function ( object, sEvent, fpNotify ) {
        object.attachEvent( "on" + sEvent, fpNotify );
    };
    un = function ( object, sEvent, fpNotify ) {
        object.detachEvent( "on" + sEvent, fpNotify );
    };
} else {
    // Browser not supported if neither method exists
    throw new Error( "Browser not supported" );
}

/*
 * Cross-browser implementation of DOMContentLoaded event detection.
 * Executes a queue of functions once the DOM is ready.
 */
var domIsReady = false, // Flag indicating if the DOM is ready
    domReadyQueue = [], // Queue of functions to execute when DOM is ready
    readyState;         // Document's readyState property

if ( "readyState" in document ) {
    // If browser is WebKit-powered, check for both 'loaded' (legacy browsers) and
    // 'interactive' (HTML5 specs, recent WebKit builds) states.
    // https://bugs.webkit.org/show_bug.cgi?id=45119
    readyState = document.readyState;
    domIsReady = readyState == "complete" || ( ~ navigator.userAgent.indexOf( 'AppleWebKit/' ) && ( readyState == "loaded" || readyState == "interactive" ) );
} else {
    // If readyState is not supported, we deduce readiness by checking for document.body.
    // This allows `whenReady` functions to fire appropriately even if added dynamically
    // after initial DOM load.
    domIsReady = !!document.body;
}

// Function to call when the DOM is ready
function dom_onReady( ) {
    if ( domIsReady ) {
        return; // Already ready, do nothing
    }

    domIsReady = true; // Set the flag
    for ( var i = 0; i < domReadyQueue.length; i++ ) {
        domReadyQueue[ i ]( ); // Execute queued functions
    }
    domReadyQueue.length = 0; // Clear the queue
}


// Attach DOM ready event listeners if not already ready
if ( !domIsReady ) {
    if ( isHostMethod( window, "addEventListener" ) ) {
        // W3C standard DOMContentLoaded event
        on( document, "DOMContentLoaded", dom_onReady );
    } else {
        // IE-specific readyState change
        on( document, "readystatechange", function ( ) {
            if ( document.readyState == "complete" ) {
                dom_onReady( );
            }
        } );

        // IE doScroll check for older IE versions (pre-DOMContentLoaded)
        if ( document.documentElement.doScroll && window === top ) {
            var doScrollCheck = function ( ) {
                if ( domIsReady ) {
                    return;
                }
                // http://javascript.nwbox.com/IEContentLoaded/
                try {
                    // This throws an error until the DOM is ready
                    document.documentElement.doScroll( "left" );
                }
                catch ( e ) {
                    setTimeout( doScrollCheck, 1 ); // Retry shortly
                    return;
                }
                dom_onReady( ); // DOM is ready
            };
            doScrollCheck( ); // Start the check
        }
    }

    // A fallback to window.onload, which will always work (but fires later)
    on( window, "load", dom_onReady );
}

/**
 * This will add a function to the queue of functions to be run once the DOM reaches a ready state.
 * If functions are added after this event then they will be executed immediately.
 * @param {function} fn The function to add
 * @param {Object} scope An optional scope for the function to be called with.
 */
function whenReady( fn, scope ) {
    if ( domIsReady ) {
        fn.call( scope ); // Execute immediately if DOM is already ready
        return;
    }
    domReadyQueue.push( function ( ) {
        fn.call( scope ); // Add to queue for later execution
    } );
}

/**
 * Returns an instance of easyXDM from the parent window with
 * respect to the defined namespace.
 *
 * @return An instance of easyXDM (in the parent window or global scope)
 */
function getParentObject( ) {
    var obj = parent; // Start with the parent window
    if ( namespace !== "" ) {
        // Traverse the namespace path to find the correct object
        for ( var i = 0, ii = namespace.split( "." ); i < ii.length; i++ ) {
            obj = obj[ ii[ i ] ];
        }
    }
    return obj.easyXDM; // Return the easyXDM instance
}

/**
 * Removes easyXDM variable from the global scope. It also returns control
 * of the easyXDM variable to whatever code used it before.
 *
 * @param {String} ns A string representation of an object that will hold
 *                    an instance of easyXDM.
 * @return An instance of easyXDM
 */
function noConflict( ns ) {

    window.easyXDM = _easyXDM; // Restore the original easyXDM global variable
    namespace = ns; // Set the new namespace
    if ( namespace ) {
        // Adjust iframe prefix to avoid conflicts within the namespace
        IFRAME_PREFIX = "easyXDM_" + namespace.replace( ".", "_" ) + "_";
    }
    return easyXDM; // Return the easyXDM instance
}

/*
 * Methods for working with URLs and their components.
 */
/**
 * Get the domain name from a URL string.
 * @param {String} url The url to extract the domain from.
 * @return The domain part of the url.
 * @type {String}
 */
function getDomainName( url ) {
    return url.match( reURI )[ 3 ]; // Third group in regex is the domain
}

/**
 * Get the port for a given URL, or an empty string if no explicit port is present.
 * @param {String} url The url to extract the port from.
 * @return The port part of the url (e.g., ":8080" or "").
 * @type {String}
 */
function getPort( url ) {
    return url.match( reURI )[ 4 ] || ""; // Fourth group is the port
}

/**
 * Returns a string containing the schema, domain, and if present, the port.
 * This effectively gives the origin part of the URL.
 * @param {String} url The url to extract the location from.
 * @return {String} The location (origin) part of the url.
 */
function getLocation( url ) {
    var m = url.toLowerCase( ).match( reURI );
    var proto = m[ 2 ], // Protocol (e.g., "http:")
        domain = m[ 3 ], // Domain (e.g., "example.com")
        port = m[ 4 ] || ""; // Port (e.g., ":8080" or "")

    // Remove default ports for http and https
    if ( ( proto == "http:" && port == ":80" ) || ( proto == "https:" && port == ":443" ) ) {
        port = "";
    }
    return proto + "//" + domain + port; // Reconstruct the origin
}

/**
 * Resolves a relative URL into an absolute one based on the current document's location.
 * @param {String} url The path to resolve.
 * @return {String} The resolved absolute url.
 */
function resolveUrl( url ) {

    // Replace all double slashes with single slashes, except in the protocol part (e.g., "http://")
    url = url.replace( reDoubleSlash, "$1/" );

    // If the URL is already absolute, do nothing
    if ( !url.match( /^(http||https):\/\// ) ) {
        var path = ( url.substring( 0, 1 ) === "/" ) ? "" : location.pathname; // Determine base path
        if ( path.substring( path.length - 1 ) !== "/" ) {
            path = path.substring( 0, path.lastIndexOf( "/" ) + 1 ); // Ensure base path ends with a slash
        }

        // Prepend current location's protocol, host, and derived path
        url = location.protocol + "//" + location.host + path + url;
    }

    // Reduce all 'xyz/../' expressions to just '' (e.g., "a/b/../c" becomes "a/c")
    while ( reParent.test( url ) ) {
        url = url.replace( reParent, "" );
    }

    return url; // Return the fully resolved URL
}

/**
 * Appends the provided parameters to the given URL.
 * The base URL can contain existing query parameters or a hash.
 * @param {String} url The base url.
 * @param {Object} parameters The parameters to add (key-value pairs).
 * @return {String} A new valid url with the parameters appended.
 */
function appendQueryParameters( url, parameters ) {

    var hash = "",
        indexOf = url.indexOf( "#" );

    // Extract and preserve any hash part of the URL
    if ( indexOf !== -1 ) {
        hash = url.substring( indexOf );
        url = url.substring( 0, indexOf );
    }

    var q = []; // Array to build query string parts
    for ( var key in parameters ) {
        if ( parameters.hasOwnProperty( key ) ) {
            // Encode parameter values and add to array
            q.push( key + "=" + encodeURIComponent( parameters[ key ] ) );
        }
    }

    // Determine if parameters should be appended with '?' or '&' or '#'
    return url + ( useHash ? "#" : ( url.indexOf( "?" ) == -1 ? "?" : "&" ) ) + q.join( "&" ) + hash;
}


// Build the query object either from location.search (if it contains xdm_e),
// or from location.hash. This is used for incoming messages.
var query = ( function ( input ) {
    input = input.substring( 1 ).split( "&" ); // Remove leading '?' or '#' and split
    var data = {},
        pair,
        i = input.length;

    while ( i-- ) {
        pair = input[ i ].split( "=" ); // Split key=value
        data[ pair[ 0 ] ] = decodeURIComponent( pair[ 1 ] ); // Decode and store
    }
    return data;
}( /xdm_e=/.test( location.search ) ? location.search : location.hash ) ); // Use search or hash based on xdm_e presence

/*
 * General Helper methods.
 */
/**
 * Helper for checking if a variable or property is undefined.
 * @param {Object} v The variable to test.
 * @return {Boolean} True if the passed variable is undefined, false otherwise.
 */
function undef( v ) {
    return typeof v === "undefined";
}

/**
 * A safe implementation of HTML5 JSON parsing and stringifying.
 * Feature testing is used to make sure the implementation works correctly.
 * @return {JSON} A valid JSON conforming object (with stringify and parse methods), or null if not found.
 */
var getJSON = function ( ) {
    var cached = {}; // Cache for the detected JSON methods
    var obj = {
            a: [ 1, 2, 3 ]
        },
        json = "{\"a\":[1,2,3]}"; // Test object and its JSON string representation

    // Check for native JSON object
    if ( typeof JSON != "undefined" && typeof JSON.stringify === "function" && JSON.stringify( obj ).replace( ( /\s/g ), "" ) === json ) {
        // This is a working native JSON instance
        return JSON;
    }

    // Check for Prototype.js Object.toJSON
    if ( Object.toJSON ) {
        if ( Object.toJSON( obj ).replace( ( /\s/g ), "" ) === json ) {
            // This is a working stringify method from Prototype.js
            cached.stringify = Object.toJSON;
        }
    }

    // Check for Prototype.js String.prototype.evalJSON
    if ( typeof String.prototype.evalJSON === "function" ) {
        obj = json.evalJSON( ); // Try parsing the test string
        if ( obj.a && obj.a.length === 3 && obj.a[ 2 ] === 3 ) {
            // This is a working parse method
            cached.parse = function ( str ) {
                return str.evalJSON( );
            };
        }
    }

    // If both stringify and parse methods were found and validated
    if ( cached.stringify && cached.parse ) {
        // Only memoize the result if we have a valid instance
        getJSON = function ( ) {
            return cached;
        };
        return cached;
    }

    return null; // No working JSON implementation found
};

/**
 * Applies properties from a source object to a target object.
 * This function performs a deep merge for nested objects.
 * @param {Object} destination The target object to apply properties to.
 * @param {Object} source The source object providing the properties.
 * @param {Boolean} noOverwrite Set to True to only set non-existing properties (shallow for top-level).
 */
function apply( destination, source, noOverwrite ) {
    var member;
    for ( var prop in source ) {
        // Ensure property belongs to the source object itself, not its prototype chain
        if ( source.hasOwnProperty( prop ) ) {
            if ( prop in destination ) {
                member = source[ prop ];
                if ( typeof member === "object" ) {
                    // Recursively apply for nested objects
                    apply( destination[ prop ], member, noOverwrite );
                } else if ( !noOverwrite ) {
                    // Overwrite existing property if not in noOverwrite mode
                    destination[ prop ] = source[ prop ];
                }
            } else {
                // Add new property to destination
                destination[ prop ] = source[ prop ];
            }
        }
    }
    return destination; // Return the modified destination object
}

// This tests for the bug in IE where setting the [name] property using javascript
// causes the value to be redirected into [submitName] instead of [name].
function testForNamePropertyBug( ) {
    var form = document.body.appendChild( document.createElement( "form" ) ), // Create a temporary form
        input = form.appendChild( document.createElement( "input" ) ); // Add an input element

    // Set the name property
    input.name = IFRAME_PREFIX + "TEST" + channelId; // Append channelId to avoid caching issues in IE

    // Check if the input element can be accessed by its name via the form's elements collection
    HAS_NAME_PROPERTY_BUG = input !== form.elements[ input.name ];

    document.body.removeChild( form ); // Clean up the temporary form
}

/**
 * Creates an IFRAME element and appends it to the DOM.
 * This function handles cross-browser quirks related to iframe creation.
 * @param config {object} Configuration object for the iframe.
 *   @param {object} config.props The properties that should be set on the frame (e.g., 'src', 'name').
 *   @param {object} config.attr The attributes that should be set on the frame (not used in this snippet).
 *   @param {DOMElement|String} config.container Its parent element or its ID (Optional).
 *   @param {function} config.onLoad A method that should be called when the frame is fully loaded (Optional).
 * @return The created IFRAME DOMElement.
 * @type DOMElement
 */
function createFrame( config ) {
    // Check for the IE name property bug if not already determined
    if ( undef( HAS_NAME_PROPERTY_BUG ) ) {
        testForNamePropertyBug( );
    }

    var frame;

    // This is to work around the problems in IE6/7 with setting the name property.
    // Internally this is set as 'submitName' instead when using 'iframe.name = ...'
    // This is not strictly required by easyXDM itself, but is to facilitate other use cases
    // that might rely on the 'name' attribute being properly set for form submission or JS access.
    if ( HAS_NAME_PROPERTY_BUG ) {
        // In IE, create the iframe with the name attribute directly in the HTML string
        frame = document.createElement( "<iframe name=\"" + config.props.name + "\"/>" );
    } else {
        // For other browsers, create normally and assign name property
        frame = document.createElement( "IFRAME" );
        frame.name = config.props.name;
    }

    // Set both id and name for broader compatibility and easier access
    frame.id = frame.name = config.props.name;
    delete config.props.name; // Remove name from props as it's already set

    // Resolve container element if a string ID is provided
    if ( typeof config.container == "string" ) {
        config.container = document.getElementById( config.container );
    }

    // If no container is specified, or it's not found, append to body and hide it
    if ( !config.container ) {
        // This needs to be hidden carefully; simply setting display:none can cause failures in some browsers.
        // Position it far off-screen to hide it visually without affecting layout calculations.
        apply( frame.style, {
            position: "absolute",
            top: "-2000px", // Move it high up
            left: "0px" // Avoid potential horizontal scrollbar
        } );
        config.container = document.body; // Default to body
    }

    // HACK: IE cannot have the src attribute set when the frame is appended
    //       into the container, so we set it to "javascript:false" as a
    //       placeholder for now. If we left the src undefined, it would
    //       instead default to "about:blank", which causes SSL mixed-content
    //       warnings in IE6 when on an SSL parent page.
    var src = config.props.src; // Store the actual src
    config.props.src = "javascript:false"; // Set placeholder src for IE

    // Transfer all other specified properties to the frame element
    apply( frame, config.props );

    // Set common iframe attributes for styling and transparency
    frame.border = frame.frameBorder = 0;
    frame.allowTransparency = true;

    // Finally, append the frame to its container
    config.container.appendChild( frame );

    // The actual src will be set later by the communication mechanism to avoid IE quirks.
}

} )( window, document, location, setTimeout, decodeURIComponent, encodeURIComponent );