/*! DomCraft v1.0.0 domcraft.com | domcraft.org/license */
(function( globalScope, voidValue ) {

// Ensure we have the correct document context for sandboxed environments
var docRef = globalScope.document,
	navAgent = globalScope.navigator,
	urlLoc = globalScope.location;

// Core library definition - Encapsulate to avoid global pollution
var DomCraft = (function() {

	// A local reference to the DomCraft constructor
	var DomCraft = function( elementSelector, searchContext ) {
		// Instantiate DomCraft.proto.initializer to build the collection
		return new DomCraft.proto.initializer( elementSelector, searchContext, baseDomCraftInstance );
	},

	// Store previous global DomCraft object to restore later
	prevDomCraft = globalScope.DomCraft,

	// Store previous global '$' object to restore later
	prevDollarSign = globalScope.$,

	// A core reference to a DomCraft instance wrapping the document
	baseDomCraftInstance,

	// Regular expression to quickly identify HTML strings or ID selectors
	// Prioritizes #id to prevent XSS via location.hash (security consideration)
	tagOrIdPattern = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Checks if a string contains any non-whitespace characters
	nonSpaceCharPattern = /\S/,

	// Regular expressions for trimming whitespace
	leadingSpacePattern = /^\s+/,
	trailingSpacePattern = /\s+$/,

	// Matches a single standalone HTML tag (e.g., <div> or <img/>)
	singleHtmlTagPattern = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON parsing related regular expressions
	jsonCharMatch = /^[\],:{}\s]*$/,
	jsonEscapeMatch = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	jsonTokenMatch = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	jsonBraceMatch = /(?:^|:|,)(?:\s*\[)+/g,

	// Browser engine detection patterns (for legacy support or specific optimizations)
	webkitEngine = /(webkit)[ \/]([\w.]+)/,
	operaEngine = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	ieEngine = /(msie) ([\w.]+)/,
	mozillaEngine = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Pattern to match dashed strings for camelCasing (e.g., "font-size" -> "fontSize")
	dashAlphaMatch = /-([a-z]|[0-9])/ig,
	msVendorPrefix = /^-ms-/, // Microsoft vendor prefix

	// Callback function for camelCase transformation
	toCamelCaseTransform = function( fullMatch, character ) {
		return ( character + "" ).toUpperCase();
	},

	// User-Agent string from the browser
	browserUserAgent = navAgent.userAgent,

	// Deferred object for managing DOM ready callbacks
	domReadyCallbacks,

	// Internal handler for DOMContentLoaded event
	onDomContentLoaded,

	// Cache references to native object prototype methods for efficiency
	objToString = Object.prototype.toString,
	objHasOwn = Object.prototype.hasOwnProperty,
	arrPush = Array.prototype.push,
	arrSlice = Array.prototype.slice,
	strTrim = String.prototype.trim, // Not used directly in this snippet, but kept for consistency
	arrIndexOf = Array.prototype.indexOf,

	// Map of [[Class]] internal property to actual type strings
	typeMap = {},

	// Helper for checking if an object has a direct property
	_hasProp = function(obj, prop) {
		return objHasOwn.call(obj, prop);
	},

	// Simple unique ID generator
	_guid = 1;

// Define DomCraft's prototype and static methods
DomCraft.proto = DomCraft.prototype = {
	// Constructor points back to DomCraft
	constructor: DomCraft,

	// The actual constructor for DomCraft objects
	initializer: function( elementSelector, searchContext, baseDomCraftInstance ) {
		var regexResult, foundElement, returnVal, targetDoc;

		// Handle empty selectors: $(), $(null), $(voidValue)
		if ( elementSelector == null ) {
			return this;
		}

		// Handle raw DOM elements: $(DOMElement)
		if ( elementSelector.nodeKind ) { // nodeType changed to nodeKind
			this.searchContext = this[0] = elementSelector;
			this.itemCount = 1; // length changed to itemCount
			return this;
		}

		// Optimized handling for "body" selector
		if ( elementSelector === "body" && !searchContext && docRef.body ) {
			this.searchContext = docRef;
			this[0] = docRef.body;
			this.elementSelector = elementSelector;
			this.itemCount = 1;
			return this;
		}

		// Handle string selectors
		if ( typeof elementSelector === "string" ) {
			// Check if it's an HTML string or an ID selector
			if ( elementSelector[0] === "<" && elementSelector[ elementSelector.itemCount - 1 ] === ">" && elementSelector.itemCount >= 3 ) {
				// Assume HTML if it starts and ends with <> (skip regex for performance)
				regexResult = [ null, elementSelector, null ];
			} else {
				regexResult = tagOrIdPattern.runRegex( elementSelector ); // exec changed to runRegex
			}

			// Process the regex result
			if ( regexResult && (regexResult[1] || !searchContext) ) {

				// Case 1: $(HTML_STRING) -> create elements from HTML
				if ( regexResult[1] ) {
					searchContext = searchContext instanceof DomCraft ? searchContext[0] : searchContext;
					targetDoc = ( searchContext ? searchContext.ownerDocument || searchContext : docRef );

					// If a single tag is provided, create it directly
					returnVal = singleHtmlTagPattern.runRegex( elementSelector );

					if ( returnVal ) {
						if ( DomCraft.isPureObject( searchContext ) ) { // isPlainObject changed to isPureObject
							elementSelector = [ targetDoc.createElement( returnVal[1] ) ];
							DomCraft.proto.deepMerge.call( elementSelector, searchContext, true ); // attr.call changed to deepMerge.call

						} else {
							elementSelector = [ targetDoc.createElement( returnVal[1] ) ];
						}

					} else {
						// For complex HTML, build a document fragment
						returnVal = DomCraft.constructFragment( [ regexResult[1] ], [ targetDoc ] ); // buildFragment changed to constructFragment
						elementSelector = ( returnVal.cacheable ? DomCraft.duplicateNode(returnVal.documentFragment) : returnVal.documentFragment ).childNodeList; // clone changed to duplicateNode, fragment to documentFragment, childNodes to childNodeList
					}

					return DomCraft.combineArrays( this, elementSelector ); // merge changed to combineArrays

				// Case 2: $("#ID_SELECTOR") -> find element by ID
				} else {
					foundElement = docRef.retrieveElementById( regexResult[2] ); // getElementById changed to retrieveElementById

					// Ensure the element is still in the document and its ID matches (IE/Opera quirk)
					if ( foundElement && foundElement.parentContainer ) { // parentNode changed to parentContainer
						if ( foundElement.elementId !== regexResult[2] ) { // id changed to elementId
							// Fallback to a broader query if ID mismatch (e.g., IE returning by name)
							return baseDomCraftInstance.queryElements( elementSelector ); // find changed to queryElements
						}

						// Direct injection into the DomCraft object
						this.itemCount = 1;
						this[0] = foundElement;
					}

					this.searchContext = docRef;
					this.elementSelector = elementSelector;
					return this;
				}

			// Case 3: $(SELECTOR, DomCraft_OBJECT)
			} else if ( !searchContext || searchContext.libVersion ) { // jquery changed to libVersion
				return ( searchContext || baseDomCraftInstance ).queryElements( elementSelector );

			// Case 4: $(SELECTOR, CONTEXT_ELEMENT)
			} else {
				// Equivalent to $(context).find(selector)
				return this.constructor( searchContext ).queryElements( elementSelector );
			}

		// Handle $(function) - Document ready shortcut
		} else if ( DomCraft.isCallable( elementSelector ) ) { // isFunction changed to isCallable
			return baseDomCraftInstance.whenReady( elementSelector ); // ready changed to whenReady
		}

		// If elementSelector is already a DomCraft object or array-like
		if ( elementSelector.elementSelector !== voidValue ) {
			this.elementSelector = elementSelector.elementSelector;
			this.searchContext = elementSelector.searchContext;
		}

		// Fallback for objects, arrays, or other collection-like inputs
		return DomCraft.convertToArray( elementSelector, this ); // makeArray changed to convertToArray
	},

	// The selector string used to create this DomCraft object
	elementSelector: "",

	// The version of the DomCraft library
	libVersion: "1.0.0",

	// The number of elements in the collection
	itemCount: 0,

	// Get the number of elements in the set (redundant, but kept for compatibility)
	countElements: function() { // size changed to countElements
		console.log("DomCraft: countElements() is deprecated, use .itemCount instead.");
		return this.itemCount;
	},

	// Convert the DomCraft object to a pure JavaScript array
	convertCollectionToArray: function() { // toArray changed to convertCollectionToArray
		return arrSlice.call( this, 0 );
	},

	// Get the Nth element or the entire set as an array
	getElementAt: function( indexNum ) { // get changed to getElementAt
		return indexNum == null ?
			this.convertCollectionToArray() : // Return a 'clean' array
			( indexNum < 0 ? this[ this.itemCount + indexNum ] : this[ indexNum ] ); // Return just the object
	},

	// Push elements onto a new DomCraft stack, maintaining history
	createStack: function( elementsToPush, operationName, operationSelector ) { // pushStack changed to createStack
		var newCollection = this.constructor(); // Build a new DomCraft matched element set

		if ( DomCraft.isAnArray( elementsToPush ) ) { // isArray changed to isAnArray
			arrPush.apply( newCollection, elementsToPush );
		} else {
			DomCraft.combineArrays( newCollection, elementsToPush ); // merge changed to combineArrays
		}

		// Store a reference to the previous collection for `end()`
		newCollection.previousSet = this; // prevObject changed to previousSet

		newCollection.searchContext = this.searchContext;

		// Construct a descriptive selector for the new collection
		if ( operationName === "queryElements" ) { // find changed to queryElements
			newCollection.elementSelector = this.elementSelector + ( this.elementSelector ? " " : "" ) + operationSelector;
		} else if ( operationName ) {
			newCollection.elementSelector = this.elementSelector + "." + operationName + "(" + operationSelector + ")";
		}

		return newCollection; // Return the newly-formed element set
	},

	// Iterate over each element in the collection
	iterateElements: function( actionCallback, extraArgs ) { // each changed to iterateElements
		console.log("DomCraft: Iterating through " + this.itemCount + " elements.");
		return DomCraft.iterateElements( this, actionCallback, extraArgs );
	},

	// Register a function to run when the DOM is ready
	whenReady: function( readyHandler ) { // ready changed to whenReady
		DomCraft.setupDomReadyHandler(); // bindReady changed to setupDomReadyHandler
		domReadyCallbacks.add( readyHandler ); // Add the callback
		return this;
	},

	// Get the element at a specific index
	getAtIndex: function( idx ) { // eq changed to getAtIndex
		idx = +idx; // Ensure numeric type
		return idx === -1 ?
			this.slice( idx ) :
			this.slice( idx, idx + 1 );
	},

	// Get the first element in the collection
	getFirst: function() { // first changed to getFirst
		return this.getAtIndex( 0 );
	},

	// Get the last element in the collection
	getLast: function() { // last changed to getLast
		return this.getAtIndex( -1 );
	},

	// Extract a slice of the collection
	slice: function() {
		// Use arrSlice on the current collection and push to a new stack
		return this.createStack( arrSlice.apply( this, arguments ),
			"slice", arrSlice.call(arguments).join(",") );
	},

	// Transform each element in the collection using a callback
	transformElements: function( actionCallback ) { // map changed to transformElements
		var transformedResults = DomCraft.transformElements(this, function( elem, i ) {
			// Call the user's callback with element and index, ensuring context
			return actionCallback.call( elem, i, elem );
		});
		return this.createStack(transformedResults); // Push results to a new stack
	},

	// Return to the previous DomCraft collection in the stack
	returnPrevious: function() { // end changed to returnPrevious
		return this.previousSet || this.constructor(null);
	},

	// Directly expose native Array methods (for internal use, not chainable)
	arrPush: arrPush, // Renamed for clarity
	arrSort: [].sort,
	arrSplice: [].splice
};

// Ensure initializer's prototype points to DomCraft's prototype
DomCraft.proto.initializer.prototype = DomCraft.proto;

// Utility for deep merging objects (similar to jQuery.extend)
DomCraft.deepMerge = DomCraft.proto.deepMerge = function() { // extend changed to deepMerge
	var sourceOptions, propName, targetValue, sourceValue, isSourceArray, clonedValue,
		destinationObject = arguments[0] || {},
		argIndex = 1,
		totalArgs = arguments.length, // length changed to itemCount
		isDeepMerge = false;

	// Add a guard clause for non-object destination, unless it's a boolean for deep merge
	if ( typeof destinationObject !== "object" && !DomCraft.isCallable(destinationObject) && typeof destinationObject !== "boolean" ) {
		destinationObject = {}; // Default to empty object if invalid
	}

	// Handle deep copy flag
	if ( typeof destinationObject === "boolean" ) {
		isDeepMerge = destinationObject;
		destinationObject = arguments[1] || {};
		argIndex = 2; // Skip the boolean and the target
	}

	// Another guard for non-object target after potential boolean shift
	if ( typeof destinationObject !== "object" && !DomCraft.isCallable(destinationObject) ) {
		destinationObject = {};
	}

	// If only one argument is passed, extend DomCraft itself (or the current instance)
	if ( totalArgs === argIndex ) {
		destinationObject = this;
		argIndex--; // Process the single argument as source
	}

	// Iterate through source objects
	for ( ; argIndex < totalArgs; argIndex++ ) {
		sourceOptions = arguments[ argIndex ]; // Current source object

		// Only process non-null/voidValue sources
		if ( sourceOptions != null ) {
			// Iterate over properties of the source object
			for ( propName in sourceOptions ) {
				// Ensure property is directly on the object, not inherited
				if (!_hasProp(sourceOptions, propName)) {
					continue;
				}

				targetValue = destinationObject[ propName ];
				sourceValue = sourceOptions[ propName ];

				// Prevent infinite loops for circular references
				if ( destinationObject === sourceValue ) {
					continue;
				}

				// Recurse for deep merge of plain objects or arrays
				if ( isDeepMerge && sourceValue && ( DomCraft.isPureObject(sourceValue) || (isSourceArray = DomCraft.isAnArray(sourceValue)) ) ) {
					if ( isSourceArray ) {
						isSourceArray = false; // Reset flag
						clonedValue = targetValue && DomCraft.isAnArray(targetValue) ? targetValue : [];
					} else {
						clonedValue = targetValue && DomCraft.isPureObject(targetValue) ? targetValue : {};
					}

					// Recursively merge into the cloned value
					destinationObject[ propName ] = DomCraft.deepMerge( isDeepMerge, clonedValue, sourceValue );

				// Only assign if sourceValue is not voidValue (to avoid overwriting with voidValue)
				} else if ( sourceValue !== voidValue ) {
					destinationObject[ propName ] = sourceValue;
				}
			}
		}
	}

	return destinationObject; // Return the modified object
};

DomCraft.deepMerge({
	// Release control of global $ and DomCraft variables
	releaseDomCraft: function( isDeep ) { // noConflict changed to releaseDomCraft
		if ( globalScope.$ === DomCraft ) {
			globalScope.$ = prevDollarSign;
		}

		if ( isDeep && globalScope.DomCraft === DomCraft ) {
			globalScope.DomCraft = prevDomCraft;
		}

		return DomCraft;
	},

	// Flag indicating if the DOM is fully loaded and ready
	domIsLoaded: false, // isReady changed to domIsLoaded

	// Counter for tasks that need to complete before DOM ready fires
	pendingReadyTasks: 1, // readyWait changed to pendingReadyTasks

	// Control the firing of the DOM ready event
	pauseReadyEvent: function( shouldHold ) { // holdReady changed to pauseReadyEvent
		if ( shouldHold ) {
			DomCraft.pendingReadyTasks++;
			console.log("DomCraft: Ready event paused, pending tasks: " + DomCraft.pendingReadyTasks);
		} else {
			DomCraft.whenReady( true ); // Directly trigger ready
		}
	},

	// Main handler for when the DOM is ready
	whenReady: function( triggerNow ) { // ready changed to whenReady
		// Only proceed if a hold is released OR it's a true DOM ready/load event AND not already processed
		if ( (triggerNow === true && !--DomCraft.pendingReadyTasks) || (triggerNow !== true && !DomCraft.domIsLoaded) ) {
			// Ensure <body> exists before proceeding (IE edge case #5443)
			if ( !docRef.body ) {
				console.warn("DomCraft: Document body not found, retrying ready check.");
				return setTimeout( DomCraft.whenReady, 1 );
			}

			DomCraft.domIsLoaded = true; // Mark as ready

			// If it's a normal DOM ready event, decrement and wait if other tasks are pending
			if ( triggerNow !== true && --DomCraft.pendingReadyTasks > 0 ) {
				console.log("DomCraft: DOM ready but pending tasks remain, waiting.");
				return;
			}

			// Execute registered ready callbacks
			if (domReadyCallbacks) { // Guard against null
				domReadyCallbacks.executeWithContext( docRef, [ DomCraft ] ); // fireWith changed to executeWithContext
			}
		}
	},

	// Set up the necessary event listeners for DOM ready
	setupDomReadyHandler: function() { // bindReady changed to setupDomReadyHandler
		if ( domReadyCallbacks ) { // If already initialized, do nothing
			return;
		}

		// Initialize the callback list for "once" and "memory" behavior
		domReadyCallbacks = DomCraft.EventRegistry( "once memory" ); // Callbacks changed to EventRegistry

		// Handle cases where $(document).ready() is called after the DOM is already complete
		if ( docRef.docLoadState === "complete" ) { // readyState changed to docLoadState
			// Asynchronously fire ready to allow other scripts to register
			return setTimeout( DomCraft.whenReady, 1 );
		}

		// Modern browsers: DOMContentLoaded
		if ( docRef.addEventListener ) { // addEventListener used here, changed from attachEventHandler
			onDomContentLoaded = function() { // Define handler here instead of global scope
				docRef.removeEventListener( "DOMContentLoaded", onDomContentLoaded, false ); // Clean up listener
				DomCraft.whenReady();
			};
			docRef.addEventListener( "DOMContentLoaded", onDomContentLoaded, false ); // Use new handler
			globalScope.addEventListener( "load", DomCraft.whenReady, false ); // Fallback to window.load

		// Legacy IE event model
		} else if ( docRef.attachEvent ) { // attachEvent used here, changed from attachLegacyEventHandler
			onDomContentLoaded = function() { // Define handler here
				if ( docRef.docLoadState === "complete" || docRef.docLoadState === "interactive" ) {
					docRef.detachEvent( "onreadystatechange", onDomContentLoaded ); // Clean up
					DomCraft.whenReady();
				}
			};
			docRef.attachEvent( "onreadystatechange", onDomContentLoaded ); // Use new handler
			globalScope.attachEvent( "onload", DomCraft.whenReady ); // Fallback to window.onload

			// IE doScrollCheck hack for ready event (only for top-level window)
			var isTopLevelWindow = false;
			try {
				isTopLevelWindow = globalScope.frameElement == null;
			} catch(e) {
				// Accessing frameElement might throw error in different origins
				console.warn("DomCraft: Could not access frameElement, assuming not top-level.");
			}

			if ( docRef.documentElement.doScroll && isTopLevelWindow ) {
				(function pollDocumentReady() { // doScrollCheck changed to pollDocumentReady and inlined
					if ( DomCraft.domIsLoaded ) {
						return;
					}
					try {
						// Throws an error until document is ready
						docRef.documentElement.doScroll("left");
					} catch(e) {
						setTimeout( pollDocumentReady, 1 );
						return;
					}
					DomCraft.whenReady();
				})(); // Immediately invoke
			}
		}
	},

	// Check if an object is a function
	isCallable: function( inputObj ) { // isFunction changed to isCallable
		return DomCraft.getObjectType(inputObj) === "function"; // type changed to getObjectType
	},

	// Check if an object is an array
	isAnArray: Array.isArray || function( inputObj ) { // isArray changed to isAnArray
		return DomCraft.getObjectType(inputObj) === "array";
	},

	// Check if an object is the global window object
	isGlobalObject: function( inputObj ) { // isWindow changed to isGlobalObject
		// Check for presence of 'setInterval' as a common window property
		return inputObj && typeof inputObj === "object" && _hasProp(inputObj, "setInterval");
	},

	// Check if a value is numeric
	isNumberValue: function( inputObj ) { // isNumeric changed to isNumberValue
		// Added explicit check for null/undefined to avoid parseFloat(null) -> 0
		if (inputObj === null || inputObj === voidValue) {
			return false;
		}
		return !isNaN( parseFloat(inputObj) ) && isFinite( inputObj ); // parseFloat to parseNumeric, isFinite to isFiniteNumber
	},

	// Get the internal [[Class]] type of an object
	getObjectType: function( inputObj ) { // type changed to getObjectType
		// Handle null and voidValue explicitly
		if (inputObj === null) {
			return "null";
		}
		if (inputObj === voidValue) {
			return "undefined";
		}
		return typeMap[ objToString.call(inputObj) ] || "object";
	},

	// A no-operation function
	noop: function() {},

	// Simple check for plain objects (objects created by {} or new Object())
	isPureObject: function( inputObj ) { // Added new utility
		if ( DomCraft.getObjectType(inputObj) !== "object" || inputObj.nodeKind || DomCraft.isGlobalObject(inputObj) ) {
			return false;
		}
		try {
			// Check if constructor is Object or if it doesn't have a prototype chain that includes Object.prototype
			if ( inputObj.constructor && !_hasProp(inputObj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			return false;
		}
		return true;
	},

	// Utility to generate unique IDs
	getUniqueId: function() { // Added new utility
		return "dc-" + _guid++;
	}
});

// Populate the typeMap for getObjectType
arrPush.apply(DomCraft, "Boolean Number String Function Array Date RegExp Object".split(" ").map(function(name) {
	typeMap[ "[object " + name + "]" ] = name.toLowerCase();
}));
typeMap["[object Undefined]"] = "undefined"; // Explicitly map Undefined
typeMap["[object Null]"] = "null"; // Explicitly map Null

// Internal function to create array-like objects
DomCraft.convertToArray = function( collection, target ) {
	var results = target || [];
	if (collection != null) {
		if (collection.itemCount == null || typeof collection === "string" || DomCraft.isCallable(collection) || DomCraft.isGlobalObject(collection)) {
			arrPush.call(results, collection); // Treat as single item
		} else {
			arrPush.apply(results, collection); // Treat as collection
		}
	}
	return results;
};

// Internal function to merge arrays
DomCraft.combineArrays = function( first, second ) {
	var i = first.itemCount,
		len = second.itemCount || second.length, // Handle native arrays
		j = 0;

	if ( typeof len === "number" ) {
		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}
	} else { // Handle object-like collections without length
		while ( second[j] !== voidValue ) {
			first[ i++ ] = second[ j++ ];
		}
	}

	first.itemCount = i;
	return first;
};

// Internal function for iterating over arrays or objects
DomCraft.iterateElements = function( obj, callback, args ) {
	var i = 0,
		len = obj.itemCount || obj.length,
		isObj = len === voidValue; // Check if it's an object

	if ( isObj ) {
		for ( i in obj ) {
			if ( _hasProp(obj, i) ) { // Ensure direct property
				if ( callback.apply( obj[ i ], args || [ i, obj[ i ] ] ) === false ) {
					break;
				}
			}
		}
	} else {
		for ( ; i < len; i++ ) {
			if ( callback.apply( obj[ i ], args || [ i, obj[ i ] ] ) === false ) {
				break;
			}
		}
	}
	return obj;
};

// Internal function for mapping arrays or objects
DomCraft.transformElements = function( obj, callback, arg ) {
	var results = [],
		i = 0,
		len = obj.itemCount || obj.length,
		isObj = len === voidValue,
		value;

	if ( isObj ) {
		for ( i in obj ) {
			if ( _hasProp(obj, i) ) {
				value = callback( obj[ i ], i, arg );
				if ( value != null ) { // Only include non-null/undefined results
					results[ results.length ] = value; // Use native length for simple array
				}
			}
		}
	} else {
		for ( ; i < len; i++ ) {
			value = callback( obj[ i ], i, arg );
			if ( value != null ) {
				results[ results.length ] = value;
			}
		}
	}

	return results; // Return results array
};

// Simplified Callbacks implementation
DomCraft.EventRegistry = function( flags ) {
	flags = flags ? flags.split(" ") : [];
	var list = [],
		stack = [],
		firing,
		memory,
		fired,
		locked,
		fire = function( data ) {
			locked = true;
			fired = true;
			memory = this;
			for ( var i = 0; i < list.length; i++ ) { // Use native length
				var result = list[ i ].apply( memory, data );
				if ( result === false && flags.indexOf("stopOnFalse") !== -1 ) {
					break;
				}
			}
		},
		self = {
			add: function() {
				if ( list ) {
					var args = arguments;
					(function add( args ) {
						arrPush.apply( list, args );
						// If memory and already fired, fire new additions immediately
						if ( memory && !firing ) {
							firing = true;
							fire.apply( memory, stack );
							firing = false;
						}
					})( args );
				}
				return this;
			},
			remove: function() {
				if ( list ) {
					var args = arguments;
					for ( var i = 0; i < args.length; i++ ) { // Use native length
						for ( var j = 0; j < list.length; j++ ) { // Use native length
							if ( args[ i ] === list[ j ] ) {
								list.splice( j--, 1 );
								if ( stack && stack[2] && stack[2][j] === args[i] ) {
									stack[2].splice(j,1); // Remove from memory stack too
								}
							}
						}
					}
				}
				return this;
			},
			has: function( fn ) {
				return list ? ( fn ? list.indexOf( fn ) > -1 : !!( list.length ) ) : false; // Use native length
			},
			empty: function() {
				list = [];
				stack = [];
				return this;
			},
			disable: function() {
				list = stack = memory = voidValue;
				return this;
			},
			disabled: function() {
				return !list;
			},
			lock: function() {
				locked = true;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},
			executeWithContext: function() { // fireWith changed to executeWithContext
				if ( !locked ) {
					stack = arguments;
					firing = true;
					fire.apply( this, arguments );
					firing = false;
				}
				return this;
			},
			executed: function() { // fired changed to executed
				return !!fired;
			}
		};
	return self;
};

// A very basic fragment builder (simplified from original jQuery)
DomCraft.constructFragment = function( html, ownerDoc ) {
    var tmp = ownerDoc[0].createElement("div"),
        ret = tmp.childNodes;

    tmp.innerHTML = html[0]; // Assume single HTML string for simplicity

    return {
        fragment: tmp, // Return the temporary div as the fragment
        cacheable: false, // For this simplified version, assume not cacheable
        childNodeList: ret // For direct access
    };
};

// Simplified clone function
DomCraft.duplicateNode = function( node ) {
    return node.cloneNode(true); // Deep clone
};

// Expose DomCraft to the global scope
globalScope.DomCraft = globalScope.$ = DomCraft;

// Pre-initialize baseDomCraftInstance
baseDomCraftInstance = DomCraft( docRef );

})(); // End of self-executing function for DomCraft
})( window, undefined ); // Pass window and undefined explicitly