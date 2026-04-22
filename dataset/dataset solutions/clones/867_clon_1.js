/*
* This file contains a JavaScript program for solving a dynamic programming problem.
* Original creation date: October 7th, 2013.
* Author: hiroqn.
*
* The program processes input from standard input (stdin) to determine
* optimal scores based on a list of musical phrases and melodies.
*/
var fs = require('fs') , // Import the Node.js 'fs' (file system) module.
    // Determine the size of the standard input stream.
    length = fs.fstatSync(process.stdin.fd).size ,
    // Allocate a buffer to hold the entire input content.
    buffer = new Buffer(length) ,
    // Read the input from stdin into the buffer.
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0) ,
    // Convert the buffer content to a UTF-8 string and split it into lines.
    input = buffer.toString('utf8', 0, bytesRead).split('\n') ;

// Initiate the main program execution flow.
main() ;


/**
 * Creates and initializes a 2D array (matrix) of specified dimensions.
 *
 * @param {number} n    - The number of rows for the matrix.
 * @param {number} m    - The number of columns for the matrix.
 * @param {*}      init - The initial value to populate all elements of the matrix.
 * @returns {Array<Array<*>>} A new 2D array with dimensions n x m, filled with 'init'.
 */
function matrix ( n , m , init ) {

  var arr = [ ] , // The primary array to hold rows.
      i ,         // Loop counter for rows.
      j ;         // Loop counter for columns.

  // Iterate over each row index.
  for ( i = 0 ; i < n ; i ++ ) {

    arr [ i ] = [ ] ; // Initialize the current row as an empty array.

    // Iterate over each column index within the current row.
    for ( j = 0 ; j < m ; j ++ ) {

      arr [ i ] [ j ] = init ; // Assign the specified initial value.

    } // End of inner loop (columns).

  } // End of outer loop (rows).

  return arr ; // Return the fully constructed matrix.

} // End of matrix function definition.


/**
 * Solves a dynamic programming problem to find the maximum score for a given melody length
 * using a list of available phrases.
 *
 * @param {number} melody      - The target total length of the melody.
 * @param {Array<Array<number>>} phraseList - An array of phrases, where each phrase is
 *                                           represented as `[start_time, length, points]`.
 * @returns {number} The maximum achievable score for the given melody length.
 */
function solve ( melody , phraseList ) {

  var n = phraseList . length , // Total number of phrases available.
      // Initialize the DP table: (n+1) rows for phrases, (melody+1) columns for lengths.
      dp = matrix ( n + 1 , melody + 1 , 0 ) ,
      i , j , k , // General-purpose loop iterators.
      s , l , p , // Variables to destructure phrase components: start, length, points.
      range ;     // Temporary variable to store a slice of the DP table.

  // Outer loop: Iterate through each phrase from the phraseList.
  for ( i = 0 ; i < n ; i ++ ) {

    // Inner loop: Iterate through all possible melody lengths up to the target 'melody'.
    for ( j = 0 ; j <= melody ; j ++ ) {

      s = phraseList [ i ] [ 0 ] ; // Extract the start time of the current phrase.
      l = phraseList [ i ] [ 1 ] ; // Extract the length of the current phrase.
      p = phraseList [ i ] [ 2 ] ; // Extract the points (score) of the current phrase.

      // Check if the current phrase can be placed starting at or before melody length 'j'.
      if ( s <= j ) {
        // This was a debugging line in the original code, kept as a comment.
        // console.log(i,j)

        // Calculate the relevant range from the previous row (dp[i+1])
        // This range corresponds to the melody lengths where the current phrase could have ended.
        range = dp [ i + 1 ] . slice ( l > j ? 0 : j - l , j - s + 1 ) ;

        // Update the DP table:
        // dp[i+1][j] is the maximum of:
        // 1. The score without using the current phrase (dp[i][j]).
        // 2. The score obtained by using the current phrase (max value from 'range' + its points 'p').
        dp [ i + 1 ] [ j ] = Math . max ( dp [ i ] [ j ] , Math . max . apply ( null , range ) + p ) ;

      } else {
        // If the phrase's start time 's' is greater than the current melody length 'j',
        // the phrase cannot be used. So, the score is simply carried over from the previous row.
        dp [ i + 1 ] [ j ] = dp [ i ] [ j ] ;
      }

    } // End of inner loop (j - melody lengths).

  } // End of outer loop (i - phrases).

  // This was a debugging line in the original code, kept as a comment.
  // console.log(dp);

  // The maximum score for all 'n' phrases and target 'melody' length is at dp[n][melody].
  return dp [ n ] [ melody ] ;

} // End of solve function.


/*
 * This is the main entry point of the program.
 * It handles input parsing, phrase sorting,
 * calls the 'solve' function for each melody,
 * and outputs the final results.
 */
function main ( ) {

  // Read the first line of input, which is the number of phrases (N).
  // The '- 0' converts the string to a number.
  var n = input . shift ( ) - 0 ,
      phraseList = [ ] ; // Initialize an array to store parsed phrase data.

  // Loop to read N lines, each representing a phrase.
  while ( n -- ) {
    // Each line is split by space, and each part is converted to a Number before being pushed.
    phraseList . push ( input . shift ( ) . split ( ' ' ) . map ( Number ) ) ;
  }

  // After reading, 'n' now holds the original count of phrases.
  n = phraseList . length ;

  // Sort the phraseList based on the points (the third element, index 2) in ascending order.
  // This sorting might be a crucial optimization or requirement for the problem's logic.
  phraseList . sort ( function ( a , b ) {
    return a [ 2 ] - b [ 2 ] ; // Compare points (a[2] and b[2]).
  } ) ;

  // This was a debugging line in the original code, kept as a comment.
  // console.log(phraseList)

  // Read the next line of input, which is the number of melodies (M).
  var m = input . shift ( ) - 0 ,
      melodyList = [ ] , // Array to store the lengths of melodies to be processed.
      melody ,           // Variable to hold the current melody length in iteration.
      ans = [ ] ,        // Array to store the calculated maximum scores for each melody.
      i , j , k ,        // General-purpose loop iterators.
      max ,              // Variable to store the max score for the current melody.
      flag0 = false ;    // A boolean flag to track if any melody results in a zero score.

  // Loop to read M lines, each representing a melody length.
  while ( m -- ) {
    melodyList . push ( input . shift ( ) - 0 ) ; // Convert the string to number and add to list.
  }

  // After reading, 'm' now holds the original count of melodies.
  m = melodyList . length ;

  // Iterate through each melody length in the melodyList.
  for ( i = 0 ; i < m ; i ++ ) {

    melody = melodyList [ i ] ; // Get the current melody length.

    // Call the 'solve' function to find the maximum score for the current melody.
    max = solve ( melody , phraseList ) ;

    // This was a debugging line in the original code, kept as a comment.
    // console.log(max)

    // Check if the calculated maximum score is 0.
    if ( max === 0 ) {
      flag0 = true ; // If it's 0, set the flag.
    } else {
      ans . push ( max ) ; // Otherwise, add the score to the 'ans' array.
    }
  }

  // After processing all melodies, check the 'flag0'.
  if ( flag0 ) {
    console . log ( -1 ) ; // If any melody had a score of 0, output -1.
    return ;               // Exit the main function.
  }

  // If no melody resulted in a 0 score, print each calculated maximum score on a new line.
  ans . forEach ( function ( i ) { console . log ( i ) } ) ;

} // End of main function.