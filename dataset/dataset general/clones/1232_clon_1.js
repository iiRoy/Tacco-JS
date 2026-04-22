/*
 *******************************************************************************************************************
 * jQuery JavaScript Library v1.7.1                                                                                *
 * - A powerful and feature-rich JavaScript library.                                                               *
 * http://jquery.com/                                                                                              *
 *                                                                                                                 *
 * Copyright 2011, John Resig. All rights reserved.                                                                *
 * Dual licensed under the MIT or GPL Version 2 licenses. See below for details.                                   *
 * http://jquery.org/license                                                                                       *
 *                                                                                                                 *
 * This version includes Sizzle.js, a fast and robust CSS selector engine.                                         *
 * http://sizzlejs.com/                                                                                            *
 * Copyright 2011, The Dojo Foundation. Released under the MIT, BSD, and GPL Licenses.                             *
 *                                                                                                                 *
 * Date: Mon Nov 21 21:11:03 2011 -0500                                                                            *
 *******************************************************************************************************************/

( function( window, undefined ) { /* This is an immediately invoked function expression (IIFE) to
                                    create a private scope for jQuery, preventing global namespace pollution.
                                    'window' is passed explicitly for performance and minification.
                                    'undefined' is passed to ensure its true undefined value, as it can be
                                    overwritten in older browsers. */

  // Establish local references to global objects for scope and performance optimization.
  var document = window.document,  // Reference to the current document object.
      navigator = window.navigator, // Reference to the navigator object (user agent info).
      location = window.location;   // Reference to the location object (current URL).


  // The core jQuery object factory.
  var jQuery = ( function() {

    // Define a local copy of jQuery, which will be the main constructor.
    var jQuery = function( selector, context ) {
      // The jQuery object is actually just the `init` constructor 'enhanced'.
      // This pattern allows `jQuery()` to return a new `jQuery.fn.init` instance
      // without requiring the `new` keyword from the user.
      return new jQuery.fn.init( selector, context, rootjQuery );
    },

    // Map over jQuery in case another library has already defined it on the window object.
    // This allows `jQuery.noConflict()` to restore the previous `jQuery` global.
    _jQuery = window.jQuery,

    // Map over the '$' alias in case of overwrite by another library.
    // This allows `jQuery.noConflict()` to restore the previous `$` global.
    _$ = window.$,

    // A central reference to the root jQuery(document) object.
    // This is often used as the default context for selectors.
    rootjQuery,

    // A simple regular expression to quickly check for HTML strings or ID strings.
    // It prioritizes #id over <tag> to avoid potential XSS vulnerabilities via location.hash (#9521).
    quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

    // Regular expression to check if a string contains any non-whitespace characters.
    rnotwhite = /\S/,

    // Regular expressions used for trimming whitespace from the beginning and end of strings.
    trimLeft = /^\s+/,   // Matches leading whitespace.
    trimRight = /\s+$/,  // Matches trailing whitespace.

    // Regular expression to match a standalone HTML tag (e.g., "<div>", "<br/>", "<input>").
    rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

    // JSON-related regular expressions for parsing and validation.
    rvalidchars = /^[\],:{}\s]*$/,                               // Checks for valid JSON characters.
    rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,         // Matches escaped characters in JSON strings.
    rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, // Matches JSON primitives.
    rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,                       // Matches array opening braces in JSON.

    // User-agent regular expressions for browser detection.
    rwebkit = /(webkit)[ \/]([\w.]+)/,        // Detects WebKit browsers (Chrome, Safari).
    ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/, // Detects Opera browsers.
    rmsie = /(msie) ([\w.]+)/,                // Detects Internet Explorer.
    rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/, // Detects Mozilla-based browsers (Firefox).

    // Regular expressions for camel-casing dashed strings (e.g., "font-size" to "fontSize").
    rdashAlpha = /-([a-z]|[0-9])/ig, // Matches a dash followed by a letter or digit.
    rmsPrefix = /^-ms-/,             // Matches the "-ms-" prefix for Microsoft-specific CSS properties.

    // Callback function used by `jQuery.camelCase` to convert matched characters to uppercase.
    fcamelCase = function( all, letter ) {
      return ( letter + "" ).toUpperCase();
    },

    // Stores the user agent string for browser detection (used by `jQuery.browser`).
    userAgent = navigator.userAgent,

    // Variable to store the result of browser matching (e.g., { webkit: true, version: "534.30" }).
    browserMatch,

    // The deferred object used for managing DOM ready callbacks.
    readyList,

    // The event handler for `DOMContentLoaded`.
    DOMContentLoaded,

    // Save references to commonly used core JavaScript methods for performance and minification.
    toString = Object.prototype.toString, // Used for `jQuery.type`.
    hasOwn = Object.prototype.hasOwnProperty, // Used for checking own properties.
    push = Array.prototype.push,         // Used for adding elements to arrays.
    slice = Array.prototype.slice,       // Used for creating array-like objects from arguments/collections.
    trim = String.prototype.trim,        // Used for trimming whitespace from strings.
    indexOf = Array.prototype.indexOf,   // Used for finding the index of an element in an array.

    // Map of [[Class]] internal property values to their corresponding type names.
    // Used by `jQuery.type` to determine the exact type of an object.
    class2type = {};

    // Assign the jQuery prototype to `jQuery.fn` for convenience and extensibility.
    // This is where all jQuery methods are added.
    jQuery.fn = jQuery.prototype = {

      // The constructor property points back to the jQuery function.
      constructor: jQuery,

      // The `init` function is the actual constructor used when `jQuery()` is called.
      // It handles various selector types and contexts.
      init: function( selector, context, rootjQuery ) {
        var match, elem, ret, doc; // Declare local variables used within this function.

        // Handle situations where no selector, null, or undefined is passed.
        if ( !selector ) {
          return this; // Return an empty jQuery object.
        }

        // Handle $(DOMElement) - if a DOM element is passed directly.
        if ( selector.nodeType ) {
          this.context = this[0] = selector; // Set the element as the first item and context.
          this.length = 1;                   // The object contains one element.
          return this;                       // Return the jQuery object with the element.
        }

        // Optimized handling for $("body") - the body element is unique.
        if ( selector === "body" && !context && document.body ) {
          this.context = document;       // Context is the document.
          this[0] = document.body;       // The body element itself.
          this.selector = selector;      // Store the selector string.
          this.length = 1;               // One element.
          return this;                   // Return the jQuery object.
        }

        // Handle HTML strings or CSS selectors.
        if ( typeof selector === "string" ) {
          // Determine if we are dealing with an HTML string or an ID selector.
          if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
            // Assume strings starting and ending with <> are HTML and skip the regex check for speed.
            match = [ null, selector, null ];

          } else {
            // Use `quickExpr` to parse the selector for HTML or an ID.
            match = quickExpr.exec( selector );
          }

          // Verify if a match was found and that no context was specified for an ID selector.
          if ( match && (match[1] || !context) ) {

            // HANDLE: $(html) -> Create elements from an HTML string.
            if ( match[1] ) {
              // Ensure context is a DOM element or document, not a jQuery object.
              context = context instanceof jQuery ? context[0] : context;
              // Determine the document context for element creation.
              doc = ( context ? context.ownerDocument || context : document );

              // If a single string is passed and it's a single tag (e.g., "<div>").
              // This is an optimization to directly create the element.
              ret = rsingleTag.exec( selector );

              if ( ret ) {
                // If context is a plain object, it's treated as attributes for the new element.
                if ( jQuery.isPlainObject( context ) ) {
                  selector = [ document.createElement( ret[1] ) ];
                  jQuery.fn.attr.call( selector, context, true ); // Apply attributes.

                } else {
                  selector = [ doc.createElement( ret[1] ) ]; // Create element in the specified document.
                }

              } else {
                // For more complex HTML, build a document fragment.
                ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
                // Get the child nodes from the fragment.
                selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
              }

              // Merge the newly created elements into the current jQuery object and return.
              return jQuery.merge( this, selector );

            // HANDLE: $("#id") -> Select an element by its ID.
            } else {
              elem = document.getElementById( match[2] ); // Attempt to find the element by ID.

              // Check `parentNode` to handle cases where Blackberry 4.6 returns nodes
              // that are no longer in the document (ticket #6963).
              if ( elem && elem.parentNode ) {
                // Handle cases where IE and Opera return items by `name` instead of `ID`.
                if ( elem.id !== match[2] ) {
                  return rootjQuery.find( selector ); // If ID doesn't match, fall back to `find`.
                }

                // Otherwise, directly inject the found element into the jQuery object.
                this.length = 1;
                this[0] = elem;
              }

              this.context = document; // The context for this selection is the document.
              this.selector = selector; // Store the original selector.
              return this;             // Return the jQuery object containing the element.
            }

          // HANDLE: $(expr, $(...)) -> Selector with a jQuery object as context.
          } else if ( !context || context.jquery ) {
            return ( context || rootjQuery ).find( selector ); // Use `find` on the context jQuery object.

          // HANDLE: $(expr, context) -> Selector with a DOM element as context.
          // This is equivalent to `$(context).find(expr)`.
          } else {
            return this.constructor( context ).find( selector ); // Create a jQuery object from context, then find.
          }

        // HANDLE: $(function) -> Shortcut for document ready.
        } else if ( jQuery.isFunction( selector ) ) {
          return rootjQuery.ready( selector ); // Attach the function to the DOM ready event.
        }

        // If the selector is already a jQuery object or a similar array-like object.
        if ( selector.selector !== undefined ) {
          this.selector = selector.selector; // Copy the selector.
          this.context = selector.context;   // Copy the context.
        }

        // Convert the selector (which might be an array, NodeList, etc.) into a proper jQuery object.
        return jQuery.makeArray( selector, this );
      },

      // The default selector, an empty string, for an empty jQuery object.
      selector: "",

      // The current version of jQuery being used.
      jquery: "1.7.1",

      // The default length of a jQuery object (0 elements).
      length: 0,

      // Returns the number of elements contained in the matched element set.
      size: function() {
        return this.length; // Simply returns the `length` property.
      },

      // Converts the jQuery object into a plain JavaScript array.
      toArray: function() {
        return slice.call( this, 0 ); // Uses `Array.prototype.slice` to create a new array.
      },

      // Get the Nth element in the matched element set OR
      // Get the whole matched element set as a clean array.
      get: function( num ) {
        return num == null ? // If `num` is null or undefined...
          // Return a 'clean' array of all elements.
          this.toArray() :

          // Otherwise, return just the object at the specified index.
          ( num < 0 ? this[ this.length + num ] : this[ num ] ); // Supports negative indexing.
      },

      // Takes an array of elements and pushes it onto the stack,
      // returning a new jQuery object representing the new matched set.
      pushStack: function( elems, name, selector ) {
        // Build a new, empty jQuery matched element set.
        var ret = this.constructor();

        if ( jQuery.isArray( elems ) ) {
          push.apply( ret, elems ); // If `elems` is an array, push all its elements.

        } else {
          jQuery.merge( ret, elems ); // Otherwise, merge `elems` into the new object.
        }

        // Add the old object onto the stack as a reference (for `end()` method).
        ret.prevObject = this;

        // Carry over the context from the previous object.
        ret.context = this.context;

        // Construct the selector string for the new object based on the operation.
        if ( name === "find" ) {
          ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
        } else if ( name ) {
          ret.selector = this.selector + "." + name + "(" + selector + ")";
        }

        // Return the newly-formed element set.
        return ret;
      },

      // Executes a callback function for every element in the matched set.
      // (The `args` parameter is primarily for internal use to seed arguments.)
      each: function( callback, args ) {
        return jQuery.each( this, callback, args ); // Delegates to the general `jQuery.each` utility.
      },

      // Attaches a function to be executed when the DOM is ready.
      ready: function( fn ) {
        // Ensure the DOM ready event listeners are attached.
        jQuery.bindReady();

        // Add the provided function to the list of ready callbacks.
        readyList.add( fn );

        return this; // Return the jQuery object for chaining.
      },

      // Reduces the set of matched elements to the one at the specified index.
      eq: function( i ) {
        i = +i; // Ensure `i` is a number.
        return i === -1 ?
          this.slice( i ) : // If -1, slice from the end (last element).
          this.slice( i, i + 1 ); // Otherwise, slice to get only the element at index `i`.
      },

      // Reduces the set of matched elements to the first one in the set.
      first: function() {
        return this.eq( 0 ); // Equivalent to `eq(0)`.
      },

      // Reduces the set of matched elements to the last one in the set.
      last: function() {
        return this.eq( -1 ); // Equivalent to `eq(-1)`.
      },

      // Selects a subset of the matched elements. Behaves like `Array.prototype.slice`.
      slice: function() {
        // Uses `pushStack` to create a new jQuery object from the sliced elements.
        return this.pushStack( slice.apply( this, arguments ),
          "slice", slice.call(arguments).join(",") );
      },

      // Passes each element in the current matched set through a function,
      // producing a new jQuery object containing the return values.
      map: function( callback ) {
        // Delegates to `jQuery.map` for array-like mapping.
        return this.pushStack( jQuery.map(this, function( elem, i ) {
          return callback.call( elem, i, elem ); // Call the callback with element as `this`.
        }));
      },

      // Ends the most recent filtering operation in the current chain and
      // returns the set of elements before the filter was applied.
      end: function() {
        // Returns the previous jQuery object in the stack, or a new empty one if none.
        return this.prevObject || this.constructor(null);
      },

      // For internal use only.
      // These methods behave like Array's methods directly on the jQuery object,
      // not like typical jQuery methods that return a new jQuery object.
      push: push,           // Directly uses `Array.prototype.push`.
      sort: [].sort,        // Directly uses `Array.prototype.sort`.
      splice: [].splice     // Directly uses `Array.prototype.splice`.
    };

    // Give the `init` function the jQuery prototype for proper instantiation.
    // This ensures that objects created with `new jQuery.fn.init()` inherit from `jQuery.fn`.
    jQuery.fn.init.prototype = jQuery.fn;

    // The `extend` method allows merging properties from one or more objects
    // into a target object. It can perform a shallow or deep copy.
    jQuery.extend = jQuery.fn.extend = function() {
      var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {}, // The object to extend. Default to an empty object.
        i = 1,                       // Index for iterating through arguments.
        length = arguments.length,   // Total number of arguments.
        deep = false;                // Flag for deep cloning.

      // Handle a deep copy situation if the first argument is a boolean.
      if ( typeof target === "boolean" ) {
        deep = target;                 // Set `deep` flag.
        target = arguments[1] || {};   // The target object is the second argument.
        i = 2;                         // Start iterating from the third argument.
      }

      // Handle case when target is a string or something unexpected (possible in deep copy scenarios).
      if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
        target = {}; // If target is not an object or function, initialize it as an empty object.
      }

      // If only one argument is passed (or two with deep=true), extend jQuery itself.
      if ( length === i ) {
        target = this; // The current context (`jQuery` or `jQuery.fn`) becomes the target.
        --i;           // Decrement `i` to process the single argument as the source.
      }

      // Iterate through the source objects (from `i` to `length`).
      for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values as sources.
        if ( (options = arguments[ i ]) != null ) {
          // Extend the base object with properties from the current `options` object.
          for ( name in options ) {
            src = target[ name ]; // Original value in the target object.
            copy = options[ name ]; // Value to be copied from the source object.

            // Prevent never-ending loop if `target` and `copy` are the same reference.
            if ( target === copy ) {
              continue;
            }

            // Recurse if we're performing a deep merge and the value is a plain object or an array.
            if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
              if ( copyIsArray ) {
                copyIsArray = false; // Reset flag for the next iteration.
                // If `src` is an array, use it as the clone base; otherwise, start with an empty array.
                clone = src && jQuery.isArray(src) ? src : [];

              } else {
                // If `src` is a plain object, use it; otherwise, start with an empty object.
                clone = src && jQuery.isPlainObject(src) ? src : {};
              }

              // Never move original objects; always clone them recursively.
              target[ name ] = jQuery.extend( deep, clone, copy );

            // Don't bring in undefined values from the source.
            } else if ( copy !== undefined ) {
              target[ name ] = copy; // Perform a shallow copy.
            }
          }
        }
      }

      // Return the modified target object.
      return target;
    };


    // Extend the jQuery object with static utility methods and properties.
    jQuery.extend({

      // Restores the previous jQuery and/or $ global variables.
      noConflict: function( deep ) {
        // If `$` currently points to jQuery, restore the previous `$` value.
        if ( window.$ === jQuery ) {
          window.$ = _$;
        }

        // If `deep` is true and `jQuery` currently points to jQuery, restore the previous `jQuery` value.
        if ( deep && window.jQuery === jQuery ) {
          window.jQuery = _jQuery;
        }

        return jQuery; // Return the current jQuery object.
      },

      // Indicates whether the DOM is ready to be used. Initialized to false.
      isReady: false,

      // A counter to track how many items to wait for before the ready event fires.
      // Used by `holdReady`. See #6781.
      readyWait: 1,

      // Holds (or releases) the DOM ready event.
      holdReady: function( hold ) {
        if ( hold ) {
          jQuery.readyWait++; // Increment the counter if holding.
        } else {
          jQuery.ready( true ); // Release the hold, potentially triggering ready.
        }
      },

      // Handles when the DOM is ready.
      ready: function( wait ) {
        // The DOM is ready if:
        // 1. A hold is released (`wait === true` and `readyWait` becomes 0).
        // OR
        // 2. It's a DOMready/load event and the DOM is not already marked as ready.
        if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
          // Make sure `document.body` exists, at least, in case IE gets a little overzealous (ticket #5443).
          if ( !document.body ) {
            return setTimeout( jQuery.ready, 1 ); // Retry `ready` asynchronously.
          }

          // Mark the DOM as ready.
          jQuery.isReady = true;

          // If a normal DOM Ready event fired, decrement `readyWait`.
          // If `readyWait` is still greater than 0, it means there are still holds, so return.
          if ( wait !== true && --jQuery.readyWait > 0 ) {
            return;
          }

          // If there are functions bound to the ready event, execute them.
          readyList.fireWith( document, [ jQuery ] );

          // Trigger any bound "ready" events on the document.
          // Then unbind them to prevent re-triggering.
          if ( jQuery.fn.trigger ) {
            jQuery( document ).trigger( "ready" ).off( "ready" );
          }
        }
      },

      // Binds the necessary event listeners for the DOM ready event.
      bindReady: function() {
        if ( readyList ) {
          return; // If `readyList` is already initialized, listeners are bound.
        }

        // Initialize `readyList` as a jQuery.Callbacks object that fires once and remembers its state.
        readyList = jQuery.Callbacks( "once memory" );

        // Catch cases where `$(document).ready()` is called after the browser event has already occurred.
        if ( document.readyState === "complete" ) {
          // Handle it asynchronously to allow scripts the opportunity to delay ready.
          return setTimeout( jQuery.ready, 1 );
        }

        // Modern browsers (Mozilla, Opera, WebKit nightlies) currently support `DOMContentLoaded`.
        if ( document.addEventListener ) {
          // Use the `DOMContentLoaded` event for faster ready detection.
          document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

          // A fallback to `window.onload`, which will always work but fires later.
          window.addEventListener( "load", jQuery.ready, false );

        // If IE event model is used (`attachEvent`).
        } else if ( document.attachEvent ) {
          // Ensure firing before `onload`, maybe late but safe also for iframes.
          document.attachEvent( "onreadystatechange", DOMContentLoaded );

          // A fallback to `window.onload`, which will always work.
          window.attachEvent( "onload", jQuery.ready );

          // If IE and not within a frame (to prevent infinite loops).
          // Continually check to see if the document is ready using `doScroll`.
          var toplevel = false;

          try {
            toplevel = window.frameElement == null; // Check if in an iframe.
          } catch(e) { /* Ignore errors if accessing `frameElement` is restricted. */ }

          if ( document.documentElement.doScroll && toplevel ) {
            doScrollCheck(); // Start the `doScroll` polling.
          }
        }
      },

      // See `test/unit/core.js` for details concerning `isFunction`.
      // Since version 1.3, DOM methods and functions like `alert`
      // aren't supported. They return `false` on IE (#2968).
      isFunction: function( obj ) {
        return jQuery.type(obj) === "function"; // Checks if the object's type is "function".
      },

      // Checks if an object is an array. Uses native `Array.isArray` if available,
      // otherwise falls back to `jQuery.type`.
      isArray: Array.isArray || function( obj ) {
        return jQuery.type(obj) === "array"; // Checks if the object's type is "array".
      },