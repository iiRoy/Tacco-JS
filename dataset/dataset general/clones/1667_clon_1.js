/*
 *  This is a jQuery JavaScript Library.
 *  Version 1.4.3pre.
 *  Visit http://jquery.com/ for more information.
 *
 *  Copyright (c) 2010, John Resig.
 *  Licensed under the MIT or GPL Version 2 licenses.
 *  See http://jquery.org/license for details.
 *
 *  Includes Sizzle.js, also from 2010, by The Dojo Foundation.
 *  Sizzle is released under the MIT, BSD, and GPL Licenses.
 *  More info at http://sizzlejs.com/.
 *
 *  Date of generation: Wed Mar 31 14:36:24 2010 -0400
 */
( function( window, undefined )

{

( function() {

  /* Define a local copy of jQuery here. */
  var jQuery = function( selector, context )
  {
      // The core jQuery object is essentially the 'init' constructor,
      // but it's been extended with additional functionality.
      return new jQuery.fn.init( selector, context );
    },

    /* Map over jQuery in case of any global namespace overwrites. */
    _jQuery = window.jQuery,

    /* Map over the $ symbol in case it's already in use. */
    _$ = window.$,

    /* Using the correct document based on the 'window' argument (for sandboxing). */
    //document = window.document, /* This line is commented out in the original. */

    /* A central reference to the root jQuery(document) object. */
    rootjQuery,

    /* Regular expression to quickly check for HTML strings or ID strings.
     * These are often optimized for faster processing. */
    quickExpr = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w\-]+)$/,

    /* Regular expression to check if a selector is 'simple'. */
    isSimple = /^.[^:#\[\.,]*$/,

    /* Regular expression to detect if a string contains any non-whitespace character. */
    rnotwhite = /\S/,

    /* Regular expressions for trimming whitespace from the beginning and end of strings. */
    trimLeft = /^\s+/,
    trimRight = /\s+$/,

    /* Regular expression to match a standalone HTML tag. */
    rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

    /* Stores the UserAgent string for browser detection in jQuery.browser. */
    userAgent = navigator.userAgent,

    /* Placeholder for browser matching results (engine and version). */
    browserMatch,

    /* A flag to indicate whether DOM ready events have already been bound. */
    readyBound = false,

    /* An array to hold functions that need to be executed when the DOM is ready. */
    readyList = [],

    /* The event handler function for DOMContentLoaded. */
    DOMContentLoaded,

    /* Save references to some core Object and Array prototype methods for efficiency. */
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,
    push = Array.prototype.push,
    slice = Array.prototype.slice,
    trim = String.prototype.trim,
    indexOf = Array.prototype.indexOf;


jQuery.fn = jQuery.prototype = {

  // The 'init' function is the actual constructor for jQuery objects.
  init: function( selector, context ) {

    var match, elem, ret, doc;

    // Handle cases where selector is empty, null, or undefined.
    if ( !selector ) {
      return this;
    }

    // Handle a DOM element passed directly as the selector.
    if ( selector.nodeType ) {
      this.context = this[0] = selector;
      this.length = 1;
      return this;
    }

    // Optimization for finding the 'body' element, which is unique.
    if ( selector === "body" && !context ) {
      this.context = document;
      this[0] = document.body;
      this.selector = "body";
      this.length = 1;
      return this;
    }

    // Handle cases where the selector is a string.
    if ( typeof selector === "string" ) {

      // Determine if we're dealing with an HTML string or an ID selector.
      match = quickExpr.exec( selector );

      // If a match is found and it's either an HTML string or an ID without context specified.
      if ( match && (match[1] || !context) ) {

        // HANDLE: $(html) -> Create elements from HTML string.
        if ( match[1] ) {
          doc = (context ? context.ownerDocument || context : document);

          // If a single tag is passed, create the element directly.
          ret = rsingleTag.exec( selector );

          if ( ret ) {

            // If context is a plain object, create element and set attributes.
            if ( jQuery.isPlainObject( context ) ) {
              selector = [ document.createElement( ret[1] ) ];
              jQuery.fn.attr.call( selector, context, true );

            } else {
              selector = [ doc.createElement( ret[1] ) ];
            }

          } else {
            // Otherwise, build a document fragment from the HTML.
            ret = buildFragment( [ match[1] ], [ doc ] );
            selector = (ret.cacheable ? ret.fragment.cloneNode(true) : ret.fragment).childNodes;
          }

          return jQuery.merge( this, selector );

        // HANDLE: $("#id") -> Select element by ID.
        } else {
          elem = document.getElementById( match[2] );

          if ( elem ) {
            // Account for IE/Opera returning elements by name instead of ID.
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

      // HANDLE: $("TAG") -> Select elements by tag name.
      } else if ( !context && /^\w+$/.test( selector ) ) {
        this.selector = selector;
        this.context = document;
        selector = document.getElementsByTagName( selector );
        return jQuery.merge( this, selector );

      // HANDLE: $(expr, $(...)) -> Find elements within another jQuery object.
      } else if ( !context || context.jquery ) {
        return (context || rootjQuery).find( selector );

      // HANDLE: $(expr, context) -> Find elements within a given context.
      // This is equivalent to: $(context).find(expr).
      } else {
        return jQuery( context ).find( selector );
      }

    // HANDLE: $(function) -> Shortcut for document ready event.
    } else if ( jQuery.isFunction( selector ) ) {
      return rootjQuery.ready( selector );
    }

    // If the selector already has a .selector property, use it.
    if (selector.selector !== undefined) {
      this.selector = selector.selector;
      this.context = selector.context;
    }

    // Convert the selector into an array and merge it into 'this'.
    return jQuery.makeArray( selector, this );
  },

  // Start with an empty selector string.
  selector: "",

  // The current version of the jQuery library.
  jquery: "1.4.3pre",

  // The default length of a jQuery object (initially zero).
  length: 0,

  // Returns the number of elements in the matched set.
  size: function() {
    return this.length;
  },

  // Converts the jQuery object to a plain array.
  toArray: function() {
    return slice.call( this, 0 );
  },

  // Get the Nth element in the matched set, or the entire set as an array.
  get: function( num ) {
    return num == null ?

      // If 'num' is null, return a 'clean' array.
      this.toArray() :

      // Otherwise, return just the specific object (handling negative indices).
      ( num < 0 ? this.slice(num)[ 0 ] : this[ num ] );
  },

  // Pushes an array of elements onto the stack, returning a new jQuery object.
  pushStack: function( elems, name, selector ) {
    // Build a new, empty jQuery matched element set.
    var ret = jQuery();

    // Merge the elements into the new set.
    if ( jQuery.isArray( elems ) ) {
      push.apply( ret, elems );

    } else {
      jQuery.merge( ret, elems );
    }

    // Add the previous object onto the stack for chaining.
    ret.prevObject = this;

    // Preserve the context from the current object.
    ret.context = this.context;

    // Construct the selector string for the new object.
    if ( name === "find" ) {
      ret.selector = this.selector + (this.selector ? " " : "") + selector;
    } else if ( name ) {
      ret.selector = this.selector + "." + name + "(" + selector + ")";
    }

    // Return the newly-formed element set.
    return ret;
  },

  // Execute a callback function for each element in the matched set.
  // 'args' is for internal use to seed arguments.
  each: function( callback, args ) {
    return jQuery.each( this, callback, args );
  },

  // Binds a function to be executed when the DOM is ready.
  ready: function( fn ) {
    // Ensure the ready event listeners are attached.
    jQuery.bindReady();

    // If the DOM is already ready, execute the function immediately.
    if ( jQuery.isReady ) {
      fn.call( document, jQuery );

    // Otherwise, add the function to the list to be executed later.
    } else if ( readyList ) {
      readyList.push( fn );
    }

    return this;
  },

  // Reduces the set of matched elements to the one at the specified index.
  eq: function( i ) {
    return i === -1 ?
      this.slice( i ) :
      this.slice( i, +i + 1 );
  },

  // Reduces the set of matched elements to the first one.
  first: function() {
    return this.eq( 0 );
  },

  // Reduces the set of matched elements to the last one.
  last: function() {
    return this.eq( -1 );
  },

  // Selects a subset of the matched elements.
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

  // End the most recent filtering operation in the current chain
  // and return the set of elements before the filter was called.
  end: function() {
    return this.prevObject || jQuery(null);
  },

  // For internal use only.
  // These behave like Array methods, not jQuery methods.
  push: push,
  sort: [].sort,
  splice: [].splice
};

// Give the 'init' function the jQuery prototype so that
// objects created with 'new jQuery.fn.init()' inherit jQuery's methods.
jQuery.fn.init.prototype = jQuery.fn;

// Extend jQuery itself and jQuery.fn (prototype) with new properties and methods.
jQuery.extend = jQuery.fn.extend = function() {

  var target = arguments[0] || {}, // The object to extend, or a new empty object.
      i = 1,                       // Index of the first source object.
      length = arguments.length,   // Total number of arguments.
      deep = false,                // Flag for deep copying.
      options, name, src, copy;    // Variables for iteration.

  // Handle a deep copy situation if the first argument is a boolean.
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {}; // Set target to the next argument or an empty object.
    i = 2;                       // Skip the boolean and the new target.
  }

  // Handle cases where target might be a string or other non-object type (possible in deep copy).
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
    target = {}; // Ensure target is an object.
  }

  // If only one argument is passed, extend jQuery itself.
  if ( length === i ) {
    target = this;
    --i; // Adjust index to process the single argument as a source.
  }

  // Iterate through all source objects.
  for ( ; i < length; i++ ) {

    // Only deal with non-null/undefined values from source objects.
    if ( (options = arguments[ i ]) != null ) {

      // Extend the target object with properties from the current source 'options'.
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loops if target and copy are the same object.
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're doing a deep merge of object literal values or arrays.
        if ( deep && copy && ( jQuery.isPlainObject(copy) || jQuery.isArray(copy) ) ) {
          var clone = src && ( jQuery.isPlainObject(src) || jQuery.isArray(src) ) ? src
            : jQuery.isArray(copy) ? [] : {}; // Determine if 'src' needs to be cloned or initialized.

          // Never move original objects, always clone them for deep copy.
          target[ name ] = jQuery.extend( deep, clone, copy );

        // Don't bring in undefined values from the source.
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified target object.
  return target;
};

// Extend the jQuery object with static methods.
jQuery.extend({

  // Restore global jQuery and $ variables to their previous states.
  noConflict: function( deep ) {
    window.$ = _$; // Restore '$'.

    if ( deep ) {
      window.jQuery = _jQuery; // If 'deep' is true, restore 'jQuery' as well.
    }

    return jQuery; // Return the jQuery object, allowing it to be assigned to a new variable.
  },

  // Flag indicating if the DOM is ready. Set to true once it occurs.
  isReady: false,

  // This function is called when the DOM is ready.
  ready: function() {
    // Ensure this function is only executed once.
    if ( !jQuery.isReady ) {
      // Make sure 'body' exists, especially in case of overzealous IE (ticket #5443).
      if ( !document.body ) {
        return setTimeout( jQuery.ready, 13 ); // Retry after a short delay.
      }

      // Mark the DOM as ready.
      jQuery.isReady = true;

      // If there are functions waiting to be executed.
      if ( readyList ) {
        // Execute all functions in the readyList.
        var fn, i = 0;
        while ( (fn = readyList[ i++ ]) ) {
          fn.call( document, jQuery );
        }

        // Clear the list of functions.
        readyList = null;
      }

      // Trigger any bound 'ready' events.
      if ( jQuery.fn.triggerHandler ) {
        jQuery( document ).triggerHandler( "ready" );
      }
    }
  },

  // Binds the necessary event listeners for the DOM ready event.
  bindReady: function() {
    // Prevent binding multiple times.
    if ( readyBound ) {
      return;
    }

    readyBound = true; // Mark as bound.

    // Handle cases where $(document).ready() is called after the browser event has already occurred.
    if ( document.readyState === "complete" ) {
      return jQuery.ready();
    }

    // For Mozilla, Opera, and WebKit nightlies, use DOMContentLoaded.
    if ( document.addEventListener ) {
      document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

      // Fallback to window.onload, which always works.
      window.addEventListener( "load", jQuery.ready, false );

    // For IE event model.
    } else if ( document.attachEvent ) {
      // Ensure firing before onload, safe even for iframes.
      document.attachEvent("onreadystatechange", DOMContentLoaded);

      // Fallback to window.onload.
      window.attachEvent( "onload", jQuery.ready );

      // If IE and not in an iframe, continually check document.documentElement.doScroll.
      var toplevel = false;

      try {
        toplevel = window.frameElement == null; // Check if in an iframe.
      } catch(e) {} // Suppress errors if access is denied.

      if ( document.documentElement.doScroll && toplevel ) {
        doScrollCheck(); // Start the doScroll check.
      }
    }
  },

  // Check if an object is a function.
  // Since 1.3, DOM methods and functions like alert aren't supported;
  // they return false on IE (#2968).
  isFunction: function( obj ) {
    return toString.call(obj) === "[object Function]";
  },

  // Check if an object is an array.
  isArray: function( obj ) {
    return toString.call(obj) === "[object Array]";
  },

  // Check if an object is a plain object (created by {} or new Object()).
  isPlainObject: function( obj ) {
    // Must be an Object.
    // Also check for constructor property presence due to IE.
    // Exclude DOM nodes and window objects.
    if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
      return false;
    }

    // A plain object should not have its own constructor property,
    // or its constructor's prototype should have 'isPrototypeOf'.
    if ( obj.constructor &&
      !hasOwn.call(obj, "constructor") &&
      !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
      return false;
    }

    // Own properties are enumerated first.
    // If the last enumerated property is its own, then all properties are own.
    var key;
    for ( key in obj ) {}

    return key === undefined || hasOwn.call( obj, key );
  },

  // Check if an object has no properties (is empty).
  isEmptyObject: function( obj ) {
    for ( var name in obj ) {
      return false; // If any property is found, it's not empty.
    }
    return true; // No properties found, it's empty.
  },

  // Throws a JavaScript error.
  error: function( msg ) {
    throw msg;
  },

  // Parses a JSON string into a JavaScript object.
  parseJSON: function( data ) {