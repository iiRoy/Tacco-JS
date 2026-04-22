/*
 * This JavaScript code processes input to determine a specific condition.
 * It's structured into a main function and a helper utility.
 * The core logic involves parsing dimensions and analyzing character frequencies.
 */

// The primary function that orchestrates the data processing.
function Main ( input ) {

  // --- Input Parsing Section ---
  // The first line of input contains two space-separated parameters.
  const Param = input.split( '\n' )[ 0 ] .split( ' ' )

  // Extract the height (H) and width (W) values.
  const H = i( Param[ 0 ] ) // H represents the height of the grid.
  const W = i( Param[ 1 ] ) // W represents the width of the grid.

  // --- Initial Condition Check ---
  // If the width is exactly 1, a specific trivial case is handled.
  if ( W == 1 ) {
    return console.log( 'Yes' ) // Output "Yes" and exit early.
  }

  /*
   * Create a frequency map (object) for all characters in the grid.
   * The grid data starts from the second line of the input.
   */
  const Obj = input
    .split( '\n' ) // Split the entire input string into an array of lines.
    .slice( 1 ) // Discard the first line, which contained H and W.
    .join( '' ) // Concatenate all remaining lines into a single string.
    .split( '' ) // Split this long string into an array of individual characters.
    .reduce( function ( obj , c ) { // Iterate over characters to build the frequency map.
      // If the character 'c' is encountered for the first time, initialize its count.
      if ( obj[ c ] == undefined ) {
        obj[ c ] = 0 // Set initial count to zero.
      }
      obj[ c ] ++ // Increment the count for the current character.
      return obj // Return the updated frequency object.
    } , {} ) // Start with an empty object as the initial accumulator.

  // --- Conditional Logic Based on Parity of H and W ---

  // Scenario 1: Both H and W are even numbers.
  if ( H % 2 == 0 && W % 2 == 0 ) {
    // Count how many character frequencies are not multiples of 4.
    const len = Object.keys( Obj )
      .filter( function ( k ) {
        return Obj[ k ] % 4 != 0 // Filter for counts that are not perfectly divisible by 4.
      } )
      .length // Get the total number of such characters.

    // If all character counts are multiples of 4, the condition is met.
    if ( len == 0 ) {
      return console.log( 'Yes' ) // Output "Yes".
    } else {
      // Otherwise, the condition is not met.
      return console.log( 'No' ) // Output "No".
    }
  }

  // Scenario 2: Both H and W are odd numbers.
  if ( H % 2 != 0 && W % 2 != 0 ) {
    // Calculate the sum of frequencies that are not multiples of 4.
    const sum = Object.keys( Obj )
      .filter( function ( k ) {
        return Obj[ k ] % 4 != 0 // Select only keys whose counts are not divisible by 4.
      } )
      .reduce( function ( sum , key ) {
        return sum + i( Obj[ key ] ) // Accumulate the integer value of these counts.
      } , 0 ) // Initialize the sum to 0.

    // Check if the accumulated sum is an odd number.
    if ( sum % 2 == 1 ) {
      return console.log( 'Yes' ) // Output "Yes".
    } else {
      // If the sum is even, the condition is not met.
      return console.log( 'No' ) // Output "No".
    }
  }

  // Scenario 3: One of H or W is odd, and the other is even.
  // This block handles the remaining case where the parities differ.
  // Calculate the sum of frequencies that are odd numbers.
  const s = Object.keys( Obj )
    .filter( function ( k ) {
      return Obj[ k ] % 2 != 0 // Filter for counts that are odd.
    } )
    .reduce( function ( sum , k ) {
      return sum + i( Obj[ k ] ) // Sum up these odd counts.
    } , 0 ) // Start the sum from 0.

  // This final condition appears to always result in 'No' based on the current logic.
  if ( s == 0 ) {
    return console.log( 'No' ) // Output "No".
  } else {
    return console.log( 'No' ) // Output "No" again.
  }
}

// --- Helper Function ---
// A utility function to parse a string into an integer.
function i ( x ) {
  return parseInt( x , 10 ) // Converts the input string 'x' to a base-10 integer.
}

// --- Program Execution Entry Point ---
// Read the entire content of standard input (usually from a file or pipe).
// The input is read as UTF-8 encoded text.
// Then, pass this input string to the Main function for processing.
Main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;

// End of the JavaScript program.