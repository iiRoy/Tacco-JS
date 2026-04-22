/* This module provides utility functions for numerical processing. */
function parseInteger( inputString )
{
  // Converts the given string into an integer.
  return parseInt( inputString );
}

/*
 * Computes the sum of absolute differences between adjacent elements
 * in a provided array of numbers.
 * @param {Array<number>} numberArray - The array of numbers to process.
 * @returns {number} The accumulated absolute differences.
 */
function calculateAbsoluteDifferenceSum( numberArray ) {
  let totalDifference = 0; // Initialize aggregator for differences.
  for ( let idx = 0; idx < numberArray.length - 1; idx++ ) {
    totalDifference += Math.abs( numberArray[ idx ] - numberArray[ idx + 1 ] );
  }
  return totalDifference;
}

/*
 * Main function to process raw input data, sort numbers, and arrange them
 * into an optimal sequence based on a specific algorithm, then print the
 * sum of absolute differences of the final sequence.
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function ProcessInputData( rawData ) {
  // Parse the input string into an array of integers.
  const parsedNumbers = rawData.split( '\n' ).map( parseInteger );

  const totalCount = parsedNumbers[ 0 ]; // The first number indicates the count of subsequent numbers.
  const initialNumbers = []; // Temporary storage for numbers to be processed.

  // Populate the initial numbers array, skipping the count itself.
  for ( let counter = 0; counter < totalCount; counter++ ) {
    initialNumbers.push( parsedNumbers[ counter + 1 ] );
  }

  const orderedSequence = []; // This will store the final sequence.
  initialNumbers.sort( ( a, b ) => a - b ); // Sort the numbers in ascending order.

  let currentMode = 'minimum'; // Controls the selection strategy: 'minimum' or 'maximum'.

  // Loop until all numbers are placed into the ordered sequence.
  while ( orderedSequence.length < totalCount ) {
    if ( currentMode === 'minimum' ) {
      // Handle the initial placement for the sequence.
      if ( orderedSequence.length === 0 ) {
        orderedSequence.push( initialNumbers.shift() ); // Take the smallest available number.
      } else {
        // Compare placing the smallest remaining number at the beginning vs. end of the current sequence.
        const firstCandidateDiff = Math.abs( orderedSequence[ 0 ] - initialNumbers[ 0 ] );
        const lastCandidateDiff = Math.abs( orderedSequence[ orderedSequence.length - 1 ] - initialNumbers[ 0 ] );

        if ( firstCandidateDiff > lastCandidateDiff ) {
          // Placing at the beginning yields a larger difference, so place it there.
          orderedSequence.unshift( initialNumbers.shift() );
          // If sequence not full, add another from the smallest end.
          if ( orderedSequence.length !== totalCount ) {
            orderedSequence.push( initialNumbers.shift() );
          }
        } else {
          // Placing at the end yields a larger difference or equal, so place it there.
          orderedSequence.push( initialNumbers.shift() );
          // If sequence not full, add another from the smallest end to the other side.
          if ( orderedSequence.length !== totalCount ) {
            orderedSequence.unshift( initialNumbers.shift() );
          }
        }
      }
      currentMode = 'maximum'; // Switch mode for the next iteration.
    } else { // currentMode === 'maximum'
      // Compare placing the largest remaining number at the beginning vs. end of the current sequence.
      const firstCandidateDiff = Math.abs( orderedSequence[ 0 ] - initialNumbers[ initialNumbers.length - 1 ] );
      const lastCandidateDiff = Math.abs( orderedSequence[ orderedSequence.length - 1 ] - initialNumbers[ initialNumbers.length - 1 ] );

      if ( firstCandidateDiff > lastCandidateDiff ) {
        // Placing at the beginning yields a larger difference, so place it there.
        orderedSequence.unshift( initialNumbers.pop() ); // Take the largest available number.
        // If sequence not full, add another from the largest end.
        if ( orderedSequence.length !== totalCount ) {
          orderedSequence.push( initialNumbers.pop() );
        }
      } else {
        // Placing at the end yields a larger difference or equal, so place it there.
        orderedSequence.push( initialNumbers.pop() ); // Take the largest available number.
        // If sequence not full, add another from the largest end to the other side.
        if ( orderedSequence.length !== totalCount ) {
          orderedSequence.unshift( initialNumbers.pop() );
        }
      }
      currentMode = 'minimum'; // Switch mode for the next iteration.
    }
  }

  // Log the final calculated difference for the optimally ordered sequence.
  console.log( calculateAbsoluteDifferenceSum( orderedSequence ) );
}

// Execute the main processing function with data read from standard input.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );