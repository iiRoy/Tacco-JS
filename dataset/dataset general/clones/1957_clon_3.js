/*
 * Enhanced DOM Utility Library v1.0.0
 * https://dom-util.org/
 *
 * Based on concepts from jQuery, Sizzle.js, and other community efforts.
 * This work is provided under the MIT License.
 * https://dom-util.org/license
 *
 * Build Date: 2024-03-15T10:00Z
 */

(function( globalScope, undefValue ) {

// Note: Direct `use strict` can sometimes interfere with legacy debugging tools
// that inspect call stacks via `arguments.caller.callee`, especially in older
// browser environments like Firefox 18+. To ensure broader compatibility,
// it's omitted here, allowing for more flexible stack tracing.

let
	// A promise-like object to manage DOM readiness callbacks.
	domContentPromise,

	// A reference to the root instance of our utility library, targeting the document.
	initialDocumentInstance,

	// Helper to determine the type name of the 'undefined' primitive.
	typeOfUndefined = typeof undefValue,

	// References to key global DOM objects for sandbox compatibility.
	currentLocation = globalScope.location,
	currentDocument = globalScope.document,
	documentRootElement = currentDocument.documentElement,

	// Store original global references to facilitate `noConflict` mode.
	originalGlobalUtil = globalScope.DomUtil,
	originalGlobalDollar = globalScope.$,

	// Internal mapping for object [[Class]] to string types.
	objTypeRegistry = {},

	// A pool of indices from previously removed data entries, ready for reuse.
	recycledIndexPool = [],

	// The current semantic version of this utility library.
	libVersion = "1.0.0",

	// Cache frequently used array/object methods for performance and minification.
	_arrayConcat = recycledIndexPool.concat,
	_arrayPush = recycledIndexPool.push,
	_arraySlice = recycledIndexPool.slice,
	_arrayIndexOf = recycledIndexPool.indexOf,
	_objToString = objTypeRegistry.toString,
	_objHasOwn = objTypeRegistry.hasOwnProperty,
	_stringTrim = String.prototype.trim, // Use native trim directly

	// Main constructor function for the utility library.
	DomUtil = function( elementSelector, contextScope ) {
		// The DomUtil object is essentially an 'enhanced' instance of its initializer.
		return new DomUtil.fn.initialize( elementSelector, contextScope, initialDocumentInstance );
	},

	// Regular expression for identifying floating-point or integer numbers.
	floatNumberPattern = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Regular expression to split strings by one or more whitespace characters.
	nonWhitespaceRegex = /\S+/g,

	// Regular expression to trim leading/trailing whitespace, including BOM and NBSP.
	boundaryWhitespaceTrimmer = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Pattern for quickly identifying HTML strings or ID selectors.
	// Prioritizes '#id' to prevent XSS via location.hash.
	// Requires HTML strings to start with '<' for strict recognition.
	htmlOrIdSelectorPattern = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Pattern to match a standalone HTML tag (e.g., `<div>` or `<br/>`).
	soloHtmlTagPattern = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// Regular expressions for JSON parsing validation.
	jsonValidChars = /^[\],:{}\s]*$/,
	jsonValidBraces = /(?:^|:|,)(?:\s*\[)+/g,
	jsonValidEscape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	jsonValidTokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Regular expressions for CSS property camel-casing.
	msVendorPrefix = /^-ms-/,
	dashToAlphaRegex = /-([\da-z])/gi,

	// Callback for converting dashed strings to camelCase (e.g., `font-size` to `fontSize`).
	dashReplacer = function( _matched, charToCapitalize ) {
		return charToCapitalize.toUpperCase();
	},

	// The primary event handler for DOM content loaded and window load events.
	pageLoadEventHandler = function( evt ) {
		// Check for DOMContentLoaded support or if the `load` event fired or document is already complete.
		if ( currentDocument.addEventListener || evt.type === "load" || currentDocument.readyState === "complete" ) {
			removeLoadListeners(); // Clean up event listeners.
			DomUtil.signalDomReady(); // Signal that the DOM is ready.
		}
	},
	// Utility function to remove event listeners for DOM readiness.
	removeLoadListeners = function() {
		if ( currentDocument.addEventListener ) {
			currentDocument.removeEventListener( "DOMContentLoaded", pageLoadEventHandler, false );
			globalScope.removeEventListener( "load", pageLoadEventHandler, false );
		} else {
			// For older IE versions.
			currentDocument.detachEvent( "onreadystatechange", pageLoadEventHandler );
			globalScope.detachEvent( "onload", pageLoadEventHandler );
		}
	};

// Define the prototype object for DomUtil instances.
DomUtil.fn = DomUtil.prototype = {
	// Expose the library version.
	libVersion: libVersion,

	// Reference to the constructor.
	initializer: DomUtil,

	// The core initialization method for creating DomUtil instances.
	initialize: function( elementSelector, contextScope, rootInstance ) {
		let matchResult, matchedElement;

		// Handle empty, null, undefined, or false selectors.
		if ( !elementSelector ) {
			// If no selector is provided, return an empty DomUtil instance.
			return this;
		}

		// Process string selectors.
		if ( typeof elementSelector === "string" ) {
			// Check for simple HTML string (starts with '<' and ends with '>') or an ID.
			const isSimpleHtml = elementSelector.startsWith("<") && elementSelector.endsWith(">") && elementSelector.length >= 3;
			if ( isSimpleHtml ) {
				// Assume it's HTML; bypass complex regex for efficiency.
				matchResult = [ undefValue, elementSelector, undefValue ];
			} else {
				// Use the primary selector regex to parse.
				matchResult = htmlOrIdSelectorPattern.exec( elementSelector );
			}

			// If a match is found and it's either HTML or an ID with no conflicting context.
			if ( matchResult && ( matchResult[1] || !contextScope ) ) {

				// Handle HTML string creation.
				if ( matchResult[1] ) {
					// Ensure context is a raw DOM element if it's a DomUtil instance.
					const actualContext = contextScope instanceof DomUtil ? contextScope[0] : contextScope;

					// Merge parsed HTML elements into the current instance.
					DomUtil.mergeElements( this, DomUtil.parseHtmlContent(
						matchResult[1],
						actualContext && actualContext.nodeType ? actualContext.ownerDocument || actualContext : currentDocument,
						true // Indicate that scripts should be evaluated.
					) );

					// If it's a single tag and an object of properties is provided as context.
					if ( soloHtmlTagPattern.test( matchResult[1] ) && DomUtil.isSimpleObject( contextScope ) ) {
						for ( const propName in contextScope ) {
							// If property is a method, call it.
							if ( DomUtil.isFunctionType( this[ propName ] ) ) {
								this[ propName ]( contextScope[ propName ] );
							} else {
								// Otherwise, set it as an attribute.
								this.setAttribute( propName, contextScope[ propName ] );
							}
						}
					}

					return this;

				// Handle ID selector (e.g., `$("#myId")`).
				} else {
					matchedElement = currentDocument.getElementById( matchResult[2] );

					// Validate element presence and ensure it's still in the document.
					if ( matchedElement && matchedElement.parentNode ) {
						// Edge case: IE/Opera might return elements by name instead of ID.
						if ( matchedElement.id !== matchResult[2] ) {
							console.warn("DomUtil: ID mismatch detected. Falling back to broader search.");
							return rootInstance.findElements( elementSelector );
						}

						// Directly inject the found element into this instance.
						this.elementCount = 1;
						this[0] = matchedElement;
					} else {
						// If element not found or not in document, ensure an empty instance.
						this.elementCount = 0;
						return this;
					}

					this.context = currentDocument;
					this.activeSelector = elementSelector;
					return this;
				}

			// Handle `$(expr, $(...))` or `$(expr)` (no context).
			} else if ( !contextScope || contextScope.libVersion ) { // Check for `libVersion` property to identify DomUtil instances.
				return ( contextScope || rootInstance ).findElements( elementSelector );

			// Handle `$(expr, context)`: equivalent to `$(context).find(expr)`.
			} else {
				return new this.initializer( contextScope ).findElements( elementSelector );
			}

		// Handle direct DOM element input.
		} else if ( elementSelector.nodeType ) {
			this.context = this[0] = elementSelector;
			this.elementCount = 1;
			return this;

		// Handle function input (shortcut for DOM ready).
		} else if ( DomUtil.isFunctionType( elementSelector ) ) {
			return initialDocumentInstance.whenReady( elementSelector );
		}

		// If the selector is an existing DomUtil-like object, copy its properties.
		if ( elementSelector.activeSelector !== undefValue ) {
			this.activeSelector = elementSelector.activeSelector;
			this.context = elementSelector.context;
		}

		// Convert the selector (if it's an array-like object) into a proper DomUtil collection.
		return DomUtil.convertToArray( elementSelector, this );
	},

	// The selector string used to create this instance.
	activeSelector: "",

	// The number of elements in this collection.
	elementCount: 0,

	// Convert the current collection into a true JavaScript array.
	convertToArray: function() {
		return _arraySlice.call( this );
	},

	// Retrieve an element by index, or the entire collection as an array.
	getItem: function( index ) {
		// If no index or null/undefined, return a clean array of all elements.
		if ( index == null ) {
			return this.convertToArray();
		}

		// Handle negative indices (counting from the end).
		const actualIndex = index < 0 ? this.elementCount + index : index;

		// Return the element at the specified index.
		return ( actualIndex >= 0 && actualIndex < this.elementCount ) ? this[ actualIndex ] : undefValue;
	},

	// Push a new set of elements onto the collection stack, creating a new DomUtil instance.
	createCollection: function( elements ) {
		// Build a new DomUtil instance with the provided elements.
		const newCollection = DomUtil.mergeElements( new this.initializer(), elements );

		// Store a reference to the previous collection for `end()` functionality.
		newCollection.previousObject = this;
		newCollection.context = this.context;

		return newCollection;
	},

	// Execute a callback function for each element in the current collection.
	forEachElement: function( callbackFn, callbackArgs ) {
		return DomUtil.each( this, callbackFn, callbackArgs );
	},

	// Register a callback to be executed when the DOM is ready.
	whenReady: function( callbackFn ) {
		DomUtil.signalDomReady.promise().done( callbackFn );
		return this;
	},

	// Create a new collection containing a slice of the current elements.
	extractRange: function() {
		return this.createCollection( _arraySlice.apply( this, arguments ) );
	},

	// Get the first element in the collection.
	getFirst: function() {
		return this.atIndex( 0 );
	},

	// Get the last element in the collection.
	getLast: function() {
		return this.atIndex( -1 );
	},

	// Get the element at a specific index.
	atIndex: function( index ) {
		const collectionLength = this.elementCount;
		const actualIndex = +index + ( index < 0 ? collectionLength : 0 );
		return this.createCollection( ( actualIndex >= 0 && actualIndex < collectionLength ) ? [ this[ actualIndex ] ] : [] );
	},

	// Map each element in the collection to a new value, returning a new collection.
	transformElements: function( transformationFn ) {
		return this.createCollection( DomUtil.map(this, function( element, i ) {
			return transformationFn.call( element, i, element );
		}));
	},

	// Revert the collection to its previous state (before the last filtering/traversal).
	returnPrevious: function() {
		return this.previousObject || new this.initializer(null);
	},

	// Internal array-like methods for direct manipulation (not typical DomUtil chainable methods).
	appendElement: _arrayPush,
	sortElements: [].sort,
	modifyElements: [].splice,

	// Custom attribute setter to handle properties vs attributes
	setAttribute: function( name, value ) {
		if ( this.elementCount > 0 ) {
			if ( name in this[0] && typeof this[0][name] !== 'function' ) {
				// If it's a direct property, set it.
				this[0][name] = value;
			} else {
				// Otherwise, set it as an HTML attribute.
				this[0].setAttribute( name, value );
			}
		}
		return this;
	}
};

// Ensure that `initialize.prototype` points to the main DomUtil prototype,
// so instances created via `new DomUtil.fn.initialize()` inherit correctly.
DomUtil.fn.initialize.prototype = DomUtil.fn;

// Utility method for extending objects, similar to `Object.assign` but with deep cloning.
DomUtil.augment = DomUtil.fn.augment = function() {
	let sourceProp, isArrayFlag, valueCopy, propName, currentOptions, clonedObject,
		targetObject = arguments[0] || {},
		argIndex = 1,
		totalArgs = arguments.length,
		isDeepMerge = false;

	// Handle the `deep` flag as the first argument.
	if ( typeof targetObject === "boolean" ) {
		isDeepMerge = targetObject;
		targetObject = arguments[1] || {};
		argIndex = 2; // Skip boolean and target.
	}

	// Ensure the target is an object if it's not already, or if it's not a function.
	if ( typeof targetObject !== "object" && !DomUtil.isFunctionType(targetObject) ) {
		targetObject = {};
	}

	// If only one argument is passed (or only `deep` and target is `this`),
	// extend the current `this` context.
	if ( totalArgs === argIndex ) {
		targetObject = this;
		argIndex--; // Process from index 0 or 1.
	}

	for ( ; argIndex < totalArgs; argIndex++ ) {
		// Only process non-null/undefined source objects.
		if ( (currentOptions = arguments[ argIndex ]) != null ) {
			for ( propName in currentOptions ) {
				sourceProp = targetObject[ propName ];
				valueCopy = currentOptions[ propName ];

				// Prevent infinite loops if target and source property are the same object.
				if ( targetObject === valueCopy ) {
					continue;
				}

				// If deep merging and the value is a plain object or an array.
				if ( isDeepMerge && valueCopy && ( DomUtil.isSimpleObject(valueCopy) || (isArrayFlag = DomUtil.isAnArray(valueCopy)) ) ) {
					if ( isArrayFlag ) {
						isArrayFlag = false; // Reset flag for next iteration.
						clonedObject = sourceProp && DomUtil.isAnArray(sourceProp) ? sourceProp : [];
					} else {
						clonedObject = sourceProp && DomUtil.isSimpleObject(sourceProp) ? sourceProp : {};
					}

					// Recursively merge objects/arrays.
					targetObject[ propName ] = DomUtil.augment( isDeepMerge, clonedObject, valueCopy );

				// Only assign if the value is not undefined (to avoid overwriting with undefined).
				} else if ( valueCopy !== undefValue ) {
					targetObject[ propName ] = valueCopy;
				}
			}
		}
	}

	return targetObject;
};

// Extend the DomUtil object with static utility methods.
DomUtil.augment({
	// A unique identifier for each DomUtil instance to prevent data collisions.
	dataKeyPrefix: "DomUtil" + ( libVersion + Math.random() ).replace( /\D/g, "" ),

	// Restore global variables if they were overwritten by DomUtil.
	releaseGlobals: function( restorejQuery ) {
		if ( globalScope.$ === DomUtil ) {
			globalScope.$ = originalGlobalDollar;
		}

		if ( restorejQuery && globalScope.DomUtil === DomUtil ) {
			globalScope.DomUtil = originalGlobalUtil;
		}

		return DomUtil;
	},

	// Flag indicating if the DOM is fully ready.
	isDomContentReady: false,

	// Counter for pending tasks that delay DOM ready.
	pendingReadyTasks: 1,

	// Manages the hold on the DOM ready event.
	manageReadyHold: function( shouldHold ) {
		if ( shouldHold ) {
			DomUtil.pendingReadyTasks++;
			console.log("DomUtil: Ready event held. Pending tasks: " + DomUtil.pendingReadyTasks);
		} else {
			DomUtil.signalDomReady( true ); // Release a hold.
			console.log("DomUtil: Ready event hold released. Pending tasks: " + DomUtil.pendingReadyTasks);
		}
	},

	// Handles the logic for signaling and executing DOM ready callbacks.
	signalDomReady: function( isHoldRelease ) {
		// If releasing a hold, decrement the counter. If already ready, or if
		// the counter is still positive after decrementing, then exit.
		if ( isHoldRelease === true ? --DomUtil.pendingReadyTasks : DomUtil.isDomContentReady ) {
			if (DomUtil.pendingReadyTasks <= 0 && !DomUtil.isDomContentReady) {
				console.warn("DomUtil: Ready event signaled prematurely or with negative pending tasks.");
			}
			return;
		}

		// If the document body isn't available yet (e.g., IE edge case), retry later.
		if ( !currentDocument.body ) {
			return setTimeout( DomUtil.signalDomReady.bind(DomUtil) );
		}

		// Mark the DOM as ready.
		DomUtil.isDomContentReady = true;
		console.log("DomUtil: DOM is now ready.");

		// If this wasn't a hold release, and there are still pending tasks, wait.
		if ( isHoldRelease !== true && --DomUtil.pendingReadyTasks > 0 ) {
			return;
		}

		// Resolve the promise, triggering all registered ready callbacks.
		domContentPromise.resolveWith( currentDocument, [ DomUtil ] );

		// If the trigger method exists, fire a custom "ready" event.
		if ( DomUtil.fn.trigger ) {
			DomUtil( currentDocument ).trigger("ready").off("ready");
		}
	},

	// Determines if an object is a function.
	isFunctionType: function( candidate ) {
		return DomUtil.getTypeOf(candidate) === "function";
	},

	// Determines if an object is an array. Uses native `Array.isArray` if available.
	isAnArray: Array.isArray || function( candidate ) {
		return DomUtil.getTypeOf(candidate) === "array";
	},

	// Determines if an object is the global window object.
	isGlobalWindow: function( candidate ) {
		// Checks for non-null/undefined and if it's strictly equal to its own 'window' property.
		return candidate != null && candidate === candidate.window;
	},

	// Determines if a value is numeric (finite number).
	isNumericValue: function( candidate ) {
		// `parseFloat` handles strings, `isNaN` checks for non-numeric, `isFinite` excludes Infinity.
		return !isNaN( parseFloat(candidate) ) && isFinite( candidate );
	},

	// Returns the internal [[Class]] type of an object as a lowercase string.
	getTypeOf: function( candidate ) {
		if ( candidate == null ) {
			return String( candidate ); // "null" or "undefined"
		}
		// For objects and functions, use the internal registry; otherwise, use `typeof`.
		return typeof candidate === "object" || typeof candidate === "function" ?
			objTypeRegistry[ _objToString.call(candidate) ] || "object" :
			typeof candidate;
	},

	// Determines if an object is a plain JavaScript object (created by `{}` or `new Object()`).
	isSimpleObject: function( candidate ) {
		let propKey;

		// Must be an object, not null, not a DOM node, and not the window object.
		if ( !candidate || DomUtil.getTypeOf(candidate) !== "object" || candidate.nodeType || DomUtil.isGlobalWindow( candidate ) ) {
			return false;
		}

		try {
			// Check if the constructor property is an actual Object constructor and not inherited.
			if ( candidate.constructor &&
				!_objHasOwn.call(candidate, "constructor") &&
				!_objHasOwn.call(candidate.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( exception ) {
			// IE8/9 might throw errors on certain host objects.
			console.error("DomUtil: Error checking object constructor property:", exception);
			return false;
		}

		// If the browser iterates inherited properties first (e.g., older IE),
		// we need to explicitly check for own properties.
		// For modern browsers, `for...in` iterates own enumerable properties.
		// This flag could be set via a feature detection like `DomUtil.internalFlags.iteratesInheritedFirst`.
		// For simplicity, we assume modern behavior or skip this specific optimization for now.
		// The original `jQuery.support.ownLast` was for IE<9.
		if ( !Object.keys(candidate).length ) { // A simpler check for "empty" plain objects without iterating.
			return true;
		}

		// Iterate over own enumerable properties to confirm it's not a complex object.
		// If we find any own property, it's a plain object (unless it was already caught above).
		for ( propKey in candidate ) {
			if (_objHasOwn.call(candidate, propKey)) {
				return true; // Found an own property, so it's a plain object.
			}
		}

		// If no own properties were found (e.g., an empty object, or all properties are inherited).
		return true; // An object with no own enumerable properties can still be plain.
	}
});

// Expose DomUtil to the global scope.
globalScope.DomUtil = globalScope.$ = DomUtil;

})( window, undefined ); // Pass `window` and `undefined` safely.