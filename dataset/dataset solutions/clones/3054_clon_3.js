function analyzeBinarySequence(binaryStringData) {
  // Store the original total length of the input sequence for final calculations.
  let initialTotalLength = binaryStringData.length;
  // This array will temporarily hold the character representation of digits from the current segment.
  let segmentCharacters;
  // This variable tracks the digit (0 or 1) that is expected at the current position
  // if the target alternating pattern starts with 0 (e.g., 01010...).
  let expectedDigitForPattern0 = 0;
  // This counter accumulates the number of digits that match the 0101... pattern.
  // This count implicitly represents the flips needed for the 1010... pattern.
  let flipsRequiredForPattern1 = 0;
  // A boolean flag to manage the termination of the chunk processing loop.
  let isProcessingFinished = false;
  // An array to store the numerical values of the digits within the current segment.
  let numericSegmentValues;
  // Defines the fixed size for each chunk of the input string to be processed.
  const processingChunkSize = 10;
  // Variable to hold the actual length of the segment currently being processed (can be less than chunkSize for the last segment).
  let currentSegmentLength;

  // The primary loop iterates, processing the input string in fixed-size chunks
  // until the entire string has been consumed.
  while (!isProcessingFinished) {
    // Extract a portion of the binary string as the current chunk.
    // Using .slice() for string extraction.
    segmentCharacters = binaryStringData.slice(0, processingChunkSize).split("");
    // Determine the exact number of digits in this segment.
    currentSegmentLength = segmentCharacters.length;
    
    // Convert each character digit in the segment into its numerical equivalent.
    // Array.from with Number constructor provides an efficient conversion.
    numericSegmentValues = Array.from(segmentCharacters, Number);

    // Iterate through each numeric digit in the current segment.
    for (let digitIndex = 0; digitIndex < currentSegmentLength; digitIndex++) {
      // Compare the current digit with the expected digit for the 0101... alternating pattern.
      if (numericSegmentValues[digitIndex] === expectedDigitForPattern0) {
        // If they match, it means this digit contributes to the count of elements
        // that *do not* need to be flipped if the target is 0101...,
        // and *do* need to be flipped if the target is 1010....
        flipsRequiredForPattern1++;
      }
      // Alternate the expected digit for the next position (0 becomes 1, 1 becomes 0).
      expectedDigitForPattern0 = (expectedDigitForPattern0 + 1) % 2;
    }

    // After processing the current chunk, check if there's more of the original string left.
    if (binaryStringData.length > processingChunkSize) {
      // If so, remove the processed chunk from the `binaryStringData` for the next iteration.
      // Using .substring() here to demonstrate an alternative to .slice().
      binaryStringData = binaryStringData.substring(processingChunkSize);
    } else {
      // If no more characters remain in the input string, signal the loop to terminate.
      isProcessingFinished = true;
    }
  }

  // Calculate the number of flips required if the target alternating pattern starts with 0 (0101...).
  // This is derived by subtracting the count of matches for the 0101... pattern (which is `flipsRequiredForPattern1`)
  // from the total length of the sequence.
  let flipsRequiredForPattern0 = initialTotalLength - flipsRequiredForPattern1;

  // The final answer is the minimum number of flips between the two possible alternating patterns.
  // `flipsRequiredForPattern0` represents the flips for a 0101... pattern.
  // `flipsRequiredForPattern1` represents the flips for a 1010... pattern.
  const minimalFlipCount = Math.min(flipsRequiredForPattern0, flipsRequiredForPattern1);
    
  // Output the calculated minimum flip count to the console.
  console.log(minimalFlipCount);
}

// Read the content from standard input synchronously.
// Ensure the content is interpreted as a UTF-8 string.
const rawFileContent = require("fs").readFileSync("/dev/stdin", "utf8");
// Call the main analysis function, trimming any leading/trailing whitespace (like newlines)
// from the input to ensure accurate processing of binary digits.
analyzeBinarySequence(rawFileContent.trim());