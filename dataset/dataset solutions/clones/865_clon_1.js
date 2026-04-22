/*
 * This file contains logic for solving a musical phrase problem using dynamic programming.
 * Original creation date: 2013-10-07.
 * Author: hiroqn
 */

// Core Node.js modules for file system operations.
var fs = require('fs');

// Determine the size of the standard input.
var length = fs.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data.
var buffer = new Buffer(length);

// Read data from standard input into the buffer.
var bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0);

// Convert the buffer content to a UTF-8 string, then split it by newlines to get an array of input lines.
var input = buffer.toString('utf8', 0, bytesRead).split('\n');

// Immediately invoke the main function to start program execution.
main();


/**
 * Creates a 2D array (matrix) initialized with a specific value.
 *
 * @param {number} n    Number of rows.
 * @param {number} m    Number of columns.
 * @param {*}      init Initial value for each cell.
 * @returns {Array<Array<*>>} The newly created matrix.
 */
function matrix ( n ,  m ,  init ) {
  // Declare the array and loop counters.
  var arr = [], i, j;

  // Initialize rows.
  for  ( i  =  0 ;  i  <  n ;  i++ )   {
    arr[i] = []; // Each row is also an array.

    // Initialize columns for the current row.
    for  ( j  =  0 ;  j  <  m ;  j++ ) {
      arr[i][j] = init; // Assign the initial value.
    } // End of inner loop for columns.
  } // End of outer loop for rows.

  // Return the fully initialized matrix.
  return arr;
} // End of matrix function.


/**
 * Solves the musical phrase problem using dynamic programming.
 * This function calculates the maximum possible 'melody' score
 * given a list of phrases.
 *
 * @param {number} melody      The target melody value.
 * @param {Array<Array<number>>} phraseList A list of phrases, where each phrase
 *                                           is [start_time, duration, points].
 * @returns {Array<Array<number>>} The dynamic programming table.
 */
function solve (  melody ,  phraseList  ) {
  // n: Number of phrases.
  var n = phraseList.length,
      // dp: Dynamic programming table initialized with zeros.
      // Dimensions are (n+1) x (melody+1).
      dp = matrix(n + 1, melody + 1, 0),
      // Loop counters.
      i, j, k,
      // Variables to store phrase components: start, duration, points.
      s, l, p,
      // Variable to track maximum value during calculations.
      max;

  // Iterate through each phrase in the phraseList.
  for ( i = 0 ; i < n ; i++ ) {
    // Extract phrase components for the current phrase.
    s = phraseList[i][0]; // Start time of the phrase.
    l = phraseList[i][1]; // Length (duration) of the phrase.
    p = phraseList[i][2]; // Points awarded by the phrase.

    // Iterate through all possible melody values up to the target 'melody'.
    for ( j = 0 ; j <= melody ; j++ ) {

      // Check if the current melody value 'j' is large enough to accommodate the phrase's start time 's'.
      if ( s <= j ) {
        // If it is, we can potentially include this phrase.

        max = 0; // Reset max for this iteration.

        // This loop finds the maximum score from previous states that can lead to the current state.
        // It considers states 'k' such that 'k' is within the valid range for placing the current phrase.
        for ( k = l > j ? 0 : j - l ; k <= j - s ; k++ ) {
          // Update 'max' if a better score is found in the DP table from a previous row.
          if ( max < dp[i + 1][k] ) {
            max = dp[i + 1][k];
          }
        } // End of inner loop for 'k'.

        // Update the DP table:
        // dp[i + 1][j] takes the maximum of:
        // 1. The value from the previous row at the same melody point (not including the current phrase).
        // 2. The 'max' score found from previous states, plus the points 'p' from the current phrase.
        dp[i + 1][j] = Math.max( dp[i][j] , max + p );

      } else {
        // If 'j' is not large enough for 's', we cannot include this phrase.
        // So, the current state's value is simply carried over from the previous row.
        dp[i + 1][j] = dp[i][j];
      } // End of if-else condition.

    } // End of inner loop for 'j' (melody values).
  } // End of outer loop for 'i' (phrases).

  // The final DP table is returned.
  return dp;
} // End of solve function.


/**
 * Main function to execute the program logic.
 * It reads input, processes phrases and melodies, and prints results.
 */
function main() {

  // Read the number of phrases 'n' from input and convert to number.
  var n = input.shift() - 0,
      // Initialize an empty array to store parsed phrases.
      phraseList = [];

  // Loop to read 'n' phrases.
  for ( i = 0 ; i < n ; i++ ) {
    // Read a line, split by space, convert parts to numbers, and add to phraseList.
    phraseList.push( input.shift().split(' ').map( Number ) );
  }


  // Read the number of melodies 'm' from input.
  var m = input.shift() - 0,
      // Initialize an array to store melody values.
      melodyList = [],
      // Variable to hold the current melody being processed.
      melody,
      // Array to store the final answers.
      ans = [],
      // Loop counters.
      i, j, k,
      // Variable for maximum value (though 'max' is reused in solve, this one is local).
      max,
      // Dynamic programming table reference.
      dp,
      // Flag to indicate if all melodies can be played successfully.
      flag = true;

  // Loop to read 'm' melody values.
  for ( i = 0 ; i < m ; i++ ) {
    // Read a melody value from input and convert to number.
    melodyList.push( input.shift() - 0 );
  }

  // Pre-calculate the DP table for a fixed maximum melody value (393).
  // This value seems to be a hardcoded limit for the problem context.
  dp = solve( 393 , phraseList );

  // Iterate through each melody in the melodyList.
  for ( i = 0 ; i < m ; i++ ) {
    melody = melodyList[i]; // Get the current melody value.

    // Check the calculated score for the current melody in the DP table.
    // If it's 0, it means this melody cannot be formed or has no score.
    if ( dp[n][melody] === 0 ) {
      flag = false; // Set flag to false, indicating failure.
    } else {
      // If a score exists, add it to the answers array.
      ans.push( dp[n][melody] );
    }
  }

  // If the flag is false (at least one melody could not be played), print -1.
  if ( !flag ) {
    console.log( -1 );
    return; // Exit the function.
  }

  // Otherwise, print each calculated answer on a new line.
  ans.forEach( function( i ) { console.log( i ) } );

} // End of main function.