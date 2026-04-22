/*
 * This JavaScript code implements a solution to a problem involving
 * prime-related calculations using a sieve-like approach.
 * It reads input from /dev/stdin, processes queries, and outputs results.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

'use strict' ;


// The entire logic is wrapped in an immediately invoked function expression (IIFE).
console.log( function ( args ) {

  // Parse the input arguments.
  //   - trim() removes leading/trailing whitespace.
  //   - split('\n') divides the input into lines.
  //   - map( r=>r.split(' ').map(v=>v|0) ) processes each line:
  //     - splits it by spaces, then
  //     - converts each part to an integer using the bitwise OR operator (v|0).
  const tmp = args . trim ( ) . split ( '\n' ) . map ( r => r . split ( ' ' ) . map ( v => v | 0 ) ) ;

  // The first element of the first line (after parsing) represents the number of queries (Q).
  // shift() removes and returns the first element from 'tmp'.
  const Q = tmp . shift ( ) [ 0 ] ;

  // Define the maximum limit for array sizes.
  const MAX = 50000 ;

  // Array 'a' is used as a boolean-like sieve. Initially, all elements are 1.
  const a = Array ( MAX ) . fill ( 1 ) ;

  // Array 's' will store prefix sums. It's one element larger than MAX.
  const s = Array ( MAX + 1 ) . fill ( 0 ) ;


  // Initialize specific values in 'a' and 's'.
  // These initializations are crucial for the sieve logic.
  a [ 0 ] = 0 ;
  a [ 1 ] = 1 ;
  s [ 0 ] = s [ 1 ] = 0 ;
  s [ 2 ] = 1 ;

   // This loop implements a variation of a sieve algorithm.
   // It iterates from i = 1 up to MAX-1.
   for ( let i = 1 ; i < MAX ; i ++ ) {

    // If a[i] is 0, it means the number corresponding to 'i' has already been processed or marked.
    if ( ! a [ i ] ) {
      continue ; // Skip to the next iteration.
    }

    // Calculate 'n' based on 'i'. This 'n' is likely a prime or a number related to the sieve.
    const n = 2 * i + 1 ;

    // This condition checks if 'i' is odd (~i&1 is true if i is even, false if i is odd)
    // AND if a[i/2] is true. If both are met, s[i+1] is set to 1.
    if ( ~ i & 1 && a [ i / 2 ] ) {
      s [ i + 1 ] = 1 ;
    }

    // Mark multiples of 'n' in array 'a' as 0.
    // This is the core "sieve out" step, similar to marking multiples of a prime.
    for ( let j = i + n ; j < MAX ; j = j + n ) {
      a [ j ] = 0 ;
    }
  }

  // Calculate prefix sums for array 's'.
  // s[i] will store the sum of values from s[0] to s[i-1] (or similar accumulation).
  for ( let i = 2 ; i < MAX ; i ++ ) {
    s [ i ] += s [ i - 1 ] ;
  }

  // Initialize an empty array to store the results of each query.
  let x = [ ] ;

  // Process each of the 'Q' queries.
  for ( let i = 0 ; i < Q ; i ++ ) {

    // Extract query parameters from 'tmp'.
    // tmp[i][0] and tmp[i][1] are the original query values.
    // 'l' and 'r' are calculated based on these values, adjusted for array indexing and problem specifics.
    const l = ( tmp [ i ] [ 0 ] - 1 ) / 2 ;
    const r = ( tmp [ i ] [ 1 ] - 1 ) / 2 + 1 ;

    // Calculate the difference s[r] - s[l] and push it into the results array 'x'.
    // This difference represents the sum or count within a specific range,
    // leveraging the prefix sums pre-calculated in 's'.
    x . push ( s [ r ] - s [ l ] ) ;
  }

  // Join all elements of the results array 'x' with newline characters
  // and return the resulting string.
  return x . join ( '\n' ) ;

// The input for the IIFE is read synchronously from '/dev/stdin' using Node.js's 'fs' module.
} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ;