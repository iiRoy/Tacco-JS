/*
 * This JavaScript file contains two primary functions:
 * 1. max(array): Finds the maximum value within a given array.
 * 2. main(input): Processes input data to calculate a specific result.
 *
 * It reads input from standard input, processes it, and prints the final
 * maximum value to the console.
 */
function max ( array ) {
  // Initialize result with the smallest possible number
  var result = -1 * Infinity;

  // Iterate over each number in the provided array
  for ( num of array ) {
    // If the current number is greater than the current maximum result
    if ( result < num ) {
      // Update result to the new maximum number
      result = num;
    }
  }
  // Return the final maximum value found
  return result;
}


// The main function that orchestrates the data processing
function main ( input ) {
  // Split the input string into an array of lines
  const lines = input.split( '\n' );
  // Parse each line into an array of integers
  const nums = lines.map( line => line.split( ' ' ).map( x => parseInt( x ) ) );

  // Extract N and C from the first line of input
  var n_c = nums.shift();
  // N represents the number of events or entries
  const N = n_c[ 0 ];
  // C represents the number of categories or channels
  const C = n_c[ 1 ];

  // Initialize a temporary array 't' with a size of 200002, filled with zeros
  const t = Array( 200002 );
  // Initialize an array 'max_recorders' to accumulate counts, also size 200002
  const max_recorders = Array( 200002 );
  // Ensure all elements are initially zero
  max_recorders.fill( 0 );


  // Loop through each category from 1 to C
  for ( var c = 1; c <= C; c++ ) {
    // Reset the temporary array 't' for each category
    t.fill( 0 );

    // Iterate through each entry in the 'nums' array
    for ( var n = 0; n < N; n++ ) {
      // Check if the current entry's category matches the current 'c'
      if ( nums[ n ][ 2 ] == c ) {
        // Increment count at the start time (adjusted)
        t[ nums[ n ][ 0 ] * 2 - 1 ]++;
        // Decrement count at the end time (adjusted)
        t[ nums[ n ][ 1 ] * 2 ]--;
      }
    }

    // Calculate prefix sums for the 't' array
    // This transforms point changes into continuous counts
    for ( var i = 1; i < 200002; i++ ) {
      t[ i ] = t[ i - 1 ] + t[ i ];
    }
    // Accumulate the counts from 't' into 'max_recorders'
    // This sums up counts across different categories
    for ( var i = 1; i < 200002; i++ ) {
      max_recorders[ i ] += t[ i ];
    }
  }

  // Debugging lines (commented out in final version)
  // console.log( nums );
  // console.log( t );

  // Print the maximum value found in the 'max_recorders' array
  // This represents the peak simultaneous recordings across all categories
  console.log( max( max_recorders ) );

  // Another debugging line (commented out)
  // console.log( ( max_recorders ) );
}


// Entry point of the script: read input from stdin and call main function
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );