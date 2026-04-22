'use strict'; // Ensure strict mode for better code quality

// This function processes raw input to calculate a specific geometric area based on segment lengths.
function ProcessGeometry (rawInputData) {

  const inputLines = rawInputData.split('\n'); // Split the entire input string into individual lines.
  const dimensionSegments = inputLines[1].split(' ').sort((a, b) => b - a).map(Number); // Get the second line, split by space, sort numerically in descending order, and convert to numbers.
  const foundLengths = []; // Array to store two specific lengths that form the sides of a rectangle.

  let calculatedArea = 0; // Initialize the variable to hold the final calculated area.
  let isPairDetected = false; // A boolean flag to track if a pair of identical segments has been found.

  // Loop through the sorted dimension segments to find suitable combinations.
  for (let segmentIndex = 0; segmentIndex < dimensionSegments.length; segmentIndex++) {

    const currentSegment = dimensionSegments[segmentIndex];
    const nextSegmentOne = dimensionSegments[segmentIndex + 1] || null; // Check for existence of next segments.
    const nextSegmentTwo = dimensionSegments[segmentIndex + 2] || null;
    const nextSegmentThree = dimensionSegments[segmentIndex + 3] || null;

    // First check: If four consecutive segments are identical (implying a square or a very specific condition).
    if (currentSegment === nextSegmentOne && currentSegment === nextSegmentTwo && currentSegment === nextSegmentThree) {
      calculatedArea = currentSegment * nextSegmentThree; // Calculate area using the first and fourth (which are identical).
      break; // Exit loop as the area is found.
    }

    // Second check: Look for pairs of identical segments.
    if (currentSegment === nextSegmentOne && !isPairDetected) {
      foundLengths.push(currentSegment); // Add the segment to our found lengths.
      isPairDetected = true; // Mark that a pair was just detected.
    } else {
      isPairDetected = false; // Reset the flag if no pair or if a pair was already handled.
    }

    // If two distinct pairs (or two identical segments) have been found.
    if (foundLengths.length === 2) {
      calculatedArea = foundLengths[0] * foundLengths[1]; // Multiply the two found lengths for the area.
      break; // Exit loop as the area is found.
    }
  }

  // Output the final calculated area to the console.
  console.log(calculatedArea);
}

// Read input from standard input and pass it to the processing function.
ProcessGeometry(require("fs").readFileSync("/dev/stdin", "utf8"));