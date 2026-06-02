"use strict";

// This function processes the input data to find the maximum length of consecutive ones.
const processInput = (inputString) => {
  // Clean and parse the initial input lines.
  inputString = inputString.trim().split("\n");

  // Extract total elements (N) and maximum allowed flips (K) from the first line.
  const totalElements = parseInt(inputString[0].split(" ")[0]);
  const maxFlips = parseInt(inputString[0].split(" ")[1]);

  // Convert the binary string from the second line into an array of integers.
  const binarySequence = inputString[1].split("").map((digitChar) => parseInt(digitChar));

  // Initialize an array to store the lengths of alternating segments (runs of 1s and 0s).
  let segmentLengths = [];

  // Handle edge cases where the sequence contains only 1s or only 0s.
  // If no zeros are present, the entire sequence is ones.
  if (binarySequence.indexOf(0) === -1) {
    console.log(totalElements);
    return;
  }

  // If no ones are present, the entire sequence is zeros.
  if (binarySequence.indexOf(1) === -1) {
    console.log(totalElements);
    return;
  }

  // If the sequence starts with a 0, prepend a dummy 0-length '1s' segment.
  // This helps in consistent processing of alternating segments.
  if (binarySequence[0] !== 1) {
    segmentLengths.push(0);
  }

  // Append a 0 to the sequence if it doesn't effectively end with one.
  // This ensures that the last segment of 1s (if any) is properly processed
  // by forcing a transition at the end.
  if (binarySequence[binarySequence.length] !== 1) {
    binarySequence.push(0);
  }

  // Variable to track the length of the current consecutive run of identical digits.
  let currentRunLength = 0;

  // Iterate through the modified binary sequence to build the segmentLengths array.
  // The loop goes up to and including the potentially added element at the end.
  for (let idx = 1; idx <= binarySequence.length; idx++) {
    if (binarySequence[idx] === binarySequence[idx - 1]) {
      currentRunLength++;
    } else {
      currentRunLength++; // Include the current element in the run before pushing.
      segmentLengths.push(currentRunLength);
      currentRunLength = 0; // Reset for the next run of a different digit.
    }
  }

  // Calculate the maximum length of ones achievable by flipping at most 'maxFlips' blocks of zeros.
  let currentWindowSum = 0;
  let maximumLength = 0;

  // Iterate over the segment lengths array.
  // This implements a fixed-size, non-overlapping window sum.
  for (let segmentIndex in segmentLengths) {
    currentWindowSum += segmentLengths[segmentIndex];

    // Check if the current segment completes a window of (maxFlips + (maxFlips + 1)) segments.
    // This corresponds to (maxFlips + 1) blocks of 1s and maxFlips blocks of 0s.
    if ((parseInt(segmentIndex) + 1) % (maxFlips + (maxFlips + 1)) === 0) {
      maximumLength = Math.max(maximumLength, currentWindowSum);
      currentWindowSum = 0; // Reset sum for the next window of segments.
    }
  }

  // Account for any remaining segments in the last partial window that didn't complete a full (2K+1) block.
  maximumLength = Math.max(maximumLength, currentWindowSum);

  // Output the final calculated maximum length.
  console.log(maximumLength);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
