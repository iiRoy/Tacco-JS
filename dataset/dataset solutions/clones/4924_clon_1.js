/*
 *   This JavaScript module is designed to process
 *   numerical input data, performing calculations
 *   involving BigInts.
 */

// Import specific utility from 'path' module.
// Note: 'parse' is imported but not utilized within this script.
const { parse } = require("path");


/**
 * The primary function responsible for
 * processing the provided input string.
 * @param {string} input - The raw string input, typically from standard input.
 */
function Main( input ) {

  // Initial processing of the input string:
  // 1. Remove leading/trailing whitespace.
  // 2. Split the string into an array of lines.
  // 3. For each line, split it into an array of strings by space.
  input = input . trim( ) . split( "\n" ) . map( function( x ) { return x.split(" ") } );

  // Determine the number of data entries (N) from the first element
  // of the first processed line.
  var N = parseInt( input[0][0], 10 );

  // Initialize an empty array to store the 'TA' pairs after conversion.
  var arr_TA = [ ];

  // Loop to populate 'arr_TA' with processed input data.
  // Iterates 'N' times, processing each relevant line.
  for ( var i = 0; i < N; i++ ) {

    // Push an array of integers, parsed from the (i+1)-th input line.
    // The map function converts string elements to integers.
    arr_TA.push( input[ i + 1 ].map( e => parseInt( e, 10 ) ) );

    // Convert the first element of the current pair in 'arr_TA' to a BigInt.
    arr_TA[i][0] = BigInt( arr_TA[i][0] );

    // Convert the second element of the current pair in 'arr_TA' to a BigInt.
    arr_TA[i][1] = BigInt( arr_TA[i][1] );
  }

  // Initialize a temporary array 'tmp' with two BigInt zeros.
  // This array will hold the running minimums/multiples.
  var tmp = [ 0n, 0n ];

  // Declare 'n', a variable that will be used for multiplication factors.
  var n;


  // Main calculation loop.
  // This loop iterates through each 'TA' pair in 'arr_TA'.
  for ( var i = 0; i < N; i++ ) {

    // Case 1: Both current TA values are greater than or equal to the temporary values.
    if ( arr_TA[i][0] >= tmp[0] && arr_TA[i][1] >= tmp[1] ) {
      // Simply update 'tmp' with the current 'arr_TA' values.
      tmp = [ arr_TA[i][0], arr_TA[i][1] ];
    }
    // Case 2: First TA value is sufficient, but the second is too small.
    else if ( arr_TA[i][0] >= tmp[0] && arr_TA[i][1] < tmp[1] ) {
      // Calculate 'n' based on the ratio of the second elements.
      n = tmp[1] / arr_TA[i][1];
      // If there's a remainder, increment 'n' (effectively a ceiling division).
      if ( tmp[1] % arr_TA[i][1] !== 0n ) {
        n = n + 1n;
      }
      // Update 'tmp' by multiplying current 'arr_TA' values by 'n'.
      tmp = [ arr_TA[i][0] * n, arr_TA[i][1] * n ];
    }
    // Case 3: Second TA value is sufficient, but the first is too small.
    else if ( arr_TA[i][0] < tmp[0] && arr_TA[i][1] >= tmp[1] ) {
      // Calculate 'n' based on the ratio of the first elements.
      n = tmp[0] / arr_TA[i][0];
      // If there's a remainder, increment 'n'.
      if ( tmp[0] % arr_TA[i][0] !== 0n ) {
        n = n + 1n;
      }
      // Update 'tmp' by multiplying current 'arr_TA' values by 'n'.
      tmp = [ arr_TA[i][0] * n, arr_TA[i][1] * n ];
    }
    // Case 4: Both current TA values are smaller than the temporary values.
    else if ( arr_TA[i][0] < tmp[0] && arr_TA[i][1] < tmp[1] ) {
      // First, calculate 'n' based on the ratio of the first elements.
      n = tmp[0] / arr_TA[i][0];
      // Adjust 'n' for ceiling division.
      if ( tmp[0] % arr_TA[i][0] !== 0n ) {
        n = n + 1n;
      }

      // Check if the current 'n' also satisfies the condition for the second element.
      if ( arr_TA[i][1] * n >= tmp[1] ) {
        // If it does, no further action is needed for 'n' in this branch.
        ;
      }
      else {
        // If not, recalculate 'n' based on the ratio of the second elements.
        n = tmp[1] / arr_TA[i][1];
      }

      // Final adjustment for 'n' based on the second element's remainder.
      if ( tmp[1] % arr_TA[i][1] !== 0n ) {
        n = n + 1n;
      }

      // Update 'tmp' using the final determined 'n'.
      tmp = [ arr_TA[i][0] * n, arr_TA[i][1] * n ];
    }
  }

  // After the loop, calculate the sum of the two elements in 'tmp'.
  // Convert the BigInt sum to a string and print it to the console.
  console.log( ( tmp[0] + tmp[1] ).toString() );
}


// Entry point: Read input from standard input, decode as UTF-8,
// and pass it to the 'Main' function for processing.
Main( require("fs").readFileSync("/dev/stdin", "utf8") );