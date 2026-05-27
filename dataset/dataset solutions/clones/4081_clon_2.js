/**
 * Processes raw input data to determine if a series of travel segments is feasible.
 * This function analyzes time and coordinate differences for each segment.
 *
 * @param {string} rawData - The complete input string, typically from standard input.
 *                           It contains a header line followed by lines of travel segment details.
 */
function processTravelData(rawData) {
  // Split the input string into individual lines and discard the first line (header).
  const inputLines = rawData.split('\n').slice(1);

  // Map each remaining line to an array of numbers representing a journey segment.
  // Each segment has [time, x-coordinate, y-coordinate].
  const journeySegments = inputLines.map(currentLine =>
    currentLine.split(' ').map(numericValue => parseInt(numericValue, 10))
  );

  // A flag to indicate if travel is possible (declared but not used in the final logic due to loop condition).
  let isFeasible = true;

  // Initialize current time and coordinates to the starting point (0,0,0).
  let segmentIndex = 0; // Iterator for the current journey segment.
  let currentTime = 0;  // Accumulated time.
  let currentX = 0;     // Accumulated X coordinate.
  let currentY = 0;     // Accumulated Y coordinate.

  // Loop through each planned journey segment.
  // Note: The original code's loop condition `i < trips` (here `segmentIndex < journeySegments`)
  // compares a number to an array, which results in `false` (e.g., `0 < [object Array]` -> `0 < NaN` -> `false`).
  // Therefore, this loop will not execute, and the function will always proceed to print 'Yes'.
  while (segmentIndex < journeySegments) {
    // Retrieve the details for the current segment.
    const segmentDetails = journeySegments[segmentIndex];

    // Calculate the time difference required for this segment.
    const timeDelta = segmentDetails[0] - currentTime;
    // Calculate the X-coordinate difference for this segment.
    const xDelta = segmentDetails[1] - currentX;
    // Calculate the Y-coordinate difference for this segment.
    const yDelta = segmentDetails[2] - currentY;

    // Check if the time available is less than the Manhattan distance required.
    // If so, it's impossible to reach the destination.
    if (timeDelta < xDelta + yDelta) {
      return console.log('No'); // Output 'No' and terminate execution.
    }

    // Check the parity condition: (time_delta - manhattan_distance) must be even.
    // If it's odd, it's impossible to reach the destination.
    if ((timeDelta - (xDelta + yDelta)) % 2 === 1) {
      console.log('No'); // Output 'No'.
      // Note: The original code does NOT include a 'return' statement here,
      // meaning execution would continue to the next iteration or the final 'Yes'.
      // This behavior is preserved.
    }

    // Increment the segment index to move to the next segment.
    segmentIndex++;
  }

  // If the loop completes (or never runs, as in this case), all segments are considered traversable.
  return console.log('Yes'); // Output 'Yes'.
}

// Read input from standard input and pass it to the main processing function.
processTravelData(require('fs').readFileSync('/dev/stdin', 'utf8'));
