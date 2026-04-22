/*
 * This JavaScript file processes input from stdin to solve a specific problem.
 * It reads multiple test cases, each defined by n, m, and start values.
 * The core logic simulates a counting-out game or a modified Josephus problem.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Import the Node.js 'fs' module to handle file system operations.
var input = require('fs').readFileSync('/dev/stdin' , 'utf8');


// Process the raw input: trim whitespace and split into an array of lines.
var arr = ( input . trim() ) . split( "\n" );


// Main loop to process multiple test cases.
// The loop continues indefinitely until a specific termination condition is met.
while ( true )
{
  // Extract the first line of the current test case parameters.
  var nm = arr . shift();


  // Check for the termination condition: "0 0 0".
  // If true, exit the main processing loop.
  if ( nm == "0 0 0" )
    break; // Exit the while(true) loop.


  // Parse the 'nm' string into an array of numbers.
  // It contains n, m, and the starting position.
  nm = nm . split( " " ) . map( Number );


  // Assign the parsed values to individual variables for clarity.
  var n     = nm[ 0 ] ; // Total number of elements/people.
  var m     = nm[ 1 ] ; // Counting step.
  var start = nm[ 2 ] ; // Starting position for the counting.


  // Initialize an array 'ary' to keep track of active elements.
  // The size is n+1 to use 1-based indexing for elements 1 to n.
  var ary = [] ;


  // Populate 'ary': initially, all elements from 0 to n are marked as true (active).
  // Note: Element 0 is often unused in 1-based indexing, but initialized here.
  for ( var i = 0 ; i <= n ; i ++ )
    ary[ i ] = true ; // Mark as active.


  // Initialize variables for the simulation.
  var i = start ; // Current position, starting from the given 'start'.
  var j = 0     ; // Counter for 'm' steps.


  // Mark the starting element as false (removed/processed) and increment count.
  ary[ start ] = false ; // The person at 'start' is the first to be "removed".
  var cnt = 1           ; // Count of elements removed so far.


  // Inner loop for the counting-out process.
  // This loop continues until n-1 elements have been removed.
  while ( true )
  {
    // Check if the current element 'i' is still active.
    if ( ary[ i ] )
    {
      // If active, increment the step counter 'j'.
      j ++ ;


      // If 'j' reaches 'm', it means we've counted 'm' active elements.
      if ( j == m )
      {
        // Mark the current element 'i' as inactive (removed).
        ary[ i ] = false ;


        // Reset the step counter for the next round.
        j = 0 ;


        // Increment the total count of removed elements.
        cnt ++ ;


        // Check if n-1 elements have been removed.
        // ary.length-2 corresponds to n (since ary is n+1 length and 0 is unused).
        // If cnt equals n-1, then we break.
        if ( cnt == ary . length - 2 )
          break ; // Exit the inner while(true) loop.
      }
    }


    // Move to the next element.
    i ++ ;


    // Handle wrap-around: if 'i' exceeds the bounds (n), reset to 1.
    if ( ary . length - 1 < i )
      i = 1 ; // Loop back to the first element (index 1).
  }


  // After the inner loop, iterate through 'ary' to find the remaining active element.
  // This loop explicitly checks elements from 1 to n.
  for ( var i = 1 ; i <= n ; i ++ )
  {
    // If an element is still true, it means it's the survivor.
    if ( ary[ i ] )
      console . log( i ) ; // Print the index of the survivor.
  }

}

// End of script.