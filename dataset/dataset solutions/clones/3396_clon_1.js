"use strict"
; // Enable strict mode for better error handling and cleaner code.

/**
 *   @function _slicedToArray
 *   @description Internal helper function for Babel-generated code to destructure arrays.
 *   @param {Array} arr - The array or iterable to slice.
 *   @param {number} i   - The number of elements to extract.
 *   @returns {Array}     - A new array containing the extracted elements.
 */
function _slicedToArray ( arr , i ) {
  return ( _arrayWithHoles( arr ) || _iterableToArrayLimit( arr , i ) || _nonIterableRest() ) ;
} // --- end of _slicedToArray function ---

/**
 *   @function _nonIterableRest
 *   @description Throws an error when an attempt is made to destructure a non-iterable instance.
 *   @throws {TypeError} Invalid attempt to destructure non-iterable instance.
 */
function _nonIterableRest ( ) {
  throw new TypeError ( "Invalid attempt to destructure non-iterable instance" ) ;
} // --- end of _nonIterableRest function ---

/**
 *   @function _iterableToArrayLimit
 *   @description Limits an iterable to a specified number of elements.
 *   @param {Iterable} arr - The iterable to process.
 *   @param {number} i     - The maximum number of elements to extract.
 *   @returns {Array}       - An array containing up to 'i' elements from the iterable.
 */
function _iterableToArrayLimit ( arr , i ) {
  var _arr = [ ] ;
  var _n = true ;
  var _d = false ;
  var _e = undefined ;
  try {
    for ( var _i = arr[ Symbol.iterator ] ( ) , _s ; ! ( _n = ( _s = _i.next ( ) ).done ) ; _n = true ) {
      _arr.push ( _s.value ) ;
      if ( i && _arr.length === i ) {
        break ;
      }
    }
  } catch ( err ) {
    _d = true ;
    _e = err ;
  } finally {
    try {
      if ( ! _n && _i[ "return" ] != null ) {
        _i[ "return" ] ( ) ;
      }
    } finally {
      if ( _d ) {
        throw _e ;
      }
    }
  }
  return _arr ;
} // --- end of _iterableToArrayLimit function ---

/**
 *   @function _arrayWithHoles
 *   @description Checks if the input is an array and returns it as is.
 *   @param {any} arr - The value to check.
 *   @returns {Array|void} - The array if it is one, otherwise undefined.
 */
function _arrayWithHoles ( arr ) {
  if ( Array.isArray ( arr ) ) return arr ;
} // --- end of _arrayWithHoles function ---

/**
 *   @function main
 *   @description The primary function executing the problem's logic.
 *   @param {string} input - The raw input string read from standard input.
 *   @returns {void}
 */
function main ( input ) {
  // Split the input string into an array of lines.
  var lines = input . split ( '\n' ) ;

  // Parse the first line to get the integer N.
  var N = parseInt ( lines [ 0 ] ) ;

  // Split the second line into numbers and take the first N elements.
  var as = splitNum ( lines [ 1 ] ) . slice ( 0 , N ) ;

  // Initialize a Map to store frequencies of numbers.
  var map = new Map ( ) ;

  // Variables for iterator status (Babel-generated).
  var _iteratorNormalCompletion = true ;
  var _didIteratorError = false ;
  var _iteratorError = undefined ;

  try {
    // Iterate over each number 'a' in the 'as' array.
    for (
      var _iterator = as [ Symbol.iterator ] ( ) , _step ;
      ! ( _iteratorNormalCompletion = ( _step = _iterator.next ( ) ) . done ) ;
      _iteratorNormalCompletion = true
    ) {
      var a = _step.value ; // The current number.

      // Get the existing count for 'a' from the map.
      var v = map . get ( a ) ;

      // If 'a' is already in the map, increment its count.
      if ( v != null ) {
        map . set ( a , v + 1 ) ;
      }
      // Otherwise, add 'a' to the map with a count of 1.
      else {
        map . set ( a , 1 ) ;
      }
    }
  } catch ( err ) {
    // Catch any errors during iteration.
    _didIteratorError = true ;
    _iteratorError = err ;
  } finally {
    try {
      // Ensure the iterator's return method is called if available.
      if ( ! _iteratorNormalCompletion && _iterator [ "return" ] != null ) {
        _iterator [ "return" ] ( ) ;
      }
    } finally {
      // Re-throw any caught errors.
      if ( _didIteratorError ) {
        throw _iteratorError ;
      }
    }
  } // --- end of initial map population loop ---

  // Initialize the result accumulator.
  var result = 0 ;

  /*
  // This block contains a commented-out alternative approach using recursion.
  // It is provided as an example of a different algorithmic strategy.
  while (map.size > 0) {
      const {value: [init, num]} = map[Symbol.iterator]().next();
      remove(map, init, num);

      const [left, right] = rec(init);
      result += Math.min(left, right);
  }
  function rec(init) {
      let leftNum = 1;
      let rightNum = 0;
      for (const d of diffs(init)) {
          if (remove(map, d)) {
              const [ls, rs] = rec(d);
              leftNum += rs;
              rightNum += ls;
          }
      }
      return [leftNum, rightNum];
  }
  */

  // Main processing loop: continues as long as there are elements in the map.
  while ( map.size > 0 ) {
    // Extract the first key-value pair from the map using destructuring.
    var _map$Symbol$iterator$ = map [ Symbol.iterator ] ( ) . next ( ) ,
      _map$Symbol$iterator$2 = _slicedToArray ( _map$Symbol$iterator$.value , 2 ) ,
      init = _map$Symbol$iterator$2 [ 0 ] , // The initial number for this component.
      num = _map$Symbol$iterator$2 [ 1 ] ; // Its frequency (unused directly after removal).

    // Remove the initial number from the map.
    remove ( map , init , num ) ;

    // Initialize a queue for a breadth-first-like traversal.
    var queue = [ init ] ;

    // Initialize counters for 'left' and 'right' branches in the current component.
    var left = 0 ,
      right = 0 ;

    // Process elements in the queue until it is empty.
    while ( queue . length > 0 ) {
      var current = queue . pop ( ) ; // Get the next number from the queue.

      // Determine if the current number signifies a 'right' branch (negative value).
      var rightFlag = current < 0 ;

      // Get the absolute value of the current number.
      var i = Math . abs ( current ) ;

      // Increment the appropriate counter based on 'rightFlag'.
      left += + ! rightFlag ; // If not a right branch, increment 'left'.
      right += + rightFlag ; // If it is a right branch, increment 'right'.

      // Variables for inner loop iterator status (Babel-generated).
      var _iteratorNormalCompletion2 = true ;
      var _didIteratorError2 = false ;
      var _iteratorError2 = undefined ;

      try {
        // Iterate over the differences calculated for the absolute value 'i'.
        for (
          var _iterator2 = diffs ( i ) [ Symbol.iterator ] ( ) , _step2 ;
          ! ( _iteratorNormalCompletion2 = ( _step2 = _iterator2.next ( ) ) . done ) ;
          _iteratorNormalCompletion2 = true
        ) {
          var d = _step2.value ; // A difference value.

          // If 'd' exists in the map and can be removed (decremented or deleted).
          if ( remove ( map , d ) ) {
            // Add 'd' to the queue, negating it if it originated from a 'right' branch.
            queue . push ( rightFlag ? d : -d ) ;
          }
        }
      } catch ( err ) {
        // Catch any errors during inner iteration.
        _didIteratorError2 = true ;
        _iteratorError2 = err ;
      } finally {
        try {
          // Ensure the inner iterator's return method is called if available.
          if ( ! _iteratorNormalCompletion2 && _iterator2 [ "return" ] != null ) {
            _iterator2 [ "return" ] ( ) ;
          }
        } finally {
          // Re-throw any caught errors from the inner loop.
          if ( _didIteratorError2 ) {
            throw _iteratorError2 ;
          }
        }
      } // --- end of inner diffs iteration loop ---
    } // --- end of queue processing loop ---

    // Add the minimum of the 'left' and 'right' counts to the total result.
    result += Math . min ( left , right ) ;
  } // --- end of main map processing loop ---

  // Output the final calculated result to the console.
  console . log ( result ) ;
} // --- end of main function ---

// Read input from standard input and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

/**
 *   @function splitNum
 *   @description Splits a string by whitespace and parses each part as an integer.
 *   @param {string} line - The string containing space-separated numbers.
 *   @returns {number[]} - An array of integers.
 */
function splitNum ( line ) {
  return line . split ( /\s+/ ) . map ( function ( n ) {
    return parseInt ( n ) ;
  } ) ;
} // --- end of splitNum function ---

/**
 *   @function binarySearch
 *   @description Performs a binary search on a sorted array to find a target value.
 *   @param {number[]} arr    - The sorted array to search within.
 *   @param {number} target   - The value to search for.
 *   @returns {number|null}   - The index of the target if found, otherwise null.
 *   @remarks This function is defined but not actively used in the provided `main` logic.
 */
function binarySearch ( arr , target ) {
  var start = 0 , // Initialize start index.
    end = arr . length ; // Initialize end index (exclusive).

  // Loop while the search range is valid.
  while ( start < end ) {
    // Calculate the middle index.
    var idx = Math . floor ( ( end - start ) / 2 ) + start ;
    var val = arr [ idx ] ; // Get the value at the middle index.

    // If the value matches the target, return its index.
    if ( val === target ) {
      return idx ;
    }

    // Adjust search range based on comparison.
    if ( val < target ) {
      start = idx ; // Search in the right half.
    } else {
      end = idx ; // Search in the left half.
    }
  }

  return null ; // Target not found.
} // --- end of binarySearch function ---

/**
 *   @function diffs
 *   @description Calculates differences between a given value and powers of 2.
 *   @param {number} val - The input value.
 *   @returns {number[]} - An array containing positive differences.
 */
function diffs ( val ) {
  var res = [ ] ; // Initialize an empty array for results.

  // Loop through powers of 2 (starting from 2, up to 2 * 10^9).
  for ( var tar = 2 ; tar <= 2 * 1e9 ; tar *= 2 ) {
    var d = tar - val ; // Calculate the difference.

    // If the difference is positive, add it to the result array.
    if ( d > 0 ) {
      res . push ( d ) ;
    }
  }

  return res ; // Return the array of differences.
} // --- end of diffs function ---

/**
 *   @function remove
 *   @description Decrements the count of a key in a map, or removes it if count becomes 0.
 *   @param {Map<number, number>} map - The map to modify.
 *   @param {number} key               - The key whose value needs to be decremented or removed.
 *   @param {number} [val]             - Optional: The current value associated with the key.
 *                                         If not provided, it's fetched from the map.
 *   @returns {boolean}               - True if the key was found and modified/removed, false otherwise.
 */
function remove ( map , key ) {
  // Retrieve the value, using the provided 'val' argument if available, otherwise from the map.
  var val = arguments . length > 2 && arguments [ 2 ] !== undefined ? arguments [ 2 ] : map . get ( key ) ;

  // If the key does not exist (value is null or undefined), return false.
  if ( val == null ) {
    return false ;
  }

  // If the value is greater than 1, decrement it.
  if ( val > 1 ) {
    map . set ( key , val - 1 ) ;
  }
  // Otherwise (value is 1), delete the key from the map.
  else {
    map . delete ( key ) ;
  }

  return true ; // Indicate that the key was successfully processed.
} // --- end of remove function ---