"use strict";

const executeProcessor = (initialInput) => {

  // Step 1: Pre-process the raw input string
  // Remove leading/trailing whitespace and split into lines.
  let cleanInputLines = initialInput.trim().split("\n");

  // Step 2: Extract the primary sequence of characters from the first line
  // Convert the first line into an array of individual symbols.
  const symbolSequence = cleanInputLines[0].split("");

  // Step 3: Initialize various counters and state variables
  // Counter for 'right-facing' symbols within a segment.
  let rightwardTally = 0;
  // Counter for 'left-facing' symbols within a segment.
  let leftwardTally = 0;
  // Variable to store the index of the first symbol in a 'boundary' pair.
  let segmentPivot;
  // Counter to detect segment transitions (e.g., R to L, or L to R).
  let segmentBoundaryCounter = 0;

  // Step 4: Prepare the output array, initialized with zeros
  // This array will hold the final calculated values for each position.
  let finalOutcome = Array(symbolSequence.length).fill(0);

  // Step 5: Iterate through the symbol sequence to analyze segments
  // The loop processes up to the second-to-last character to allow
  // comparison with the next character.
  for (let currentSymbolIndex = 0; currentSymbolIndex < symbolSequence.length - 1; currentSymbolIndex++) {

    // Increment respective tallies based on the current symbol's direction
    if (symbolSequence[currentSymbolIndex] === "R") rightwardTally++;
    if (symbolSequence[currentSymbolIndex] === "L") leftwardTally++;

    // Check for a change in symbol direction, indicating a segment boundary
    if (symbolSequence[currentSymbolIndex] !== symbolSequence[currentSymbolIndex + 1]) {
      segmentBoundaryCounter++; // Mark that a segment direction change occurred

      // If this is the first direction change in a potential 'RL' block,
      // record its index as the pivot point.
      if (segmentBoundaryCounter === 1) {
        segmentPivot = currentSymbolIndex;
      }
    }

    // If two direction changes have been detected, it signifies the end
    // of an 'RL' segment (e.g., R...RL...R or L...LR...L) and time to calculate.
    if (segmentBoundaryCounter === 2) {
      // Calculate the total number of symbols in the current 'RL' block.
      let totalSegmentLength = rightwardTally + leftwardTally;

      // Distribute the total count to the boundary positions based on parity
      if (totalSegmentLength % 2 === 0) {
        // If the total is even, distribute equally to both sides of the pivot.
        finalOutcome[segmentPivot] = totalSegmentLength / 2;
        finalOutcome[segmentPivot + 1] = totalSegmentLength / 2;
      } else {
        // If the total is odd, apply ceiling logic for uneven distribution.
        finalOutcome[segmentPivot] = Math.ceil(leftwardTally / 2) + 1;
        finalOutcome[segmentPivot + 1] = Math.ceil(rightwardTally / 2) + 1;
      }

      // Reset segment counters for the next block
      segmentBoundaryCounter = 0;
      rightwardTally = 0;
      leftwardTally = 0;
    }

    // Special handling for the very last 'RL' segment in the sequence.
    // This condition triggers when processing the second-to-last character.
    if (currentSymbolIndex === symbolSequence.length - 2) {
      // Unconditionally increment the leftward tally for the last character.
      leftwardTally++;

      let lastSegmentTotal = rightwardTally + leftwardTally;

      // Apply the same distribution logic for the final segment as above.
      if (lastSegmentTotal % 2 === 0) {
        finalOutcome[segmentPivot] = lastSegmentTotal / 2;
        finalOutcome[segmentPivot + 1] = lastSegmentTotal / 2;
      } else {
        finalOutcome[segmentPivot] = Math.ceil(leftwardTally / 2) + 1;
        finalOutcome[segmentPivot + 1] = Math.ceil(rightwardTally / 2) + 1;
      }
    }
  }

  // Step 6: Output the final calculated results
  // Join the numbers in the result array with spaces and print to console.
  console.log(finalOutcome.join(" "));
};

// Initiate the processing by reading input from standard input
executeProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));