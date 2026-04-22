"use strict";

/**
 * Primary function to process the input data and determine the outcome based on specific sequence properties.
 * This routine performs several checks and a conditional transformation on a numeric array.
 * @param {string} rawContent The entire input string, typically acquired from standard input.
 * @returns {void} Outputs either "Yes" or "No" to the console, indicating the result of the analysis.
 */
function ProcessSequence( rawContent ) {
  // Split the incoming raw content string into an array of individual lines.
  let parsedLines = rawContent.split( "\n" );

  // Extract the sequence length from the first line of the parsed input.
  let sequenceLength = parseInt( parsedLines[0] );

  // Create the main numeric sequence by slicing off the first line,
  // then mapping each remaining string element to an integer and decrementing it by one.
  const numericSequence = parsedLines.slice(1).map( (elementStr) => parseInt(elementStr) - 1 );

  // --- First Validation Phase: Parity Consistency Check ---
  // Iterate through the sequence from the beginning to ensure that
  // the parity (even/odd) of each element matches the parity of its index.
  for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx += 1) {
    if (numericSequence[currentIdx] % 2 !== currentIdx % 2) {
      // If any element's parity does not match its index's parity,
      // the condition is violated, and we output "No" and terminate.
      console.log( "No" );
      return;
    }
  }

  // --- Second Phase: Conditional Transformation via Swaps ---
  // This loop iterates backward from the end of the sequence (excluding the first two elements).
  // It looks for a specific descending triplet pattern and performs a swap if found.
  for (let currentIdx = sequenceLength - 1; currentIdx > 1; currentIdx -= 1) {
    if (numericSequence[currentIdx] < numericSequence[currentIdx - 1] && numericSequence[currentIdx - 1] < numericSequence[currentIdx - 2]) {
      // If the pattern numericSequence[currentIdx] < numericSequence[currentIdx-1] < numericSequence[currentIdx-2] is detected,
      // a swap is performed: numericSequence[currentIdx] and numericSequence[currentIdx-2] are exchanged.
      let temporaryValue = numericSequence[currentIdx];
      numericSequence[currentIdx] = numericSequence[currentIdx - 2];
      numericSequence[currentIdx - 2] = temporaryValue;
    }
  }

  // --- Third Validation Phase: Post-Transformation Structural Check ---
  // After potential swaps, this loop re-validates the sequence structure.
  // It checks for another specific pattern that would indicate an invalid sequence.
  for (let currentIdx = sequenceLength - 1; currentIdx > 1; currentIdx -= 1) {
    if (numericSequence[currentIdx] < numericSequence[currentIdx - 2] && (numericSequence[currentIdx] > numericSequence[currentIdx - 1] || numericSequence[currentIdx - 1] > numericSequence[currentIdx - 2])) {
      // If the pattern numericSequence[currentIdx] < numericSequence[currentIdx-2]
      // AND (numericSequence[currentIdx] > numericSequence[currentIdx-1] OR numericSequence[currentIdx-1] > numericSequence[currentIdx-2])
      // is found, the sequence is deemed invalid.
      console.log( "No" );
      return; // Output "No" and terminate.
    }
  }

  // If the code reaches this point, all validation checks have passed,
  // and any necessary transformations have been applied successfully.
  console.log( "Yes" );
  return;
}

// --- Program Entry Point: Execution Block ---
// This line reads the entire content from standard input (typically a file redirected to /dev/stdin)
// using Node.js's built-in file system module, interprets it as UTF-8,
// and then passes this raw string content to the main processing function.
ProcessSequence( require("fs").readFileSync("/dev/stdin", "utf8") );