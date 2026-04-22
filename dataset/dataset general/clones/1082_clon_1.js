/*
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Nov 21 2011 11:34:02 GMT-0500 (Eastern Standard Time)
 */
( function( window, undefined )

{

// Obtain references to core browser objects from the global window object.
var document = window.document,
    navigator = window.navigator,
    location = window.location;

var jQuery = ( function() {

    // Define a local copy of jQuery to prevent conflicts.
    var jQuery = function( selector, context ) {
        // The jQuery object is actually just the init constructor 'enhanced'.
        // This is the main entry point for creating jQuery objects.
        return new jQuery.fn.init( selector, context, rootjQuery );
    },

    // Store the original `window.jQuery` in case of overwrites by other libraries.
    _jQuery = window.jQuery,

    // Store the original `window.$` for similar reasons.
    _$ = window.$,

    // A central reference to the root jQuery(document) object.
    rootjQuery,

    // Regular expression to quickly identify HTML strings or ID selectors.
    // It prioritizes #id over <tag> to mitigate potential XSS vulnerabilities
    // stemming from `location.hash` (see ticket #9521).
    quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

    // Regular expression to check if a string contains any non-whitespace characters.
    rnotwhite = /\S/,

    // Regular expressions for trimming whitespace from the beginning and end of strings.
    trimLeft = /^\s+/,
    trimRight = /\s+$/,

    // Regular expression to match a standalone HTML tag (e.g., `<div>` or `<br/>`).
    rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

    // JSON related regular expressions used for parsing.
    rvalidchars = /^[\],:{}\s]*$/,
    rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
    rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

    // User-agent regular expressions for browser detection.
    rwebkit = /(webkit)[ \/]([\w.]+)/,
    ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
    rmsie = /(msie) ([\w.]+)/,
    rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

    // Regular expression to match dashed strings for camelization (e.g., `font-size` to `fontSize`).
    rdashAlpha = /-([a-z]|[0-9])/ig,
    rmsPrefix = /^-ms-/,

    // Callback function used by `jQuery.camelCase` for string replacement.
    fcamelCase = function( all, letter ) {
        return ( letter + "" ).toUpperCase();
    },

    // Store the user-agent string for browser sniffing purposes.
    userAgent = navigator.userAgent,

    // Object to hold browser match information.
    browserMatch,

    // The deferred object used to manage DOM ready callbacks.
    readyList,

    // The internal handler for `DOMContentLoaded` event.
    DOMContentLoaded,

    // Cache references to frequently used `Object.prototype` and `Array.prototype` methods.
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,
    push = Array.prototype.push,
    slice = Array.prototype.slice,
    trim = String.prototype.trim,
    indexOf = Array.prototype.indexOf,

    // A mapping of `[[Class]]` internal property values to their corresponding types.
    class2type = {};

// Extend jQuery's prototype (`jQuery.fn`) to add instance methods.
jQuery.fn = jQuery.prototype = {
    // The constructor property points back to jQuery.
    constructor: jQuery,

    // The core initializer for jQuery objects.
    init: function( selector, context, rootjQuery ) {
        var match, elem, ret, doc;

        // Handle cases where no selector is provided (e.g., `$(null)`, `$(undefined)`).
        if ( !selector ) {
            return this;
        }

        // Handle `$(DOMElement)`: wrap a single DOM element.
        if ( selector.nodeType ) {
            this.context = this[0] = selector;
            this.length = 1;
            return this;
        }

        // Optimize for `$("body")` since the body element is unique.
        if ( selector === "body" && !context && document.body ) {
            this.context = document;
            this[0] = document.body;
            this.selector = selector;
            this.length = 1;
            return this;
        }

        // Handle HTML strings or ID selectors.
        if ( typeof selector === "string" ) {
            // Check if the string looks like an HTML fragment or an ID.
            if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
                // If it starts and ends with angle brackets, assume HTML and bypass the regex check.
                match = [ null, selector, null ];

            } else {
                // Otherwise, use the quick expression regex to parse.
                match = quickExpr.exec( selector );
            }

            // If a match was found and either it's an HTML fragment or no context was specified for an ID.
            if ( match && (match[1] || !context) ) {

                // HANDLE: $(html) -> Create elements from an HTML string.
                if ( match[1] ) {
                    // Normalize context to a DOM element or document.
                    context = context instanceof jQuery ? context[0] : context;
                    doc = ( context ? context.ownerDocument || context : document );

                    // If it's a single tag (e.g., `<div>`), create it directly for efficiency.
                    ret = rsingleTag.exec( selector );

                    if ( ret ) {
                        // If context is a plain object, treat it as attributes to set.
                        if ( jQuery.isPlainObject( context ) ) {
                            selector = [ document.createElement( ret[1] ) ];
                            jQuery.fn.attr.call( selector, context, true );

                        } else {
                            selector = [ doc.createElement( ret[1] ) ];
                        }

                    } else {
                        // For more complex HTML, build a document fragment.
                        ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
                        selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
                    }

                    return jQuery.merge( this, selector );

                // HANDLE: $("#id") -> Find element by ID.
                } else {
                    elem = document.getElementById( match[2] );

                    // Ensure the element is actually in the document (Blackberry 4.6 bug fix #6963).
                    if ( elem && elem.parentNode ) {
                        // Handle IE/Opera returning elements by name instead of ID.
                        if ( elem.id !== match[2] ) {
                            return rootjQuery.find( selector );
                        }

                        // Inject the found element directly into the jQuery object.
                        this.length = 1;
                        this[0] = elem;
                    }

                    this.context = document;
                    this.selector = selector;
                    return this;
                }

            // HANDLE: $(expr, $(...)) -> Search within a jQuery object's elements.
            } else if ( !context || context.jquery ) {
                return ( context || rootjQuery ).find( selector );

            // HANDLE: $(expr, context) -> Search within a specific context element.
            // This is equivalent to: $(context).find(expr).
            } else {
                return this.constructor( context ).find( selector );
            }

        // HANDLE: $(function) -> Shortcut for `$(document).ready()`.
        } else if ( jQuery.isFunction( selector ) ) {
            return rootjQuery.ready( selector );
        }

        // If the selector itself is a jQuery object, copy its selector and context.
        if ( selector.selector !== undefined ) {
            this.selector = selector.selector;
            this.context = selector.context;
        }

        // Finally, convert the selector (which might be an array-like object) into a proper jQuery object.
        return jQuery.makeArray( selector, this );
    },

    // The selector string used to create this jQuery object.
    selector: "",

    // The current version of jQuery being used.
    jquery: "1.7.1",

    // The default length of a jQuery object (0 elements).
    length: 0,

    // Returns the number of elements in the matched set.
    size: function() {
        return this.length;
    },

    // Converts the jQuery object to a native JavaScript array.
    toArray: function() {
        return slice.call( this, 0 );
    },

    // Get the Nth element in the matched set, or the entire set as a clean array.
    get: function( num ) {
        return num == null ?

            // If `num` is null or undefined, return the entire set as an array.
            this.toArray() :

            // Otherwise, return the element at the specified index.
            // Supports negative indices for counting from the end.
            ( num < 0 ? this[ this.length + num ] : this[ num ] );
    },

    // Pushes elements onto the jQuery stack, returning a new jQuery object.
    pushStack: function( elems, name, selector ) {
        // Create a new jQuery object for the stack.
        var ret = this.constructor();

        if ( jQuery.isArray( elems ) ) {
            push.apply( ret, elems );

        } else {
            jQuery.merge( ret, elems );
        }

        // Store a reference to the previous jQuery object on the stack.
        ret.prevObject = this;

        ret.context = this.context;

        // Construct the selector string for the new object.
        if ( name === "find" ) {
            ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
        } else if ( name ) {
            ret.selector = this.selector + "." + name + "(" + selector + ")";
        }

        // Return the newly formed element set.
        return ret;
    },

    // Iterates over each element in the matched set, executing a callback function.
    // `args` is an optional array of arguments to pass to the callback.
    each: function( callback, args ) {
        return jQuery.each( this, callback, args );
    },

    // Registers a function to be executed when the DOM is ready.
    ready: function( fn ) {
        // Ensure the DOM ready listeners are bound.
        jQuery.bindReady();

        // Add the provided function to the list of ready callbacks.
        readyList.add( fn );

        return this;
    },

    // Reduces the set of matched elements to the one at the specified index.
    eq: function( i ) {
        i = +i; // Ensure `i` is a number.
        return i === -1 ?
            this.slice( i ) : // Handle -1 for the last element.
            this.slice( i, i + 1 ); // Get a slice containing only the specified element.
    },

    // Returns the first element in the matched set.
    first: function() {
        return this.eq( 0 );
    },

    // Returns the last element in the matched set.
    last: function() {
        return this.eq( -1 );
    },

    // Creates a new jQuery object containing a subset of the elements.
    slice: function() {
        return this.pushStack( slice.apply( this, arguments ),
            "slice", slice.call(arguments).join(",") );
    },

    // Passes each element in the current matched set through a function,
    // producing a new jQuery object containing the return values.
    map: function( callback ) {
        return this.pushStack( jQuery.map(this, function( elem, i ) {
            return callback.call( elem, i, elem );
        }));
    },

    // Ends the most recent filtering operation in the current chain,
    // returning the set of elements before the filter was applied.
    end: function() {
        return this.prevObject || this.constructor(null);
    },

    // These methods are included for internal use and compatibility,
    // behaving like Array methods rather than jQuery methods.
    push: push,
    sort: [].sort,
    splice: [].splice
};

// Make the `init` function's prototype the same as `jQuery.fn`
// so that `new jQuery.fn.init()` instances inherit jQuery methods.
jQuery.fn.init.prototype = jQuery.fn;

// Extend jQuery itself and its prototype (`jQuery.fn`) with new properties and methods.
jQuery.extend = jQuery.fn.extend = function() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation if the first argument is a boolean.
    if ( typeof target === "boolean" ) {
        deep = target;
        target = arguments[1] || {};
        // Skip the boolean argument and the new target object.
        i = 2;
    }

    // Handle cases where the target might be a string or other primitive (possible in deep copy).
    if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
        target = {};
    }

    // If only one argument is passed, extend jQuery itself (or `jQuery.fn`).
    if ( length === i ) {
        target = this;
        --i;
    }

    // Iterate through all source objects.
    for ( ; i < length; i++ ) {
        // Only process non-null/undefined values.
        if ( (options = arguments[ i ]) != null ) {
            // Extend the base object with properties from the current source.
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];

                // Prevent infinite loops if target is the same as copy.
                if ( target === copy ) {
                    continue;
                }

                // Recurse if we're doing a deep merge and the copy is a plain object or an array.
                if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                    if ( copyIsArray ) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : [];

                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, always clone them to avoid shared references.
                    target[ name ] = jQuery.extend( deep, clone, copy );

                // Don't copy undefined values; they should not overwrite existing properties.
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified target object.
    return target;
};

// Extend the jQuery object with static utility methods.
jQuery.extend({
    // Restores `window.$` and `window.jQuery` to their previous values.
    noConflict: function( deep ) {
        if ( window.$ === jQuery ) {
            window.$ = _$;
        }

        if ( deep && window.jQuery === jQuery ) {
            window.jQuery = _jQuery;
        }

        return jQuery; // Return the jQuery object itself.
    },

    // Flag indicating whether the DOM is ready.
    isReady: false,

    // Counter to track how many items are pending before the ready event fires.
    // Used for `jQuery.holdReady()`.
    readyWait: 1,

    // Manages the state of the DOM ready event.
    holdReady: function( hold ) {
        if ( hold ) {
            jQuery.readyWait++; // Increment the counter, delaying ready.
        } else {
            jQuery.ready( true ); // Trigger ready if counter becomes zero.
        }
    },

    // Handles the DOM ready event.
    ready: function( wait ) {
        // Condition for triggering ready:
        // 1. A released hold (`wait === true` and `readyWait` decremented to 0)
        // OR
        // 2. A normal DOMReady/load event and jQuery is not yet ready.
        if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
            // If `document.body` is not yet available, defer execution (IE bug #5443).
            if ( !document.body ) {
                return setTimeout( jQuery.ready, 1 );
            }

            // Mark jQuery as ready.
            jQuery.isReady = true;

            // If a normal DOM Ready event occurred, decrement `readyWait`.
            // If it's still greater than 0, wait for other holds to release.
            if ( wait !== true && --jQuery.readyWait > 0 ) {
                return;
            }

            // Execute all registered ready callbacks.
            readyList.fireWith( document, [ jQuery ] );

            // Trigger any bound ready events on the document.
            if ( jQuery.fn.trigger ) {
                jQuery( document ).trigger( "ready" ).off( "ready" );
            }
        }
    },

    // Binds the necessary event listeners for DOM ready.
    bindReady: function() {
        // If `readyList` already exists, listeners are already bound.
        if ( readyList ) {
            return;
        }

        // Initialize the Callbacks object for ready events.
        readyList = jQuery.Callbacks( "once memory" );

        // Check if the document is already complete (e.g., script loaded after DOM ready).
        if ( document.readyState === "complete" ) {
            // Handle asynchronously to allow scripts to delay ready.
            return setTimeout( jQuery.ready, 1 );
        }

        // Modern browsers (Mozilla, Opera, Webkit) support `DOMContentLoaded`.
        if ( document.addEventListener ) {
            document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            // A fallback to `window.onload` which always works.
            window.addEventListener( "load", jQuery.ready, false );

        // Fallback for Internet Explorer's event model.
        } else if ( document.attachEvent ) {
            document.attachEvent( "onreadystatechange", DOMContentLoaded );
            // A fallback to `window.onload` for IE.
            window.attachEvent( "onload", jQuery.ready );

            // If in IE and not within an iframe, continually check document readiness.
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch(e) {} // Suppress errors if `window.frameElement` is inaccessible.

            if ( document.documentElement.doScroll && toplevel ) {
                doScrollCheck(); // Initiate the doScroll check.
            }
        }
    },

    // Determines if an object is a function.
    // Note: DOM methods and functions like `alert` return false in IE prior to 1.3 (#2968).
    isFunction: function( obj ) {
        return jQuery.type(obj) === "function";
    },

    // Determines if an object is an array.
    // Uses native `Array.isArray` if available, otherwise falls back to `jQuery.type`.
    isArray: Array.isArray || function( obj ) {
        return jQuery.type(obj) === "array";
    },

    // A simple check to determine if an object is a window object.
    isWindow: function( obj ) {
        return obj && typeof obj === "object" && "setInterval" in obj;
    },

    // Determines if a value is numeric.
    isNumeric: function( obj ) {
        return !isNaN( parseFloat(obj) ) && isFinite( obj );
    },

    // Returns the internal `[[Class]]` property of an object, or a normalized string for primitives.
    type: function( obj ) {
        return obj == null ?
            String( obj ) : // Handle null and undefined.
            class2type[ toString.call(obj) ] || "object"; // Use map for objects, default to "object".
    }