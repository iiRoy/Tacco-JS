/*
 * This is a JavaScript program designed to solve a specific problem.
 * It includes utility functions for input processing
 * and a main function containing the core algorithm.
 */
"use strict" ; /* Enforce strict mode for better code quality and fewer common pitfalls */


// --- Input/Output Utility Functions ---

// Read entire standard input synchronously, decode as UTF-8
var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;
// Split input by space or newline, initialize cursor for reading tokens
var cin = input . split ( / |\n/ ) , cid = 0 ;


/**
 * Reads the next token from the input array and converts it to a number.
 * @returns {number} The next numerical token.
 */
function next ( ) {
  return + cin [ cid ++ ] ;
}

/**
 * Reads the next token from the input array as a string.
 * @returns {string} The next string token.
 */
function nextstr ( ) {
  return cin [ cid ++ ] ;
}

/**
 * Reads the next token from the input array and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function nextbig ( ) {
  return BigInt ( cin [ cid ++ ] ) ;
}

/**
 * Reads 'n' tokens from the input.
 * @param {number} n The number of tokens to read.
 * @param {boolean} a If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of the read tokens.
 */
function nexts ( n , a ) {
  return a ? cin . slice ( cid , cid += n ) : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}

/**
 * Reads a matrix of 'h' rows and 'w' columns from the input.
 * @param {number} h The number of rows.
 * @param {number} w The number of columns.
 * @param {boolean} a If true, elements are strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm ( h , w , a ) {
  var r = [ ] , i = 0 ; // Initialize result array and loop counter
  if ( a ) {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) ) ; // Read row as strings
    }
  } else {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ; // Read row as numbers
    }
  }
  return r ;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as subsequent arguments.
 * Uses `eval` for dynamic array creation, which should be used with caution.
 * @param {*} v The initial value for all elements.
 * @param {...number} dimensions The dimensions of the array (e.g., xArray(0, 2, 3) for a 2x3 array of zeros).
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments , l = a . length , r = "Array(a[" + -- l + "]) . fill ( ) . map ( x => { return " + v + " ; } )" ;
  while ( -- l ) {
    r = "Array(a[" + l + "]) . fill ( ) . map ( x => " + r + ")" ;
  }
  return eval ( r ) ; // Execute the dynamically constructed array creation string
}


// --- Main Program Execution ---

// Call the main logic function and store its result.
var myOut = main ( ) ;

// If the main function returned a value (i.e., not undefined), print it to the console.
if ( myOut !== undefined ) {
  console . log ( String ( myOut ) ) ;
}


/*
 * The core logic of the program.
 * This function processes the input array 'a' to find an optimal value
 * using a binary search approach coupled with a specific array manipulation algorithm.
 */
function main ( ) {
  var n = next ( ) ; // Read the number of elements for the array 'a'
  var a = nexts ( n ) ; // Read 'n' integer elements into array 'a'

  // Initialize binary search bounds. 'ok' is a known possible answer, 'ng' is a known impossible answer.
  var ok = n , ng = 0 ;

  // Binary search loop: continues as long as there's a range to search (ok - ng > 1)
  while ( ok - ng > 1 ) {
    // Calculate the midpoint 'm' for the current search range. Using bitwise shift for integer division.
    var m = ok + ng >> 1 , f = 1 ; // 'f' is a flag, initially true (assuming 'm' is possible)

    var b ; // Declare array 'b', which dynamically stores pairs of (value, count)

    // Initialize array 'b' based on the first element of 'a'.
    if ( a [ 0 ] > 1 ) {
      b = [ 1 , 1 , a [ 0 ] , 1 ] ; // If a[0] > 1, 'b' starts with a specific pattern
    } else {
      b = [ 1 , 1 ] ; // Otherwise, 'b' starts with a simpler pattern
    }

    // Iterate through the rest of the array 'a' (from the second element)
    // The loop continues only if the flag 'f' remains true.
    for ( var i = 1 ; i < n && f ; i ++ ) {
      // Check if the second-to-last element in 'b' is less than the current element a[i].
      if ( b [ b . length - 2 ] < a [ i ] ) {
        // If true, pop elements from 'b' while the last element is 1 and length > 2.
        while ( b . length > 2 && b [ b . length - 1 ] === 1 ) {
          b . length -= 2 ;
        }
        b . push ( a [ i ] , 1 ) ; // Then push a[i] and a count of 1.
      } else {
        // If the condition is false (b[b.length-2] >= a[i])
        // Special case: if 'm' is 1, immediately set 'f' to false and break.
        if ( m === 1 ) {
          f = 0 ;
          break ;
        }
        // Pop elements from 'b' while the second-to-last element is greater than a[i].
        while ( b [ b . length - 2 ] > a [ i ] ) {
          b . length -= 2 ;
        }
        // After popping, if b[b.length-2] is now less than a[i], push a[i] with count 2.
        if ( b [ b . length - 2 ] < a [ i ] ) {
          b . push ( a [ i ] , 2 ) ;
        } else {
          // More complex handling if b[b.length-2] is equal to a[i] (or other conditions)
          var t = b [ b . length - 2 ] ; // Store the second-to-last element of 'b' in 't'.
          // Iterate backwards through 'b' in steps of 2, starting from the last element's index.
          for ( var j = b . length - 1 ; j > 0 ; j -= 2 ) {
            // If the element before the current pair (b[j-1]) is less than 't',
            // push a[i] with count 2 and break the inner loop.
            if ( b [ j - 1 ] < t ) {
              b . push ( a [ i ] , 2 ) ;
              break ;
            }
            // If the current count (b[j]) is less than 'm',
            // increment the count, and if b[j-1] < a[i], push a[i] with count 1, then break.
            if ( b [ j ] < m ) {
              b [ j ] ++ ;
              if ( b [ j - 1 ] < a [ i ] ) {
                b . push ( a [ i ] , 1 ) ;
              }
              break ;
            }
            // If neither of the above conditions met, pop the last pair from 'b' and decrement 't'.
            b . length -= 2 ;
            t -- ;
          }
          // If the inner loop completed without breaking (meaning j became less than 0),
          // set flag 'f' to false.
          if ( j < 0 ) {
            f = 0 ;
          }
        }
      }
    }

    // Update binary search bounds based on the final value of flag 'f'.
    if ( f ) {
      ok = m ; // If 'f' is true, 'm' is a possible (or better) answer.
    } else {
      ng = m ; // If 'f' is false, 'm' is not a possible answer.
    }
  }
  return ok ; // Return the final 'ok' value, which is the result of the binary search.
}