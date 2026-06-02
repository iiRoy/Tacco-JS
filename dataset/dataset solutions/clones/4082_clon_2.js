function processInput(rawData) {
  // Split the input string into individual lines, skipping the first line.
  const dataRows = rawData.split('\n').splice(1);

  // Parse each line into an array of numbers, representing journey segments.
  const journeySegments = dataRows.map(rowStr =>
    rowStr.split(' ').map(numStr => Number(numStr))
  );

  // Initialize variables for the current state: segment index, time, and coordinates.
  let segmentIndex = 0;
  let currentTime = 0;
  let currentX = 0;
  let currentY = 0;

  // Iterate through each defined journey segment.
  while (segmentIndex < journeySegments.length) {
    const currentSegment = journeySegments[segmentIndex];

    // Calculate the time elapsed for this segment.
    const timeDiff = currentSegment[0] - currentTime;

    // Determine the absolute change in X and Y coordinates from the origin (0,0).
    // Note: currentX and currentY are not updated within the loop,
    // so these differences are always relative to the initial (0,0) position.
    const xDiffAbs = Math.abs(currentSegment[1] - currentX);
    const yDiffAbs = Math.abs(currentSegment[2] - currentY);

    // Check if the available time is insufficient to cover the Manhattan distance.
    if (timeDiff < xDiffAbs + yDiffAbs) {
      return console.log('No');
    }

    // Evaluate a specific parity condition.
    // This checks if (timeDiff % 2) is equal to (xDiffAbs + yDiffAbs).
    // The outer modulo 2 then converts the boolean result (true=1, false=0) to 1 or 0.
    // If the condition (timeDiff % 2 == (xDiffAbs + yDiffAbs)) is true, this entire expression evaluates to 1 (true).
    // If it's false, the expression evaluates to 0 (false).
    if ((timeDiff % 2 == (xDiffAbs + yDiffAbs)) % 2) {
      return console.log('No');
    }

    // Update the current time to the end time of the processed segment.
    // Important: currentX and currentY are intentionally not updated here,
    // maintaining their initial value of 0 for subsequent calculations.
    currentTime = currentSegment[0];

    // Advance to the next segment.
    segmentIndex++;
  }

  // If all segments are traversable according to the rules, output 'Yes'.
  return console.log('Yes');
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
