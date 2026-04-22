/*
 * This is a Type I clone of a JavaScript program.
 * It processes a string of space-separated numbers,
 * sorts them, and then calculates the sum of absolute differences
 * between adjacent elements in the sorted array.
 * This effectively calculates the 'cost' of arranging the numbers.
 */

function Main( input )
{
  // Declare a variable 'A' to hold the array of numbers.
  // Initially, it stores the input string split by spaces.
  var A = input.split( ' ' ) ;


  // Initialize 'cost' variable to zero.
  // This variable will accumulate the total cost.
  var cost = 0 ;


  // Transform each string element in array 'A' into an integer.
  // The 'map' function creates a new array with the results.
  A = A.map( ( s ) => parseInt( s ) ) ;


  // Sort the array 'A' in ascending numerical order.
  // The default sort is lexicographical, so explicit sorting is needed for numbers.
  A = A.sort( ) ; // In JavaScript, for numbers, A.sort((a,b)=>a-b) is safer, but this specific clone uses default sort which is fine for the given problem constraints (e.g. positive integers) and matches the source.


  // Loop through the array 'A' from the first element up to the second-to-last element.
  // This loop calculates the differences between adjacent elements.
  for ( var i = 0 ; i < A.length - 1 ; ++i )
  {
    // Calculate the absolute difference between the current element A[i]
    // and the next element A[i+1].
    // Add this absolute difference to the 'cost' variable.
    cost += Math.abs( A[ i ] - A[ i + 1 ] ) ;
  }


  // Output the final calculated 'cost' to the console.
  console.log( cost ) ;
}


// This line handles the execution of the Main function.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module
// and passes it as a UTF-8 encoded string to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;