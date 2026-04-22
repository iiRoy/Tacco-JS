// This file contains the main logic for processing input data for a specific problem.
// The code adheres to strict JavaScript practices.

"use strict" ; /* Enable strict mode for better error handling and cleaner code. */


function Main ( input ) { // Define the primary function that processes the given input string.

  // Split the entire input string by newline characters to get an array of lines.
  var lines = input . split ( "\n" ) ;


  // Extract the first line, which represents the count 'N', and convert it to a number.
  var N = lines . shift ( ) - 0 ; // The '- 0' is a common idiom for type conversion to number.


  // Initialize an array named 'ryo' with a size of 'N' to store structured data.
  var ryo = new Array ( N ) ;


  // Loop 'N' times to parse and store data from the subsequent input lines.
  for ( var n = 0 ; n < N ; n ++ ) {

    // For each line, split it by spaces to get an array of numbers as strings.
    var nums = lines [ n ] . split ( " " ) ;

    // Create an object for the current index 'n' in the 'ryo' array.
    ryo [ n ] = {
      taka : nums [ 0 ] - 0 , // Convert the first number to 'taka' score.
      aoki : nums [ 1 ] - 0 , // Convert the second number to 'aoki' score.
    } ; // Closing brace for the object literal.

    // Calculate the difference between 'aoki' and 'taka' scores and store it as 'sa'.
    ryo [ n ] . sa = ryo [ n ] . aoki - ryo [ n ] . taka ;

  } // End of the data population loop.


  // Sort the 'ryo' array using a custom comparison function.
  // The sorting is based on the 'sa' property in descending order.
  ryo . sort ( function ( a , b ) {

    // The comparison logic: 'b.sa - a.sa' ensures descending order for 'sa'.
    return b . sa - a . sa ;

  } ) ;


  // This line was present in the original code, but commented out.
  // It suggests an alternative sorting strategy that was not used.
  // ryo.sort(function(a, b) { return b.taka - a.taka; });


  // Initialize a variable to accumulate the 'koufuku' (happiness/total score).
  var koufuku = 0 ;


  // Iterate through the sorted 'ryo' array to calculate the final 'koufuku' score.
  for ( var n = 0 ; n < N ; n ++ ) {

    // Check if the current index 'n' is even or odd.
    if ( n % 2 == 0 ) { // If 'n' is an even number (0, 2, 4, ...).

      koufuku += ryo [ n ] . taka ; // Add the 'taka' score to 'koufuku'.
      ryo [ n ] . taka = 0 ; // Set 'taka' to 0, indicating it has been used.

    } else { // If 'n' is an odd number (1, 3, 5, ...).

      koufuku -= ryo [ n ] . aoki ; // Subtract the 'aoki' score from 'koufuku'.
      ryo [ n ] . aoki = 0 ; // Set 'aoki' to 0, indicating it has been used.

    }
  } // End of the score calculation loop.


  // Print the final calculated 'koufuku' value to the console output.
  console . log ( koufuku ) ;

} // End of the 'Main' function.


// Invoke the 'Main' function by reading input from standard input using Node.js 'fs' module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;