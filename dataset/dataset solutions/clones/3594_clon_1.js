/*
 * This file contains a JavaScript implementation for calculating medians.
 * It defines a utility function `median` and a main function `Main`
 * which processes input to find a specific median value.
 */

// Function: median
// Calculates the median of a given list of numbers.
// Assumes the input 'l' is an array of numbers.
//
// Parameters:
//   l - An array of numbers.
function median ( l ) {
  // Sort the input list 'l' in ascending order.
  // Then, retrieve the element at the middle index.
  // Math.floor is used to handle both even and odd length arrays
  // correctly for finding the lower-median or central element.
  return l.sort() [ Math.floor ( l.length / 2 ) ] ;
} // End of median function

// Main function: Main
// Processes the input string to perform calculations.
//
// Parameters:
//   input - A string containing multi-line input data.
function Main ( input ) {

  // Split the input string by newline characters.
  input = input.split ( "\n" ) ;

  // Parse the first line of input to get the value of N.
  // N is expected to be an integer.
  N = parseInt ( input [ 0 ] ) ;

  // Split the second line of input by spaces to get an array of elements 'a'.
  // These elements are likely numbers, but stored as strings initially.
  a = input [ 1 ] .split ( " " ) ;

  // Initialize an empty array 'm' which will store medians of subarrays.
  m = [ ] ;


  // Outer loop: iterates from i = 0 up to N-1.
  for ( var i = 0 ; i < N ; i ++ ) {

    // Inner loop: iterates from j = i + 1 up to N.
    // This creates all possible contiguous subarrays starting at index 'i'.
    for ( var j = i + 1 ; j < N + 1 ; j ++ ) {

      // Extract a slice (subarray) of 'a' from index 'i' to 'j' (exclusive of 'j').
      // Calculate the median of this subarray.
      // Push the calculated median into the array 'm'.
      m.push ( median ( a.slice ( i , j ) ) ) ;
    } // End of inner for loop
  } // End of outer for loop

  // After populating 'm' with medians of all subarrays,
  // calculate the median of the array 'm' itself.
  // Log the final result to the console.
  console.log ( median ( m ) ) ;

} // End of Main function


// This is the entry point of the script.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module.
// The input is read as UTF-8 encoded text.
// Then, the 'Main' function is called with the read input.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// End of script.