/*!
 * jQuery JavaScript Library v1.8.0
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: Thu Aug 09 2012 16:24:48 GMT-0400 (Eastern Daylight Time)
 */


( function ( window, undefined )

{
	// This immediately invoked function expression encapsulates the jQuery library.

	var

		// A central reference to the root jQuery(document)
		rootjQuery,

		// The deferred object used on DOM ready. This will handle ready event.
		readyList,

		// Use the correct document accordingly with window argument (sandbox)
		document = window.document,

		location = window.location,

		navigator = window.navigator,

		// Map over jQuery in case of overwrite. Safeguard against global namespace pollution.
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite. Another safeguard.
		_$ = window.$,

		// Save a reference to some core methods for performance and to avoid issues with host objects.
		core_push = Array.prototype.push,

		core_slice = Array.prototype.slice,

		core_indexOf = Array.prototype.indexOf,

		core_toString = Object.prototype.toString,

		core_hasOwn = Object.prototype.hasOwnProperty,

		core_trim = String.prototype.trim,

		// Define a local copy of jQuery. This is the main jQuery function.
		jQuery = function( selector, context ) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// It returns a new instance of jQuery.fn.init.
			return new jQuery.fn.init( selector, context, rootjQuery );
		},


		// Used for matching numbers within strings.
		core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

		// Regular expression for detecting and trimming whitespace.
		core_rnotwhite = /\S/,

		core_rspace = /\s+/,

		// IE doesn't match non-breaking spaces with \s. This handles that.
		rtrim = core_rnotwhite.test( "\xA0" ) ? ( /^[\s\xA0]+|[\s\xA0]+$/g ) : /^\s+|\s+$/g,

		// A simple way to check for HTML strings.
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,


		// Match a standalone tag, e.g., "<div>" or "<br/>".
		rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,


		// JSON RegExp definitions. These are used for parsing JSON strings.
		rvalidchars = /^[\],:{}\s]*$/,

		rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

		rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,

		rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,


		// Matches a dashed string for camelizing.
		rmsPrefix = /^-ms-/,

		rdashAlpha = /-([\da-z])/gi,

		// Used by jQuery.camelCase as callback to replace() for transforming strings.
		fcamelCase = function( all, letter ) {
			return ( letter + "" ).toUpperCase();
		},

		// The ready event handler and self cleanup method.
		DOMContentLoaded = function() {

			// Check if the browser supports addEventListener.
			if ( document.addEventListener ) {

				document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );

				jQuery.ready(); // Call the jQuery ready handler.

			} else if ( document.readyState === "complete" ) {

				// we're here because readyState === "complete" in oldIE
				// which is good enough for us to call the dom ready!
				document.detachEvent( "onreadystatechange", DOMContentLoaded );

				jQuery.ready(); // Call the jQuery ready handler for older IE.
			}
		},

		// [[Class]] -> type pairs for internal type checking.
		class2type = {};


// Extend jQuery's prototype with core methods.
jQuery.fn = jQuery.prototype = {

	// The constructor property points back to jQuery.
	constructor: jQuery,

	// The init method is the actual constructor for jQuery objects.
	init: function( selector, context, rootjQuery ) {

		var match, elem, ret, doc;

		// Handle $(""), $(null), $(undefined), $(false) - returns an empty jQuery object.
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement) - wraps a single DOM element.
		if ( selector.nodeType ) {

			this.context = this[0] = selector;

			this.length = 1;

			return this;
		}

		// Handle HTML strings or CSS selectors.
		if ( typeof selector === "string" ) {

			// Assume that strings that start and end with <> are HTML and skip the regex check.
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {

				match = [ null, selector, null ];

			} else {

				// Try to match HTML or an ID selector.
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id.
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {

					context = context instanceof jQuery ? context[0] : context;

					doc = ( context && context.nodeType ? context.ownerDocument || context : document );

					// scripts is true for back-compat.
					selector = jQuery.parseHTML( match[1], doc, true );

					// If it's a single tag and context is a plain object, set attributes.
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {

						this.attr.call( selector, context, true );
					}

					return jQuery.merge( this, selector );

				// HANDLE: $(#id)
				} else {

					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963.
					if ( elem && elem.parentNode ) {

						// Handle the case where IE and Opera return items
						// by name instead of ID.
						if ( elem.id !== match[2] ) {

							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object.
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...)) - context is a jQuery object.
			} else if ( !context || context.jquery ) {

				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context) - context is a DOM element or document.
			// (which is just equivalent to: $(context).find(expr).
			} else {

				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function) - Shortcut for document ready event.
		} else if ( jQuery.isFunction( selector ) ) {

			return rootjQuery.ready( selector );
		}

		// If the selector itself is a jQuery object, copy its selector and context.
		if ( selector.selector !== undefined ) {

			this.selector = selector.selector;

			this.context = selector.context;
		}

		// Convert the selector into an array and merge it into this jQuery object.
		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector string.
	selector: "",

	// The current version of jQuery being used.
	jquery: "1.8.0",

	// The default length of a jQuery object is 0.
	length: 0,

	// The number of elements contained in the matched element set.
	size: function() {
		return this.length;
	},

	// Convert the jQuery object to a plain array.
	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array.
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array if no number is provided.
			this.toArray() :

			// Return just the object at the specified index.
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set).
	pushStack: function( elems, name, selector ) {

		// Build a new jQuery matched element set from the provided elements.
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference) for .end() functionality.
		ret.prevObject = this;

		ret.context = this.context;

		// Construct the selector string for debugging/introspection.
		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set.
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	// Binds a function to be executed when the DOM is ready.
	ready: function( fn ) {
		// Add the callback to the ready promise.
		jQuery.ready.promise().done( fn );

		return this;
	},

	// Get the element at the specified index.
	eq: function( i ) {
		i = +i; // Ensure 'i' is a number.
		return i === -1 ?
			this.slice( i ) : // If -1, get the last element.
			this.slice( i, i + 1 ); // Get a slice containing only the element at 'i'.
	},

	// Get the first element in the set.
	first: function() {
		return this.eq( 0 );
	},

	// Get the last element in the set.
	last: function() {
		return this.eq( -1 );
	},

	// Create a new jQuery object with a subset of the elements.
	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ),
			"slice", core_slice.call(arguments).join(",") );
	},

	// Pass each element in the current matched set through a function.
	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	// End the most recent filtering operation in the current chain.
	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,

	sort: [].sort,

	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation.
// This ensures that new jQuery.fn.init objects inherit from jQuery.fn.
jQuery.fn.init.prototype = jQuery.fn;

// Extend jQuery itself and its prototype.
jQuery.extend = jQuery.fn.extend = function() {

	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {}, // The object to extend.
		i = 1,                      // Index of the current argument.
		length = arguments.length,  // Total number of arguments.
		deep = false;               // Whether to perform a deep copy.

	// Handle a deep copy situation.
	if ( typeof target === "boolean" ) {

		deep = target; // First argument is a boolean for deep copy.

		target = arguments[1] || {}; // Second argument is the target.

		// skip the boolean and the target.
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy).
	// Ensure target is an object if it's not already one.
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {

		target = {};
	}

	// extend jQuery itself if only one argument is passed.
	// In this case, 'this' becomes the target.
	if ( length === i ) {

		target = this;

		--i; // Decrement 'i' to process the single argument as 'options'.
	}

	// Iterate through the options objects.
	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values.
		if ( (options = arguments[ i ]) != null ) {

			// Extend the base object.
			for ( name in options ) {

				src = target[ name ]; // Source value from the target object.

				copy = options[ name ]; // Value to be copied from the options object.

				// Prevent never-ending loop when an object references itself.
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays.
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {

					if ( copyIsArray ) {

						copyIsArray = false; // Reset flag.

						clone = src && jQuery.isArray(src) ? src : []; // Ensure clone is an array.

					} else {

						clone = src && jQuery.isPlainObject(src) ? src : {}; // Ensure clone is a plain object.
					}

					// Never move original objects, clone them.
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values, only assign if 'copy' is not undefined.
				} else if ( copy !== undefined ) {

					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object.
	return target;
};

// Extend the jQuery object itself with utility methods.
jQuery.extend( {

	// Restore original jQuery and $ to window if they were overwritten.
	noConflict: function( deep ) {

		if ( window.$ === jQuery ) {

			window.$ = _$; // Restore the original '$'.
		}

		if ( deep && window.jQuery === jQuery ) {

			window.jQuery = _jQuery; // Restore the original 'jQuery'.
		}

		return jQuery; // Return the current jQuery object.
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781.
	readyWait: 1,

	// Hold (or release) the ready event.
	holdReady: function( hold ) {

		if ( hold ) {

			jQuery.readyWait++; // Increment the counter, delaying ready.

		} else {

			jQuery.ready( true ); // Attempt to fire ready, decrementing counter.
		}
	},

	// Handle when the DOM is ready.
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready.
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready, 1 );
		}

		// Remember that the DOM is ready.
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be.
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute them.
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events on the document.
		if ( jQuery.fn.trigger ) {

			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat also handles non-string values, but isFinite is more strict.
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {

		// Handle null and undefined specifically.
		return obj == null ?
			String( obj ) :
			// Use internal [[Class]] property to determine type.
			class2type[ core_toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well.
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {

			return false;
		}

		try {
			// Not own constructor property must be Object.
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {

				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897.
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {} // Iterate to find the last key.

		// Check if the last key found is an own property.
		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false; // If any enumerable property is found, it's not empty.
		}
		return true; // No properties found, so it's empty.
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// scripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, scripts ) {

		var parsed;

		if ( !data || typeof data !== "string" ) {
			return null;
		}

		if ( typeof context === "boolean" ) {

			scripts = context; // Shift arguments if context is a boolean.

			context = 0; // Reset context to default.
		}

		context = context || document; // Default context is the document.

		// Single tag check.
		if ( (parsed = rsingleTag.exec( data )) ) {

			return [ context.createElement( parsed[1] ) ];
		}

		// Build a document fragment from the HTML string.
		parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );

		return jQuery.merge( [], // Merge into an empty array to create a new array.