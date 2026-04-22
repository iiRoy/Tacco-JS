'use strict'; // Enforces stricter parsing and error handling in the code.

/**
 * @function ProcessGeometryData
 * @description Determines the maximum possible area of a rectangle that can be constructed
 *              from a given set of linear segment measurements.
 *              The logic prioritizes finding two pairs of identical segments (for a square)
 *              or two distinct pairs of segments (for a rectangle) from the largest available lengths.
 * @param {string} rawDataString - The complete input as a single string, typically read from stdin.
 *                                 Expected format: first line is a count (ignored), second line
 *                                 is space-separated integer segment lengths.
 */
function ProcessGeometryData(rawDataString) {
  // Split the raw input string into an array of lines.
  const documentLines = rawDataString.split('\n');

  // --- Input Validation and Preprocessing ---
  // Ensure there are at least two lines of input (one for count, one for actual data).
  if (documentLines.length < 2) {
    console.log(0); // If input is malformed or insufficient, no rectangle can be formed.
    return;
  }

  // Extract the segment lengths from the second line, convert them to numbers,
  // and sort them in descending order to easily find the largest available segments.
  const numericSegmentLengths = documentLines[1].split(' ').map(Number).sort((valA, valB) => valB - valA);

  // Further validation: check if the parsed segments array is empty or contains invalid numbers.
  if (numericSegmentLengths.length === 0 || numericSegmentLengths.some(isNaN)) {
    console.log(0); // If no valid numeric segments are present, the area is zero.
    return;
  }

  // --- Frequency Mapping for Efficient Lookup ---
  // Create a frequency map (Map object) to store the count of each unique segment length.
  // This optimizes the process of checking how many times a specific length appears.
  const segmentLengthFrequencies = new Map();
  for (const currentSegment of numericSegmentLengths) {
    segmentLengthFrequencies.set(currentSegment, (segmentLengthFrequencies.get(currentSegment) || 0) + 1);
  }

  // --- Core Logic: Identifying Rectangle Sides ---
  // This array will store the two chosen side lengths (width and height) of our rectangle.
  const identifiedRectangleSides = [];

  // Get all unique segment lengths and sort them in descending order.
  // This ensures we prioritize larger segments for maximum area.
  const distinctSortedLengths = Array.from(segmentLengthFrequencies.keys()).sort((lenA, lenB) => lenB - lenA);

  // Iterate through the unique lengths to find appropriate pairs for the rectangle's sides.
  for (const candidateLength of distinctSortedLengths) {
    // Retrieve the count of the current candidate length from the frequency map.
    const availableCount = segmentLengthFrequencies.get(candidateLength);

    // If we have 4 or more segments of this length, we can form a square (or rectangle)
    // using this length for both sides. This is the optimal case for maximizing area.
    if (availableCount >= 4) {
      identifiedRectangleSides.push(candidateLength);
      identifiedRectangleSides.push(candidateLength);
      break; // We've found our two sides; no need to check further.
    }
    // If we have at least 2 (but less than 4) segments of this length,
    // we can use it as one side of our potential rectangle.
    else if (availableCount >= 2) {
      identifiedRectangleSides.push(candidateLength);
    }

    // If two sides have already been identified, we can terminate the loop early.
    // This is an optimization to prevent unnecessary iterations.
    if (identifiedRectangleSides.length === 2) {
      break;
    }
  }

  // --- Final Area Calculation and Output ---
  // Check if exactly two suitable sides were found during the process.
  if (identifiedRectangleSides.length === 2) {
    // Calculate the product of the two sides to determine the rectangle's area.
    const finalCalculatedArea = identifiedRectangleSides[0] * identifiedRectangleSides[1];
    console.log(finalCalculatedArea);
  } else {
    // If fewer than two suitable sides were found, it means no rectangle can be formed.
    console.log(0);
  }
}

// --- Application Entry Point ---
// Reads data from standard input (e.g., from a pipe or file redirection)
// and passes it to the main processing function.
ProcessGeometryData(require("fs").readFileSync("/dev/stdin", "utf8"));