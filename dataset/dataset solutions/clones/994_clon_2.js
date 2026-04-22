/*
 * This module provides a utility function to determine prime numbers
 * and processes a list of numbers from standard input to count how many are prime.
 */

// Function: checkPrimality
// Purpose: To verify if a given integer is a prime number using an optimized algorithm.
function checkPrimality(  candidateValue  )
{
  // Initial quick checks for small prime numbers (2 and 3)
  if ( candidateValue == 2 || candidateValue == 3 )
  {
    return true;
  }

  // Exclude numbers less than 2, all even numbers, and multiples of 3.
  // This significantly reduces the number of checks needed later.
  if (candidateValue < 2 || candidateValue % 2 == 0 || candidateValue % 3 == 0)
  {
    return false;
  }

  // Calculate the upper boundary for trial division.
  // We only need to check for divisors up to the square root of the candidate value.
  var divisorCeiling = Math.floor(Math.sqrt(candidateValue));

  // Loop through potential divisors using the 6k ± 1 optimization.
  // All prime numbers greater than 3 can be expressed in the form 6k - 1 or 6k + 1.
  for (var iterationCount = 1; (iterationCount * 6) - 1 <= divisorCeiling; iterationCount++)
  {
    // Check divisibility by (6k - 1) and (6k + 1)
    if (candidateValue % ((iterationCount * 6) - 1) == 0 || candidateValue % ((iterationCount * 6) + 1) == 0)
    {
      return false; // If divisible, the number is not prime.
    }
  }

  // If the loop completes without finding any divisors, the number is prime.
  return true;
}


// --- Main execution flow for processing standard input ---

// Activate the standard input stream to listen for data.
process.stdin.resume( );

// Configure the encoding for the incoming data stream to 'utf-8'.
process.stdin.setEncoding( 'utf-8' );

// Attach an event handler for when data is received on the standard input.
process.stdin.on( 'data', function (   inputBuffer   )
{
  // Split the entire received data buffer into an array of strings, one for each line.
  var contentLines = inputBuffer.split( '\n' );

  // Remove the first element from the array. This is often a count of following numbers
  // in competitive programming contexts, and not part of the actual numbers to be processed.
  contentLines.shift();

  // Filter the remaining lines. Each line is converted to a number implicitly by checkPrimality.
  // Then, count how many of these filtered numbers are prime.
  // Finally, log the total count to the console (standard output).
  console.log( contentLines.filter( checkPrimality ).length );
} );