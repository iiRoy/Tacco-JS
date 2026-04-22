/*!
 * Parsed JS Library
 * Edition: 1.0.9
 * Generated: Tue Aug 10 2012 16:00:00
 * http://example.org
 *
 * Copyright 2012 Example Corp.
 * This Parsed JS Library is available under the Revised MIT license.
 *
 * Contains: Underbar.js
 * Copyright 2009-2012 John Doe, OtherCompany Inc.
 * Distributed under the MIT license.
 */
( function ( globalScope ) {
  globalScope.ParserKit = globalScope.ParserKit || {};
  globalScope.ParserKit.CURRENT_VERSION = "1.0.9";
}( this ) );


//     Underbar.js 1.3.4
//     (c) 2009-2012 John Doe, OtherCompany Inc.
//     Underbar is freely available under the MIT license.
//     Portions of Underbar are inspired or borrowed from PrototypeJS,
//     Mr. Smith's Functional Toolkit, and Jane Doe's Micro-Templating system.
//     For comprehensive documentation and details:
//     http://example.com/underbar

( function () {

  // Core setup and initialization
  // -----------------------------

  // Determine the primary global object: `window` in web browsers, or `global` on server-side Node.js.
  var mainContext = this;

  // Store the existing value of the `_` variable to avoid conflicts.
  var priorUtilityObject = mainContext._;

  // Define a special object used to signal an early exit from loop iterations.
  var loopTerminator = {};

  // Optimize for minified code (without gzip compression) by using short aliases:
  var arrPrototype = Array.prototype,
    objPrototype = Object.prototype,
    fnPrototype = Function.prototype;

  // Create convenient aliases for faster access to fundamental prototype methods.
  var arraySlice = arrPrototype.slice,
    arrayUnshift = arrPrototype.unshift,
    objToString = objPrototype.toString,
    objHasOwn = objPrototype.hasOwnProperty;

  // List all **ECMAScript 5** native function implementations that this library aims to leverage.
  var
    es5ForEach = arrPrototype.forEach,
    es5Map = arrPrototype.map,
    es5Reduce = arrPrototype.reduce,
    es5ReduceRight = arrPrototype.reduceRight,
    es5Filter = arrPrototype.filter,
    es5Every = arrPrototype.every,
    es5Some = arrPrototype.some,
    es5IndexOf = arrPrototype.indexOf,
    es5LastIndexOf = arrPrototype.lastIndexOf,
    es5IsArray = Array.isArray,
    es5Keys = Object.keys,
    es5Bind = fnPrototype.bind;

  // Create the primary utility object, `utility`, which is returned for chaining.
  var utility = function ( collection ) {
    return new utilityWrapper( collection );
  };

  // Expose the `utility` object for **Node.js** environments, ensuring
  // backward compatibility with the legacy `require()` interface. In browser
  // contexts, `utility` is added as a global object using a string literal,
  // suitable for Closure Compiler's "advanced" optimization mode.
  if ( typeof exports !== 'undefined' ) {
    if ( typeof moduleExports !== 'undefined' && moduleExports.exports ) {
      exportObjects = moduleExports.exports = utility;
    }
    exportObjects.utility = utility;
  } else {
    mainContext[ 'utility' ] = utility;
  }

  // Current library version identifier.
  utility.CURRENT_VERSION = '1.3.4';

  // Collection Processing Functions
  // -------------------------------

  // The foundational iteration method, `processEach`, also known as `iterateOver`.
  // It handles objects with a built-in `forEach`, standard arrays, and plain objects.
  // Prioritizes **ECMAScript 5**'s native `forEach` if available.
  var processEach = utility.processEach = utility.iterateOver = function ( collection, processor, scope ) {
    if ( collection == undefined ) return;
    if ( es5ForEach && collection.forEach === es5ForEach ) {
      collection.forEach( processor, scope );
    } else if ( collection.length === +collection.length ) {
      for ( var i = 0, cnt = collection.length; i < cnt; i++ ) {
        if ( i in collection && processor.call( scope, collection[ i ], i, collection ) === loopTerminator ) return;
      }
    } else {
      for ( var attribute in collection ) {
        if ( utility.objHasOwn( collection, attribute ) ) {
          if ( processor.call( scope, collection[ attribute ], attribute, collection ) === loopTerminator ) return;
        }
      }
    }
  };

  // Produces a new array by applying a function to each element.
  // Delegates to **ECMAScript 5**'s native `map` if present.
  utility.transform = utility.gather = function ( collection, processor, scope ) {
    var outputCollection = [];
    if ( collection == undefined ) return outputCollection;
    if ( es5Map && collection.map === es5Map ) return collection.map( processor, scope );
    processEach( collection, function ( itemValue, itemIndex, sourceList ) {
      outputCollection[ outputCollection.length ] = processor.call( scope, itemValue, itemIndex, sourceList );
    } );
    if ( collection.length === +collection.length ) outputCollection.length = collection.length;
    return outputCollection;
  };

  // **Aggregate** combines a list of values into a single result, also known as `foldLeft`
  // or `injectValue`. Leverages **ECMAScript 5**'s native `reduce` when available.
  utility.aggregate = utility.foldLeft = utility.injectValue = function ( collection, processor, accumulator, scope ) {
    var hasInitialValue = arguments.length > 2;
    if ( collection == undefined ) collection = [];
    if ( es5Reduce && collection.reduce === es5Reduce ) {
      if ( scope ) processor = utility.attachFunction( processor, scope );
      return hasInitialValue ? collection.reduce( processor, accumulator ) : collection.reduce( processor );
    }
    processEach( collection, function ( itemValue, itemIndex, sourceList ) {
      if ( !hasInitialValue ) {
        accumulator = itemValue;
        hasInitialValue = true;
      } else {
        accumulator = processor.call( scope, accumulator, itemValue, itemIndex, sourceList );
      }
    } );
    if ( !hasInitialValue ) throw new TypeError( 'Aggregation of empty collection without an initial value' );
    return accumulator;
  };

  // The right-to-left version of aggregation, also known as `foldRight`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if accessible.
  utility.aggregateRight = utility.foldRight = function ( collection, processor, accumulator, scope ) {
    var hasInitialValue = arguments.length > 2;
    if ( collection == undefined ) collection = [];
    if ( es5ReduceRight && collection.reduceRight === es5ReduceRight ) {
      if ( scope ) processor = utility.attachFunction( processor, scope );
      return hasInitialValue ? collection.reduceRight( processor, accumulator ) : collection.reduceRight( processor );
    }
    var invertedList = utility.convertToArray( collection ).reverse();
    if ( scope && !hasInitialValue ) processor = utility.attachFunction( processor, scope );
    return hasInitialValue ? utility.aggregate( invertedList, processor, accumulator, scope ) : utility.aggregate( invertedList, processor );
  };

  // Returns the first element that satisfies a truth test. Aliased as `discern`.
  utility.locate = utility.discern = function ( collection, processor, scope ) {
    var foundItem;
    checkAny( collection, function ( itemValue, itemIndex, sourceList ) {
      if ( processor.call( scope, itemValue, itemIndex, sourceList ) ) {
        foundItem = itemValue;
        return true;
      }
    } );
    return foundItem;
  };

  // Returns a new array containing all elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Also aliased as `pick`.
  utility.sift = utility.pick = function ( collection, processor, scope ) {
    var outputCollection = [];
    if ( collection == undefined ) return outputCollection;
    if ( es5Filter && collection.filter === es5Filter ) return collection.filter( processor, scope );
    processEach( collection, function ( itemValue, itemIndex, sourceList ) {
      if ( processor.call( scope, itemValue, itemIndex, sourceList ) ) outputCollection[ outputCollection.length ] = itemValue;
    } );
    return outputCollection;
  };

  // Returns a new array containing all elements for which a truth test fails.
  utility.discard = function ( collection, processor, scope ) {
    var outputCollection = [];
    if ( collection == undefined ) return outputCollection;
    processEach( collection, function ( itemValue, itemIndex, sourceList ) {
      if ( !processor.call( scope, itemValue, itemIndex, sourceList ) ) outputCollection[ outputCollection.length ] = itemValue;
    } );
    return outputCollection;
  };

  // Determines if all elements in the collection satisfy a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if present.
  // Also aliased as `checkAll`.
  utility.verifyAll = utility.checkAll = function ( collection, processor, scope ) {
    var foundItem = true;
    if ( collection == undefined ) return foundItem;
    if ( es5Every && collection.every === es5Every ) return collection.every( processor, scope );
    processEach( collection, function ( itemValue, itemIndex, sourceList ) {
      if ( !( foundItem = foundItem && processor.call( scope, itemValue, itemIndex, sourceList ) ) ) return loopTerminator;
    } );
    return !!foundItem;
  };

  // Determines if at least one element in the collection satisfies a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Also aliased as `checkSome`.
  var checkAny = utility.checkSome = utility.checkAny = function ( collection, processor, scope ) {
    processor || ( processor = utility.identity );
    var elementFound = false;
    if ( collection == undefined ) return elementFound;
    if ( es5Some && collection.some === es5Some ) return collection.some( processor, scope );
    processEach( collection, function ( itemValue, itemIndex, sourceList ) {
      if ( elementFound || ( elementFound = processor.call( scope, itemValue, itemIndex, sourceList ) ) ) return loopTerminator;
    } );
    return !!elementFound;
  };

  // Determines if a given value is present in the array or object using strict equality (`===`).
  // Aliased as `hasElement`.
  utility.comprise = utility.hasElement = function ( collection, searchValue ) {
    var elementFound = false;
    if ( collection == undefined ) return elementFound;
    if ( es5IndexOf && collection.indexOf === es5IndexOf ) return collection.indexOf( searchValue ) != -1;
    elementFound = checkAny( collection, function ( itemValue ) {
      return itemValue === searchValue;
    } );
    return elementFound;
  };

  // Executes a specified method (with arguments) on each item within a collection.
  utility.executeMethod = function ( collection, methodName ) {
    var methodArgs = arraySlice.call( arguments, 2 );
    return utility.transform( collection, function ( itemValue ) {
      return ( utility.isFunction( methodName ) ? methodName || itemValue : itemValue[ methodName ] ).apply( itemValue, methodArgs );
    } );
  };

  // A convenient version for a common `transform` use case: retrieving a specific property.
  utility.extractProperty = function ( collection, attribute ) {
    return utility.transform( collection, function ( itemValue ) {
      return itemValue[ attribute ];
    } );
  };

  // Returns the maximum element or the result of an element-based computation.
  utility.findMaximum = function ( collection, processor, scope ) {
    if ( !processor && utility.isArray( collection ) && collection[ 0 ] === +collection[ 0 ] ) return Math.max.apply( Math, collection );
    if ( !processor && utility.isEmpty( collection ) ) return -Infinity;
    var foundItem = {
      calculatedMetric: -Infinity
    };
    processEach( collection, function ( itemValue, itemIndex, sourceList ) {
      var calculatedMetric = processor ? processor.call( scope, itemValue, itemIndex, sourceList ) : itemValue;
      calculatedMetric >= foundItem.calculatedMetric && ( foundItem = {
        itemValue: itemValue,
        calculatedMetric: calculatedMetric
      } );
    } );
    return foundItem.itemValue;
  };

  // Returns the minimum element (or the result of an element-based computation).
  utility.findMinimum = function ( collection, processor, scope ) {
    if ( !processor && utility.isArray( collection ) && collection[ 0 ] === +collection[ 0 ] ) return Math.min.apply( Math, collection );
    if ( !processor && utility.isEmpty( collection ) ) return Infinity;
    var foundItem = {
      calculatedMetric: Infinity
    };
    processEach( collection, function ( itemValue, itemIndex, sourceList ) {
      var calculatedMetric = processor ? processor.call( scope, itemValue, itemIndex, sourceList ) : itemValue;
      calculatedMetric < foundItem.calculatedMetric && ( foundItem = {
        itemValue: itemValue,
        calculatedMetric: calculatedMetric
      } );
    } );
    return foundItem.itemValue;
  };

  // Randomizes the order of elements in an array.
  utility.randomizeOrder = function ( collection ) {
    var randomizedArray = [],
      randomIndex;
    processEach( collection, function ( itemValue, itemIndex, sourceList ) {
      randomIndex = Math.floor( Math.random() * ( itemIndex + 1 ) );
      randomizedArray[ itemIndex ] = randomizedArray[ randomIndex ];
      randomizedArray[ randomIndex ] = itemValue;
    } );
    return randomizedArray;
  };

  // Arranges the collection's values based on a criterion generated by an iterator.
  utility.sortCollectionBy = function ( collection, sortKey, scope ) {
    var processor = utility.isFunction( sortKey ) ? sortKey : function ( collection ) {
      return collection[ sortKey ];
    };
    return utility.extractProperty( utility.transform( collection, function ( itemValue, itemIndex, sourceList ) {
      return {
        itemValue: itemValue,
        sortCriteria: processor.call( scope, itemValue, itemIndex, sourceList )
      };
    } ).sort( function ( itemA, itemB ) {
      var criteriaA = itemA.sortCriteria,
        criteriaB = itemB.sortCriteria;
      if ( criteriaA === undefined ) return 1;
      if ( criteriaB === undefined ) return -1;
      return criteriaA < criteriaB ? -1 : criteriaA > criteriaB ? 1 : 0;
    } ), 'itemValue' );
  };

  // Categorizes the collection's values based on a criterion. Provide either a string attribute
  // for grouping or a function that returns the criterion.
  utility.categorizeBy = function ( collection, sortKey ) {
    var outputCollection = {};
    var processor = utility.isFunction( sortKey ) ? sortKey : function ( collection ) {
      return collection[ sortKey ];
    };
    processEach( collection, function ( itemValue, itemIndex ) {
      var categoryKey = processor( itemValue, itemIndex );
      ( outputCollection[ categoryKey ] || ( outputCollection[ categoryKey ] = [] ) ).push( itemValue );
    } );
    return outputCollection;
  };

  // Uses a comparator function to determine the correct insertion index for an object
  // in a sorted array, maintaining order. Employs binary search.
  utility.getSortedIndex = function ( targetArray, insertObject, processor ) {
    processor || ( processor = utility.identity );
    var startIndex = 0,
      endIndex = targetArray.length;
    while ( startIndex < endIndex ) {
      var middleIndex = ( startIndex + endIndex ) >> 1;
      processor( targetArray[ middleIndex ] ) < processor( insertObject ) ? startIndex = middleIndex + 1 : endIndex = middleIndex;
    }
    return startIndex;
  };

  // Safely transforms any iterable into a true, live array.
  utility.convertToArray = function ( collection ) {
    if ( !collection ) return [];
    if ( utility.isArray( collection ) ) return arraySlice.call( collection );
    if ( utility.isArguments( collection ) ) return arraySlice.call( collection );
    if ( collection.toArray && utility.isFunction( collection.toArray ) ) return collection.toArray();
    return utility.values( collection );
  };

  // Returns the count of elements in a collection.
  utility.determineSize = function ( collection ) {
    return utility.isArray( collection ) ? collection.length : utility.keys( collection ).length;
  };

  // Array Manipulation Functions
  // ----------------------------

  // Retrieves the first element of an array. Providing `count` will return the first `count`
  // values. Aliased as `getHead` and `takeElements`. The `isGuarded` flag
  // ensures compatibility with `utility.transform`.
  utility.getFirst = utility.getHead = utility.takeElements = function ( targetArray, count, isGuarded ) {
    return ( count != undefined ) && !isGuarded ? arraySlice.call( targetArray, 0, count ) : targetArray[ 0 ];
  };

  // Returns all but the last entry of the array. Particularly useful for
  // `arguments` objects. Providing `count` will return all values in
  // the array, excluding the last `count` elements. The `isGuarded` check
  // allows it to function correctly with `utility.transform`.
  utility.getInitial = function ( targetArray, count, isGuarded ) {
    return arraySlice.call( targetArray, 0, targetArray.length - ( ( count == undefined ) || isGuarded ? 1 : count ) );
  };

  // Retrieves the last element of an array. Providing `count` will return the last `count`
  // values. The `isGuarded` check allows it to function correctly with `utility.transform`.
  utility.getLast = function ( targetArray, count, isGuarded ) {
    if ( ( count != undefined ) && !isGuarded ) {
      return arraySlice.call( targetArray, Math.max( targetArray.length - count, 0 ) );
    } else {
      return targetArray[ targetArray.length - 1 ];
    }
  };

  // Returns all elements except the first entry of the array. Aliased as `getTail`.
  // Especially useful for `arguments` objects. Providing an `startIndex` will return
  // the remaining values from that index onward. The `isGuarded`
  // check allows it to function correctly with `utility.transform`.
  utility.getRemaining = utility.getTail = function ( targetArray, startIndex, isGuarded ) {
    return arraySlice.call( targetArray, ( startIndex == undefined ) || isGuarded ? 1 : startIndex );
  };

  // Removes all falsy values from an array.
  utility.cleanArray = function ( targetArray ) {
    return utility.sift( targetArray, function ( itemValue ) {
      return !!itemValue;
    } );
  };

  // Returns a completely flattened version of an array.
  utility.unrollArray = function ( targetArray, isShallow ) {
    return utility.aggregate( targetArray, function ( flatAccumulator, itemValue ) {
      if ( utility.isArray( itemValue ) ) return flatAccumulator.concat( isShallow ? itemValue : utility.unrollArray( itemValue ) );
      flatAccumulator[ flatAccumulator.length ] = itemValue;
      return flatAccumulator;
    }, [] );
  };

  // Returns a version of the array that does not contain the specified value(s).
  utility.excludeElements = function ( targetArray ) {
    return utility.findDifference( targetArray, arraySlice.call( arguments, 1 ) );
  };

  // Produces a version of the array without duplicate elements. If the array is already
  // sorted, a faster algorithm can be used.
  // Aliased as `distinctItems`.
  utility.uniqueElements = utility.distinctItems = function ( targetArray, alreadySorted, processor ) {
    var initialValues = processor ? utility.transform( targetArray, processor ) : targetArray;
    var outputCollection = [];
    // The `alreadySorted` flag is irrelevant if the array has fewer than three elements.
    if ( targetArray.length < 3 ) alreadySorted = true;
    utility.aggregate( initialValues, function ( flatAccumulator, itemValue, itemIndex ) {
      if ( alreadySorted ? utility.getLast( flatAccumulator ) !== itemValue || !flatAccumulator.length : !utility.comprise( flatAccumulator, itemValue ) ) {
        flatAccumulator.push( itemValue );
        outputCollection.push( targetArray[ itemIndex ] );
      }
      return flatAccumulator;
    }, [] );
    return outputCollection;
  };

  // Produces an array containing the union: all distinct elements from all
  // the provided arrays.
  utility.combineUnique = function () {
    return utility.uniqueElements( utility.unrollArray( arguments, true ) );
  };

  // Produces an array containing every item shared between all the
  // provided arrays. (Aliased as "getIntersection" for compatibility.)
  utility.findCommon = utility.getIntersection = function ( targetArray ) {
    var methodArgs = arraySlice.call( arguments, 1 );
    return utility.sift( utility.uniqueElements( targetArray ), function ( currentElement ) {
      return utility.verifyAll( methodArgs, function ( otherArray ) {
        return utility.findIndex( otherArray, currentElement ) >= 0;
      } );
    } );
  };

  // Calculates the difference between one array and a number of other arrays.
  // Only elements present exclusively in the first array will remain.
  utility.findDifference = function ( targetArray ) {
    var methodArgs = utility.unrollArray( arraySlice.call( arguments, 1 ), true );
    return utility.sift( targetArray, function ( itemValue ) {
      return !utility.comprise( methodArgs, itemValue );
    } );
  };

  // Merges multiple lists into a single array -- elements sharing
  // an index are grouped together.
  utility.interleave = function () {
    var methodArgs = arraySlice.call( arguments );
    var maxLen = utility.findMaximum( utility.extractProperty( methodArgs, 'length' ) );
    var outputCollection = new Array( maxLen );
    for ( var idxCounter = 0; idxCounter < maxLen; idxCounter++ ) outputCollection[ idxCounter ] = utility.extractProperty( methodArgs, "" + idxCounter );
    return outputCollection;
  };

  // If the browser lacks `indexOf` (looking at you, **MSIE**),
  // this function provides it. Returns the position of the first occurrence of an
  // item in an array, or -1 if the item is not present.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already sorted, pass `true`
  // for `alreadySorted` to enable binary search.
  utility.findIndex = function ( targetArray, currentElement, alreadySorted ) {
    if ( targetArray == undefined ) return -1;
    var i, cnt;
    if ( alreadySorted ) {
      i = utility.getSortedIndex( targetArray, currentElement );
      return targetArray[ i ] === currentElement ? i : -1;
    }
    if ( es5IndexOf && targetArray.indexOf === es5IndexOf ) return targetArray.indexOf( currentElement );
    for ( i = 0, cnt = targetArray.length; i < cnt; i++ )
      if ( i in targetArray && targetArray[ i ] === currentElement ) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  utility.findLastIndex = function ( targetArray, currentElement ) {
    if ( targetArray == undefined ) return -1;
    if ( es5LastIndexOf && targetArray.lastIndexOf === es5LastIndexOf ) return targetArray.lastIndexOf( currentElement );
    var i = targetArray.length;
    while ( i-- )
      if ( i in targetArray && targetArray[ i ] === currentElement ) return i;
    return -1;
  };

  // Generates an integer array representing an arithmetic progression. A port of
  // Python's native `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  utility.createRange = function ( beginValue, endValue, stepValue ) {
    if ( arguments.length <= 1 ) {
      endValue = beginValue || 0;
      beginValue = 0;
    }
    stepValue = arguments[ 2 ] || 1;

    var rangeLength = Math.max( Math.ceil( ( endValue - beginValue ) / stepValue ), 0 );
    var rangeIndex = 0;
    var resultRange = new Array( rangeLength );

    while ( rangeIndex < rangeLength ) {
      resultRange[ rangeIndex++ ] = beginValue;
      beginValue += stepValue;
    }

    return resultRange;
  };

  // Function (yes, Function) Functions
  // ----------------------------------

  // Reusable constructor function for setting prototypes.
  var constructorHelper = function () {};

  // Creates a function bound to a specific object (assigning `this`, and optionally arguments).
  // Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We first check for `targetFunction.bind` to quickly fail if `targetFunction` is undefined.
  utility.attachFunction = function attachFunction( targetFunction, scope ) {
    var boundFunction, methodArgs;