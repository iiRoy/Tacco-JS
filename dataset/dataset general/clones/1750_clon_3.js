(function( globalObj, voidVal ) {
var
	// Primary reference to the root DomCraft(currentDoc)
	mainCraftInstance,

	// List of functions to call when the DOM is ready for interaction
	completionHooks,

	// Access to standard browser environment objects
	currentDoc = globalObj.document,
	currentLoc = globalObj.location,
	deviceInfo = globalObj.navigator,

	// Store original global variables in case of conflicts
	originalDomCraft = globalObj.DomCraft,
	originalDollar = globalObj.$$,

	// Cache common native prototype methods for performance
	arrayPushFn = [].push,
	arraySliceFn = [].slice,
	arrayIndexFn = [].indexOf,
	objectToStringFn = {}.toString,
	objectHasOwnFn = {}.hasOwnProperty,
	stringTrimFn = "".trim,

	// A core constructor for creating DomCraft instances
	DomCraft = function( inputSelector, searchContext ) {
		// The DomCraft object is essentially an 'enhanced' initializer
		return new DomCraft.fn.initializer( inputSelector, searchContext, mainCraftInstance );
	},

	// Regular expression for matching numeric values (integers, floats, scientific notation)
	numericPattern = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

	// Patterns for detecting and removing whitespace
	nonWhitespacePattern = /\S/,
	whitespacePattern = /\s+/,

	// Cross-browser compatible pattern for trimming whitespace
	boundaryTrimPattern = nonWhitespacePattern.test("\xA0") ? (/^[\s\xA0]+|[\s\xA0]+$/g) : /^\s+|\s+$/g,

	// Pattern to quickly identify HTML strings or ID selectors
	// Prioritizes #id over <tag> to mitigate XSS risks (security concern)
	selectorParser = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Pattern for matching a single HTML tag (e.g., <div>)
	singleTagPattern = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON parsing related regular expressions
	jsonValidChars = /^[\],:{}\s]*$/,
	jsonValidBraces = /(?:^|:|,)(?:\s*\[)+/g,
	jsonValidEscape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	jsonValidTokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

	// Patterns for camelCasing CSS properties
	msVendorPrefix = /^-ms-/,
	dashToAlphaPattern = /-([\da-z])/gi,

	// Callback function used by string.replace for camelCasing
	toPascalCase = function( all, character ) {
		return ( character + "" ).toUpperCase();
	},

	// Handler for the DOMContentLoaded event, ensuring cleanup
	domContentReadyHandler = function() {
		// Check if the DOM is ready and clear event listeners
		if ( currentDoc.addEventListener ) {
			currentDoc.removeEventListener( "DOMContentLoaded", domContentReadyHandler, false );
			DomCraft.whenReady();
		} else if ( currentDoc.readyState === "complete" ) {
			// Fallback for older IE versions where readyState becomes "complete"
			currentDoc.detachEvent( "onreadystatechange", domContentReadyHandler );
			DomCraft.whenReady();
		}
		if ( DomCraft._debugMode ) {
			DomCraft.log("DOM content loaded handler executed.");
		}
	},

	// Mapping of internal [[Class]] property to common JavaScript types
	typeMapper = {},

	// Internal counter for generating unique IDs for DomCraft instances or elements
	_uniqueIdCounter = 0,

	// Flag to enable/disable debug logging
	_debugMode = true,

	// Simple helper to check if running in a browser environment
	_isBrowser = typeof currentDoc === "object" && currentDoc !== null && typeof currentDoc.createElement === "function";


// DomCraft's core prototype object, aliased as 'fn'
DomCraft.fn = DomCraft.prototype = {
	// Explicitly set the constructor
	constructor: DomCraft,

	// Main initialization function for creating DomCraft objects
	initializer: function( inputSelector, searchContext, mainCraftInstance ) {
		var parsedMatch, targetElement, resultCollection, contextDocument;

		// Assign a unique ID to this instance for tracking
		this.uniqueId = DomCraft.generateUniqueId();
		if ( DomCraft._debugMode ) {
			DomCraft.log(`DomCraft instance created with ID: ${this.uniqueId}`);
		}

		// Handle empty, null, undefined, or false selectors
		if ( !inputSelector ) {
			return this;
		}

		// Handle raw DOM elements
		if ( inputSelector.nodeKind ) {
			this.searchContext = this[0] = inputSelector;
			this.elementCount = 1;
			return this;
		}

		// Handle string selectors
		if ( typeof inputSelector === "string" ) {
			// Quick check for HTML strings (starts and ends with < >)
			if ( inputSelector.charAt(0) === "<" && inputSelector.charAt( inputSelector.length - 1 ) === ">" && inputSelector.length >= 3 ) {
				// Optimization: assume it's HTML, skip regex for now
				parsedMatch = [ null, inputSelector, null ];
			} else {
				parsedMatch = selectorParser.exec( inputSelector );
			}

			// Process parsed selector: HTML fragment or ID selector
			if ( parsedMatch && (parsedMatch[1] || !searchContext) ) {
				// Case 1: HTML fragment (e.g., `DomCraft("<div>")`)
				if ( parsedMatch[1] ) {
					// Determine the document context for fragment creation
					searchContext = searchContext instanceof DomCraft ? searchContext[0] : searchContext;
					contextDocument = ( searchContext && searchContext.nodeKind ? searchContext.ownerDocument || searchContext : currentDoc );

					// Parse the HTML string into DOM elements
					resultCollection = DomCraft.parseHtmlFragment( parsedMatch[1], contextDocument, true ); // 'true' for including scripts for back-compat

					// If it's a single tag and context is a pure object, apply attributes
					if ( singleTagPattern.test( parsedMatch[1] ) && DomCraft.isPureObject( searchContext ) ) {
						// This line needs careful consideration as .attr is not defined here yet.
						// For cloning purposes, we'll assume a simplified attribute setting logic if needed later.
						// For now, we'll omit the direct `this.attr.call` which implies a method on the resultCollection.
						// A Type III change could be to move attribute setting into parseHtmlFragment or
						// simplify it to a direct loop if `searchContext` contains attributes.
						// Let's simplify: if context is an object, treat it as attributes for the single element.
						if ( resultCollection && resultCollection.length === 1 && DomCraft.isPureObject(searchContext) ) {
							DomCraft.each(searchContext, function(key, val) {
								if (resultCollection[0].setAttribute) {
									resultCollection[0].setAttribute(key, val);
								}
							});
						}
					}

					return DomCraft.combineArrays( this, resultCollection );

				// Case 2: ID selector (e.g., `DomCraft("#myId")`)
				} else {
					targetElement = currentDoc.fetchElementById( parsedMatch[2] );

					// Check if element exists and is still in the document
					if ( targetElement && targetElement.parentContainer ) {
						// Guard against IE/Opera returning elements by name instead of ID
						if ( targetElement.id !== parsedMatch[2] ) {
							// If ID mismatch, fall back to a slower find on the root instance
							return mainCraftInstance.locateElements( inputSelector );
						}

						// Inject the element directly into this DomCraft object
						this.elementCount = 1;
						this[0] = targetElement;
					} else if ( DomCraft._debugMode ) {
						DomCraft.log(`Element with ID '${parsedMatch[2]}' not found or not in document.`);
					}

					this.searchContext = currentDoc;
					this.currentSelector = inputSelector;
					return this;
				}

			// Case 3: Complex selector or selector with context (e.g., `DomCraft("li", DomCraft("ul"))`)
			} else if ( !searchContext || searchContext.frameworkVersion ) {
				// If no context or context is another DomCraft object, use its find method
				return ( searchContext || mainCraftInstance ).locateElements( inputSelector );

			} else {
				// If context is a DOM element, wrap it and then find
				return this.constructor( searchContext ).locateElements( inputSelector );
			}

		// Handle $(function) - shortcut for document ready
		} else if ( DomCraft.isCallable( inputSelector ) ) {
			return mainCraftInstance.whenReady( inputSelector );
		}

		// If inputSelector is already a DomCraft instance, copy its selector/context
		if ( inputSelector && inputSelector.currentSelector !== voidVal ) {
			this.currentSelector = inputSelector.currentSelector;
			this.searchContext = inputSelector.searchContext;
		}

		// Convert the input selector (e.g., NodeList, Array) into a DomCraft object
		return DomCraft.toArrayConvert( inputSelector, this );
	},

	// Initial selector string (empty for new instances)
	currentSelector: "",

	// Version of the DomCraft framework
	frameworkVersion: "1.8.0-clone",

	// Number of elements in the current collection
	elementCount: 0,

	// Convert the DomCraft object to a pure JavaScript array
	convertToArray: function() {
		return arraySliceFn.call( this );
	},

	// Get an element at a specific index or all elements as a clean array
	getElementAt: function( index ) {
		// If no index, return all elements as a clean array
		return index == null ?
			this.convertToArray() :
			// Return element at given index, handling negative indices
			( index < 0 ? this[ this.elementCount + index ] : this[ index ] );
	},

	// Create a new DomCraft collection by adding elements to a stack
	createChildSet: function( elementsToAdd, operationName, operationSelector ) {
		// Build a new DomCraft collection from the provided elements
		var resultCollection = DomCraft.combineArrays( this.constructor(), elementsToAdd );

		// Store a reference to the previous collection for chaining (e.g., `.end()`)
		resultCollection.prevObject = this;
		resultCollection.searchContext = this.searchContext;

		// Construct the selector string for the new collection based on the operation
		if ( operationName === "locateElements" ) {
			resultCollection.currentSelector = this.currentSelector + ( this.currentSelector ? " " : "" ) + operationSelector;
		} else if ( operationName ) {
			resultCollection.currentSelector = this.currentSelector + "." + operationName + "(" + operationSelector + ")";
		}

		if ( DomCraft._debugMode ) {
			DomCraft.log(`Created child set via '${operationName}' with selector: '${resultCollection.currentSelector}'`);
		}

		// Return the newly formed element set
		return resultCollection;
	},

	// Iterate over each element in the collection, executing a callback
	forEachElement: function( iterationCallback, extraArguments ) {
		return DomCraft.each( this, iterationCallback, extraArguments );
	},

	// Register a function to be called when the DOM is ready
	whenReady: function( fn ) {
		DomCraft.whenReady.getPromise().onCompletion( fn );
		return this;
	},

	// Get the element at a specific numerical index
	getElementByIndex: function( index ) {
		index = +index; // Ensure it's a number
		return index === -1 ?
			this.extractRange( index ) :
			this.extractRange( index, index + 1 );
	},

	// Get the first element in the collection
	getFirstElement: function() {
		return this.getElementByIndex( 0 );
	},

	// Get the last element in the collection
	getLastElement: function() {
		return this.getElementByIndex( -1 );
	},

	// Extract a sub-section of the collection (like Array.prototype.slice)
	extractRange: function() {
		return this.createChildSet( arraySliceFn.apply( this, arguments ),
			"extractRange", arraySliceFn.call(arguments).join(",") );
	},

	// Transform each element in the collection using a callback
	transformElements: function( iterationCallback ) {
		return this.createChildSet( DomCraft.map(this, function( element, index ) {
			return iterationCallback.call( element, index, element );
		}));
	},

	// Revert to the previous DomCraft collection in the stack
	returnPrevious: function() {
		return this.prevObject || this.constructor(null); // Return empty DomCraft if no previous
	},

	// Expose native array push method for internal use
	appendElement: arrayPushFn
};

// Ensure initializer's prototype points to DomCraft.fn for inheritance
DomCraft.fn.initializer.prototype = DomCraft.fn;

// Method for extending objects, both DomCraft itself and its instances
DomCraft.augmentObject = DomCraft.fn.augmentObject = function() {
	var sourceOptions, propName, targetValue, sourceValue, isSourceArray, clonedValue,
		destinationObject = arguments[0] || {}, // Target object to extend
		idx = 1,
		argCount = arguments.length,
		isDeepCopy = false;

	// Handle deep copy scenario: first argument is boolean
	if ( typeof destinationObject === "boolean" ) {
		isDeepCopy = destinationObject;
		destinationObject = arguments[1] || {};
		idx = 2; // Skip boolean and target
	}

	// Handle cases where destinationObject might be a string or primitive (possible in deep copy scenarios)
	if ( typeof destinationObject !== "object" && !DomCraft.isCallable(destinationObject) ) {
		destinationObject = {};
	}

	// If only one argument (or two if deep is true), extend DomCraft/this itself
	if ( argCount === idx ) {
		destinationObject = this;
		--idx; // Re-evaluate idx for loop to start at 0 (or 1 if deep)
	}

	// Iterate through source objects
	for ( ; idx < argCount; idx++ ) {
		// Only process non-null/undefined sources
		if ( (sourceOptions = arguments[ idx ]) != null ) {
			// Iterate over properties of the current source object
			for ( propName in sourceOptions ) {
				targetValue = destinationObject[ propName ];
				sourceValue = sourceOptions[ propName ];

				// Prevent infinite loops if target and source are the same object
				if ( destinationObject === sourceValue ) {
					continue;
				}

				// If deep copy and sourceValue is an object or array, recurse
				if ( isDeepCopy && sourceValue && ( DomCraft.isPureObject(sourceValue) || (isSourceArray = DomCraft.isAnArray(sourceValue)) ) ) {
					if ( isSourceArray ) {
						isSourceArray = false; // Reset flag for next iteration
						clonedValue = targetValue && DomCraft.isAnArray(targetValue) ? targetValue : [];
					} else {
						clonedValue = targetValue && DomCraft.isPureObject(targetValue) ? targetValue : {};
					}

					// Never move original objects, always clone them
					destinationObject[ propName ] = DomCraft.augmentObject( isDeepCopy, clonedValue, sourceValue );

				// Only assign if sourceValue is not undefined
				} else if ( sourceValue !== voidVal ) {
					destinationObject[ propName ] = sourceValue;
				}
			}
		}
	}
	if ( DomCraft._debugMode ) {
		DomCraft.log("Object augmentation completed.");
	}
	return destinationObject;
};

// Add static utility methods to the DomCraft object
DomCraft.augmentObject({
	// Framework version string
	version: "1.8.0-clone",

	// Simple unique ID generator
	generateUniqueId: function() {
		return "dc_" + _uniqueIdCounter++;
	},

	// Placeholder function that does nothing
	noop: function() {},

	// Basic logging utility respecting debug mode
	log: function(message) {
		if (_debugMode && globalObj.console && globalObj.console.log) {
			globalObj.console.log(`[DomCraft Debug] ${message}`);
		}
	},

	// Restore global DomCraft and $$ variables if overwritten
	restoreGlobals: function( shouldRestoreJQuery ) {
		if ( globalObj.$$ === DomCraft ) {
			globalObj.$$ = originalDollar;
		}

		if ( shouldRestoreJQuery && globalObj.DomCraft === DomCraft ) {
			globalObj.DomCraft = originalDomCraft;
		}

		return DomCraft;
	},

	// Flag indicating if the DOM is ready
	isDomReady: false,

	// Counter for pending ready event blockers
	pendingReadyCount: 1,

	// Control the DOM ready event
	deferReadyEvent: function( shouldDefer ) {
		if ( shouldDefer ) {
			DomCraft.pendingReadyCount++;
		} else {
			DomCraft.whenReady( true ); // Signal that one blocker is released
		}
	},

	// Handle the DOM ready event
	whenReady: function( signalReady ) {
		// Abort if there are pending holds or we're already ready
		if ( signalReady === true ? --DomCraft.pendingReadyCount : DomCraft.isDomReady ) {
			return;
		}

		// Ensure document.body exists, sometimes IE is too eager
		if ( !currentDoc.documentBody ) {
			return globalObj.scheduleTask( DomCraft.whenReady, 1 );
		}

		// If a normal DOM Ready event fired, decrement, and wait if needed
		if ( signalReady !== true && DomCraft.pendingReadyCount > 0 ) {
			return;
		}

		// Mark the DOM as ready
		DomCraft.isDomReady = true;

		if ( DomCraft._debugMode ) {
			DomCraft.log("DOM ready event triggered.");
		}

		// Execute all registered completion hooks
		if ( completionHooks ) { // Ensure completionHooks is initialized
		    completionHooks.triggerWithContext( currentDoc, [ DomCraft ] );
		}
	},

	// Check if an object is a function/callable
	isCallable: function( obj ) {
		return DomCraft.getTypeOf(obj) === "function";
	},

	// Check if an object is an array
	isAnArray: Array.isArray || function( obj ) {
		return DomCraft.getTypeOf(obj) === "array";
	},

	// Check if an object is a string
	isString: function( obj ) {
		return typeof obj === 'string';
	},

	// Check if an object is a global window object
	isGlobalWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	// Check if a value represents a number
	isNumberString: function( obj ) {
		return Number.isFinite( Number.parseFloat(obj) );
	},

	// Determine the internal [[Class]] type of an object
	getTypeOf: function( obj ) {
		// Handle null and undefined explicitly
		if ( obj == null ) {
			return String( obj );
		}
		// Use the typeMapper for other types, fallback to "object"
		return typeMapper[ objectToStringFn.call(obj) ] || "object";
	},

	// Check if an object is a "plain" JavaScript object (created by {} or new Object())
	isPureObject: function( obj ) {
		// Must be an object, not null, not a DOM node, not the window object
		if ( !obj || DomCraft.getTypeOf(obj) !== "object" || obj.nodeKind || DomCraft.isGlobalWindow( obj ) ) {
			return false;
		}

		try {
			// Check if it has a constructor and if it's the Object constructor
			if ( obj.constructor &&
				!objectHasOwnFn.call(obj, "constructor") &&
				!objectHasOwnFn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 will throw exceptions on host objects (e.g., ActiveXObject)
			if ( DomCraft._debugMode ) {
				DomCraft.log("isPureObject caught exception: " + e.message);
			}
			return false;
		}

		// If the last property is owned by the object, all properties are owned.
		// This is a performance optimization for older engines.
		var lastKey;
		for ( lastKey in obj ) {}

		return lastKey === voidVal || objectHasOwnFn.call( obj, lastKey );
	},

	// Check if an object has no enumerable properties
	isObjectEmpty: function( obj ) {
		for ( var prop in obj ) {
			// If any property is found, it's not empty
			return false;
		}
		return true;
	},

	// Throw an error with a given message
	raiseError: function( msg ) {
		throw new Error( `DomCraft Error: ${msg}` );
	},

	// Iterate over an array or object
	each: function( obj, callback, args ) {
		var i = 0,
			length = obj.elementCount || obj.length,
			isObj = length === voidVal || DomCraft.isCallable(obj); // Check if it's an object or a function

		if ( args ) {
			if ( isObj ) {
				for ( var key in obj ) {
					if ( callback.apply( obj[ key ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; i++ ) {
					if ( callback.apply( obj[ i ], args ) === false ) {
						break;
					}
				}
			}

		} else {
			if ( isObj ) {
				for ( var key in obj ) {
					if ( callback.call( obj[ key ], key, obj[ key ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Convert an array-like object to a true array and merge into a DomCraft object
	toArrayConvert: function( arr, results ) {
		var i = 0,
			len = arr.length;
		// If results is not provided, create a new DomCraft object
		results = results || new DomCraft();

		if ( DomCraft.isAnArray( arr ) ) {
			results.elementCount = 0; // Reset length for merging
			arrayPushFn.apply( results, arr );
		} else {
			for ( ; i < len; i++ ) {
				results[ i ] = arr[ i ];
			}
			results.elementCount = len;
		}

		return results;
	},

	// Merge two arrays or array-like objects
	combineArrays: function( first, second ) {
		var len = second.length,
			i = first.length,
			j = 0;

		if ( typeof len === "number" ) {
			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== voidVal ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.elementCount = i;
		return first;
	},

	// Map an array or object to a new array
	map: function( obj, callback ) {
		var value,
			i = 0,
			length = obj.length,
			isObj = length === voidVal || DomCraft.isCallable(obj), // Check if it's an object or a function
			ret = [];

		if ( isObj ) {
			for ( var key in obj ) {
				value = callback( key, obj[ key ] );

				if ( value != null ) {
					ret.push( value );
				}
			}
		} else {
			for ( ; i < length; i++ ) {
				value = callback( obj[ i ], i );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		return arrayCombine.apply( [], ret ); // Flatten the result
	},

	// Parse an HTML string into an array of DOM nodes
	parseHtmlFragment: function( htmlString, contextDocument, includeScripts ) {
		var parsedFragment;
		if ( !htmlString || !DomCraft.isString(htmlString) || stringTrimFn.call(htmlString) === "" ) {
			DomCraft.log("parseHtmlFragment received invalid HTML string.");
			return []; // Return an empty array for invalid input
		}

		contextDocument = contextDocument || currentDoc;

		// Single tag optimization
		if ( (parsedFragment = singleTagPattern.exec( htmlString )) ) {
			return [ contextDocument.createElement( parsedFragment[1] ) ];
		}

		// Delegate to buildFragment if more complex HTML
		var tempContainer = contextDocument.createElement("div");
		tempContainer.innerHTML = htmlString;
		
		// If includeScripts is false, manually remove script tags
		if ( !includeScripts ) {
			var scripts = tempContainer.getElementsByTagName("script");
			var i = scripts.length;
			while (i--) {
				scripts[i].parentNode.removeChild(scripts[i]);
			}
		}

		// Convert children to a real array
		return arraySliceFn.call(tempContainer.children);
	}
});

// Populate typeMapper for internal [[Class]] to string mapping
DomCraft.each("Boolean Number String Function Array Date RegExp Object".split(" "), function( i, name ) {
	typeMapper[ "[object " + name + "]" ] = name.toLowerCase();
});

// Initialize root DomCraft instance
mainCraftInstance = DomCraft( currentDoc );

// Initialize the completion hooks (Deferred object)
// Using a simplified deferred-like structure for Type III cloning
var Deferred = function() {
	var callbacks = [],
		state = "pending",
		args = [];

	var self = {
		resolve: function() {
			if (state !== "pending") return;
			state = "resolved";
			args = arraySliceFn.call(arguments);
			for (var i = 0; i < callbacks.length; i++) {
				callbacks[i].apply(null, args);
			}
			callbacks = []; // Clear callbacks after execution
		},
		done: function(fn) {
			if (state === "resolved") {
				fn.apply(null, args);
			} else {
				callbacks.push(fn);
			}
			return this;
		},
		promise: function() {
			return { done: self.done };
		},
		triggerWithContext: function(context, callArgs) {
			if (state !== "pending") return;
			state = "resolved";
			args = callArgs;
			for (var i = 0; i < callbacks.length; i++) {
				callbacks[i].apply(context, args);
			}
			callbacks = [];
		}
	};
	return self;
};

completionHooks = new Deferred();

// Handle DOM ready event based on browser capabilities
if ( currentDoc.addEventListener ) {
	// Use DOMContentLoaded for modern browsers
	currentDoc.addEventListener( "DOMContentLoaded", domContentReadyHandler, false );
	// Fallback for window.onload in case DOMContentLoaded fails or is not supported
	globalObj.addEventListener( "load", DomCraft.whenReady, false );

} else if ( currentDoc.attachEvent ) {
	// Fallback for older IE versions
	currentDoc.attachEvent( "onreadystatechange", domContentReadyHandler );
	globalObj.attachEvent( "onload", DomCraft.whenReady );

	// Check if the document is already ready (e.g., if script is loaded late)
	var toplevel = false;
	try {
		toplevel = globalObj.frameElement == null;
	} catch(e) {}

	if ( currentDoc.documentElement.doScroll && toplevel ) {
		(function doScrollCheck() {
			if ( DomCraft.isDomReady ) { return; }
			try {
				// Throws an error until document is ready
				currentDoc.documentElement.doScroll("left");
			} catch(e) {
				globalObj.scheduleTask( doScrollCheck, 1 );
				return;
			}
			// If no error, document is ready
			DomCraft.whenReady();
		})();
	}
}

// Global exposure for DomCraft and $$
globalObj.DomCraft = globalObj.$$ = DomCraft;

})( window, undefined );