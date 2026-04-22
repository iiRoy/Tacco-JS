;!function( toolkit, ModuleLabel, ExportContainer ) {
	"use strict";

/* This section extends the Object ClassRef with deep comparison and utility methods. */
toolkit.augment.memoizeStore( 'Object', function( ClassRef ) {

	// Helper function to compare the contents of two arrays for equality.
	function compareCollections( coll1, coll2 ) {
		return coll1.length === coll2.length && Array.from( coll1 ).every( function( itemVal, idx ) {
			return ClassRef.isEquivalentTo( coll2[idx], itemVal );
		} );
	}

	// Helper function to compare the structure and values of two objects for equality.
	function compareStructures( struct1, struct2 ) {
		// Check if the number of properties or own properties differ.
		if ( toolkit.countElements( struct1 ) !== toolkit.countElements( struct2 ) || ClassRef.countOwnProperties( struct1 ) !== ClassRef.countOwnProperties( struct2 ) ) {
			return false;
		}

		// Iterate over properties and check for existence and equivalence.
		for ( var propKey in struct2 ) {
			if ( toolkit.ownsProperty( struct1, propKey ) !== toolkit.ownsProperty( struct2, propKey ) || !ClassRef.isEquivalentTo( struct1[propKey], struct2[propKey] ) ) {
				return false;
			}
		}
		return true;
	}

	// Define new utility methods directly on the Object ClassRef.
	toolkit.defineProps( ClassRef, {
		/**
		 *  Accumulates values from an object using a reducer function.
		 *  @param {object} entity - The object to iterate over.
		 *  @param {*} initialAccum - The initial value for the accumulator.
		 *  @param {function} processFunc - The reducer function.
		 *  @param {object} [thisContext] - The `this` context for the reducer.
		 *  @returns {*} The accumulated value.
		 */
		reduceCollection   : function( entity, initialAccum, processFunc, thisContext ) {
			thisContext = thisContext || entity;
			return ClassRef.keys( entity ).reduce( function( currentResult, propKey, idx ) {
				return processFunc.call( thisContext, currentResult, entity[propKey], propKey, entity, idx );
			}, initialAccum );
		},

		/**
		 *  Removes all own enumerable properties from an object, effectively emptying it.
		 *  @param {object} entity - The object to clear.
		 *  @returns {object} The cleared object.
		 */
		emptyObject        : function( entity ) {
			ClassRef.keys( entity ).forEach( function( propKey ) {
				delete entity[propKey];
			}, entity );
			return entity;
		},

		/**
		 *  Performs a deep comparison between two values.
		 *  @param {*} entity - The first value to compare.
		 *  @param {*} otherValue - The second value to compare.
		 *  @returns {boolean} True if the values are equivalent, false otherwise.
		 */
		isEquivalentTo     : function( entity, otherValue ) {
			switch ( toolkit.getNativeType( entity ) ) {
				case 'array'  : return Array.isArray( otherValue )             ? compareCollections( entity, otherValue ) : false;
				case 'object' : return toolkit.getNativeType( otherValue ) === 'object' ? compareStructures( entity, otherValue )  : false;
				case 'date'   : return +entity === +otherValue; // Compare Date objects by their numeric value.
			}
			return entity === otherValue; // Default comparison for primitives.
		},

		/**
		 *  Retrieves an array of an object's own enumerable property names.
		 *  @param {object} entity - The object to inspect.
		 *  @returns {string[]} An array of property keys.
		 */
		getOwnPropKeys     : function( entity ) { return ClassRef.getOwnPropertyNames( entity ); },

		/**
		 *  Counts the number of own enumerable properties an object has.
		 *  @param {object} entity - The object to count properties for.
		 *  @returns {number} The count of own properties.
		 */
		countOwnProperties : function( entity ) { return ClassRef.getOwnPropKeys( entity ).length; }
	}, 'writable' ); // 'writable' ensures properties can be redefined.
} );

/* This section extends the Function ClassRef with various utility methods. */
toolkit.augment.memoizeStore( 'Function', function( ClassRef ) {

	// Regular expression to extract parameter names from a function's string representation.
	var regexParams    = /^[\s\(]*function[^\(]*\(([^\)]*)\)/,
		// Regular expression to split parameter strings by commas and whitespace.
		regexSplitter = /\s*,\s*/;

	// Defines a static method on the Function constructor to ensure a value is a function.
	toolkit.defineProp( ClassRef, 'adaptFunction', toolkit.createDescriptor( function ensureCallable( inputVal ) {
		return toolkit.getNativeType( inputVal ) === 'function' ? inputVal : function() { return inputVal; };
	}, 'writable' ) );

	toolkit.defineProps( ClassRef.prototype, {
	// PROPERTY: Retrieves the names of the function's parameters as an array of strings.
		argumentNames : {
			get : function() {
				var paramNames = String( this ).match( regexParams )[1].trim().split( regexSplitter );
				return paramNames.length === 1 && !paramNames[0] ? [] : paramNames;
			}
		},

	// METHODS:
		/**
		 *  Attempts to execute the function within a try-catch block, returning any caught exception.
		 *  @param {object} [executionScope] - The `this` context for the function call.
		 *  @param {...*} [args] - Arguments to pass to the function.
		 *  @returns {*} The function's return value or the caught exception.
		 */
		tryExecute   : function( executionScope ) {
			var callArgs = Array.from( arguments ).slice( 1 ), originalFunc = this;
			return function safeExecution() {
				try { return originalFunc.apply( executionScope || this, callArgs ); }
				catch ( exceptionError ) { return exceptionError; }
			}();
		},

		/**
		 *  Returns a partially applied version of the function (a curried function).
		 *  @returns {function} A new function with `this` bound to itself and arguments prepended.
		 */
		partialApply : function() {
			var appliedFlag = 'applied', originalFunc = this;
			// Memoize the partially applied function.
			return originalFunc[appliedFlag] || !toolkit.defineProp( originalFunc, appliedFlag, toolkit.createDescriptor( function() {
				return originalFunc.apply( this, [this].concat( Array.from( arguments ) ) );
			}.cloneMetadata( originalFunc ), 'writable' ) ) || originalFunc[appliedFlag];
		},

		/**
		 *  Schedules the function to run on the next event loop tick (Node.js) or with a minimal delay (browsers).
		 *  @param {object} [executionScope] - The `this` context for the function call.
		 *  @param {...*} [args] - Arguments to pass to the function.
		 *  @returns {void}
		 */
		scheduleNextTick : toolkit.RuntimeEnv === 'commonjs'
				  ? function( executionScope ) { return process.nextTick( this.bind.apply( this, [executionScope].concat( Array.from( arguments ).slice( 1 ) ) ) ); }
				  : function() { return this.executeLater.apply( this, [1].concat( Array.from( arguments ) ) ); },

		/**
		 *  Schedules the function to run after a specified delay.
		 *  @param {number} delayMillis - The delay in milliseconds.
		 *  @param {object} [executionScope] - The `this` context for the function call.
		 *  @param {...*} [args] - Arguments to pass to the function.
		 *  @returns {object} An object with a `haltOperation` method and a `timerHandle`.
		 */
		executeLater     : function( delayMillis, executionScope ) {
			var callArgs = Array.from( arguments ).slice( 2 ), originalFunc = this;
			function deferredCall() {
				deferredCall.haltOperation();
				return originalFunc.apply( executionScope || this, callArgs );
			}
			return toolkit.assignProps( deferredCall, {
				haltOperation : function() {
					clearTimeout( this.timerHandle ); delete this.timerHandle;
					return originalFunc;
				},
				timerHandle   : setTimeout( deferredCall, delayMillis )
			} );
		},

		/**
		 *  Caches the results of function calls based on unique argument combinations.
		 *  @param {object} [executionScope] - The `this` context for the function call.
		 *  @param {object} [resultCache] - An optional object to use as the cache store.
		 *  @returns {function} A memoized version of the function.
		 */
		cacheResult      : function( executionScope, resultCache ) {
			var originalFunc = this; toolkit.getNativeType( resultCache ) === 'object' || ( resultCache = toolkit.newPlainObject() );
			function cachedFunction() {
				var callArgs = Array.from( arguments ), argString = callArgs.toString();
				return argString in resultCache ? resultCache[argString] : ( resultCache[argString] = originalFunc.apply( executionScope, callArgs ) );
			}
			cachedFunction.restoreOriginal = function() { return originalFunc; };
			return cachedFunction;
		},

		/**
		 *  Placeholder method to stop a deferred operation (e.g., a delayed or scheduled call).
		 *  @returns {function} The original function.
		 */
		haltOperation    : function() { return this; },

		/**
		 *  Placeholder method to restore an un-memoized function.
		 *  @returns {function} The original function.
		 */
		restoreOriginal  : function() { return this; },

		/**
		 *  Wraps the current function with a decorator function.
		 *  @param {function} decoratorFunc - The function to wrap the original.
		 *  @param {...*} [args] - Additional arguments to pass to the decorator.
		 *  @returns {function} The decorated function.
		 */
		decorateFunction : function( decoratorFunc ) {
			var callArgs = Array.from( arguments ).slice( 1 ), originalFunc = this;
			return function() {
				return decoratorFunc.apply( this, [originalFunc.bind( this )].concat( callArgs ).concat( Array.from( arguments ) ) );
			}.cloneMetadata( decoratorFunc );
		}
	}, 'writable' );
} );

/* This section extends the Array ClassRef with various utility methods. */
toolkit.augment.memoizeStore( 'Array', function( ClassRef ) {

	// Helper function for grouping by a function's return value.
	function categorizeByFunction( criterion, element ) { return criterion( element ) ? '0' : '1'; }
	// Helper function for grouping by a regular expression test.
	function categorizeByRegex( criterion, element ) { return criterion.test( element ) ? '0' : '1'; }
	// Helper function for grouping by an object's string property value.
	function categorizeByString( criterion, element ) { return toolkit.getPropertyValue( element, criterion ) || '1'; }
	// Helper to check if a value is falsy (returns null if so, otherwise the value itself).
	function isFalsyValue( element ) { return !element ? null : element; }
	// Extracts the actual value from a [value, sort_key] pair.
	function getSortedValue( pair )  { return pair[0]; }
	// Creates a [value, sort_key] pair for Schwartzian transform sorting.
	function getSortablePair( element ) { return [element, ( typeof this === 'function' ? this( element ) : toolkit.getPropertyValue( element, this ) )]; }
	
	var ArrayPrototype = ClassRef.prototype,
		// Predefined comparison functions for sorting in ascending or descending order.
		comparisonHandlers  = {
			descending : function( pairA, pairB ) { return pairA[1] === pairB[1] ? 0 : pairA[1] < pairB[1] ? 1 : -1; },
			ascending  : function( pairA, pairB ) { return pairA[1] === pairB[1] ? 0 : pairA[1] > pairB[1] ? 1 : -1; }
		};

	// Aliases for common boolean/numeric sort directions.
	comparisonHandlers[String( true )] = comparisonHandlers[1] = comparisonHandlers.ascending;
	comparisonHandlers[String( !false )] = comparisonHandlers[0] = comparisonHandlers.descending;

	// Define static property `comparisonFunctions` on the Array constructor.
	toolkit.defineProp( ClassRef, 'comparisonFunctions', toolkit.createDescriptor( { value : comparisonHandlers }, 'writable' ) );

	toolkit.defineProps( ArrayPrototype, {
		/**
		 *  Applies a reducer function to each element in the array, accumulating a single result.
		 *  @param {*} accumulator - The initial value of the accumulator.
		 *  @param {function} iteratorFunc - The function to execute on each element.
		 *  @param {object} [scopeContext] - The `this` context for the iterator.
		 *  @returns {*} The accumulated value.
		 */
		reduceCollection    : function( accumulator, iteratorFunc, scopeContext ) {
			return ArrayPrototype.reduce.call( this, function( currentAccum, element, index, collection ) {
				return iteratorFunc.call( scopeContext || element, currentAccum, element, index, collection );
			}, accumulator );
		},

		/**
		 *  Creates an object by associating elements from the current array (values) with keys from another array.
		 *  @param {Array} keysArray - An array of keys to use for the new object.
		 *  @param {function} [iteratorFunc] - Optional function to transform each value before association.
		 *  @param {object} [scopeContext] - The `this` context for the iterator.
		 *  @returns {object} The newly created object.
		 */
		createAssociation   : function( keysArray, iteratorFunc, scopeContext ) {
			iteratorFunc = iteratorFunc || toolkit; scopeContext = scopeContext || this;
			return ArrayPrototype.reduce.call( this, function( resultObject, element, index ) {
				resultObject[keysArray[index]] = iteratorFunc.call( scopeContext, element, index, this );
				return resultObject;
			}, toolkit.newPlainObject() );
		},

		/**
		 *  Removes all elements from the array, setting its length to 0.
		 *  @returns {Array} The empty array.
		 */
		emptyCollection     : function() { this.length = 0; return this; },

		/**
		 *  Creates a shallow copy of the array.
		 *  @returns {Array} A new array containing the same elements.
		 */
		duplicateCollection : function() { return ArrayPrototype.slice.call( this ); },

		/**
		 *  Creates a new array with all falsy values (false, null, 0, "", undefined, NaN) removed.
		 *  @param {boolean} [includeFalsy] - If true, replaces falsy values with null instead of removing.
		 *  @returns {Array} The compacted array.
		 */
		filterFalsy         : function( includeFalsy ) { return ArrayPrototype.transformAndFilter.call( this, includeFalsy === true ? isFalsyValue : toolkit ); },

		/**
		 *  Checks if the array includes a specific element.
		 *  @param {*} element - The element to search for.
		 *  @returns {boolean} True if the element is found, false otherwise.
		 */
		includesElement     : function( element ) { return !!~ArrayPrototype.indexOf.call( this, element ); },

		/**
		 *  Executes a provided function once for each array element.
		 *  @param {function} iteratorFunc - Function to execute for each element.
		 *  @param {object} [scopeContext] - The `this` context for the iterator.
		 *  @returns {Array} The original array.
		 */
		iterateItems        : function( iteratorFunc, scopeContext ) { ArrayPrototype.forEach.call( this, iteratorFunc, scopeContext || this ); return this; },

		/**
		 *  Recursively flattens nested arrays up to a specified depth.
		 *  @param {number} [depth] - The maximum depth to flatten. If 0, no flattening occurs.
		 *  @returns {Array} A new flattened array.
		 */
		deepUnnest          : function( depth ) {
			if ( toolkit.getNativeType( depth ) === 'number' ) {
				if ( depth > 0 ) { --depth; }
				else { return this; }
			}
			return ArrayPrototype.reduceCollection.call( this, [], function( flattened, element ) {
				ClassRef.isArray( element ) ? flattened.splice.apply( flattened, [flattened.length, 0].concat( element.deepUnnest( depth ) ) ) : flattened.push( element );
				return flattened;
			}, this );
		},

		/**
		 *  Filters elements from the array that match a given regular expression pattern.
		 *  @param {RegExp|string} pattern - The regular expression or string pattern to match.
		 *  @param {function} [iteratorFunc] - Optional function to transform matched elements.
		 *  @param {object} [scopeContext] - The `this` context for the iterator.
		 *  @returns {Array} A new array containing only the matched elements.
		 */
		searchPattern       : function( pattern, iteratorFunc, scopeContext ) {
			var collection = this; iteratorFunc = iteratorFunc || toolkit; scopeContext = scopeContext || collection;
			toolkit.getNativeType( pattern ) !== 'string' || ( pattern = new RegExp( pattern.sanitizeForRegex(), 'g' ) );
			return ArrayPrototype.reduceCollection.call( collection, [], function( filteredResults, element, index ) {
				!pattern.test( element ) || filteredResults.push( iteratorFunc.call( scopeContext, element, index, collection ) );
				return filteredResults;
			} );
		},

		/**
		 *  Groups elements of the array into an object based on a criterion.
		 *  @param {function|RegExp|string|number} groupingCriterion - The criterion to group by.
		 *  @param {function} [iteratorFunc] - Optional function to transform elements before grouping.
		 *  @param {object} [scopeContext] - The `this` context for the iterator.
		 *  @returns {object} An object where keys are group identifiers and values are arrays of grouped elements.
		 */
		groupElements       : function( groupingCriterion, iteratorFunc, scopeContext ) {
			iteratorFunc = iteratorFunc || toolkit;
			var collection = this, groupKeys, matcher, resultMap = {};
			
			switch( toolkit.getNativeType( groupingCriterion ) ) {
				case 'function' : matcher = categorizeByFunction; break;
				case 'regexp'   : matcher = categorizeByRegex;    break;
				case 'number'   :
				case 'string'   : matcher = categorizeByString;
								  groupKeys = ArrayPrototype.extractProperty.call( collection, groupingCriterion, true ); break;
				default         : throw new TypeError( 'Array.prototype.groupElements requires a Function, RegExp or String criterion.' );
			}
			
			// Initialize result map with potential keys or default '0'/'1' groups.
			if ( groupKeys ) { groupKeys.forEach( function( key ) { resultMap[key] = []; } ); }
			else {
				resultMap['0'] = [];
				resultMap['1'] = [];
			}
			
			return ArrayPrototype.reduceCollection.call( collection, resultMap, function( currentMap, element, index ) {
				currentMap[matcher( groupingCriterion, element )].push( iteratorFunc.call( this, element, index, collection ) );
				return currentMap;
			}, scopeContext || collection );
		},

		/**
		 *  Adds an element to the array only if it is not already present.
		 *  @param {*} element - The element to add.
		 *  @returns {boolean} True if the element was added, false if it already existed.
		 */
		addIfMissing        : function( element ) { return ArrayPrototype.includesElement.call( this, element ) ? !1 : !this.push( element ) || true; },

		/**
		 *  Invokes a specified method on each element in the array, passing additional arguments.
		 *  @param {string} methodName - The name of the method to invoke.
		 *  @param {...*} [methodArgs] - Arguments to pass to the invoked method.
		 *  @returns {Array} A new array containing the results of each method invocation (falsy results are filtered).
		 */
		callOnElements      : function( methodName ) {
			var methodArgs = Array.from( arguments ).slice( 1 );
			return ArrayPrototype.transformAndFilter.call( this, function( element ) {
				return toolkit.getNativeType( element[methodName] ) === 'function' ? element[methodName].apply( element, methodArgs ) : null;
			} );
		}, 
		/**
		 *  Retrieves an element by its index, supporting negative indices (counting from the end).
		 *  @param {number} index - The index of the element to retrieve.
		 *  @returns {*} The element at the specified index, or undefined.
		 */
		retrieveItem        : function( index ) { return this[index < 0 ? this.length + index : index]; },

		/**
		 *  Returns the last element of the array.
		 *  @returns {*} The last element, or undefined if the array is empty.
		 */
		finalItem           : function() { return this[this.length - 1]; },

		/**
		 *  Maps each element of the array using an iterator function and then filters out any falsy results.
		 *  @param {function} iteratorFunc - The function to apply to each element.
		 *  @param {object} [scopeContext] - The `this` context for the iterator.
		 *  @returns {Array} A new array containing only the truthy results.
		 */
		transformAndFilter  : function( iteratorFunc, scopeContext ) {
			scopeContext = scopeContext || this;
			return ArrayPrototype.reduce.call( this, function( filteredResults, element, index, collection ) {
				!toolkit.valuePresent( ( element = iteratorFunc.call( scopeContext, element, index, collection ) ) ) || filteredResults.push( element );
				return filteredResults;
			}, [] );
		}, 

		/**
		 *  Removes all specified elements from the array.
		 *  @param {...*} elementsToRemove - Elements to be removed from the array.
		 *  @returns {Array} An array of the elements that were successfully removed.
		 */
		deleteElements      : function() {
			var elementsToRemove = Array.from( arguments ), index, removedItems = [], itemToRemove;
			while ( itemToRemove = elementsToRemove.shift() ) {
				!~( index = ArrayPrototype.indexOf.call( this, itemToRemove ) ) || removedItems.push( ArrayPrototype.splice.call( this, index, 1 )[0] );
			}
			return removedItems;
		},

		/**
		 *  Sorts the array based on a criterion, using the Schwartzian transform for efficiency.
		 *  @param {function|string} groupingCriterion - A function to extract the sort key or a property name.
		 *  @param {function|string|boolean} [direction] - The sorting direction ('asc', 'desc', true for asc, false for desc) or a custom comparator function.
		 *  @returns {Array} A new sorted array.
		 */
		orderItems          : function( groupingCriterion, direction ) {
			return ArrayPrototype.map.call( this, getSortablePair, groupingCriterion )
						.sort( toolkit.getNativeType( direction ) === 'function' ? direction : comparisonHandlers[String( direction ).toLowerCase()] || comparisonHandlers.ascending )
						.map( getSortedValue );
		},

		/**
		 *  Assigns a property (key and value) to each object within the array.
		 *  @param {string} propKey - The name of the property to assign.
		 *  @param {*} valueToInject - The value to assign, or an array of values to assign by index.
		 *  @returns {Array} The original array with properties injected.
		 */
		injectKeyValue      : function( propKey, valueToInject ) {
			var isArrayOfValues = ClassRef.isArray( valueToInject );
			return ArrayPrototype.iterateItems.call( this, function( element, index ) { element[propKey] = isArrayOfValues ? valueToInject[index] : valueToInject; } );
		},

		/**
		 *  Returns a new array containing only the unique elements from the original array.
		 *  @returns {Array} A new array with distinct items.
		 */
		uniqueElements      : function() {
			return ArrayPrototype.reduce.call( this, function( uniqueList, element ) {
				uniqueList.includesElement( element ) || uniqueList.push( element );
				return uniqueList;
			}, [] );
		},

		/**
		 *  Returns a new array with specified elements excluded.
		 *  @param {...*} elementsToExclude - Elements to filter out from the array.
		 *  @returns {Array} A new array without the excluded elements.
		 */
		excludeElements     : function() {
			var tempArray = ArrayPrototype.duplicateCollection.call( this ); tempArray.deleteElements.apply( tempArray, arguments );
			return tempArray;
		},

		/**
		 *  Combines multiple arrays into an array of arrays, where each inner array contains elements at the same index.
		 *  @param {...Array} additionalCollections - One or more arrays to combine with the current array.
		 *  @returns {Array} A new array of arrays (zipped).
		 */
		combineCollections  : function() {
			var collections = Array.from( arguments ); collections.unshift( this );
			return ArrayPrototype.map.call( this, function( element, index ) { return collections.extractProperty( index ); } );
		}
	}, 'writable' );
} );

/* This section extends the Number ClassRef with integer checks and formatting utilities. */
toolkit.augment.memoizeStore( 'Number', function( ClassRef ) {

	// Aliases for Math functions to reduce verbosity and a constant for max safe integer.
	var absoluteValue = Math.abs,
		maxSafeInteger  = 9007199254740992, // Corresponds to Number.MAX_SAFE_INTEGER in ES6.
		floorNumber     = Math.floor;

	toolkit.defineProps( ClassRef, {
	// Complies with ES6 Number.isInteger behavior.
		testForInteger : function( numericValue ) {
			return toolkit.getNativeType( numericValue ) === 'number' && isFinite( numericValue ) && numericValue > -maxSafeInteger && numericValue < maxSafeInteger && floorNumber( numericValue ) === numericValue;
		},
	// Complies with ES6 Number.toInteger behavior.
		forceInteger   : function( numericValue ) {
			numericValue = +numericValue; // Ensure value is a number.
			if ( isNaN( numericValue ) ) { return +0; } // Handle NaN cases.
			if ( numericValue === 0 || !isFinite( numericValue ) ) { return numericValue; } // Handle +/-0 and Infinity.
			return ( numericValue < 0 ? -1 : 1 ) * absoluteValue( floorNumber( numericValue ) ); // Convert to integer.
		}
	}, 'writable' );

	toolkit.defineProps( ClassRef.prototype, {
		/**
		 *  Pads a number with leading zeros to reach a desired length in a given base.
		 *  @param {number} desiredLength - The minimum length of the resulting string.
		 *  @param {number} [baseSystem=10] - The numeral system to use (e.g., 2 for binary, 16 for hexadecimal).
		 *  @returns {string} The padded string representation of the number.
		 */
		prefixWithZeros    : function( desiredLength, baseSystem ) {
			var stringValue = this.toString( baseSystem || 10 );
			return '0'.repeatString( desiredLength - stringValue.length ) + stringValue;
		},

		/**
		 *  Executes a callback function a specified number of times, passing the iteration index.
		 *  @param {function} callbackAction - The function to execute repeatedly.
		 *  @param {object} [scopeContext] - The `this` context for the callback.
		 *  @returns {number} The original number.
		 */
		executeRepeatedly : function( callbackAction, scopeContext ) {
			toolkit.numericSequence( 0, this ).forEach( callbackAction, scopeContext || toolkit.globalScope );
			return this;
		},

		/**
		 *  Converts the number to a two-character hexadecimal string, padded with a leading zero if necessary.
		 *  @returns {string} The hexadecimal representation.
		 */
		formatAsHex        : function() { return this.prefixWithZeros( 2, 16 ); }
	}, 'writable' );
} );

/* This section extends the String ClassRef with various text manipulation utilities. */
toolkit.augment.memoizeStore( 'String', function( ClassRef ) {

	// Caches for character configurations and regex patterns to optimize repeated operations.
	var charConfigCache    = toolkit.newPlainObject(),
		sliceRegexCache  = toolkit.newPlainObject(),
		// Regular expressions for common string operations like escaping, case detection, and color parsing.
		regexEscapeChars   = /([-\*\+\?\.\|\^\$\/\\\(\)[\]\{\}])/g,
		escapeReplacement  = '\\$1',
		uppercaseRegex     = /([A-Z])/g,
		hexColorRegex      = /#?(\w{1,6})/,
		rgbComponentRegex  = /(\d{1,3})/g,
		caseSplitRegex     = /[\sA-Z_-]+/g,
		trailingSpaceRegex = /(.*?)\s*$/;

	// Helper function for splitting strings based on case changes, preserving the character.
	function processCasePart( match, part ) { return part + part.toLowerCase(); }

	// Decomposes a string into an array of parts by detecting case transitions and delimiters.
	function decomposeString( inputString ) {
		inputString = inputString.trim();
		var char0 = inputString.charAt( 0 ), char1 = inputString.charAt( 1 ),
			initialIdx = char0.toLowerCase() === char0 && char1 !== ' ' && char1.toUpperCase() === char1 ? 2 : 1,
			partsArray = inputString.substring( initialIdx ).replace( uppercaseRegex, processCasePart ).split( caseSplitRegex );
		partsArray[0] = inputString.substring( 0, initialIdx ) + partsArray[0];
		return partsArray;
	}

/**
 * These methods are provided for compatibility and extended functionality.
 * They are designed to integrate seamlessly and avoid conflicts with future native ES standards.
 */
	toolkit.defineProps( ClassRef.prototype, {
		/**
		 *  Checks if the string is empty or contains only whitespace characters.
		 *  @returns {boolean} True if the string is blank, false otherwise.
		 */
		isJustWhitespace    : function() { return !!this.trim().isEmptyString(); },

		/**
		 *  Capitalizes the first letter of the string and converts the rest to lowercase.
		 *  @returns {string} The title-cased string.
		 */
		titleCase           : function() { return this.charAt( 0 ).toUpperCase() + this.substring( 1 ).toLowerCase(); },

		/**
		 *  Replaces multiple consecutive occurrences of a character with a single instance.
		 *  @param {string} [separatorChar=' '] - The character to clean.
		 *  @returns {string} The string with normalized separators.
		 */
		compressSpaces      : function( separatorChar ) {
			separatorChar = separatorChar || ' ';
			separatorChar = charConfigCache[separatorChar] || ( charConfigCache[separatorChar] = { regex : new RegExp( '(' + separatorChar + '){1,}', 'g' ), fill : separatorChar } );
			return this.split( separatorChar.regex ).filter( function( strSegment ) { return !strSegment.isJustWhitespace() && strSegment !== separatorChar.fill; } ).join( separatorChar.fill );
		},

		/**
		 *  Checks if the string contains a given substring.
		 *  @param {string} substring - The substring to search for.
		 *  @returns {boolean} True if the substring is found, false otherwise.
		 */
		includesSubstring   : function( substring ) { return !!~this.indexOf( substring ); },

		/**
		 *  Checks if the string is empty (has a length of 0).
		 *  @returns {boolean} True if the string is empty, false otherwise.
		 */
		isEmptyString       : function() { return ClassRef( this ) === ''; },

		/**
		 *  Checks if the string ends with a specific suffix.
		 *  @param {string} suffix - The suffix to check for.
		 *  @returns {boolean} True if the string ends with the suffix, false otherwise.
		 */
		suffixMatches       : function( suffix ) { return this.length && this.lastIndexOf( suffix ) === this.length - suffix.length; },

		/**
		 *  Formats a string using placeholders (e.g., %s, %d) and provided values.
		 *  @returns {string} The formatted string.
		 */
		interpolateString   : toolkit.interpolateString.partialApply(),

		/**
		 *  Replaces all occurrences of a pattern (string or regex) with a replacement string.
		 *  @returns {string} The string with all replacements made.
		 */
		replaceAll          : toolkit.replaceAll.partialApply(),

		/**
		 *  Converts a string from camelCase or PascalCase to kebab-case (hyphen-separated).
		 *  @returns {string} The kebab-cased string.
		 */
		kebabCaseString     : function() { return decomposeString( this ).join( '-' ).toLowerCase(); },

		/**
		 *  Performs a case-insensitive check for substring inclusion.
		 *  @param {string} substring - The substring to search for.
		 *  @returns {boolean} True if the substring is found (case-insensitive), false otherwise.
		 */
		caseInsensitiveIncludes : function( substring ) { return this.toLowerCase().includesSubstring( ClassRef( substring ).toLowerCase() ); },

		/**
		 *  Extracts parts of a string that match a given regular expression pattern.
		 *  @param {RegExp} pattern - The regular expression to match.
		 *  @returns {Array<string>} An array of matched parts (excluding the full match if it's the entire string).
		 */
		extractParts        : function( pattern ) {
			var matches = Array.from( this.match( pattern ) );
			switch ( matches.length ) {
				case 1  : if ( matches[0] === null || matches[0] === this ) { return []; }
				default : matches[0] !== this || matches.shift(); return matches;
			}
		},

		/**
		 *  Escapes special characters in the string so it can be safely used within a regular expression.
		 *  @returns {string} The string with regex special characters escaped.
		 */
		sanitizeForRegex    : function() { return this.replace( regexEscapeChars, escapeReplacement ); },

		/**
		 *  Splits the string into an array of chunks, each of a specified maximum size.
		 *  @param {number} chunkSize - The maximum length of each chunk.
		 *  @returns {Array<string>} An array of string chunks.
		 */
		segmentString       : function( chunkSize ) {
			chunkSize = parseInt( chunkSize, 10 );
			if ( isNaN( chunkSize ) || this.length < chunkSize || chunkSize === 0 ) { return [ClassRef( this )]; }
			return this.match( sliceRegexCache[chunkSize] || ( sliceRegexCache[chunkSize] = new RegExp( '(.{1,' + chunkSize + '})', 'g' ) ) );
		},

		/**
		 *  Checks if the string starts with a specific prefix.
		 *  @param {string} prefix - The prefix to check for.
		 *  @returns {boolean} True if the string starts with the prefix, false otherwise.
		 */
		prefixMatches       : function( prefix ) { return !this.indexOf( prefix ); },

		/**
		 *  Repeats the string a specified number of times.
		 *  @param {number} count - The number of times to repeat the string.
		 *  @returns {string} The repeated string.
		 */
		repeatString        : function( count ) { return new Array( Number.forceInteger( count ) + 1 ).join( this ); },

		/**
		 *  Converts a string from kebab-case or snake_case to camelCase.
		 *  @returns {string} The camel-cased string.
		 */
		camelCaseString     : function() {
			var segments = decomposeString( this ), resultParts = [segments.shift()];
			return segments.reduce( function( accumulator, segment ) {
				accumulator.push( segment.titleCase() );
				return accumulator;
			}, resultParts ).join( '' );
		},

		/**
		 *  Converts an RGB color string (e.g., "rgb(255,0,128)") to its hexadecimal representation.
		 *  @returns {string} The hexadecimal color string (e.g., "#FF0080").
		 */
		convertToHexColor   : ( function() {
			// Inner helper to format a decimal color component to a 2-digit hex string.
			function formatComponentToHex( value ) { return parseInt( value, 10 ).prefixWithZeros( 2, 16 ); }
			return function() {
				var colorMatches = this.match( rgbComponentRegex );
				// If only one component is found, assume grayscale and repeat it.
				return '#' + ( ( colorMatches.length === 1 ) ? formatComponentToHex( colorMatches[0] ).repeatString( 3 ) : colorMatches.map( formatComponentToHex ).join( '' ) );
			};
		}() ),

		/**
		 *  Parses a JSON string into a JavaScript object.
		 *  @returns {object} The parsed JSON object.
		 */
		deserializeJSON     : JSON.parse.partialApply(),

		/**
		 *  Converts a hexadecimal color string (e.g., "#FF0080", "F08", "FF008000") to an RGB string or array.
		 *  @param {boolean} [returnAsArray=false] - If true, returns an array of RGB values; otherwise, returns an "rgb()" string.
		 *  @returns {string|Array<number>} The RGB color representation.
		 */
		rgbColorValue       : function( returnAsArray ) {
			var hexValue = this.match( hexColorRegex )[1], hexLength = hexValue.length, rgbComponents;
			switch( hexLength ) {
				case 6  : break; // Full 6-digit hex.
				case 3  : hexValue = this.repeatString( 2 ); break; // Shorthand hex (e.g., "F08" -> "FF0088").
				case 2  : hexValue = this.repeatString( 3 ); break; // Single component repeated (e.g., "F0" -> "F0F0F0").
				default : hexValue = hexLength > 6 ? hexValue.substring( 0, 6 ) : hexLength === 4 ? hexValue + '00' : hexValue + '0'; // Handle invalid lengths.
			}
			rgbComponents = hexValue.segmentString( 2 ).map( function( component ) { return parseInt( component, 16 ); } );
			return returnAsArray === true ? rgbComponents : 'rgb(' + rgbComponents.join( ', ' ) + ')';
		},

		/**
		 *  Removes any trailing whitespace characters from the end of the string.
		 *  @returns {string} The string with trailing whitespace removed.
		 */
		removeEndSpace      : function() {
			return this.replace( trailingSpaceRegex, '$1' );
		},

		/**
		 *  Truncates the string to a specified maximum length, adding an ellipsis if it exceeds.
		 *  @param {number} [maxLength=50] - The maximum length of the string before truncation.
		 *  @param {string} [ellipsis='...'] - The string to append if truncation occurs.
		 *  @returns {string} The truncated string.
		 */
		ellipsizeText       : function( maxLength, ellipsis ) {
			maxLength = maxLength || 50; toolkit.getNativeType( ellipsis ) === 'string' || ( ellipsis = '...' );
			return this.length < maxLength ? ClassRef( this ) : this.substring( 0, maxLength ).removeEndSpace() + ellipsis;
		},

		/**
		 *  Converts a string from camelCase or PascalCase to snake_case (underscore-separated).
		 *  @returns {string} The snake-cased string.
		 */
		snakeCaseString     : function() { return decomposeString( this ).join( '_' ).toLowerCase(); }
	}, 'writable' );
} );

/* Module exposure and initialization. */
	// The primary entry point for the library, allowing extensions.
	function apiRoot() {
		toolkit.augment.apply( toolkit, arguments );
		return apiRoot;
	}

	// Function to augment a specific class (e.g., Object, Array) with new utility methods.
	function augmentClass( ClassRef, extensionFunc ) {
		toolkit.augment.memoizeStore( ClassRef.name, extensionFunc ).augment( ClassRef );
		return apiRoot;
	}

	// Determine the appropriate export container based on the runtime environment.
	toolkit.canIterate( ExportContainer ) || ( ExportContainer = toolkit.RuntimeEnv === 'commonjs' ? module.exports : toolkit.globalScope );

// Publish the core library components to the determined export container.
	toolkit.defineProps( ( apiRoot = toolkit.publish( apiRoot, ModuleLabel, ExportContainer ) ), {
		toolkit : toolkit,
		augment : augmentClass
	}, 'readOnly' ); // 'readOnly' ensures these properties cannot be accidentally overwritten.

	// Establish a cross-reference to the underlying toolkit (m8 equivalent).
	toolkit.publish( toolkit, apiRoot );

	// Augment standard JavaScript types (Object, Array, Function, Number, String) with the defined utilities.
	toolkit.augment( Object, Array, Function, Number, String );

// Self-executing anonymous function to initialize the module.
// It detects the environment to load the 'externalToolkit' (m8 equivalent) library if available.
}( typeof externalToolkit !== 'undefined' ? externalToolkit : typeof moduleLoader !== 'undefined' ? moduleLoader( 'externalToolkit' ) : null, 'n8ivLib' );