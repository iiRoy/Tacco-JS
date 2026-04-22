// This module processes genetic sequence data to find the longest valid segment.
function analyzeGeneticSequence(rawInputText) {
  // Ensure the input is treated as a string and handle potential empty input.
  if (typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
    outputFinalResult(0); // If input is invalid or empty, the longest segment is 0.
    return;
  }

  // Extract the primary sequence from the first line of the input.
  // Using trim() to remove potential trailing newlines or whitespace.
  const dnaSequenceToExamine = rawInputText.split('\n')[0].trim();

  // If after trimming, the sequence is empty, output 0.
  if (dnaSequenceToExamine.length === 0) {
    outputFinalResult(0);
    return;
  }

  // Define the set of allowed characters for a valid ACGT segment.
  // Using a Set for efficient O(1) lookup performance.
  const permittedNucleotides = new Set(['A', 'C', 'G', 'T']);

  let longestContinuousSegment = 0; // Stores the maximum length found so far.
  let currentSegmentAccumulator = 0; // Tracks the length of the current contiguous valid segment.

  // Iterate through each character of the DNA sequence.
  // Using a traditional for loop for explicit index control.
  for (let sequencePosition = 0; sequencePosition < dnaSequenceToExamine.length; sequencePosition++) {
    const charAtCurrentPosition = dnaSequenceToExamine[sequencePosition];

    // Check if the current character is one of the permitted nucleotides.
    if (permittedNucleotides.has(charAtCurrentPosition)) {
      // If it is, increment the current segment length.
      currentSegmentAccumulator++;
      // Update the overall longest segment if the current one is longer.
      if (currentSegmentAccumulator > longestContinuousSegment) {
        longestContinuousSegment = currentSegmentAccumulator;
      }
    } else {
      // If the character is not a permitted nucleotide, the continuous segment is broken.
      // Reset the accumulator for the current segment.
      currentSegmentAccumulator = 0;
    }
  }

  // Display the final calculated maximum length.
  outputFinalResult(longestContinuousSegment);
}

// Helper function to encapsulate the output mechanism.
function outputFinalResult(resultValue) {
  console.log(resultValue);
}

// Entry point for execution in a Node.js environment.
// Reads input from standard input and passes it to the main processing function.
// Using a more descriptive path for the standard input device.
analyzeGeneticSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));