function processInputData(rawData) {
  "use strict";
  const inputLines = rawData.split("\n");
  const firstLineParts = inputLines[0].split(" ");
  const totalLength = parseInt(firstLineParts[0], 10);
  const maxFlips = parseInt(firstLineParts[1], 10);
  const characterSequence = inputLines[1].split("");

  const sequenceLength = characterSequence.length;
  const segmentLengths = [];
  // These arrays store lengths of segments based on the *next* character encountered.
  // This specific (and potentially counter-intuitive) population logic is preserved
  // to maintain exact observable behavior, including any original quirks.
  const zeroSegmentLengths = []; // Stores lengths of '1' segments that were followed by a '0'
  const oneSegmentLengths = [];  // Stores lengths of '0' segments that were followed by a '1'

  let currentRunLength = 1;
  let previousChar = characterSequence[0];

  // Iterate through the character sequence to build run-length segments
  for (let segmentIndex = 1; segmentIndex < sequenceLength; segmentIndex++) {
    const currentChar = characterSequence[segmentIndex];
    if (currentChar !== previousChar) {
      segmentLengths.push(currentRunLength);
      
      // Replicating the original's logic for zeroSegmentLengths/oneSegmentLengths population.
      // If the *next* character (currentChar) is '1', it means the *current* run (currentRunLength)
      // was of '0's. So, its length is pushed to oneSegmentLengths.
      if (currentChar === "1") {
        oneSegmentLengths.push(currentRunLength);
      } else { // If the *next* character (currentChar) is '0', the *current* run (currentRunLength) was of '1's.
        zeroSegmentLengths.push(currentRunLength);
      }
      currentRunLength = 1; // Reset run length for the new segment
    } else {
      currentRunLength++; // Continue current run
    }
    previousChar = currentChar; // Update previous character for next iteration
  }

  // Early exit condition: If maxFlips is greater than or equal to the count of specific '1' segments
  // (as determined by zeroSegmentLengths.length), the entire string can be made '1's.
  // This relies on the specific (and potentially buggy) population of zeroSegmentLengths.
  if (maxFlips >= zeroSegmentLengths.length) {
    console.log(totalLength);
    return;
  }

  // Determine the initial window size for the sliding window operation.
  // The logic depends on whether the sequence starts with '1' or '0'.
  const initialWindowSize = characterSequence[0] === "1" ? maxFlips * 2 + 1 : maxFlips * 2 + 2;

  // Helper function to calculate the sum of array elements.
  const calculateSum = (elements) => elements.reduce((accumulator, element) => accumulator + element, 0);

  // Initialize the sliding window with the first 'initialWindowSize' segments.
  const currentWindowSegments = segmentLengths.slice(0, initialWindowSize);
  let currentWindowSum = calculateSum(currentWindowSegments);

  const windowSums = [currentWindowSum]; // Store the sum of the initial window
  const totalSegmentsCount = segmentLengths.length;

  // Perform the sliding window operation to find the maximum sum of segments.
  // This uses an optimized approach by updating the sum incrementally,
  // rather than re-calculating the sum of the entire window each time.
  for (let segmentIndex = initialWindowSize; segmentIndex < totalSegmentsCount; segmentIndex++) {
    // Subtract the segment leaving the window from the current sum.
    currentWindowSum -= segmentLengths[segmentIndex - initialWindowSize];
    // Add the new segment entering the window to the current sum.
    currentWindowSum += segmentLengths[segmentIndex];
    windowSums.push(currentWindowSum); // Store the sum of the new window
  }

  // Find and print the maximum sum found among all window sums.
  console.log(windowSums.reduce((accumulator, currentNum) => accumulator > currentNum ? accumulator : currentNum, 0));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
