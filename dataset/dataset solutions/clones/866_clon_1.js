// This file contains the JavaScript solution for a programming problem.
// Original creation date: October 7, 2013.

var fs = require('fs'); /* Core Node.js file system module */

// Determine the size of the standard input stream.
var length = fs.fstatSync( process.stdin.fd ).size;

// Create a buffer to hold the input data.
var buffer = new Buffer( length );

// Read the input from stdin into the buffer.
var bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 );

// Convert the buffer to a UTF-8 string and split it into lines.
var input = buffer.toString( 'utf8', 0, bytesRead ).split( '\n' );


// Entry point for the program execution.
main( );


/**
 * Creates a 2D array (matrix) initialized with a specific value.
 * @param {number} n - Number of rows.
 * @param {number} m - Number of columns.
 * @param {*} init - Initial value for all elements.
 * @returns {Array<Array<*>>} The initialized matrix.
 */
function matrix ( n, m, init )
{
  var arr = [ ]; // Initialize an empty array for rows.
  var i, j;      // Loop counters.

  // Populate rows.
  for ( i = 0 ; i < n ; i ++ )
  {
    arr[ i ] = [ ]; // Initialize an empty array for columns in the current row.

    // Populate columns in the current row.
    for ( j = 0 ; j < m ; j ++ )
    {
      arr[ i ][ j ] = init; // Assign the initial value.
    }
  }
  return arr; // Return the fully constructed matrix.
}


/**
 * Solves the main problem logic using dynamic programming.
 * Calculates the maximum possible 'score' based on a melody length and a list of phrases.
 * @param {number} melody - The target melody length.
 * @param {Array<Array<number>>} phraseList - List of phrases, each with [start, length, points].
 * @returns {number} The maximum score achievable.
 */
function solve( melody, phraseList )
{
  // n represents the number of available phrases.
  var n = phraseList.length;

  // dp is our dynamic programming table.
  // It's initialized to (n+1) rows and (melody+1) columns, all zeros.
  var dp = matrix( n + 1, melody + 1, 0 );

  // Declare loop counters and phrase component variables.
  var i, j;
  var s, l, p; // s: start, l: length, p: points
  var range;   // Temporary variable to hold a slice of dp array.

  // Iterate through each phrase.
  for ( i = 0 ; i < n ; i ++ )
  {
    // Iterate through each possible melody length from 0 up to the target melody length.
    for ( j = 0 ; j <= melody ; j ++ )
    {
      // Extract components of the current phrase.
      s = phraseList[ i ][ 0 ]; // Start time (or position) of the phrase.
      l = phraseList[ i ][ 1 ]; // Length of the phrase.
      p = phraseList[ i ][ 2 ]; // Points gained from the phrase.

      // Check if the current phrase's start time is within the current melody length 'j'.
      if ( s <= j )
      {
        // Debugging line, intentionally commented out for production.
        // console.log( "Processing phrase:", i, "at melody length:", j );

        // Calculate the range for `Math.max.apply` based on phrase length and current melody length.
        // This finds the maximum score achievable before placing the current phrase.
        range = dp[ i + 1 ].slice( ( l > j ) ? 0 : j - l, j - s + 1 );

        // Update the DP table:
        // dp[i+1][j] is the max of:
        // 1. Not using the current phrase (dp[i][j]).
        // 2. Using the current phrase (max score from previous states + current phrase points).
        dp[ i + 1 ][ j ] = Math.max( dp[ i ][ j ], Math.max.apply( null, range ) + p );
      }
      else
      {
        // If the phrase's start time 's' is greater than current melody length 'j',
        // we cannot use this phrase. So, the score is simply inherited from the previous state.
        dp[ i + 1 ][ j ] = dp[ i ][ j ];
      }
    }
  }

  // Debugging line, intentionally commented out.
  // console.log( "Final DP table:", dp );

  // The final answer is in the bottom-right corner of the DP table.
  return dp[ n ][ melody ];
}


/**
 * Main function to orchestrate the program flow.
 * Reads input, processes melodies, and prints results.
 */
function main( )
{
  // Read the number of phrases (N) from input, converting it to a number.
  var n = input.shift( ) - 0;

  // Initialize an empty list to store phrase data.
  var phraseList = [ ];

  // Loop to populate the phraseList array.
  for ( i = 0 ; i < n ; i ++ )
  {
    phraseList.push( input.shift( ).split( ' ' ).map( Number ) );
  }

  // --- Original code comments, kept as Type I clone. ---
  // n = phraseList.length;
  // phraseList.sort(function (a, b) {
  //   return a[2] - b[2];
  // });
  // console.log(phraseList)
  // ---------------------------------------------------

  // Read the number of melodies (M) from input.
  var m = input.shift( ) - 0;

  // Initialize arrays and variables for processing melodies.
  var melodyList = [ ];
  var melody;
  var ans = [ ];
  var i, j, k; // Loop counters.
  var max;     // Stores the maximum score for a given melody.
  var flag = true; // Flag to track if all melodies yielded a non-zero score.

  // Populate the melodyList array.
  for ( i = 0 ; i < m ; i ++ )
  {
    melodyList.push( input.shift( ) - 0 );
  }

  // Process each melody in the melodyList.
  for ( i = 0 ; i < m ; i ++ )
  {
    melody = melodyList[ i ]; // Get the current melody length.
    max = solve( melody, phraseList ); // Solve for the current melody.

    // Another commented-out debug line.
    // console.log( "Max score for melody", melody, ":", max );

    // Check if the maximum score is zero.
    if ( max === 0 )
    {
      flag = false; // If any melody yields zero, set flag to false.
    }
    else
    {
      ans.push( max ); // Otherwise, add the score to the answers list.
    }
  }

  // If the flag is false, it means at least one melody had a max score of 0.
  if ( ! flag )
  {
    console.log( -1 ); // Print -1 as per problem specification.
    return;            // Exit the function.
  }

  // If all melodies had non-zero scores, print each score.
  ans.forEach( function ( val ) {
    console.log( val );
  } );

} // End of main function.