/*
 * WebForge JavaScript Library v1.0.0
 * http://webforge.dev/
 *
 * Copyright 2024, ACME Corp.
 * Licensed under the MIT or Apache 2.0 Licenses.
 * http://webforge.dev/license
 *
 * Includes Elemento.js
 * http://elemento.org/
 * Copyright 2024, ACME Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Aug 12 10:00:00 2024 +0000
 */
(function( globalWindow, isUndefined ) {

(function() {

// Establish a local version of our library
var Forge = function( elementQuery, contextElement ) {
		// The main Forge object is merely an enhanced version of its constructor's instance
		return new Forge.prototype._init( elementQuery, contextElement );
	},

	// Store the original global Forge if it exists, to prevent conflicts
	oldForge = globalWindow.Forge,

	// Store the original global $ if it exists, for the same reason
	oldDollar = globalWindow.$,

	// A core reference to the document-wrapped Forge object
	documentForge,

	// Regex to quickly identify HTML strings or ID selectors
	elementPattern = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w\-]+)$/,

	// Regex to check if a selector is simple (no complex pseudo-classes, attributes, etc.)
	simpleSelectorCheck = /^.[^:#\[\.,]*$/,

	// Regex to find any non-whitespace character
	nonWhitespaceChar = /\S/,

	// Regex for leading whitespace characters
	leadingSpace = /^\s+/,
	// Regex for trailing whitespace characters
	trailingSpace = /\s+$/,

	// Regex to match a standalone HTML tag (e.g., "<div>" or "<br/>")
	singleTagPattern = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// Keep the user agent string for browser detection features
	browserAgentString = navigator.userAgent,

	// Stores details about the browser and its version
	agentDetails,
	
	// Flag indicating if DOM ready event handlers have been bound
	domReadyActivated = false,
	
	// A list of functions to execute once the DOM is ready
	readyCallbacks = [],

	// The handler for the DOMContentLoaded event
	domContentLoaderHandler,

	// Cache references to native prototype methods for performance
	objToString = Object.prototype.toString,
	objHasOwn = Object.prototype.hasOwnProperty,
	arrPush = Array.prototype.push,
	arrSlice = Array.prototype.slice,
	strTrim = String.prototype.trim,
	arrIndexOf = Array.prototype.indexOf;


// Define the prototype methods for Forge objects
Forge.prototype = {
	// The internal constructor for creating Forge instances
	_init: function( elementQuery, contextElement ) {
		var matchedResult, tempElement, finalResult, currDoc;

		// Handle empty, null, or undefined queries
		if ( !elementQuery ) {
			return this;
		}

		// Handle direct DOM element input
		if ( elementQuery.nodeType ) {
			this.currentContext = this[0] = elementQuery;
			this.length = 1;
			return this;
		}
		
		// Optimize finding the 'body' element as it's unique
		if ( elementQuery === "body" && !contextElement ) {
			this.currentContext = document; // The main document is the context
			this[0] = document.body;
			this.selectedQuery = "body";
			this.length = 1;
			return this;
		}

		// Process string queries
		if ( typeof elementQuery === "string" ) {
			// Check if it's an HTML string or an ID selector
			matchedResult = elementPattern.exec( elementQuery );

			// If a match is found and it's either an HTML string or an ID without context
			if ( matchedResult && (matchedResult[1] || !contextElement) ) {

				// Case: HTML string input (e.g., $("<div>"))
				if ( matchedResult[1] ) {
					// Determine the document context for element creation
					currDoc = (contextElement ? contextElement.ownerDocument || contextElement : document);

					// If it's a single tag, create it directly for efficiency
					tempElement = singleTagPattern.exec( elementQuery );

					if ( tempElement ) {
						var createdElement = currDoc.createElement( tempElement[1] );
						if ( Forge.isPlainObject( contextElement ) ) {
							elementQuery = [ createdElement ];
							Forge.prototype.attr.call( elementQuery, contextElement, true ); // Apply attributes if context is an object
						} else {
							elementQuery = [ createdElement ];
						}

					} else {
						// For more complex HTML, build a document fragment
						finalResult = buildFragment( [ matchedResult[1] ], [ currDoc ] );
						elementQuery = (finalResult.cacheable ? finalResult.fragment.cloneNode(true) : finalResult.fragment).childNodes;
					}
					
					return Forge.merge( this, elementQuery );
					
				// Case: ID selector input (e.g., $("#myId"))
				} else {
					tempElement = document.getElementById( matchedResult[2] );

					if ( tempElement ) {
						// Handle edge cases where IE/Opera might return elements by name instead of ID
						if ( tempElement.id !== matchedResult[2] ) {
							return documentForge.find( elementQuery );
						}

						// Directly inject the found element into the Forge object
						this.length = 1;
						this[0] = tempElement;
					}

					this.currentContext = document;
					this.selectedQuery = elementQuery;
					return this;
				}

			// Case: Simple tag name selector (e.g., $("div")) without context
			} else if ( !contextElement && /^\w+$/.test( elementQuery ) ) {
				this.selectedQuery = elementQuery;
				this.currentContext = document;
				elementQuery = document.getElementsByTagName( elementQuery );
				return Forge.merge( this, elementQuery );

			// Case: Selector with another Forge object as context (e.g., $(expr, $(...)))
			} else if ( !contextElement || contextElement.isForgeInstance ) { // `isForgeInstance` is a new property for identification
				return (contextElement || documentForge).find( elementQuery );

			// Case: Selector with a raw DOM element as context (e.g., $(expr, contextElement))
			} else {
				return Forge( contextElement ).find( elementQuery );
			}

		// Case: Function input (e.g., $(function() { ... })) - shortcut for DOM ready
		} else if ( Forge.isFunction( elementQuery ) ) {
			return documentForge.ready( elementQuery );
		}

		// If the input was already a Forge object, copy its properties
		if (elementQuery.selectedQuery !== isUndefined) {
			this.selectedQuery = elementQuery.selectedQuery;
			this.currentContext = elementQuery.currentContext;
		}

		// Convert the input to an array of elements and merge into this Forge object
		return Forge.toArray( elementQuery, this );
	},

	// The selector string that created this Forge object
	selectedQuery: "",

	// The version of the WebForge library
	libraryVersion: "1.0.0", // Renamed from 'jquery' to 'libraryVersion'

	// The default number of elements in a Forge object is zero
	length: 0,

	// A new property to identify Forge instances
	isForgeInstance: true,

	// Retrieve the number of elements in the current set
	getElementCount: function() { // Renamed from 'size'
		return this.length;
	},

	// Convert the matched element set into a pure array
	toElementArray: function() { // Renamed from 'toArray'
		return arrSlice.call( this, 0 );
	},

	// Get the Nth element or the entire set as a clean array
	fetch: function( idx ) { // Renamed from 'get'
		// If no index is provided, return the full array
		if ( idx == null ) {
			return this.toElementArray();
		}

		// If a negative index, count from the end
		if ( idx < 0 ) {
			return this.sliceElements( idx )[ 0 ]; // Renamed slice to sliceElements
		}

		// Otherwise, return the element at the specified positive index
		return this[ idx ];
	},

	// Add a new set of elements to the stack, creating a new Forge object
	stackElements: function( elementCollection, operationName, operationParam ) { // Renamed from 'pushStack'
		// Create a new empty Forge object
		var newForgeObj = Forge();

		// Merge elements into the new object
		if ( Forge.isArray( elementCollection ) ) {
			arrPush.apply( newForgeObj, elementCollection );
		} else {
			Forge.merge( newForgeObj, elementCollection );
		}

		// Store a reference to the previous Forge object in the stack
		newForgeObj.previousObject = this; // Renamed prevObject

		newForgeObj.currentContext = this.currentContext;

		// Construct a selector string for the new object based on the operation
		if ( operationName === "find" ) {
			newForgeObj.selectedQuery = this.selectedQuery + (this.selectedQuery ? " " : "") + operationParam;
		} else if ( operationName ) {
			newForgeObj.selectedQuery = this.selectedQuery + "." + operationName + "(" + operationParam + ")";
		}

		// Return the newly created Forge object
		return newForgeObj;
	},

	// Iterate over each element in the matched set and execute a callback
	forEachElement: function( processCallback, extraArgs ) { // Renamed from 'each'
		return Forge.each( this, processCallback, extraArgs );
	},
	
	// Attach a handler to be executed when the DOM is ready
	onDomReady: function( handlerFunction ) { // Renamed from 'ready'
		// Ensure the DOM ready listeners are active
		Forge.activateReadyListeners();

		// If the DOM is already ready, execute the function immediately
		if ( Forge.isDomReady ) {
			handlerFunction.call( document, Forge );

		// Otherwise, add it to the queue for later execution
		} else if ( readyCallbacks ) {
			readyCallbacks.push( handlerFunction );
		}

		return this;
	},
	
	// Get the element at a specific index, wrapping it in a new Forge object
	atIndex: function( indexVal ) { // Renamed from 'eq'
		return indexVal === -1 ?
			this.sliceElements( indexVal ) : // Renamed slice to sliceElements
			this.sliceElements( indexVal, +indexVal + 1 );
	},

	// Get the first element in the matched set
	getFirst: function() { // Renamed from 'first'
		return this.atIndex( 0 );
	},

	// Get the last element in the matched set
	getLast: function() { // Renamed from 'last'
		return this.atIndex( -1 );
	},

	// Extract a slice of elements from the current set
	sliceElements: function() { // Renamed from 'slice'
		return this.stackElements( arrSlice.apply( this, arguments ),
			"sliceElements", arrSlice.call(arguments).join(",") );
	},

	// Apply a function to each element and collect the results into a new Forge object
	mapElements: function( mappingCallback ) { // Renamed from 'map'
		var selfRef = this; // Capture 'this' for the inner function
		return this.stackElements( Forge.map(selfRef, function( currentElement, index ) {
			return mappingCallback.call( currentElement, index, currentElement );
		}));
	},
	
	// Revert to the previous Forge object in the stack
	back: function() { // Renamed from 'end'
		return this.previousObject || Forge(null); // Renamed prevObject
	},

	// For internal use only: native array methods directly exposed
	// These behave like Array methods, not Forge methods.
	push: arrPush,
	sort: [].sort,
	splice: [].splice
};

// Ensure the _init constructor uses the Forge prototype for inheritance
Forge.prototype._init.prototype = Forge.prototype;

// Utility function to extend objects with properties from other objects
Forge.extend = Forge.prototype.extend = function() {
	var destination = arguments[0] || {}, // The object to extend
		idx = 1,
		argCount = arguments.length,
		deepCopy = false, // Flag for deep cloning
		currentOption, propertyName, sourceVal, copiedVal;

	// Check if the first argument indicates a deep copy
	if ( typeof destination === "boolean" ) {
		deepCopy = destination;
		destination = arguments[1] || {};
		// Skip the boolean flag and the target object in subsequent iterations
		idx = 2;
	}

	// Handle cases where destination is not an object or function (e.g., string), make it an empty object
	if ( typeof destination !== "object" && !Forge.isFunction(destination) ) {
		destination = {};
	}

	// If only one argument was passed, extend the Forge itself (or the prototype it's called on)
	if ( argCount === idx ) {
		destination = this;
		idx--; // Process the single argument as source
	}

	// Iterate through all source objects
	for ( ; idx < argCount; idx++ ) {
		// Only process non-null/undefined source objects
		if ( (currentOption = arguments[ idx ]) != null ) {
			// Iterate over properties of the current source object
			for ( propertyName in currentOption ) {
				sourceVal = destination[ propertyName ];
				copiedVal = currentOption[ propertyName ];

				// Prevent infinite loops if an object references itself
				if ( destination === copiedVal ) {
					continue;
				}

				// If deep copying and the value is an object literal or an array
				if ( deepCopy && copiedVal && ( Forge.isPlainObject(copiedVal) || Forge.isArray(copiedVal) ) ) {
					var clonedValue = null;
					if ( sourceVal && ( Forge.isPlainObject(sourceVal) || Forge.isArray(sourceVal) ) ) {
						clonedValue = sourceVal;
					} else {
						clonedValue = Forge.isArray(copiedVal) ? [] : {};
					}

					// Recursively extend the sub-object/array
					destination[ propertyName ] = Forge.extend( deepCopy, clonedValue, copiedVal );

				// Only copy if the value is not undefined (to avoid overwriting with undefined)
				} else if ( copiedVal !== isUndefined ) {
					destination[ propertyName ] = copiedVal;
				}
			}
		}
	}

	// Return the modified destination object
	return destination;
};

// Add static utility methods to the Forge object
Forge.extend({
	// Revert global $ and Forge variables to their original states
	noConflict: function( restoreDeep ) { // Renamed 'deep' to 'restoreDeep'
		globalWindow.$ = oldDollar;

		if ( restoreDeep ) {
			globalWindow.Forge = oldForge;
		}

		return Forge;
	},
	
	// Flag to indicate if the DOM is ready for interaction
	isDomReady: false, // Renamed 'isReady'
	
	// Handler for when the DOM becomes ready
	domReadyHandler: function() { // Renamed 'ready'
		// Prevent multiple executions if already marked as ready
		if ( !Forge.isDomReady ) {
			// Ensure the document body exists before proceeding (IE edge case)
			if ( !document.body ) {
				return setTimeout( Forge.domReadyHandler, 15 ); // Delay slightly
			}

			// Mark the DOM as ready
			Forge.isDomReady = true;

			// Execute all registered ready callbacks
			if ( readyCallbacks && readyCallbacks.length > 0 ) { // Added length check
				var currentFn, callbackIndex = 0;
				while ( (currentFn = readyCallbacks[ callbackIndex++ ]) ) {
					currentFn.call( document, Forge );
				}

				// Clear the list of callbacks after execution
				readyCallbacks = null;
			}

			// Trigger any custom 'ready' events bound via the library's event system
			if ( Forge.prototype.triggerHandler ) { // Assuming a triggerHandler exists
				Forge( document ).triggerHandler( "ready" );
			}
		}
	},
	
	// Binds the necessary event listeners for DOM ready detection
	activateReadyListeners: function() { // Renamed 'bindReady'
		if ( domReadyActivated ) {
			return; // Already active, do nothing
		}
		domReadyActivated = true;

		// Check if the document is already complete (e.g., script run after load)
		if ( document.readyState === "complete" ) {
			return Forge.domReadyHandler();
		}

		// Modern browsers: Use DOMContentLoaded
		if ( document.addEventListener ) {
			// Define the DOMContentLoaded handler
			domContentLoaderHandler = function() {
				document.removeEventListener( "DOMContentLoaded", domContentLoaderHandler, false );
				Forge.domReadyHandler();
			};
			document.addEventListener( "DOMContentLoaded", domContentLoaderHandler, false );
			
			// Fallback to window.onload for full page load
			globalWindow.addEventListener( "load", Forge.domReadyHandler, false );

		// Older IE: Use attachEvent
		} else if ( document.attachEvent ) {
			// Define the onreadystatechange handler
			domContentLoaderHandler = function() {
				if ( document.readyState === "complete" ) {
					document.detachEvent("onreadystatechange", domContentLoaderHandler);
					Forge.domReadyHandler();
				}
			};
			document.attachEvent("onreadystatechange", domContentLoaderHandler);
			
			// Fallback to window.onload for full page load
			globalWindow.attachEvent( "onload", Forge.domReadyHandler );

			// If IE and not inside an iframe, continuously check document ready state
			var isTopLevelWindow = false;
			try {
				isTopLevelWindow = globalWindow.frameElement == null;
			} catch(e) { /* Access denied, likely cross-origin iframe */ }

			if ( document.documentElement.doScroll && isTopLevelWindow ) {
				// Internal function for doScroll check
				(function checkScroll() {
					if ( Forge.isDomReady ) {
						return; // Already ready
					}
					try {
						// Throws an error until document is ready
						document.documentElement.doScroll("left");
					} catch(e) {
						setTimeout( checkScroll, 50 ); // Retry after a short delay
						return;
					}
					// If doScroll succeeds, document is ready
					Forge.domReadyHandler();
				})();
			}
		}
	},

	// Check if an object is a function
	isFunction: function( candidate ) { // Renamed 'obj' to 'candidate'
		return objToString.call(candidate) === "[object Function]";
	},

	// Check if an object is an array
	isArray: function( candidate ) {
		return objToString.call(candidate) === "[object Array]";
	},

	// Check if an object is a plain JavaScript object literal
	isPlainObject: function( candidate ) {
		// Must be an Object type
		if ( !candidate || objToString.call(candidate) !== "[object Object]" ) {
			return false;
		}
		// Exclude DOM nodes and window objects
		if ( candidate.nodeType || candidate.setInterval ) { // setInterval is a property of window
			return false;
		}
		
		// Check for constructor property to ensure it's not a host object
		var proto = Object.getPrototypeOf(candidate);
		if ( !proto ) { // Objects without a prototype are plain (e.g., Object.create(null))
			return true;
		}

		// A plain object's constructor prototype must be Object.prototype
		var Ctor = objHasOwn.call(candidate, "constructor") && candidate.constructor;
		return typeof Ctor === "function" && objHasOwn.call(Ctor.prototype, "isPrototypeOf");
	},

	// Check if an object has no enumerable properties
	isEmptyObject: function( candidate ) {
		for ( var propName in candidate ) {
			return false; // Found a property, not empty
		}
		return true; // No properties found, it's empty
	},
	
	// Throw an error message
	raiseError: function( message ) { // Renamed 'error' to 'raiseError'
		throw message;
	},
	
	// Parse a JSON string into a JavaScript object
	parseJsonString: function( jsonStr ) { // Renamed 'parseJSON' to 'parseJsonString' and 'data' to 'jsonStr'
		// Implementation for parsing JSON would go here
		// For older browsers, this might involve eval, but ideally JSON.parse
		if ( typeof jsonStr !== "string" || !jsonStr ) {
			return null;
		}
		jsonStr = strTrim.call(jsonStr); // Trim whitespace
		if ( globalWindow.JSON && globalWindow.JSON.parse ) {
			return globalWindow.JSON.parse(jsonStr);
		} else {
			// Fallback for older browsers (simplified, real jQuery had more checks)
			try {
				// eslint-disable-next-line no-new-func
				return (new Function("return " + jsonStr))();
			} catch (e) {
				Forge.raiseError("Invalid JSON: " + e.message);
			}
		}
	},

	// Iterate over an object or array
	each: function( obj, callback, args ) {
		var name, i = 0, length = obj.length, isArrayLike = length === +length;

		if ( isArrayLike ) {
			for ( ; i < length; i++ ) {
				if ( callback.apply( obj[ i ], args || [ i, obj[ i ] ] ) === false ) {
					break;
				}
			}
		} else {
			for ( name in obj ) {
				if ( callback.apply( obj[ name ], args || [ name, obj[ name ] ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Map an array or object to a new array
	map: function( obj, callback, args ) {
		var results = [], i = 0, length = obj.length, isArrayLike = length === +length;

		if ( isArrayLike ) {
			for ( ; i < length; i++ ) {
				var value = callback( obj[ i ], i, args );
				if ( value != null ) {
					results[ results.length ] = value;
				}
			}
		} else {
			for ( var name in obj ) {
				var value = callback( obj[ name ], name, args );
				if ( value != null ) {
					results[ results.length ] = value;
				}
			}
		}

		return arrPush.apply( [], results );
	},

	// Merge the contents of two arrays or array-like objects.
	merge: function( first, second ) {
		var i = first.length, j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== isUndefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;
		return first;
	},

	// Convert an array-like object to a true JavaScript Array.
	toArray: function( arrayLike, results ) {
		// If results is not provided, initialize it as an empty Forge object
		results = results || Forge();
		// Use merge to efficiently copy elements
		return Forge.merge( results, arrayLike );
	}
});

// The buildFragment function is crucial for HTML string parsing.
// Its internal complexity is significant, so we'll leave it as a placeholder,
// but acknowledge its existence and role in the original jQuery.
// For Type III, we acknowledge it exists but don't need to rewrite its complex internals.
var buildFragment = function( html, ownerDoc ) {
    // This is a highly complex function in jQuery that parses HTML strings
    // into a document fragment, handling various browser quirks.
    // For a Type III clone, its full implementation is beyond the scope of
    // demonstrating structural changes, but its interface is preserved.
    // In a real clone, this would be a detailed implementation.
    return {
        fragment: document.createDocumentFragment(), // Placeholder
        cacheable: false // Placeholder
    };
};

// Set up the documentForge reference for convenience
documentForge = Forge(document);

// Expose Forge to the global scope (window)
globalWindow.Forge = globalWindow.$ = Forge;

})();

})( window );