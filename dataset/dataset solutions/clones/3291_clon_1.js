'use strict';


// This ensures strict parsing and execution of JavaScript code.
process.stdin.resume();

// Sets the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');


/**
 * Calculates the maximum value in an array of numbers.
 *
 * @param {Array<number>} a - The input array.
 * @returns {number} The maximum value found in the array.
 */
const max = ( a ) => {

  // Initialize loop counter with array length.
  let i = a . length;

  // Initialize max with negative infinity to ensure any number is greater.
  let max = -Infinity;

  // Iterate backwards through the array.
  while ( i -- ) {

    // If current element is greater than current max, update max.
    if ( a [ i ] > max ) {
        max = a [ i ];
    }
  }

  // Return the greatest value found.
  return max;
};


/**
 * Calculates the minimum value in an array of numbers.
 *
 * @param {Array<number>} a - The input array.
 * @returns {number} The minimum value found in the array.
 */
const min = ( a ) => {

  // Initialize loop counter with array length.
  let i = a . length;

  // Initialize max with positive infinity to ensure any number is smaller.
  let max = Infinity;

  // Iterate backwards through the array.
  while ( i -- ) {

    // If current element is less than current max, update max.
    if ( a [ i ] < max ) {
        max = a [ i ];
    }
  }

  // Return the smallest value found.
  return max;
};


/**
 * The main function to process input and solve the problem.
 *
 * @param {string} p - The input string containing problem data.
 */
const Main = ( p ) => {

  // Split the input string by newlines into an array of lines.
  p = p . split ( "\n" );

  // Parse N, the first number from the first line.
  let N = parseInt ( p [ 0 ] );

  // Parse h, an array of numbers from the second line.
  let h = ( p [ 1 ] . split ( " " ) . map ( Number ) );

  // Initialize a cost array 'c' with Infinity.
  // The size is N + 20 to prevent out-of-bounds access for dp(i+2).
  let c = new Array ( N + 20 ) . fill ( Infinity );

  // The cost to reach the starting position (index 0) is 0.
  c [ 0 ] = 0;


  /**
   * Recursive dynamic programming function to calculate minimum costs.
   * This function calculates the minimum cost to reach index i+1 and i+2
   * from the current index i.
   *
   * @param {number} i - The current index.
   */
  const dp = ( i ) => {

    // Base case: if index exceeds N, no further processing needed.
    if ( i > N ) {
        return 0;
    }

    // Calculate cost to reach i+1: min(current cost, cost from i + abs(h[i] - h[i+1])).
    c [ i + 1 ] = Math . min ( c [ i ] + Math . abs ( h [ i ] - h [ i + 1 ] ) , c [ i + 1 ] );

    // Calculate cost to reach i+2: min(current cost, cost from i + abs(h[i] - h[i+2])).
    c [ i + 2 ] = Math . min ( c [ i ] + Math . abs ( h [ i ] - h [ i + 2 ] ) , c [ i + 2 ] );

    // Recursively call for the next positions.
    dp ( i + 1 );
    dp ( i + 2 );
  };

  // Start the dynamic programming calculation from index 0.
  dp ( 0 );


  // Output the minimum cost to reach the (N-1)th position.
  console . log ( c [ N - 1 ] );
};


// This section handles standard input/output and calls the Main function.
// It reads the entire standard input and passes it to Main.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );