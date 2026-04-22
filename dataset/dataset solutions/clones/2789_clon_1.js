'use strict';

/*
 * This JavaScript module defines a main function to solve a combinatorial problem.
 * It takes an input string, parses numerical parameters 'n' and 'k',
 * and then computes and prints results based on combinations.
 * The 'use strict' directive ensures the code runs in strict mode,
 * which helps catch common coding errors and "unsafe" actions.
 */

const Main = ( arg ) => {


  // The input 'arg' is expected to be a string.
  // First, trim any leading/trailing whitespace from the input.
  // Then, split the string into an array of lines using the newline character.
  let input = arg.trim().split( '\n' );


  // From the first line of the input array (input[0]):
  // Split it by space, then map each resulting string to a Number.
  // The first element of this mapped array is assigned to 'n'.
  let n = input[ 0 ].split( ' ' ).map( Number )[ 0 ];


  // Similarly, from the first line of input:
  // Split by space, map to Number, and the second element is assigned to 'k'.
  let k = input[ 0 ].split( ' ' ).map( Number )[ 1 ];


  // In the context of the problem, 'k' typically represents blue items,
  // and 'n - k' would represent red items or remaining items.
  // The original code had a commented-out debug line: // console.log({ n, k });


  // Define a constant 'mod' for modulo operations.
  // This is a common large prime number (10^9 + 7) used in competitive programming
  // to prevent integer overflow and keep results within a manageable range.
  let mod = 1e9 + 7;


  /**
   * This function calculates the number of combinations ("a choose b").
   * It computes C(a, b) = a! / (b! * (a-b)!).
   *
   * @param {number} a - The total number of items available.
   * @param {number} b - The number of items to choose from 'a'.
   * @returns {number} The calculated combination value.
   */
  const combination = ( a, b ) => {

    // An optimization often used is: b = Math.min(b, a - b);
    // This was commented out in the original code, so it remains commented here.

    let numerator = 1;     // Initialize the numerator product.
    let denominator = 1;   // Initialize the denominator product.


    // Calculate the part of the numerator that corresponds to a * (a-1) * ... * (a-b+1).
    for ( let i = a; i > a - b; i-- ) {

      numerator *= i;
    }


    // Calculate the part of the denominator that corresponds to b * (b-1) * ... * 1 (i.e., b!).
    for ( let j = b; j > 0; j-- ) {

      denominator *= j;
    }


    // The final combination number is the numerator divided by the denominator.
    let number = numerator / denominator;


    // Return the computed combination value.
    return number;
  };


  // Iterate from 'i' equals 1 up to and including 'k'.
  // In each iteration, calculate a specific answer based on 'n', 'k', and the current 'i'.
  for ( let i = 1; i <= k; i++ ) {


    // Calculate the 'answer' using two calls to the 'combination' function,
    // and then multiplying their results.
    let answer = combination( n - k + 1, i ) * combination( k - 1, i - 1 );


    // Apply the modulo operation to the answer.
    // Math.round is used here, potentially to handle floating point inaccuracies
    // before the modulo, though typically modulo is on integers.
    answer = Math.round( answer % mod );


    // JavaScript's Math.round can sometimes produce -0.
    // This line ensures that any -0 result is explicitly converted to 0.
    answer = ( answer === -0 ) ? 0 : answer;


    // Print the final calculated answer for the current iteration 'i' to the console.
    console.log( answer );
  }

}; // End of the Main function definition.


// This line executes the Main function.
// It reads the entire content of standard input (/dev/stdin) as a UTF-8 string
// using Node.js's 'fs' (file system) module and passes it to Main.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );