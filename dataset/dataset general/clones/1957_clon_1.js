/*
 * jQuery JavaScript Library v1.10.2
 *
 * Project Homepage: http://jquery.com/
 *
 * This release also includes Sizzle.js
 * Sizzle Homepage: http://sizzlejs.com/
 *
 * Copyright (c) 2005, 2013 jQuery Foundation, Inc. and its contributors.
 * Licensed under the MIT license: http://jquery.org/license
 *
 * Build Date: 2013-07-03T13:48Z
 */


( function ( window, undefined ) {

  // Note: "use strict" is avoided here.
  // This is because some applications, including ASP.NET,
  // rely on tracing the call stack via 'arguments.caller.callee'.
  // Firefox, in particular, encounters issues when attempting
  // to trace through "use strict" call chains. (Refer to issue #13335).
  // This applies to Firefox versions 18 and later.
  // "use strict";


  var
    // Holds the deferred object used for DOM ready events
    readyList,


    // A primary reference to the root jQuery(document) object
    rootjQuery,

    // This variable helps with browser compatibility, specifically IE<10.
    // It's used for checks like `typeof xmlNode.method`
    // instead of `xmlNode.method !== undefined`.
    core_strundefined = typeof undefined,

    // Establish references to global objects, considering a sandbox environment
    location = window.location,
    document = window.document,
    docElem = document.documentElement,

    // Store a reference to the original 'jQuery' object,
    // in case it's overwritten by another script.
    _jQuery = window.jQuery,

    // Store a reference to the original '$' object,
    // in case it's overwritten by another script.
    _$ = window.$,

    // A map to store [[Class]] to type string pairs for type detection.
    class2type = {},

    // An array to hold IDs of deleted data cache entries, allowing for reuse.
    core_deletedIds = [],

    // The current version string of the jQuery library.
    core_version = "1.10.2",

    // Cache commonly used core methods for performance and convenience.
    core_concat = core_deletedIds.concat,
    core_push = core_deletedIds.push,
    core_slice = core_deletedIds.slice,
    core_indexOf = core_deletedIds.indexOf,
    core_toString = class2type.toString,
    core_hasOwn = class2type.hasOwnProperty,
    core_trim = core_version.trim,

    // This is the main jQuery constructor function.
    // It creates a new jQuery object.
    jQuery = function ( selector, context ) {
      // The jQuery object is essentially an 'enhanced' instance
      // of the 'init' constructor.
      return new jQuery.fn.init( selector, context, rootjQuery );
    },

    // Regular expression for matching various forms of numbers.
    core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

    // Regular expression for splitting strings based on whitespace characters.
    core_rnotwhite = /\S+/g,

    // Regular expression to trim leading and trailing whitespace,
    // including BOM (Byte Order Mark) and NBSP (Non-breaking space).
    // This addresses issues in browsers like Safari 5.0 and Internet Explorer.
    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

    // Regex to quickly identify HTML strings or #id selectors.
    // Prioritizes #id to prevent XSS vulnerabilities via location.hash (#9521).
    // Strict HTML recognition requires starting with '<' (#11290).
    rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

    // Regex to match a simple, standalone HTML tag (e.g., `<div>` or `<br/>`).
    rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

    // JSON parsing regular expressions:
    // Matches valid JSON characters.
    rvalidchars = /^[\],:{}\s]*$/,
    // Matches array structures within JSON.
    rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
    // Matches escaped characters in JSON strings.
    rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
    // Matches valid JSON tokens (strings, numbers, booleans, null).
    rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

    // Regex for matching the "-ms-" vendor prefix.
    rmsPrefix = /^-ms-/,
    // Regex for matching hyphens followed by a letter, used for camelCasing.
    rdashAlpha = /-([\da-z])/gi,

    // Callback function used by jQuery.camelCase to convert a letter to uppercase.
    fcamelCase = function ( all, letter ) {
      return letter.toUpperCase();
    },

    // The event handler function for the DOM ready event.
    completed = function ( event ) {

      // If `document.addEventListener` is available, or if the event type is 'load',
      // or if `document.readyState` is 'complete' (sufficient for older IE versions),
      // then the DOM is considered ready.
      if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
        detach();
        jQuery.ready();
      }
    },
    // Cleanup method to remove DOM ready event listeners.
    detach = function () {
      if ( document.addEventListener ) {
        document.removeEventListener( "DOMContentLoaded", completed, false );
        window.removeEventListener( "load", completed, false );

      } else {
        document.detachEvent( "onreadystatechange", completed );
        window.detachEvent( "onload", completed );
      }
    };


jQuery.fn = jQuery.prototype = {
  // The current version string of the jQuery library instance.
  jquery: core_version,

  // Reference to the constructor function.
  constructor: jQuery,

  // The core initialization function for creating jQuery objects.
  init: function ( selector, context, rootjQuery ) {
    var match, elem;

    // Handle various "empty" selectors: $(""), $(null), $(undefined), $(false)
    if ( !selector ) {
      return this;
    }

    // Process HTML strings as selectors.
    if ( typeof selector === "string" ) {
      // If the string looks like an HTML tag (starts with '<', ends with '>', at least 3 chars),
      // assume it's HTML and bypass the regex check for efficiency.
      if ( selector.charAt( 0 ) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
        match = [ null, selector, null ];

      } else {
        // Otherwise, use the quick expression regex to parse the selector.
        match = rquickExpr.exec( selector );
      }

      // If a match is found, and it's HTML (match[1]) or no context is specified for an ID selector.
      if ( match && ( match[1] || !context ) ) {

        // HANDLE: $(html) -> Create elements from an HTML string.
        if ( match[1] ) {
          // Determine the context for HTML parsing.
          context = context instanceof jQuery ? context[0] : context;

          // Merge the newly parsed HTML elements into the current jQuery object.
          // The 'true' flag ensures scripts are executed for back-compatibility.
          jQuery.merge( this, jQuery.parseHTML(
            match[1],
            context && context.nodeType ? context.ownerDocument || context : document,
            true
          ) );

          // HANDLE: $(html, props) -> Create HTML and set properties.
          if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
            for ( match in context ) {
              // If a property in 'context' corresponds to a jQuery method, call it.
              if ( jQuery.isFunction( this[match] ) ) {
                this[match]( context[match] );

                // Otherwise, set the property as an attribute.
              } else {
                this.attr( match, context[match] );
              }
            }
          }

          return this;

          // HANDLE: $(#id) -> Select an element by its ID.
        } else {
          elem = document.getElementById( match[2] );

          // Check parentNode to handle cases where Blackberry 4.6
          // might return nodes no longer in the document (#6963).
          if ( elem && elem.parentNode ) {
            // Address IE/Opera returning items by name instead of ID.
            if ( elem.id !== match[2] ) {
              return rootjQuery.find( selector );
            }

            // If a valid element is found, inject it directly into the jQuery object.
            this.length = 1;
            this[0] = elem;
          }

          this.context = document;
          this.selector = selector;
          return this;
        }

        // HANDLE: $(expr, $(...)) -> Find elements within another jQuery object.
      } else if ( !context || context.jquery ) {
        return ( context || rootjQuery ).find( selector );

        // HANDLE: $(expr, context) -> Find elements within a specific context.
        // This is equivalent to: $(context).find(expr)
      } else {
        return this.constructor( context ).find( selector );
      }

      // HANDLE: $(DOMElement) -> Wrap a native DOM element in a jQuery object.
    } else if ( selector.nodeType ) {
      this.context = this[0] = selector;
      this.length = 1;
      return this;

      // HANDLE: $(function) -> Shortcut for document ready event.
    } else if ( jQuery.isFunction( selector ) ) {
      return rootjQuery.ready( selector );
    }

    // If the selector already has a 'selector' property (e.g., another jQuery object),
    // copy its selector and context.
    if ( selector.selector !== undefined ) {
      this.selector = selector.selector;
      this.context = selector.context;
    }

    // Convert the selector into an array of elements and merge them into 'this'.
    return jQuery.makeArray( selector, this );
  },

  // The selector string used to create this jQuery object.
  selector: "",

  // The number of elements in the jQuery object.
  length: 0,

  // Convert the jQuery object into a plain JavaScript array.
  toArray: function () {
    return core_slice.call( this );
  },

  // Get the Nth element from the matched set, or the entire set as a clean array.
  get: function ( num ) {
    return num == null ?

      // If 'num' is null or undefined, return the entire set as an array.
      this.toArray() :

      // Otherwise, return the element at the specified index.
      ( num < 0 ? this[ this.length + num ] : this[ num ] );
  },

  // Push a new set of elements onto the stack,
  // creating a new jQuery object with the previous one as 'prevObject'.
  pushStack: function ( elems ) {

    // Create a new jQuery object and merge the provided elements into it.
    var ret = jQuery.merge( this.constructor(), elems );

    // Store a reference to the previous jQuery object on the stack.
    ret.prevObject = this;
    ret.context = this.context;

    // Return the new jQuery object.
    return ret;
  },

  // Iterate over each element in the matched set and execute a callback.
  // Optional 'args' can be passed to the callback (primarily for internal use).
  each: function ( callback, args ) {
    return jQuery.each( this, callback, args );
  },

  // Register a function to be executed when the DOM is ready.
  ready: function ( fn ) {
    // Add the callback function to the list of ready handlers.
    jQuery.ready.promise().done( fn );

    return this;
  },

  // Create a new jQuery object containing a slice of the elements.
  slice: function () {
    return this.pushStack( core_slice.apply( this, arguments ) );
  },

  // Get the first element in the matched set.
  first: function () {
    return this.eq( 0 );
  },

  // Get the last element in the matched set.
  last: function () {
    return this.eq( -1 );
  },

  // Get the element at a specific index in the matched set.
  eq: function ( i ) {
    var len = this.length,
      j = +i + ( i < 0 ? len : 0 ); // Calculate the effective index.
    // Return a new jQuery object containing the element at 'j', or an empty array if invalid.
    return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
  },

  // Map each element in the matched set to a new value using a callback function.
  map: function ( callback ) {
    return this.pushStack( jQuery.map( this, function ( elem, i ) {
      return callback.call( elem, i, elem );
    } ) );
  },

  // End the current chain of operations and revert to the previous jQuery object on the stack.
  end: function () {
    // If there's a previous object, return it; otherwise, return an empty jQuery object.
    return this.prevObject || this.constructor( null );
  },

  // Internal method: behaves like an Array's push, not a jQuery method.
  push: core_push,
  // Internal method: uses Array.prototype.sort.
  sort: [].sort,
  // Internal method: uses Array.prototype.splice.
  splice: [].splice
};


// Ensure that the 'init' function's prototype points to jQuery.fn,
// allowing instances created with 'new jQuery.fn.init()' to inherit jQuery methods.
jQuery.fn.init.prototype = jQuery.fn;


jQuery.extend = jQuery.fn.extend = function () {
  var src, copyIsArray, copy, name, options, clone,
    target = arguments[0] || {}, // The object to extend, or an empty object.
    i = 1,
    length = arguments.length,
    deep = false; // Flag for deep cloning.

  // Handle a deep copy scenario.
  if ( typeof target === "boolean" ) {
    deep = target; // Set deep flag.
    target = arguments[1] || {}; // Target becomes the next argument or an empty object.
    // Skip the boolean argument and the new target.
    i = 2;
  }

  // Handle cases where the target is not an object or a function (e.g., a string),
  // which might happen in a deep copy scenario. Ensure it's an object.
  if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
    target = {};
  }

  // If only one argument is passed (or the target is 'this' after deep handling),
  // extend jQuery itself.
  if ( length === i ) {
    target = this;
    --i;
  }

  // Iterate through all source objects.
  for ( ; i < length; i++ ) {
    // Only process non-null/undefined source objects.
    if ( ( options = arguments[i] ) != null ) {
      // Extend the target object with properties from the current source 'options'.
      for ( name in options ) {
        src = target[name];
        copy = options[name];

        // Prevent infinite loops if 'target' and 'copy' refer to the same object.
        if ( target === copy ) {
          continue;
        }

        // If 'deep' cloning is enabled and 'copy' is a plain object or an array.
        if ( deep && copy && ( jQuery.isPlainObject( copy ) || ( copyIsArray = jQuery.isArray( copy ) ) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            // If 'src' is an array, use it; otherwise, create an empty array.
            clone = src && jQuery.isArray( src ) ? src : [];

          } else {
            // If 'src' is a plain object, use it; otherwise, create an empty object.
            clone = src && jQuery.isPlainObject( src ) ? src : {};
          }

          // Recursively extend the nested object/array.
          // Important: never move original objects, always clone them.
          target[name] = jQuery.extend( deep, clone, copy );

          // If 'copy' is not undefined, directly assign it to 'target[name]'.
        } else if ( copy !== undefined ) {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified (extended) target object.
  return target;
};


jQuery.extend( {
  // A unique identifier for each jQuery instance on the page.
  // Non-digit characters are removed from a combined version and random number
  // to match the 'rinlinejQuery' pattern.
  expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

  // Reverts the global '$' and 'jQuery' variables to their previous values.
  noConflict: function ( deep ) {
    if ( window.$ === jQuery ) {
      window.$ = _$; // Restore the previous '$' variable.
    }

    if ( deep && window.jQuery === jQuery ) {
      window.jQuery = _jQuery; // Restore the previous 'jQuery' variable.
    }

    return jQuery; // Return the jQuery object itself.
  },

  // Flag indicating whether the DOM is ready to be used. Initially false.
  isReady: false,

  // A counter to track how many items need to be waited for
  // before the 'ready' event can fire (e.g., deferred scripts).
  // See issue #6781.
  readyWait: 1,

  // Manages the 'ready' event's state by holding or releasing it.
  holdReady: function ( hold ) {
    if ( hold ) {
      jQuery.readyWait++; // Increment the wait counter to hold the ready event.
    } else {
      jQuery.ready( true ); // Release the ready event by decrementing and potentially firing it.
    }
  },

  // Handles the logic for when the DOM is ready.
  ready: function ( wait ) {

    // Abort if there are still pending holds, or if the DOM is already ready.
    if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
      return;
    }

    // Ensure the document body exists. This is a safeguard against
    // IE being overly zealous in firing ready events before the body is available.
    // (Refer to ticket #5443).
    if ( !document.body ) {
      return setTimeout( jQuery.ready ); // Retry after a short delay.
    }

    // Mark the DOM as ready.
    jQuery.isReady = true;

    // If this was not a forced 'true' release, and there are still items to wait for,
    // then defer the actual 'ready' event firing.
    if ( wait !== true && --jQuery.readyWait > 0 ) {
      return;
    }

    // Resolve the 'readyList' deferred, executing any bound callbacks.
    readyList.resolveWith( document, [ jQuery ] );

    // If jQuery.fn.trigger is available, trigger the "ready" event
    // on the document and then unbind it.
    if ( jQuery.fn.trigger ) {
      jQuery( document ).trigger( "ready" ).off( "ready" );
    }
  },

  // Determines if an object is a function.
  // Note: Since jQuery 1.3, DOM methods and built-in functions (like alert)
  // are not considered functions in this context on IE (#2968).
  // See 'test/unit/core.js' for more details.
  isFunction: function ( obj ) {
    return jQuery.type( obj ) === "function";
  },

  // Determines if an object is an array.
  isArray: Array.isArray || function ( obj ) {
    return jQuery.type( obj ) === "array";
  },

  // Determines if an object is a window object.
  // 'obj == obj.window' handles cross-iframe window checks.
  isWindow: function ( obj ) {
    /* jshint eqeqeq: false */
    return obj != null && obj == obj.window;
  },

  // Determines if an object is a numeric value.
  isNumeric: function ( obj ) {
    return !isNaN( parseFloat( obj ) ) && isFinite( obj );
  },

  // Determines the internal [[Class]] of an object.
  type: function ( obj ) {
    if ( obj == null ) {
      return String( obj ); // Handle null and undefined.
    }
    // Return the type string, falling back to "object" if not found in class2type map.
    return typeof obj === "object" || typeof obj === "function" ?
      class2type[ core_toString.call( obj ) ] || "object" :
      typeof obj;
  },

  // Determines if an object is a plain JavaScript object.
  isPlainObject: function ( obj ) {
    var key;

    // Must be an Object.
    // Additionally, check for the presence of the constructor property (for IE).
    // Ensure that DOM nodes and window objects do not pass this check.
    if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
      return false;
    }

    try {
      // The object's constructor property must not be its own,
      // and its constructor's prototype must have 'isPrototypeOf'.
      // This helps exclude host objects or objects without a standard constructor.
      if ( obj.constructor &&
        !core_hasOwn.call( obj, "constructor" ) &&
        !core_hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
        return false;
      }
    } catch ( e ) {
      // IE8 and IE9 may throw exceptions on certain host objects (#9897).
      return false;
    }

    // Support for IE<9:
    // If 'jQuery.support.ownLast' is true, handle iteration over
    // inherited properties before own properties.
    if ( jQuery.support.ownLast ) {
      for ( key in obj ) {
        return core_hasOwn.call( obj, key ); // If any own property exists, it's plain.
      }
    }