"use strict"
;
// This directive ensures strict mode parsing and execution.


/**
 * Determines if a given number `num` is a power of 2.
 * A number is considered a power of 2 if its binary representation
 * consists of a single '1' followed by zero or more '0's.
 *
 * @param {number} num The input number to check.
 * @returns {boolean} True if the number is a power of 2, false otherwise.
 */
function is2n ( num )
{

  // Convert the number to its binary string representation.
  let numStr = num . toString( 2 ) ;

  // Check the first digit of the binary string.
  // For a power of 2, it must be '1'.
  if ( numStr[0] !== "1" )
  {
    // If the first digit is not '1', it's not a power of 2.
    return false ;
  }

  // Iterate through the remaining digits of the binary string.
  for ( let i = 1 ; i < numStr . length ; i++ )
  {
    // All subsequent digits must be '0' for it to be a power of 2.
    if ( numStr[i] !== "0" )
    {
      // If any subsequent digit is not '0', it's not a power of 2.
      return false ;
    }
  }
  // If all checks pass, the number is a power of 2.
  return true ;
}


/**
 * Main function to process the input and solve the problem.
 * The problem involves finding pairs of numbers from an input array
 * whose sum is a power of 2.
 *
 * @param {string} input The raw input string, typically from stdin.
 */
function main ( input )
{
  // Split the input string by newlines and filter out any empty lines.
  const inputs = input . split( "\n" ) . filter( x => x !== "" ) ;

  // Parse the second line of input into an array of numbers.
  // The numbers are space-separated.
  const A = inputs[1] . split( " " ) . map( Number ) ;

  // Sort the array A in descending order. This helps in efficiently
  // finding potential pairs for the largest remaining number.
  let sortedA = A . sort( (a, b) => b - a ) ;

  // Initialize a counter for the number of pairs found.
  let count = 0 ;

  // Continue processing as long as there are numbers left in the array.
  while ( sortedA . length > 0 )
  {
    // Debugging lines (commented out in original, kept as is or removed)
    // console.log({ sortedA });
    // console.log("i", sortedA[0]);

    // Flag to track if a pair was found for the current largest element.
    let hasPair = false ;

    // Iterate through the remaining elements starting from the second one.
    // The first element `sortedA[0]` is the largest currently available.
    for ( let i = 1 ; i < sortedA . length ; i++ )
    {
      // Calculate the sum of the largest element and the current element.
      let sum = sortedA[0] + sortedA[i] ;

      // Check if the sum is a power of 2 using the helper function.
      if ( is2n( sum ) )
      {
        // Debugging line (commented out in original)
        // console.log("j", sortedA[i]);

        // If a pair is found, remove both elements from the array.
        // Remove the smaller element first to avoid index shifting issues
        // when removing the larger element at index 0.
        sortedA . splice( i, 1 ) ;
        sortedA . splice( 0, 1 ) ;

        // Increment the pair count.
        count += 1 ;

        // Set the flag to true as a pair has been found.
        hasPair = true ;

        // Break out of the inner loop as the current largest element
        // has found its pair and is removed.
        break ;
      }
    }

    // If no pair was found for the current largest element,
    // it cannot form a sum that is a power of 2 with any other remaining element.
    // So, remove it from the array.
    if ( !hasPair )
    {
      sortedA . splice( 0, 1 ) ;
    }
  }

  // Output the total number of pairs found.
  console . log( count ) ;
}


// Read input from standard input and pass it to the main function.
main( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ) ;