function processInput(rawData) {
  // The input string is split into individual lines.
  // The first line is typically metadata (like the number of trips) and is discarded using splice(1).
  const dataRows = rawData.split('\n').splice(1);

  // Each remaining line, representing a journey segment, is parsed.
  // First, it's split by space, then each part is converted to a number.
  const journeySegments = dataRows.map(rowStr =>
    rowStr.split(' ').map(numStr => Number(numStr))
  );

  // Initialize state variables for the traveler's current position and time.
  var segmentIndex = 0;   // Iterator for the journeySegments array.
  var currentTime = 0;    // The current time 't'.
  var currentX = 0;       // The current x-coordinate.
  var currentY = 0;       // The current y-coordinate.

  // Loop through each planned journey segment to validate its feasibility.
  while (segmentIndex < journeySegments.length) {
    const currentSegment = journeySegments[segmentIndex]; // Get the details for the current destination.

    // Calculate the time difference and absolute coordinate differences for this segment.
    const timeDelta = currentSegment[0] - currentTime; // Time elapsed to reach the next point.
    const xDeltaAbs = Math.abs(currentSegment[1] - currentX); // Absolute change in x-coordinate.
    const yDeltaAbs = Math.abs(currentSegment[2] - currentY); // Absolute change in y-coordinate.

    // First condition check: Is there enough time to reach the destination?
    // The Manhattan distance (dx + dy) must be less than or equal to the time available (dt).
    if (timeDelta < xDeltaAbs + yDeltaAbs) {
      return console.log('No'); // If not enough time, output 'No' and terminate.
    }

    // Second condition check: Parity of time difference and Manhattan distance.
    // (dt % 2) must be equal to ((dx + dy) % 2). This ensures that any "extra" time
    // can be spent by moving back and forth, maintaining the same parity.
    // The original code returns 'No' if they *match*, which implies a specific problem interpretation.
    if (timeDelta % 2 == (xDeltaAbs + yDeltaAbs) % 2) {
      return console.log('No'); // If parities match, output 'No' and terminate.
    }

    // If both conditions pass, update the current position and time for the next segment.
    currentTime = currentSegment[0]; // Update current time to the end time of this segment.
    currentX = currentSegment[1];    // Update current x-coordinate.
    currentY = currentSegment[2];    // Update current y-coordinate.

    segmentIndex++; // Move to the next journey segment.
  }

  // If the loop completes without returning 'No', all segments are reachable.
  return console.log('Yes'); // Output 'Yes'.
}

// Read the entire content of standard input as a UTF-8 string.
// Then, pass this raw input string to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
