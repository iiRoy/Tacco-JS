function ProcessInputData(rawInputString) {
  "use strict"; // Enforce strict mode for cleaner code

  // Split the entire input string into individual lines
  const inputLines = rawInputString.split("\n");

  // Parse the first line to get N and K values
  const firstLineParts = inputLines[0].split(" ");
  const totalElements = parseInt(firstLineParts[0], 10); // N: total length of the sequence
  const maxFlipsAllowed = parseInt(firstLineParts[1], 10); // K: maximum number of '0' segments to flip

  // Convert the second line into an array of characters
  const charArray = inputLines[1].split("");

  // Determine the total length of the character sequence
  const charArrayLength = charArray.length;

  // Arrays to store lengths of consecutive segments of identical characters
  const segmentLengthsArray = []; // Stores lengths of all segments (e.g., [3, 2, 1, 4] for "0001101111")
  const zeroSegmentLengths = []; // Stores lengths of '0' segments
  const oneSegmentLengths = []; // Stores lengths of '1' segments

  let currentSegmentLength = 1; // Counter for the current segment's length
  let previousCharacter = charArray[0]; // Initialize with the first character

  // Iterate through the character array starting from the second character
  for (let loopIndex = 1; loopIndex < charArrayLength; ++loopIndex) {
    const currentCharacter = charArray[loopIndex]; // Get the current character

    // Check if the current character is different from the previous one
    if (currentCharacter !== previousCharacter) {
      // If different, the previous segment has ended. Store its length.
      segmentLengthsArray.push(currentSegmentLength);
      // Categorize the segment based on the previous character
      if (previousCharacter === "1") {
        oneSegmentLengths.push(currentSegmentLength);
      } else {
        zeroSegmentLengths.push(currentSegmentLength);
      }
      currentSegmentLength = 1; // Reset counter for the new segment
    } else {
      // If same, continue the current segment
      currentSegmentLength++;
    }
    previousCharacter = currentCharacter; // Update previous character for the next iteration
  }
  // Add the last segment's length after the loop finishes
  segmentLengthsArray.push(currentSegmentLength);
  if (previousCharacter === "1") {
    oneSegmentLengths.push(currentSegmentLength);
  } else {
    zeroSegmentLengths.push(currentSegmentLength);
  }


  // If K is greater than or equal to the number of '0' segments,
  // we can flip all '0's, making the entire sequence '1's.
  // In this case, the maximum length is simply N.
  if (maxFlipsAllowed >= zeroSegmentLengths.length) {
    console.log(totalElements);
    return; // Exit the function
  }

  // Determine the size of the sliding window based on the starting character and K
  // If starts with '1', we need to consider K '0' segments and K+1 '1' segments.
  // If starts with '0', we need to consider K '0' segments and K '1' segments, plus the initial '0' segment.
  const slidingWindowSize = charArray[0] === "1" ? maxFlipsAllowed * 2 + 1 : maxFlipsAllowed * 2 + 2;

  // Initialize the sliding window with the first 'slidingWindowSize' segments
  const currentSlidingWindow = segmentLengthsArray.slice(0, slidingWindowSize);

  // Helper function to calculate the sum of elements in an array
  const calculateArraySum = (inputArray) => inputArray.reduce((accumulatorValue, currentElement) => accumulatorValue + currentElement, 0);

  // Array to store the sum of lengths for each sliding window position
  const allWindowSums = [calculateArraySum(currentSlidingWindow)];

  const totalSegments = segmentLengthsArray.length; // Total number of segments

  // Slide the window across the segment lengths array
  for (let loopIndex = slidingWindowSize; loopIndex < totalSegments; ++loopIndex) {
    currentSlidingWindow.shift(); // Remove the oldest segment from the window
    currentSlidingWindow.push(segmentLengthsArray[loopIndex]); // Add the new segment to the window
    allWindowSums.push(calculateArraySum(currentSlidingWindow)); // Calculate and store the sum of the new window
  }

  // Find the maximum sum among all calculated window sums and print it
  console.log('%s', allWindowSums.reduce((accumulatorValue, currentWindowSum) => accumulatorValue > currentWindowSum ? accumulatorValue : currentWindowSum, 0));
}

// Read input from standard input and pass it to the main processing function
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
