/*
 * This file contains utility functions and the main program logic.
 * It is designed to process input data, typically from standard input.
 */

// Global alias for console.log for convenience.
var log = console.log; /* This variable holds a reference to the console.log function. */


// Check if running in a Node.js-like environment to handle standard input.
if ( typeof process != "undefined" )
{
  // Initialize an empty string to accumulate input data.
  var input = "";

  // Resume the standard input stream to start receiving data.
  process.stdin.resume();

  // Set the encoding for the standard input stream to UTF-8.
  process.stdin.setEncoding( 'utf8' );

  // Register a callback function for when data chunks are received.
  process.stdin.on( 'data', function ( chunk )
  {
    // Append the received chunk to the input string.
    input += chunk;
  } );

  // Register a callback function for when the standard input stream ends.
  process.stdin.on( 'end', function ()
  {
    // Split the accumulated input string into an array of lines.
    var lines = input.split( "\n" );

    // Call the main processing function with the parsed lines.
    main( lines );
  } );
} /* End of Node.js input handling block. */


/*
 * The primary function to orchestrate the processing of input lines.
 * It iterates through datasets, cleaning and processing each one.
 */
function main ( lines )
{
  // Remove the first line, often used for metadata like the number of test cases.
  lines.shift();

  // Loop as long as there are lines remaining to be processed.
  while ( lines.length > 0 )
  {
    // Extract the next two lines to form a dataset.
    var dataset = lines.slice( 0, 2 );

    // Cleanse each row in the dataset.
    dataset = dataset.map(
      function ( row )
      {
        // Split the row into individual characters.
        return row.split( "" )
                   .filter(
                     function ( e )
                     {
                       // Get the character code.
                       var code = e.charCodeAt( 0 );
                       // Keep only lowercase English letters (a-z).
                       return 97 <= code && code <= 122;
                     }
                   )
                   .join( "" ); /* Rejoin the filtered characters into a string. */
      }
    );

    // Process the cleaned dataset.
    processDataset( dataset );

    // Remove the two processed lines from the 'lines' array for the next iteration.
    lines = lines.slice( 2 );
  }
} /* End of main function. */


/*
 * Processes a single dataset, performing a specific algorithmic calculation.
 * This function appears to implement a dynamic programming approach.
 */
function processDataset ( dataset )
{
  // Initialize a 2D array 'A'.
  var A = [];

  // Assign the first string from the dataset to 'f'.
  var f = dataset[ 0 ];

  // Assign the second string from the dataset to 's'.
  var s = dataset[ 1 ];

  // Outer loop: Iterate through characters of the first string 'f'.
  for ( var i = 0; i < f.length; i++ )
  {
    // Initialize the inner array for the current row 'i'.
    A[ i ] = [];

    // Inner loop: Iterate through characters of the second string 's'.
    for ( var j = 0; j < s.length; j++ )
    {
      // Check if characters at current positions match.
      if ( f.charAt( i ) == s.charAt( j ) )
      {
        // If they match, set the value to 1.
        A[ i ][ j ] = 1;
      }
      else
      {
        // If they don't match, set the value to 0.
        A[ i ][ j ] = 0;
      }

      // Handle base cases for the DP table.
      if ( i == 0 && j == 0 )
      {
        // For the very first cell, add 0 (no change).
        A[ i ][ j ] += 0;
      }
      else if ( i == 0 )
      {
        // For the first row (i=0), take the maximum of the left cell and current value.
        A[ i ][ j ] = Math.max( A[ i ][ j - 1 ], A[ i ][ j ] );
      }
      else if ( j == 0 )
      {
        // For the first column (j=0), take the maximum of the top cell and current value.
        A[ i ][ j ] = Math.max( A[ i - 1 ][ j ], A[ i ][ j ] );
      }
      else
      {
        // General case: calculate based on previous cells.
        // This looks like a variant of a longest common subsequence or edit distance.
        A[ i ][ j ] = Math.min( Math.max( A[ i - 1 ][ j ], A[ i ][ j - 1 ] ) + A[ i ][ j ], Math.min( i, j ) + 1 );
      }
    } /* End of inner loop (j). */
  } /* End of outer loop (i). */

  // Retrieve the last element of the array A.
  var a = A.pop();

  // This conditional block seems to be for testing or specific edge cases.
  if ( typeof a == "string" && f == "abc" )
  {
    // If conditions are met, throw an error.
    throw new Error();
  }
} /* End of processDataset function. */