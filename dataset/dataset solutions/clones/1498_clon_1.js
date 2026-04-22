/*
 * This file contains a JavaScript program designed to solve a specific
 * mathematical problem, likely involving number theory or optimization.
 * It includes a set of utility functions for input/output processing
 * and common mathematical operations like extended Euclidean algorithm.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

"use strict" ; // Enforces strict mode for cleaner code and fewer errors.

// --- Input Processing Utilities ---

// Reads the entire input from /dev/stdin as UTF-8.
var input = require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Splits the input into tokens by spaces or newlines.
var cin = input . split( / |\n/ ) ,
    cid = 0 ; // Current index for reading tokens.

/**
 * Reads the next token as a number.
 * @returns {number} The next numerical token.
 */
function next ( ) {
  return +cin[ cid++ ] ;
}

/**
 * Reads the next token as a string.
 * @returns {string} The next string token.
 */
function nextstr ( ) {
  return cin[ cid++ ] ;
}

/**
 * Reads the next token as a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function nextbig ( ) {
  return BigInt( cin[ cid++ ] ) ;
}

/**
 * Reads N tokens as an array.
 * Optionally converts them to numbers if 'a' is truthy.
 * @param {number} n - Number of tokens to read.
 * @param {boolean} a - If true, map tokens to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function nexts ( n , a ) {
  if ( a ) {
    return cin . slice ( cid , cid += n ) . map ( a => +a ) ;
  } else {
    return cin . slice ( cid , cid += n ) ;
  }
}

/**
 * Reads N tokens, converts to numbers, and sorts them.
 * Sorts in descending order if 'a' is truthy, ascending otherwise.
 * @param {number} n - Number of tokens to read.
 * @param {boolean} a - If true, sort descending.
 * @returns {Array<number>} A sorted array of numbers.
 */
function nextssort ( n , a ) {
  if ( a ) {
    return cin . slice ( cid , cid += n ) . map ( a => +a ) . sort ( ( a , b ) => b - a ) ;
  } else {
    return cin . slice ( cid , cid += n ) . map ( a => +a ) . sort ( ( a , b ) => a - b ) ;
  }
}

/**
 * Reads a 2D matrix of H rows and W columns.
 * Optionally converts elements to numbers if 'a' is truthy.
 * @param {number} h - Number of rows.
 * @param {number} w - Number of columns.
 * @param {boolean} a - If true, map elements to numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function nextm ( h , w , a ) {
  var r = [ ] ,
      i = 0 ;

  if ( a ) { // If 'a' is true, parse as numbers
    for ( ; i < h ; i++ ) {
      r . push ( cin . slice ( cid , cid += w ) ) ;
    }
  } else { // Otherwise, keep as strings
    for ( ; i < h ; i++ ) {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => +a ) ) ;
    }
  }

  return r ;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * Uses `eval` for dynamic array creation based on arguments.
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments ,
      l = a . length ,
      r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;

  while ( --l ) {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
  }

  return eval ( r ) ;
}

// --- Output Processing Utilities ---

var streams = [ ] ; // Buffer for output lines.

/**
 * Pushes a value to the output buffer.
 * @param {*} s - The value to be printed.
 */
function print ( s ) {
  streams . push ( s ) ;
}

// --- Main Program Execution ---

// Execute the main function and store its result.
var myOut = main ( ) ;

// If main() returns a value, print it to console.
if ( myOut !== undefined ) {
  console . log ( String ( myOut ) ) ;
}

// If there are buffered streams, print them joined by newlines.
if ( streams . length ) {
  console . log ( streams . join ( "\n" ) ) ;
}

// --- Core Logic Functions ---

/**
 * Main function containing the problem-solving logic.
 * Calculates an optimized value based on input 'n'.
 * @returns {number} The calculated minimum answer.
 */
function main ( ) {
  var n = next ( ) ; // Read the input number.

  if ( n === 1 ) {
    return 1 ; // Base case: if n is 1, the answer is 1.
  }

  // Initialize x1 with n and x2 with 2 for prime factorization.
  var x1 = n ;
  var x2 = 2 ;

  // Factor out all powers of 2 from x1, accumulating them in x2.
  while ( x1 % 2 === 0 ) {
    x1 /= 2 ;
    x2 *= 2 ;
  }

  // Initialize variables for the main loop.
  var n2 = n * 2 , // n doubled.
      ans = n2 - 1 ; // Initial answer candidate.

  // Iterate through potential factors of x1 (odd numbers).
  for ( var i = 1 ; i * i <= x1 ; i += 2 ) {
    if ( x1 % i ) {
      continue ; // If 'i' is not a factor, skip to the next iteration.
    }

    var u = x1 / i ; // Calculate the complementary factor.

    // Calculate two possibilities using function 'f' with swapped arguments.
    var f1 = f ( u , i * x2 ) ;
    var f2 = f ( u * x2 , i ) ;

    // Update the minimum answer found so far.
    ans = Math . min ( ans , f1 , f2 ) ;
  }

  return ans ; // Return the final minimum answer.
}

/**
 * Helper function 'f' used in the main logic.
 * It calculates a value based on extended Euclidean algorithm results.
 * @param {number} u - First operand.
 * @param {number} v - Second operand.
 * @returns {number} A calculated value or a large number if conditions are not met.
 */
function f ( u , v ) {
  // Call extended Euclidean algorithm for u and v.
  var [ a , b , c ] = exgcd ( u , v ) ;

  // If the GCD (c) is greater than 1, return a very large number (effectively infinity).
  if ( c > 1 ) {
    return 9e15 ;
  }

  // If 'a' is negative, return -a*u.
  if ( a < 0 ) {
    return -a * u ;
  }

  // If 'b' is negative, return -b*v.
  if ( b < 0 ) {
    return -b * v ;
  }

  // If neither 'a' nor 'b' is negative, return a very large number.
  return 9e15 ;
}

/**
 * Implements the extended Euclidean algorithm.
 * Finds integers 'a' and 'b' such that ax + by = gcd(x, y).
 * @param {number} x - First number.
 * @param {number} y - Second number.
 * @returns {Array<number|BigInt>} An array [a, b, gcd(x,y)].
 */
function exgcd ( x , y ) {
  // Initialize coefficients for a and b, using BigInt for precision.
  var a0 = 1n , a1 = 0n ,
      b0 = 0n , b1 = 1n ;

  // Convert inputs to BigInt.
  x = BigInt ( x ) ;
  y = BigInt ( y ) ;

  // Euclidean algorithm loop.
  while ( y ) {
    var q1 = x / y ; // Quotient.
    var r2 = x % y ; // Remainder.

    // Update coefficients.
    var a2 = a0 - q1 * a1 ;
    var b2 = b0 - q1 * b1 ;

    // Shift values for next iteration.
    x = y ;
    y = r2 ;

    a0 = a1 ;
    a1 = a2 ;

    b0 = b1 ;
    b1 = b2 ;
  }

  // Return the coefficients (converted to Number) and the GCD.
  return [ Number ( a0 ) , Number ( b0 ) , x ] ;
}