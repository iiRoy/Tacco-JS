// A utility function to process raw text input for segment analysis.
function analyzeStringSegments(sourceText) {
  "use strict"; // Enforce strict mode for cleaner code.

  // --- Input Parsing and Initial Validation ---
  const inputLines = sourceText.split("\n");

  // Add a guard clause for insufficient input lines.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input. Expected at least two lines.");
    // In a real application, you might throw an error or handle differently.
    return;
  }

  const configurationValues = inputLines[0].split(" ");
  const originalStringTotalLength = parseInt(configurationValues[0], 10); // Renamed 'n'
  const maxFlipsAllowed = parseInt(configurationValues[1], 10);       // Renamed 'k'

  // Validate parsed numbers.
  if (isNaN(originalStringTotalLength) || isNaN(maxFlipsAllowed)) {
    console.error("Error: Invalid numeric input for string length or flip budget.");
    return;
  }

  const characterSequence = inputLines[1].split(""); // Renamed 'chars'
  const sequenceLength = characterSequence.length;     // Renamed 'count'

  // Handle an empty input character sequence.
  if (sequenceLength === 0) {
    console.log(0); // If no characters, max length of '1's is 0.
    return;
  }

  // --- Run-Length Encoding (RLE) for Segments ---
  // This section identifies consecutive blocks of identical characters ('0's or '1's)
  // and stores their lengths. It also counts the total '0' blocks.
  const segmentBlockLengths = []; // Renamed 'stands'
  let currentBlockLength = 0;     // Renamed 'x'
  let lastProcessedChar = '';     // Renamed 'prev'
  let totalZeroBlockCount = 0;    // Tracks the number of '0' blocks, replaces 'stands_0.length'

  // Initialize for the first character in the sequence.
  if (sequenceLength > 0) {
    lastProcessedChar = characterSequence[0];
    currentBlockLength = 1;
    if (lastProcessedChar === '0') {
      totalZeroBlockCount++; // Increment if the very first block is a '0'.
    }
  }

  // Iterate through the rest of the sequence to build segment lengths.
  for (let charIndex = 1; charIndex < sequenceLength; charIndex++) { // Renamed 'i' to 'charIndex'
    const currentChar = characterSequence[charIndex]; // Renamed 'c' to 'currentChar'

    if (currentChar !== lastProcessedChar) {
      // A new block type has started. Store the length of the previous block.
      segmentBlockLengths.push(currentBlockLength);
      currentBlockLength = 1; // Reset for the new block.
      if (currentChar === '0') {
        totalZeroBlockCount++; // If the new block is a '0' block, count it.
      }
    } else {
      currentBlockLength++; // Continue accumulating length for the current block.
    }
    lastProcessedChar = currentChar; // Update the last processed character.
  }
  // After the loop, push the length of the very last block.
  segmentBlockLengths.push(currentBlockLength);

  // --- Special Case Handling for Max Flips ---
  // If the allowed flips (maxFlipsAllowed) are sufficient to convert all '0' blocks to '1's,
  // then the entire string can become '1's.
  if (maxFlipsAllowed >= totalZeroBlockCount) {
    console.log(originalStringTotalLength); // Output the total length 'n'.
    return; // Terminate execution.
  }

  // --- Sliding Window Algorithm for Maximum '1's ---
  // This part calculates the maximum contiguous length of '1's achievable
  // by flipping at most 'maxFlipsAllowed' '0' blocks.

  // Determine the initial window size based on the first segment's character type.
  // This calculation defines the number of segments to consider within a window
  // to potentially use 'maxFlipsAllowed' '0' blocks.
  let slidingWindowSegmentCount; // Renamed 'w'
  if (characterSequence[0] === '1') {
    // If starting with '1', a window using 'maxFlipsAllowed' '0' blocks will span
    // 'maxFlipsAllowed' '0' segments and 'maxFlipsAllowed + 1' '1' segments.
    slidingWindowSegmentCount = maxFlipsAllowed * 2 + 1;
  } else {
    // If starting with '0', a window using 'maxFlipsAllowed' '0' blocks will span
    // 'maxFlipsAllowed + 1' '0' segments and 'maxFlipsAllowed + 1' '1' segments.
    slidingWindowSegmentCount = maxFlipsAllowed * 2 + 2;
  }

  // Ensure the calculated window size doesn't exceed the total number of segments available.
  slidingWindowSegmentCount = Math.min(slidingWindowSegmentCount, segmentBlockLengths.length);

  // Helper function to sum array elements (extracted for Type III change).
  const sumArrayElements = (arrayToSum) => arrayToSum.reduce((accumulator, element) => accumulator + element, 0);

  // Initialize the first window and its sum.
  // 'activeWindowSegments' holds the current window's block lengths.
  let activeWindowSegments = segmentBlockLengths.slice(0, slidingWindowSegmentCount); // Renamed 'ww'
  let currentWindowAccumulatedSum = sumArrayElements(activeWindowSegments); // Optimization: running sum

  const allWindowSums = [currentWindowAccumulatedSum]; // Renamed 'nums'
  const totalNumberOfSegments = segmentBlockLengths.length; // Renamed 'stands_count'

  // Slide the window across the segment block lengths.
  let windowStartIndex = 0; // Tracks the starting index of the current window.
  for (let currentSegmentIndex = slidingWindowSegmentCount; // Renamed 'i'
       currentSegmentIndex < totalNumberOfSegments;
       currentSegmentIndex++) {
    
    // Remove the length of the segment that is leaving the window from the sum.
    currentWindowAccumulatedSum -= segmentBlockLengths[windowStartIndex];
    
    // Add the length of the new segment entering the window to the sum.
    currentWindowAccumulatedSum += segmentBlockLengths[currentSegmentIndex];
    
    // Move the window's starting point forward.
    windowStartIndex++;

    // Store the sum of the new window configuration.
    allWindowSums.push(currentWindowAccumulatedSum);
  }

  // --- Final Result Determination ---
  // Find the maximum sum among all calculated window sums.
  const overallMaximumLength = allWindowSums.reduce((maxVal, currentVal) => Math.max(maxVal, currentVal), 0);

  // Output the final result using a template literal for formatting.
  console.log(`Maximum achievable length: ${overallMaximumLength}`);
}

// --- Execution Entry Point ---
// This block handles reading input from stdin and calling the main analysis function.
try {
  // Read the entire content of stdin synchronously.
  const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  // Process the input data.
  analyzeStringSegments(fileInputContent);
} catch (executionError) {
  // Catch and log any errors during file reading or processing.
  console.error("An unexpected error occurred during execution:", executionError.message);
  // Exit with a non-zero status code to indicate failure.
  process.exit(1);
}