/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered significantly.
 */

// Define the primary execution function for the program.
function   main ( )
{
  // Retrieve the raw input data.
  var input = getInput( );

  // Split the input string by newline characters into an array of lines.
  var ls = input.split( '\n' ) ;


  // Parse the first line as an integer to get 'n'.
  var n = parseInt( ls [ 0 ] )
  // Extract and parse the numbers from the subsequent lines.
  var nums = ls.slice( 1, n + 1 ).map( function ( s ) {
    // Convert each string element to an integer.
    return parseInt( s );
  } )

  // Calculate and print the length of the Longest Increasing Subsequence (LIS).
  console.log( lis( nums ) )
}


/*
 * Calculates the length of the Longest Increasing Subsequence (LIS)
 * using patience sorting (a variant of dynamic programming).
 * @param {Array<number>} xs - The array of numbers to process.
 * @returns {number} The length of the LIS.
 */
function lis ( xs ) {
  // 'table' stores the smallest end element of an increasing subsequence of a given length.
  // table[i] is the smallest ending element of an increasing subsequence of length i+1.
  var table = [ xs [ 0 ] ] ;

  // Iterate through the input array starting from the second element.
  for ( var i = 1 ; i < xs.length ; i ++ ) {
    var x = xs [ i ] ; // Current element being processed.

    // Find the insertion point for 'x' in the 'table'.
    // If 'x' is greater than all elements in 'table', it extends the LIS.
    // Otherwise, it replaces an element to potentially form a shorter LIS with a smaller end.
    table [ search( table , x ) + 1 ] = x ;
    debug( table ) // Log the state of the 'table' for debugging purposes.
  }
  // The length of the 'table' is the length of the LIS.
  return table.length ;
}


// Helper function to perform a binary search.
// It finds the index 'i' such that table[i] < x && x <= table[i+1].
// This is crucial for efficiently updating the 'table' in the LIS algorithm.
function search( table , x ) {
  var l = 0 , h = table.length ; // 'l' is low, 'h' is high for binary search boundaries.

  // Handle edge cases: empty table or 'x' is smaller than or equal to the first element.
  if ( table.length == 0 || x <= table [ 0 ] ) {
    return -1 ; // Indicates 'x' should be the new first element (index 0).
  }

  // Standard binary search loop.
  while ( l + 1 < h ) {
    // Calculate the pivot index.
    var pivot = Math.floor( ( l + h + 1 ) / 2 ) ;
    // If table[pivot] is less than 'x', 'x' could be further right.
    if ( table [ pivot ] < x ) {
      l = pivot ; // Move the low boundary.
    } else {
      // Otherwise, 'x' is less than or equal to table[pivot], so it could be further left.
      h = pivot ; // Move the high boundary.
    }
    debug( { l: l , h: h } ) // Debugging the search boundaries.
  }
  // 'l' will contain the index of the largest element less than 'x'.
  return l ;
}


// Global variable to check if the environment is NodeJS.
nodeJS = typeof require != 'undefined' ;


// Function to abstract input retrieval based on environment.
function getInput ( ) {
  // If not running in NodeJS (i.e., in a browser).
  if ( ! nodeJS ) {
    // Get input from a textarea element with id 'input'.
    return document.getElementById( 'input' ).value
  }
  // If running in NodeJS.
  return require( 'fs' ).readFileSync( '/dev/stdin' ).toString( ) ;
}


// Debugging utility function.
function debug ( x ) {
  // Only output debug messages if not in a NodeJS environment.
  // This is a bit unusual, normally debug output is conditional on a flag,
  // but following the original logic for Type I cloning.
  if ( ! nodeJS ) {
    console.error( x ) // Output debug info to console error stream.
  }
}


// Execute the main function if the script is run in a NodeJS environment.
if ( nodeJS ) {
  main( ) // Call the main program entry point.
}