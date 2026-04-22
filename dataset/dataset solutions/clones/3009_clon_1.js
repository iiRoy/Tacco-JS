/*
 * This file contains the main logic for processing input
 * and calculating the maximum GCD of all possible subarrays
 * by excluding one element at a time.
 */

"use strict"; /* Enforces strict mode for cleaner code */

/**
 * The main entry point function for the program.
 * It reads input, performs calculations, and prints the result.
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input ) {
  // Initialize an input parser utility.
  let cin = new Inputer ( input ) ;

  // Read the number of elements (N) from the input.
  let N = cin . getInt ( ) ;

  // Read the array of integers (A) of size N.
  let A = cin . getIntArray ( N ) ;

  /*
   * Defines a Greatest Common Divisor (GCD) function using Euclidean algorithm.
   * This is a recursive implementation.
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {number} The GCD of a and b.
   */
  const gcd = ( a , b ) => {
    // If b is not zero, recurse with b and the remainder of a divided by b.
    // Otherwise, a is the GCD.
    return b ? gcd ( b , a % b ) : a ;
  }

  // Initialize an array 'L' to store prefix GCDs.
  // L[n] will store gcd(A[0], A[1], ..., A[n-1]).
  // L has N+1 elements, with L[0] initialized to 0 (identity for gcd).
  let L = new Array ( N + 1 ) ;
  L [ 0 ] = 0 ;

  // Initialize an array 'R' to store suffix GCDs.
  // R[n] will store gcd(A[n], A[n+1], ..., A[N-1]).
  // R has N+1 elements, with R[N] initialized to 0 (identity for gcd).
  let R = new Array ( N + 1 ) ;
  R [ N ] = 0 ;

  // Calculate prefix GCDs.
  // Iterate from the beginning to the end of the array A.
  for ( let n = 0 ; n <= N ; n ++ ) {
    // L[n+1] is the GCD of L[n] (prefix GCD up to A[n-1]) and A[n].
    // Note: A[n] is undefined when n=N, but L[N+1] is not used.
    // The loop computes L[1] to L[N]. L[N] is gcd(A[0]...A[N-1]).
    L [ n + 1 ] = gcd ( L [ n ] , A [ n ] ) ;
  }

  // Calculate suffix GCDs.
  // Iterate from the end to the beginning of the array A.
  for ( let n = N - 1 ; n >= 0 ; n -- ) {
    // R[n] is the GCD of R[n+1] (suffix GCD from A[n+1]) and A[n].
    R [ n ] = gcd ( R [ n + 1 ] , A [ n ] ) ;
  }

  // Initialize an array 'M' to store the GCDs when one element is removed.
  // M[n] will store gcd(prefix GCD up to A[n-1], suffix GCD from A[n+1]).
  let M = new Array ( N ) ;

  // Calculate the GCD for each case where one element is removed.
  // For each element A[n] in the original array:
  for ( let n = 0 ; n < N ; n ++ ) {
    // M[n] is the GCD of the prefix up to A[n-1] (L[n])
    // and the suffix from A[n+1] (R[n+1]).
    M [ n ] = gcd ( L [ n ] , R [ n + 1 ] ) ;
  }

  // Output the maximum value found in the 'M' array.
  // This maximum value is the answer to the problem.
  console . log ( Math . max ( ... M ) ) ;
}

/*
 * Helper class for parsing input from standard input.
 * It tokenizes the input string and provides methods to retrieve
 * integers and strings sequentially.
 */
class Inputer {
  /*
   * Constructor for the Inputer class.
   * @param {string} t - The input string to be parsed.
   * @throws {Error} If the input string 't' is undefined.
   */
  constructor ( t ) {
    // Ensure that an input string is provided.
    if ( typeof t == 'undefined' ) {
      throw new Error ( '引数（stdin）を省略できません！' ) ;
    }

    // Initialize a counter for the current item index.
    this . cnt = 0 ;

    // Split the input string by newlines or spaces into an array of items.
    this . items = t . split ( /\n|\s/ ) ;
  }

  /*
   * Retrieves the next integer from the input stream.
   * @returns {number} The next integer value.
   */
  getInt ( ) {
    // Convert the current item to a number and increment the counter.
    return this . items [ this . cnt ++ ] - 0 ;
  }

  /*
   * Retrieves an array of integers of a specified length.
   * @param {number} t - The number of integers to retrieve.
   * @returns {number[]} An array containing 't' integer values.
   * @throws {Error} If the length 't' is undefined.
   */
  getIntArray ( t ) {
    // Ensure that the length 't' is provided.
    if ( typeof t == 'undefined' ) {
      throw new Error ( '引数（1以上）を省略できません！' ) ;
    }

    // Create a new array to store the integers.
    let r = new Array ( t ) ;

    // Populate the array by calling getInt() 't' times.
    for ( let e = 0 ; e < t ; e ++ ) {
      r [ e ] = this . getInt ( ) ;
    }

    // Return the array of integers.
    return r ;
  }

  /*
   * Retrieves the next string from the input stream.
   * @returns {string} The next string value.
   */
  getStr ( ) {
    // Return the current item and increment the counter.
    return this . items [ this . cnt ++ ] ;
  }

  /*
   * Retrieves an array of strings of a specified length.
   * @param {number} t - The number of strings to retrieve.
   * @returns {string[]} An array containing 't' string values.
   * @throws {Error} If the length 't' is undefined.
   */
  getStrArray ( t ) {
    // Ensure that the length 't' is provided.
    if ( typeof t == 'undefined' ) {
      throw new Error ( '引数（1以上）を省略できません！' ) ;
    }

    // Create a new array to store the strings.
    let r = new Array ( t ) ;

    // Populate the array by calling getStr() 't' times.
    for ( let e = 0 ; e < t ; e ++ ) {
      r [ e ] = this . getStr ( ) ;
    }

    // Return the array of strings.
    return r ;
  }
}

// This block handles execution in different environments.
// If not running in a browser environment (e.g., Node.js),
// it reads input from /dev/stdin and calls the Main function.
if ( typeof window == "undefined" ) {
  // Read the entire content of /dev/stdin as a UTF-8 string.
  const fs = require ( "fs" ) ;
  const inputData = fs . readFileSync ( "/dev/stdin" , "utf8" ) ;

  // Call the Main function with the read input.
  Main ( inputData ) ;
}