"use strict"; /* This directive enforces strict mode, helping to write cleaner and safer code. */

// --- Start of the main program logic ---

/**
 * The primary function responsible for processing input and determining the output.
 * @param {string} arg - The raw input string, typically read from standard input.
 */
const main = arg => {
  // First, split the input string into an array of lines based on newline characters.
  arg = arg.split("\n") ;

  // The last line of the input is expected to be the value for 'k'.
  // We extract it using pop() and then parse it into an integer.
  const k = parseInt( arg.pop() ) ;

  /*
   * The remaining lines in the 'arg' array represent antenna positions.
   * We slice the array to take only the first 5 elements (indices 0 to 4).
   * Then, we map each string element to its integer representation.
   * The original code had a commented-out alternative for processing all lines,
   * but the current logic specifically targets the first five.
   */
  const antennas = arg .slice( 0, 5 ) .map( n => parseInt(n) ) ;

  // Begin a nested loop to compare all unique pairs of antenna positions.
  // The outer loop iterates from the first antenna to the second-to-last.
  for ( let i = 0 ; i < antennas.length ; i++ ) {
    // The inner loop starts from 'i + 1' to avoid comparing an antenna with itself
    // and to avoid duplicate comparisons (e.g., (1,2) is same as (2,1)).
    for ( let j = i + 1 ; j < antennas.length ; j++ ) {
      // Check if the absolute difference between the current pair of antennas
      // is greater than the allowed maximum difference 'k'.
      if ( antennas[j] - antennas[i] > k ) {
        // If the condition is met, it means the antennas are too far apart.
        // Print the "sad" message and immediately exit the function.
        console.log(":(") ;
        return ; // No further processing is needed if a violation is found.
      }
    }
  }

  // If the loops complete without finding any antennas that are too far apart,
  // it means all conditions are met. Print the "happy" message.
  console.log("Yay!") ;
} ; // End of the main function definition.

// --- Program execution entry point ---

// Read the entire content of standard input synchronously,
// decode it as UTF-8, and then pass it to the 'main' function for processing.
main( require('fs').readFileSync( '/dev/stdin', 'utf8' ) ) ;

// --- End of file ---