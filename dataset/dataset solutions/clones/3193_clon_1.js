/*
 * This file contains JavaScript code implementing a solution.
 * It begins with strict mode declaration for better error handling.
 */
"use strict"
    ;

/*
 * Helper function: _slicedToArray
 * Used by Babel to support destructuring assignment for arrays.
 * It handles non-iterable instances, iterable limits, and arrays with holes.
 */
function _slicedToArray( arr, i )
{
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest()
      ;
}

/*
 * Helper function: _nonIterableRest
 * Throws an error when an attempt to destructure a non-iterable instance occurs.
 * This ensures proper error handling for invalid destructuring operations.
 */
function _nonIterableRest()
{
  throw new TypeError(
      "Invalid attempt to destructure non-iterable instance"
  )
      ;
}

/*
 * Helper function: _iterableToArrayLimit
 * Converts an iterable to an array, limiting the number of elements.
 * It's designed to work with iterators and includes robust error handling.
 */
function _iterableToArrayLimit( arr , i )
{
  var _arr = []; // Initialize an empty array to store elements.
  var _n = true; // Flag to indicate if the iteration is still ongoing.
  var _d = false; // Flag to indicate if an error occurred during iteration.
  var _e = undefined; // Stores the error if one occurs.

  try {
    // Attempt to iterate over the input array.
    for (
        var _i = arr[Symbol.iterator]() , _s
        ;
        !( _n = ( _s = _i.next() ).done )
        ;
        _n = true
    )
    {
      _arr.push( _s.value ); // Add the current value to the array.

      // If a limit 'i' is provided and the array length reaches it, break the loop.
      if ( i && _arr.length === i )
      {
        break;
      }
    }
  }
  catch ( err )
  {
    _d = true; // Set error flag.
    _e = err; // Store the error.
  }
  finally
  {
    try
    {
      // Ensure the iterator's return method is called if it exists and iteration wasn't complete.
      if ( !_n && _i["return"] != null )
      {
        _i["return"]();
      }
    }
    finally
    {
      // Re-throw the error if one occurred during iteration.
      if ( _d )
      {
        throw _e;
      }
    }
  }

  return _arr; // Return the resulting array.
}

/*
 * Helper function: _arrayWithHoles
 * Checks if the input is an array and returns it directly if it is.
 * This is a simple check for array-like objects in destructuring contexts.
 */
function _arrayWithHoles(arr)
{
  if (Array.isArray( arr ))
  {
    return arr;
  }
}

/*
 * This Immediately Invoked Function Expression (IIFE) encapsulates the main application logic.
 * It defines utility functions and then executes the primary program flow.
 */
!function()
{
  /**
   * Parses a line of numbers, converting them to integers.
   * Accepts either an array of strings/numbers or a string to be split by whitespace.
   *
   * @param {string|Array<string|number>} line - The input line or array of numbers.
   * @returns {Array<number>} An array of parsed integers.
   */
  function splitNum(line) {
    // Determine if the input is already an array or needs to be split.
    return ( Array.isArray( line ) ? line : line.split( /\s+/ ) )
        .map( function ( n )
        {
          // Convert each element to an integer.
          return parseInt( n )
              ;
        } )
        ;
  }

  /**
   * A generator function that yields numbers in a specified range.
   *
   * @param {number} start - The starting number (inclusive).
   * @param {number} end - The ending number (exclusive).
   * @yields {number} Each number in the range.
   */
  function* range(start, end)
  {
    for (
        var i = start
        ;
        i < end
        ;
        i++
    )
    {
      yield i
          ; // Yield the current number.
    }
  }

  /**
   * Sorts an array of objects by one or more keys, with configurable sort order.
   *
   * @param {Array<Object>} arr - The array of objects to sort.
   * @param {string|Array<string|Array<string|number>>} keys - A key string, or an array of keys.
   *   Each key can be a string (for ascending sort) or an array like `[keyName, sortOrder]`.
   *   `sortOrder` can be "asc", "desc", or a number (1 for asc, -1 for desc).
   * @returns {Array<Object>} The sorted array.
   */
  function sortByKey(arr, keys)
  {
    // Ensure keys is always an array for consistent processing.
    if ( !Array.isArray( keys ) )
    {
      keys = [ keys ]
          ;
    }

    // Use the built-in sort method with a custom comparison function.
    return arr.sort( function (a, b)
    {
      var _iteratorNormalCompletion = true; // Flag for iterator completion status.
      var _didIteratorError = false;       // Flag if an error occurred during iteration.
      var _iteratorError = undefined;      // Stores the error object.

      try
      {
        // Iterate over each sorting key provided.
        for (
            var _iterator = keys[Symbol.iterator]() , _step
            ;
            !( _iteratorNormalCompletion = ( _step = _iterator.next() ).done )
            ;
            _iteratorNormalCompletion = true
        )
        {
          var k = _step.value; // The current key or key-order pair.

          // Check if the key is a simple string (ascending sort by default).
          if ( "string" == typeof k )
          {
            var d = a[k] - b[k]; // Calculate the difference for comparison.
            if ( 0 !== d )
            {
              return d; // If there's a difference, return it.
            }
          }
          else
          {
            // Handle complex keys with specified sort order.
            var _d = a[k[0]] - b[k[0]]; // Difference based on the actual key name.
            var sig = "desc" === k[1] ? -1 : "asc" === k[1] ? 1 : Number(k[1]); // Determine sort direction.

            if ( 0 !== _d )
            {
              return _d * sig; // Return difference multiplied by the sign for order.
            }
          }
        }
      }
      catch ( err )
      {
        _didIteratorError = true; // Mark that an error occurred.
        _iteratorError = err;     // Store the error.
      }
      finally
      {
        try
        {
          // Ensure the iterator's return method is called if iteration wasn't completed normally.
          if ( !_iteratorNormalCompletion && _iterator.return != null )
          {
            _iterator.return();
          }
        }
        finally
        {
          // Re-throw the stored error if one occurred.
          if ( _didIteratorError )
          {
            throw _iteratorError;
          }
        }
      }

      return 0; // If all keys are equal, elements are considered equal.
    } )
        ;
  }

  /*
   * This nested IIFE contains the core logic to solve the problem.
   * It takes 'input' as an argument, which is expected to be a string.
   */
  !function ( input )
  {
    // Split the input string into an array of lines.
    var lines = input.split( "\n" );

    // Parse the first line to get N and M using the splitNum helper and destructuring.
    var _splitNum = splitNum( lines[0] )
        , _splitNum2 = _slicedToArray( _splitNum, 2 )
        , N = _splitNum2[0]
        , M = _splitNum2[1]
        ;

    // Parse the second line for the array A, taking only the first M elements.
    var A = splitNum( lines[1] ).slice( 0, M );

    // Define the costs associated with each digit (0-9).
    var costs = [ 0, 2, 5, 5, 4, 5, 6, 3, 7, 6 ];

    // Map the input digits to objects containing the digit and its cost.
    var nums = A.map( function ( digit )
    {
      return {
        digit: digit,
        cost: costs[digit]
      }
          ;
    } );

    // Sort the 'nums' array by digit in descending order.
    // This ensures we prioritize larger digits when costs are equal.
    sortByKey( nums, [[ "digit", -1 ]] );

    // Initialize the dynamic programming (DP) array.
    // dp[i] will store [max_length, digit_used_to_achieve_it] for a cost 'i'.
    // dp[0] is base case: 0 length, no digit.
    // dp[1] initialized to negative infinity length, indicating impossibility for cost 1 (unless 1 is a valid digit).
    var dp = [ [0, null], [-1 / 0, null] ];

    var _iteratorNormalCompletion2 = true; // Iterator flag for the outer loop.
    var _didIteratorError2 = false;        // Error flag for the outer loop.
    var _iteratorError2 = undefined;       // Error object for the outer loop.

    try
    {
      // Iterate from cost 2 up to N (the target cost).
      for (
          var _iterator2 = range( 2, N + 1 )[Symbol.iterator]() , _step2
          ;
          !( _iteratorNormalCompletion2 = ( _step2 = _iterator2.next() ).done )
          ;
          _iteratorNormalCompletion2 = true
      )
      {
        var i = _step2.value; // Current cost 'i'.
        var max = [-1 / 0, null]; // Initialize max length and digit for current cost 'i'.

        var _iteratorNormalCompletion3 = true; // Iterator flag for the inner loop.
        var _didIteratorError3 = false;        // Error flag for the inner loop.
        var _iteratorError3 = undefined;       // Error object for the inner loop.

        try
        {
          // Iterate over each available digit and its cost.
          for (
              var _iterator3 = nums[Symbol.iterator]() , _step3
              ;
              !( _iteratorNormalCompletion3 = ( _step3 = _iterator3.next() ).done )
              ;
              _iteratorNormalCompletion3 = true
          )
          {
            var _step3$value = _step3.value
                , digit = _step3$value.digit
                , cost = _step3$value.cost
                ;

            // If the current digit's cost is less than or equal to the current total cost 'i'.
            if ( cost <= i )
            {
              // Calculate the potential length if this digit is used.
              // It's 1 (for the current digit) + the max length achievable for the remaining cost (i - cost).
              var cur = 1 + dp[i - cost][0];

              // If this new length is greater than the current maximum for 'i', update 'max'.
              // Since 'nums' is sorted descending by digit, the first 'max' found for a given length will use the largest digit.
              if ( cur > max[0] )
              {
                max = [cur, digit];
              }
            }
          }
        }
        catch ( err )
        {
          _didIteratorError3 = true; // Mark error.
          _iteratorError3 = err;     // Store error.
        }
        finally
        {
          try
          {
            // Ensure inner iterator cleanup.
            if ( !_iteratorNormalCompletion3 && _iterator3.return != null )
            {
              _iterator3.return();
            }
          }
          finally
          {
            // Re-throw inner loop error.
            if ( _didIteratorError3 )
            {
              throw _iteratorError3;
            }
          }
        }

        dp[i] = max; // Store the maximum length and digit for cost 'i'.
      }
    }
    catch ( err )
    {
      _didIteratorError2 = true; // Mark error for outer loop.
      _iteratorError2 = err;     // Store error for outer loop.
    }
    finally
    {
      try
      {
        // Ensure outer iterator cleanup.
        if ( !_iteratorNormalCompletion2 && _iterator2.return != null )
        {
          _iterator2.return();
        }
      }
      finally
      {
        // Re-throw outer loop error.
        if ( _didIteratorError2 )
        {
          throw _iteratorError2;
        }
      }
    }

    var result = ""; // Initialize an empty string to build the result number.
    var matches = N; // Start with the total cost N.

    // Backtrack through the DP array to reconstruct the number.
    for (
        ;
        matches > 0
        ;
    )
    {
      var _dp$matches = _slicedToArray( dp[matches], 2 )
          , digit = _dp$matches[1]
          ;

      result += digit; // Append the chosen digit to the result string.
      matches -= costs[digit]; // Subtract the cost of the chosen digit from the remaining cost.
    }

    // Output the final constructed number to the console.
    console.log( result );

  }( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) )
      ; // Read input from stdin and pass it to the main function.

}()
    ; // End of the main application IIFE.