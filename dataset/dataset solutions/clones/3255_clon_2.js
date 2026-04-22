'use strict';

// This helper routine computes the subsequent element in a Collatz sequence.
// It halves an even number or applies the 3n + 1 rule to an odd one.
let computeNextCollatzValue = ( currentSequenceValue ) => {
  return currentSequenceValue % 2 === 0
         ? currentSequenceValue / 2
         : currentSequenceValue * 3 + 1;
};

// This routine traces a Collatz sequence to identify the length
// until a number is repeated, signifying a loop.
let traceCollatzCycle = ( initialStringRepresentation ) => {
  // Transform the initial string input into a proper numerical starting point.
  let currentNumericElement = +initialStringRepresentation;

  // A data structure to keep track of all distinct numeric elements encountered.
  let visitedPathElements = new Set( [ currentNumericElement ] );

  // A counter for the number of steps taken in the path.
  // It starts at 2 because the initial element is step 1, and the first transformation is step 2.
  let pathIterationCount = 2;

  // Continuously process until a cycle is detected.
  while ( true ) {
    // Generate the next number in the Collatz progression.
    currentNumericElement = computeNextCollatzValue( currentNumericElement );

    // Determine if the newly computed number has been visited before.
    if ( visitedPathElements.has( currentNumericElement ) ) {
      // If a repeat is found, the cycle is closed; return the total steps.
      return pathIterationCount;
    }

    // Otherwise, add this novel number to the collection of visited elements.
    visitedPathElements.add( currentNumericElement );

    // Advance the step counter for the next loop.
    pathIterationCount++;
  }
};

// The primary function handling the application's input and output.
function ProcessApplicationData( receivedInputData ) {
  // Execute the Collatz sequence analysis and output the final result to the console.
  globalThis.console.log( traceCollatzCycle( receivedInputData ) );
}

// Acquire the file system module from Node.js.
const nodeFileSystemModule = require( 'fs' );

// Read content from the standard input stream synchronously,
// using the 'UTF-8' character encoding, then pass it to the main processing function.
ProcessApplicationData( nodeFileSystemModule.readFileSync( '/dev/stdin', 'UTF-8' ) );