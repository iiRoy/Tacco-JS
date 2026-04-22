"use strict";

/*
 * This module defines a core routine to process incoming text.
 * It performs parsing, conditional evaluation, and outputs a result.
 */
function ProcessInputData(incomingText)
{
  // First, cleanse the provided string: remove any peripheral whitespace,
  // then segment it by spaces, and finally transform each segment into a numerical value.
  const numericalSegments = incomingText
    .trim()
    .split(' ')
    .map(Number); // Ensure all parts are treated as numbers

  // Establish some named constants for the calculation logic.
  const checkValue = 10;     // A fixed boundary for comparison
  const scaleFactor = 100;    // A constant multiplier

  // Evaluate the initial numerical segment against the predefined threshold.
  if (numericalSegments[0] <= checkValue)
  {
    // If the condition holds true, compute a modified output.
    // This involves a weighted difference added to the second segment.
    console.log(numericalSegments[1] + (scaleFactor * (checkValue - numericalSegments[0])));
  }
  else
  {
    // Otherwise, if the condition is false, simply display the second numerical segment.
    console.log(numericalSegments[1]);
  }
}

// Initiate the data processing by reading content from the standard input stream.
// Utilizes Node.js 'fs' module to synchronously acquire the full file content as UTF-8.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));