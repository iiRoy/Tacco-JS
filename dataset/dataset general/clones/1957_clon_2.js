/*
 * Core JavaScript Utility Library v1.10.2
 * http://example.com/jsutil
 *
 * Incorporates PatternMatching.js
 * http://example.com/patternmatching
 *
 * Copyright 2005, 2013 Project Foundation, Inc. and contributors
 * Distributed under the permissive license
 * http://example.org/permissivelicense
 *
 * Timestamp: 2013-07-03T13:48Z
 */

( function( globalScope, voidValue ) {

	// Some environments, like older tracing tools, might have issues
	// with strict mode's call stack handling. Thus, it's omitted here.
	var
		// Deferred object for handling document readiness state
		domReadyQueue,

		// Reference to the primary utility instance for the document
		mainAppInstance,

		// String representation for the 'undefined' type
		typeOfVoidValue = typeof voidValue,

		// Access the current page's URL and document structure
		pageLocation = globalScope.location,
		currentWebDocument = globalScope.document,
		htmlRootElement = currentWebDocument.documentElement,

		// Store original global references in case of conflicts
		cachedLibraryReference = globalScope.JsBridge,

		// Store original shorthand reference
		cachedShorthandReference = globalScope.$,

		// Map of internal object class names to common type strings
		objectTypeMapping = {},

		// Pool of identifiers for deleted data, allowing reuse
		recycledIdStore = [],

		libraryVersion = "1.10.2",

		// Cache frequently used array and object methods
		arrayConcatMethodRef = recycledIdStore.concat,
		arrayPushMethodRef = recycledIdStore.push,
		arraySliceMethodRef = recycledIdStore.slice,
		arrayIndexOfMethodRef = recycledIdStore.indexOf,
		objectToStringMethodRef = objectTypeMapping.toString,
		objectHasOwnPropertyRef = objectTypeMapping.hasOwnProperty,
		stringTrimMethodRef = libraryVersion.trim,

		// Define the main utility function
		JsBridge = function( queryText, searchContext ) {
			// The JsBridge object is effectively an 'initializer' constructor
			return new JsBridge.fn.initiateObject( queryText, searchContext, mainAppInstance );
		},

		// Regular expression for identifying numbers (integer or float, optional exponent)
		numericPattern = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

		// Regular expression to match one or more non-whitespace characters
		nonSpacePattern = /\S+/g,

		// Regular expression to strip leading/trailing whitespace, including BOM and NBSP
		boundaryWhitespacePattern = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

		// Quick check for HTML strings or ID selectors
		// Prioritizes ID over generic tag to prevent common security issues
		// Requires HTML to explicitly start with '<'
		quickMatchPattern = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

		// Matches a single standalone HTML tag (e.g., `<div>` or `<img/>`)
		singleTagPattern = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

		// JSON parsing related regular expressions
		jsonCharPattern = /^[\],:{}\s]*$/,
		jsonBracePattern = /(?:^|:|,)(?:\s*\[)+/g,
		jsonEscapePattern = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
		jsonTokenPattern = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

		// Regular expression to find the '-ms-' vendor prefix
		msPrefixPattern = /^-ms-/,
		// Regular expression to find a dash followed by an alphanumeric character
		dashAlphaPattern = /-([\da-z])/gi,

		// Callback function used to convert dashed strings to camelCase
		toCamelCaseConverter = function( fullPatternMatch, matchedCharacter ) {
			return matchedCharacter.toUpperCase();
		},

		// Event handler for when the DOM is ready or page is loaded
		domContentLoadedHandler = function( eventObject ) {

			// If `addEventListener` is available or it's a 'load' event, or document is complete
			if ( currentWebDocument.addEventListener || eventObject.type === "load" || currentWebDocument.readyState === "complete" ) {
				removeEventHandlers();
				JsBridge.signalDocumentReady();
			}
		},
		// Cleans up event listeners once the document is ready
		removeEventHandlers = function() {
			if ( currentWebDocument.addEventListener ) {
				currentWebDocument.removeEventListener( "DOMContentLoaded", domContentLoadedHandler, false );
				globalScope.removeEventListener( "load", domContentLoadedHandler, false );

			} else { // Fallback for older browsers
				currentWebDocument.detachEvent( "onreadystatechange", domContentLoadedHandler );
				globalScope.detachEvent( "onload", domContentLoadedHandler );
			}
		};

JsBridge.fn = JsBridge.prototype = {
	// Current version of the utility library
	libVersionInfo: libraryVersion,

	moduleConstructor: JsBridge,
	initiateObject: function( queryText, searchContext, mainInstance ) {
		var parsedExpression, selectedNode;

		// Handle empty, null, undefined, or false queries
		if ( !queryText ) {
			return this;
		}

		// Process queries provided as strings
		if ( typeof queryText === "string" ) {
			if ( queryText.charAt(0) === "<" && queryText.charAt( queryText.length - 1 ) === ">" && queryText.length >= 3 ) {
				// Assume strings starting and ending with angle brackets are HTML
				parsedExpression = [ null, queryText, null ];

			} else {
				parsedExpression = quickMatchPattern.exec( queryText );
			}

			// If HTML is matched or no specific context is given for an ID
			if ( parsedExpression && (parsedExpression[1] || !searchContext) ) {

				// Handle HTML string input
				if ( parsedExpression[1] ) {
					searchContext = searchContext instanceof JsBridge ? searchContext[0] : searchContext;

					// The 'true' argument ensures scripts are processed for backward compatibility
					JsBridge.merge( this, JsBridge.parseHTML(
						parsedExpression[1],
						searchContext && searchContext.nodeType ? searchContext.ownerDocument || searchContext : currentWebDocument,
						true
					) );

					// Handle HTML with additional properties
					if ( singleTagPattern.test( parsedExpression[1] ) && JsBridge.isInputPlainObject( searchContext ) ) {
						for ( parsedExpression in searchContext ) {
							// If property is a function, call it as a method
							if ( JsBridge.isInputFunction( this[ parsedExpression ] ) ) {
								this[ parsedExpression ]( searchContext[ parsedExpression ] );

							// Otherwise, set it as an attribute
							} else {
								this.attr( parsedExpression, searchContext[ parsedExpression ] );
							}
						}
					}

					return this;

				// Handle ID selector input (e.g., "#myId")
				} else {
					selectedNode = currentWebDocument.getElementById( parsedExpression[2] );

					// Ensure the found node is still part of the document
					if ( selectedNode && selectedNode.parentNode ) {
						// Address cases where older browsers might return elements by name instead of ID
						if ( selectedNode.id !== parsedExpression[2] ) {
							return mainAppInstance.find( queryText );
						}

						// Directly inject the element into the JsBridge object
						this.itemCount = 1;
						this[0] = selectedNode;
					}

					this.searchContext = currentWebDocument;
					this.currentQuery = queryText;
					return this;
				}

			// Handle `(expression, JsBridge_object)`
			} else if ( !searchContext || searchContext.libVersionInfo ) {
				return ( searchContext || mainAppInstance ).find( queryText );

			// Handle `(expression, DOM_element)`
			} else {
				return this.moduleConstructor( searchContext ).find( queryText );
			}

		// Handle queries provided as DOM elements
		} else if ( queryText.nodeType ) {
			this.searchContext = this[0] = queryText;
			this.itemCount = 1;
			return this;

		// Handle queries provided as functions (shortcut for document ready)
		} else if ( JsBridge.isInputFunction( queryText ) ) {
			return mainAppInstance.whenDocumentReady( queryText );
		}

		// If the input object itself has a selector property, preserve it
		if ( queryText.currentQuery !== voidValue ) {
			this.currentQuery = queryText.currentQuery;
			this.searchContext = queryText.searchContext;
		}

		return JsBridge.makeArray( queryText, this );
	},

	// Default empty query string
	currentQuery: "",

	// Default number of elements in a JsBridge object
	itemCount: 0,

	convertCollectionToArray: function() {
		return arraySliceMethodRef.call( this );
	},

	// Get the element at the Nth position in the matched set OR
	// Get the entire matched set as a plain array
	retrieveElement: function( elementIndex ) {
		return elementIndex == null ?

			// Return a 'clean' array
			this.convertCollectionToArray() :

			// Return just the specific element
			( elementIndex < 0 ? this[ this.itemCount + elementIndex ] : this[ elementIndex ] );
	},

	// Adds a new set of elements to the internal stack
	// (and returns the new JsBridge collection)
	appendElementsToStack: function( elementsToAdd ) {

		// Construct a new JsBridge collection
		var newCollection = JsBridge.merge( this.moduleConstructor(), elementsToAdd );

		// Store a reference to the previous collection in the stack
		newCollection.prevObject = this;
		newCollection.searchContext = this.searchContext;

		// Return the newly formed collection
		return newCollection;
	},

	// Executes a callback function for each element in the matched set.
	forEachElement: function( iterationFunction, extraArguments ) {
		return JsBridge.each( this, iterationFunction, extraArguments );
	},

	whenDocumentReady: function( readyCallback ) {
		// Enqueue the callback function
		JsBridge.signalDocumentReady.promise().done( readyCallback );

		return this;
	},

	extractSubset: function() {
		return this.appendElementsToStack( arraySliceMethodRef.apply( this, arguments ) );
	},

	getInitialElement: function() {
		return this.getElementAtIndex( 0 );
	},

	getFinalElement: function() {
		return this.getElementAtIndex( -1 );
	},

	getElementAtIndex: function( elementIndex ) {
		var collectionSize = this.itemCount,
			adjustedIndex = +elementIndex + ( elementIndex < 0 ? collectionSize : 0 );
		return this.appendElementsToStack( adjustedIndex >= 0 && adjustedIndex < collectionSize ? [ this[adjustedIndex] ] : [] );
	},

	transformElements: function( iterationFunction ) {
		return this.appendElementsToStack( JsBridge.map(this, function( elementItem, index ) {
			return iterationFunction.call( elementItem, index, elementItem );
		}));
	},

	restorePreviousSet: function() {
		return this.prevObject || this.moduleConstructor(null);
	},

	// These behave like standard Array methods, not JsBridge methods.
	arrayPushReference: arrayPushMethodRef,
	arraySortReference: [].sort,
	arraySpliceReference: [].splice
};

// Ensure the initializer function shares the main JsBridge prototype
JsBridge.fn.initiateObject.prototype = JsBridge.fn;

JsBridge.extend = JsBridge.fn.extend = function() {
	var sourceProperty, isCopiedValueArray, copiedProperty, propName, extensionOptions, clonedProperty,
		targetObject = arguments[0] || {},
		argIndex = 1,
		totalArgs = arguments.length,
		deepCopyFlag = false;

	// Handle a deep copy scenario
	if ( typeof targetObject === "boolean" ) {
		deepCopyFlag = targetObject;
		targetObject = arguments[1] || {};
		// Skip the boolean flag and the target object
		argIndex = 2;
	}

	// Handle case where target is not an object or function (possible in deep copy)
	if ( typeof targetObject !== "object" && !JsBridge.isInputFunction(targetObject) ) {
		targetObject = {};
	}

	// If only one argument is provided, extend the current object (this)
	if ( totalArgs === argIndex ) {
		targetObject = this;
		--argIndex;
	}

	for ( ; argIndex < totalArgs; argIndex++ ) {
		// Only process non-null/undefined values
		if ( (extensionOptions = arguments[ argIndex ]) != null ) {
			// Iterate over properties of the source object
			for ( propName in extensionOptions ) {
				sourceProperty = targetObject[ propName ];
				copiedProperty = extensionOptions[ propName ];

				// Prevent infinite recursion for circular references
				if ( targetObject === copiedProperty ) {
					continue;
				}

				// Recurse for deep merging of plain objects or arrays
				if ( deepCopyFlag && copiedProperty && ( JsBridge.isInputPlainObject(copiedProperty) || (isCopiedValueArray = JsBridge.isInputArray(copiedProperty)) ) ) {
					if ( isCopiedValueArray ) {
						isCopiedValueArray = false;
						clonedProperty = sourceProperty && JsBridge.isInputArray(sourceProperty) ? sourceProperty : [];

					} else {
						clonedProperty = sourceProperty && JsBridge.isInputPlainObject(sourceProperty) ? sourceProperty : {};
					}

					// Never modify original objects directly; clone them
					targetObject[ propName ] = JsBridge.extend( deepCopyFlag, clonedProperty, copiedProperty );

				// Do not copy undefined values
				} else if ( copiedProperty !== voidValue ) {
					targetObject[ propName ] = copiedProperty;
				}
			}
		}
	}

	// Return the modified destination object
	return targetObject;
};

JsBridge.extend({
	// Unique identifier for each instance of the library on a page
	// Non-numeric characters removed for consistency
	uniqueInstanceId: "JsBridge" + ( libraryVersion + Math.random() ).replace( /\D/g, "" ),

	restorePreviousAliases: function( deepCopyFlag ) {
		if ( globalScope.$ === JsBridge ) {
			globalScope.$ = cachedShorthandReference;
		}

		if ( deepCopyFlag && globalScope.JsBridge === JsBridge ) {
			globalScope.JsBridge = cachedLibraryReference;
		}

		return JsBridge;
	},

	// Indicates if the document is fully loaded and ready for interaction
	documentIsFullyLoaded: false,

	// Counter for pending operations that defer the 'ready' event
	pendingLoadTriggers: 1,

	// Manages the deferral of the 'ready' event
	manageLoadTriggers: function( shouldDefer ) {
		if ( shouldDefer ) {
			JsBridge.pendingLoadTriggers++;
		} else {
			JsBridge.signalDocumentReady( true );
		}
	},

	// Handles the logic for when the document becomes ready
	signalDocumentReady: function( deferCompletion ) {

		// Abort if there are pending deferrals or if already ready
		if ( deferCompletion === true ? --JsBridge.pendingLoadTriggers : JsBridge.documentIsFullyLoaded ) {
			return;
		}

		// Ensure the document body exists before proceeding
		if ( !currentWebDocument.body ) {
			return globalScope.setTimeout( JsBridge.signalDocumentReady );
		}

		// Mark the document as ready
		JsBridge.documentIsFullyLoaded = true;

		// If this was a normal ready event, decrement the counter and wait if necessary
		if ( deferCompletion !== true && --JsBridge.pendingLoadTriggers > 0 ) {
			return;
		}

		// Execute all queued ready callbacks
		domReadyQueue.resolveWith( currentWebDocument, [ JsBridge ] );

		// Trigger any bound 'ready' events if the method exists
		if ( JsBridge.fn.trigger ) {
			JsBridge( currentWebDocument ).trigger("ready").off("ready");
		}
	},

	// Checks if the given value is a function.
	// Note: Browser-specific host objects might return false.
	isInputFunction: function( valueToCheck ) {
		return JsBridge.getVariableType(valueToCheck) === "function";
	},

	isInputArray: Array.isArray || function( valueToCheck ) {
		return JsBridge.getVariableType(valueToCheck) === "array";
	},

	isInputWindow: function( valueToCheck ) {
		/* jshint eqeqeq: false */
		return valueToCheck != null && valueToCheck == valueToCheck.window;
	},

	isInputNumeric: function( valueToCheck ) {
		return !isNaN( globalScope.parseFloat(valueToCheck) ) && globalScope.isFinite( valueToCheck );
	},

	getVariableType: function( valueToCheck ) {
		if ( valueToCheck == null ) {
			return globalScope.String( valueToCheck );
		}
		// Return specific type for objects/functions, otherwise typeof result
		return typeof valueToCheck === "object" || typeof valueToCheck === "function" ?
			objectTypeMapping[ objectToStringMethodRef.call(valueToCheck) ] || "object" :
			typeof valueToCheck;
	},

	isInputPlainObject: function( valueToCheck ) {
		var objectProperty;

		// Must be an object, not a DOM node or window object
		if ( !valueToCheck || JsBridge.getVariableType(valueToCheck) !== "object" || valueToCheck.nodeType || JsBridge.isInputWindow( valueToCheck ) ) {
			return false;
		}

		try {
			// Check for constructor property to filter out host objects
			if ( valueToCheck.constructor &&
				!objectHasOwnPropertyRef.call(valueToCheck, "constructor") &&
				!objectHasOwnPropertyRef.call(valueToCheck.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( errorThrown ) {
			// Some older browsers throw errors on certain host objects
			return false;
		}

		// Handle iteration order for inherited properties in some older browsers.
		// If `JsBridge.support.ownLast` is true, check for own properties.
		if ( JsBridge.support && JsBridge.support.ownLast ) {
			for ( objectProperty in valueToCheck ) {
				return objectHasOwnPropertyRef.call( valueToCheck, objectProperty );
			}
		}
	// ... (rest of original code would continue here)
	// This is a partial clone for the purpose of demonstration, ending where the original extract ends.
	// In a full clone, all remaining parts of the original file would be processed.
	}
});

// The original code was cut off here. Assuming the user wants the provided snippet cloned.
// If the full jQuery file was provided, I would continue cloning until the end.
} )( window );