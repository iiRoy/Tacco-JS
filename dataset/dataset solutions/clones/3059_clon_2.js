"use strict"; // Enforce strict mode for modern JavaScript practices

/**
 * Orchestrates the processing of input data according to specific problem logic.
 * This function handles sequence parsing, block identification, and final calculation.
 *
 * @param {string} rawDataSource - The entire input provided as a single string.
 */
function ProcessInput(rawDataSource) {
  // Break down the raw input string into an array of individual lines.
  const inputLines = rawDataSource.split("\n");

  // Extract and parse the first line containing global configuration values.
  // This line is removed from the inputLines array after processing.
  const configurationParameters = inputLines.shift().split(/\s+/).map((valueString) => Number(valueString));

  // Assign the extracted configuration values to descriptive constants.
  const totalElements = configurationParameters[0];
  const maxOperations = configurationParameters[1];

  // Process the second line, which represents the binary sequence.
  // It's split into characters and each character is converted to an integer.
  const binarySequence = inputLines.shift().split(/\s+/)[0].split("").map((charValue) => parseInt(charValue, 10));

  // Initialize variables for traversing the sequence and storing identified blocks.
  let currentSegmentStart = 0;
  const blockSegmentInfo = []; // Stores objects describing consecutive blocks (e.g., type, start, length).

  // Set up a pointer for scanning and determine the type of the initial block.
  let blockScanPointer;
  let currentBlockDesignation = binarySequence[0];

  // Iterate through the binary sequence to identify and categorize contiguous blocks.
  // A block is only recorded if it is followed by a block of a different type.
  // If a block extends to the end of the sequence, it is not explicitly added here.
  while (currentSegmentStart < totalElements) {
    // Advance the scan pointer until a different block type is encountered or the end is reached.
    for (blockScanPointer = currentSegmentStart; blockScanPointer < totalElements && binarySequence[blockScanPointer] === currentBlockDesignation; blockScanPointer++) {
      /* Loop body is intentionally empty; the pointer's final value is what matters. */
    }

    // If the block ended before the sequence's end, it means a type change occurred.
    // Record this block and flip the expected type for the next segment.
    if (blockScanPointer < totalElements) {
      const segmentSpan = blockScanPointer - currentSegmentStart; // Calculate the length of the identified block.
      blockSegmentInfo.push({ blockType: currentBlockDesignation, startIndex: currentSegmentStart, length: segmentSpan });
      currentBlockDesignation = (currentBlockDesignation + 1) % 2; // Toggle the block type (0 to 1, or 1 to 0).
    }
    // Move the starting point for the next block search to where the previous one ended.
    currentSegmentStart = blockScanPointer;
  }

  // Prepend a zero-length '1' block if the first identified block is '0'.
  // This is a specific adjustment for problems where calculations assume a leading '1' block.
  // Note: This access `blockSegmentInfo[0]` will cause a runtime error if `blockSegmentInfo` is empty,
  // which replicates the exact behavior of the original code.
  if (blockSegmentInfo[0].blockType === 0) {
    blockSegmentInfo.unshift({ blockType: 1, startIndex: 0, length: 0 });
  }

  // Calculate the total count of '0' blocks within the collected segments.
  // This variable is derived but not utilized in the subsequent calculations.
  const zeroSegmentCounter = blockSegmentInfo.reduce((accumulatorValue, segmentItem) => {
    return accumulatorValue + (segmentItem.blockType === 0 ? 1 : 0);
  }, 0);

  // Define a helper function to determine the combined length of a segment and its immediate neighbors.
  // This function is defined but ultimately not called within this particular code path.
  const computeAdjacentBlockLength = (blockIndex) => {
    let combinedLength = blockSegmentInfo[blockIndex].length;
    if (blockIndex > 0) {
      combinedLength += blockSegmentInfo[blockIndex - 1].length;
    }
    if (blockIndex < blockSegmentInfo.length - 1) {
      combinedLength += blockSegmentInfo[blockIndex + 1].length;
    }
    return combinedLength;
  };

  // Compute the final result by summing the lengths of a specific number of initial blocks.
  // The number of blocks considered is determined by `maxOperations * 2` plus one.
  // If `blockSegmentInfo` has fewer than `maxOperations * 2 + 1` elements, accessing
  // `blockSegmentInfo[currentBlockIter]` will lead to `undefined.length`, causing an error,
  // consistent with the original code's behavior.
  let cumulativeResult = 0;
  for (let currentBlockIter = 0; currentBlockIter <= maxOperations * 2; currentBlockIter++) {
    cumulativeResult += blockSegmentInfo[currentBlockIter].length;
  }

  // Output the final computed result to the console.
  console.log(cumulativeResult);
} // End of ProcessInput function definition

// This conditional block determines the execution environment.
// If running in a Node.js environment (i.e., not in a web browser),
// it reads input from standard input and passes it to the main processing function.
if (typeof window === "undefined") {
  ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}