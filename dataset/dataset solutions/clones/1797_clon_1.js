"use strict" ;

// This section contains utility functions for reading input data.
// It uses Node.js 'fs' module to synchronously read from standard input.
var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// The input string is split into tokens using spaces or newlines as delimiters.
// 'cin' stores these tokens, and 'cid' (current input index) tracks the next token to be read.
var cin = input . split ( / |\n/ ) ,
    cid = 0 ;

/**
 * Retrieves the next token from the 'cin' array and converts it to a number.
 * The 'cid' index is incremented after retrieval.
 * @returns {number} The numeric value of the next token.
 */
function next ( ) {
  return + cin [ cid ++ ] ;
}

/**
 * Retrieves the next token from the 'cin' array as a string.
 * The 'cid' index is incremented after retrieval.
 * @returns {string} The string value of the next token.
 */
function nextstr ( ) {
  return cin [ cid ++ ] ;
}

/**
 * Retrieves the next token from the 'cin' array and converts it to a BigInt.
 * The 'cid' index is incremented after retrieval.
 * @returns {BigInt} The BigInt value of the next token.
 */
function nextbig ( ) {
  return BigInt ( cin [ cid ++ ] ) ;
}

/**
 * Reads 'n' tokens from the 'cin' array.
 * If 'a' is true, tokens are returned as strings; otherwise, they are converted to numbers.
 * The 'cid' index is updated by 'n'.
 * @param {number} n The number of tokens to read.
 * @param {boolean} a Flag to determine if tokens should be strings (true) or numbers (false).
 * @returns {Array<string|number>} An array containing the read tokens.
 */
function nexts ( n , a ) {
  return a
    ? cin . slice ( cid , cid += n )
    : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}

/**
 * Reads a 2D array (matrix) of dimensions 'h' (height) by 'w' (width) from the 'cin' array.
 * If 'a' is true, elements are returned as strings; otherwise, they are converted to numbers.
 * The 'cid' index is updated appropriately.
 * @param {number} h The number of rows.
 * @param {number} w The number of columns per row.
 * @param {boolean} a Flag to determine if elements should be strings (true) or numbers (false).
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm ( h , w , a ) {
  var r = [ ] ,
      i = 0 ;

  if ( a ) {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) ) ;
    }
  }
  else {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
    }
  }
  return r ;
}

/**
 * Creates a multi-dimensional array with specified dimensions, initialized with a given value.
 * This function uses 'eval' for dynamic array creation, which should be used with caution.
 * The first argument 'v' is the initial value; subsequent arguments are the dimensions.
 * @param {*} v The value to initialize the innermost array elements with.
 * @param {...number} dimensions The dimensions of the array, from outermost to innermost.
 * @returns {Array} The dynamically created multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments ,
      l = a . length ,
      r = "Array ( a [ " + -- l + " ] ) . fill ( ) . map ( x => { return " + v + " ; } )" ;

  while ( -- l ) {
    r = "Array ( a [ " + l + " ] ) . fill ( ) . map ( x => " + r + " )" ;
  }
  return eval ( r ) ; // Executes the constructed string as JavaScript code.
}


// --- Main Program Logic ---

// Execute the main function of the program.
var myOut = main ( ) ;

// If the main function returns a defined value, print it to the console.
if ( myOut !== undefined ) {
  console . log ( String ( myOut ) ) ;
}

/**
 * The primary function that encapsulates the core algorithm of the problem.
 * It processes input, performs calculations, and prepares the final output.
 * @returns {string} The computed result, typically a string with elements joined by newlines.
 */
function main ( ) {
  // Read the initial integer 'n' from the input.
  var n = next ( ) ;

  // Read 'n' pairs of numbers into a 2D array 'v'. Each inner array has 2 elements.
  var v = nextm ( n , 2 ) ;

  // 'aa' is a constant, likely representing a threshold or a specific depth in a data structure.
  var aa = 11 ;

  // 'mn' determines the size for a precomputed array 'w'.
  // It's the minimum of 'n' and 2 raised to the power of 'aa'.
  var mn = Math . min ( n , 1 << aa ) ;

  // Initialize 'w' as an array of size 'mn'. This array will store precomputed results.
  var w = Array ( mn ) ;

  // The first element of 'w' is initialized with the first item from 'v'.
  w [ 0 ] = [ v [ 0 ] ] ;

  // This loop precomputes combinations for smaller subproblems, up to 'mn'.
  // It appears to build a tree-like structure or a dynamic programming table.
  for ( var i = 1 ; i < mn ; i ++ ) {
    // 'd' calculates the base-2 logarithm (floor) of (i+1).
    var d = 31 - Math . clz32 ( i + 1 ) ;

    // 't' calculates the parent index in a binary tree, using bitwise right shift.
    var t = i - 1 >> 1 ;

    // 'wi' is a temporary array, initialized with a copy of the parent's combinations.
    var wi = w [ t ] . concat ( ) ;

    // Add the current item 'v[i]' to 'wi'.
    wi . push ( v [ i ] ) ;

    // Iterate through the parent's combinations to create new combinations with 'v[i]'.
    for ( var j = 0 ; j < w [ t ] . length ; j ++ ) {
      // Check if the sum of the second elements (e.g., weights or costs) does not exceed 1e5.
      if ( w [ t ] [ j ] [ 1 ] + v [ i ] [ 1 ] <= 1e5 ) {
        // If within bounds, add a new combined item: sum of first elements (values) and sum of second elements.
        wi . push ( [ w [ t ] [ j ] [ 0 ] + v [ i ] [ 0 ] , w [ t ] [ j ] [ 1 ] + v [ i ] [ 1 ] ] ) ;
      }
    }

    // Sort 'wi' based on its second element in ascending order.
    wi . sort ( ( a , b ) => a [ 1 ] - b [ 1 ] ) ;

    // Initialize w[i] with the first element of the sorted 'wi'.
    w [ i ] = [ wi [ 0 ] ] ;

    // Filter 'wi' to keep only "Pareto optimal" combinations.
    // An item is kept if its first element (value) is greater than the last kept item's value.
    for ( var j = 1 ; j < wi . length ; j ++ ) {
      if ( wi [ j ] [ 0 ] > w [ i ] [ w [ i ] . length - 1 ] [ 0 ] ) {
        w [ i ] . push ( wi [ j ] ) ;
      }
    }
  }

  // Read the number of queries 'q'.
  var q = next ( ) ;

  // Initialize an array 'ans' to store the results for each query.
  var ans = Array ( q ) ;

  // Process each query one by one.
  for ( var i = 0 ; i < q ; i ++ ) {
    // Read query parameters: 'x' (an index or identifier) and 's' (a capacity or limit).
    var x = next ( ) ,
        s = next ( ) ;

    // Recalculate 'd' for the current query 'x'.
    var d = 31 - Math . clz32 ( x ) ;

    // 'z' will store the maximum achievable value for the current query.
    var z = 0 ;

    // Adjust 'x' to be 0-indexed.
    x -- ;

    // Conditional logic based on 'd' (depth/level) relative to the constant 'aa'.
    if ( d < aa ) {
      // If 'd' is less than 'aa', use the directly precomputed results from 'w[x]'.
      for ( var j = 0 ; j < w [ x ] . length ; j ++ ) {
        // Find the maximum 'z' where the second element (cost/weight) is within the limit 's'.
        if ( z < w [ x ] [ j ] [ 0 ] && w [ x ] [ j ] [ 1 ] <= s ) {
          z = w [ x ] [ j ] [ 0 ] ;
        }
      }
      ans [ i ] = z ; // Store the result.
    }
    else {
      // If 'd' is greater than or equal to 'aa', a more complex calculation is needed.
      // This path likely combines on-the-fly computation with precomputed 'w' values.

      // 'wt' (working temporary) starts with the item 'v[x]'.
      var wt = [ v [ x ] ] ;

      // Adjust 'x' to its parent index in the implicit binary tree structure.
      x = x - 1 >> 1 ;

      // Loop upwards from 'd' down to 'aa', combining items.
      for ( var k = d ; k >= aa ; k -- ) {
        var ln = wt . length ; // Store the current number of items in 'wt'.
        wt . push ( v [ x ] ) ; // Add the item 'v[x]' to 'wt'.

        // Combine existing items in 'wt' with the newly added 'v[x]'.
        for ( var j = 0 ; j < ln ; j ++ ) {
          // Check if the combined second element (cost) is within the limit 1e5.
          if ( wt [ j ] [ 1 ] + v [ x ] [ 1 ] <= 1e5 ) {
            // Add the new combined item to 'wt'.
            wt . push ( [ wt [ j ] [ 0 ] + v [ x ] [ 0 ] , wt [ j ] [ 1 ] + v [ x ] [ 1 ] ] ) ;
          }
        }
        x = x - 1 >> 1 ; // Move 'x' to its next parent.
      }

      // Sort 'wt' based on its second element (cost) in ascending order.
      wt . sort ( ( a , b ) => a [ 1 ] - b [ 1 ] ) ;

      // 'r' is a pointer, initially set to the last index of 'wt'.
      var r = wt . length ;

      // Post-process 'wt' to ensure that values are non-decreasing as weights increase.
      // If a subsequent item has a smaller value, its value is replaced, and its weight is set to a very large number (1e6)
      // to effectively exclude it from consideration unless 's' is extremely large.
      for ( var j = 1 ; j < r ; j ++ ) {
        if ( wt [ j ] [ 0 ] < wt [ j - 1 ] [ 0 ] ) {
          wt [ j ] [ 0 ] = wt [ j - 1 ] [ 0 ] ;
          wt [ j ] [ 1 ] = 1e6 ;
        }
      }
      r -- ; // Adjust 'r' to be a valid index.

      // Combine the processed 'wt' with the precomputed 'w[x]' (for the remaining smaller part).
      for ( var j = 0 ; j < w [ x ] . length ; j ++ ) {
        // Skip items from 'w[x]' if their weight is already too high.
        if ( w [ x ] [ j ] [ 1 ] > 1e5 ) {
          continue ;
        }

        // Use a two-pointer approach to find the best combination:
        // Move 'r' backwards in 'wt' as long as the combined weight exceeds 's'.
        while ( r >= 0 && wt [ r ] [ 1 ] + w [ x ] [ j ] [ 1 ] > s ) {
          r -- ;
        }

        // If 'r' becomes negative, no more valid combinations are possible with current 'w[x][j]'.
        if ( r < 0 ) {
          break ;
        }

        // Update 'z' if a combination yielding a higher total value is found.
        if ( z < wt [ r ] [ 0 ] + w [ x ] [ j ] [ 0 ] ) {
          z = wt [ r ] [ 0 ] + w [ x ] [ j ] [ 0 ] ;
        }
      }
      ans [ i ] = z ; // Store the final result for this query.
    }
  }

  // Join all computed answers with newline characters and return the resulting string.
  return ans . join ( "\n" ) ;
}