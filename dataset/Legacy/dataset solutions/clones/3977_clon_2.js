console.log((inputData => {
  // This section parses the raw input string.
  // It first trims whitespace, then splits by newlines.
  // Each line is further split by spaces, and values are converted to integers.
  // The first element of the first line is extracted as 'pointCount',
  // and the rest of the lines are stored in 'parsedLines'.
  const [[pointCount], ...parsedLines] = inputData
    .trim()
    .split('\n')
    .map(lineStr => lineStr.split(' ').map(coordStr => coordStr | 0));

  // Initialize two arrays to hold the coordinates of red and blue points.
  const redPoints = [];
  const bluePoints = [];

  // Populate the 'redPoints' and 'bluePoints' arrays.
  // The first 'pointCount' lines in 'parsedLines' are for red points,
  // and the next 'pointCount' lines are for blue points.
  for (let idx = 0; idx < pointCount; idx++) {
    redPoints.push(parsedLines[idx]);
    bluePoints.push(parsedLines[pointCount + idx]);
  }

  // Sort the 'bluePoints' array based on their X-coordinates in ascending order.
  // This is a crucial step for the greedy matching algorithm.
  bluePoints.sort(([firstCoordA], [firstCoordB]) => firstCoordA - firstCoordB);

  let matchedPairs = 0; // This variable will count the number of successful matches.
  const unusedPlaceholder = []; // This array is declared but not used in the logic.

  // Iterate through each blue point, attempting to find a suitable red point.
  for (let idx = 0; idx < pointCount; idx++) {
    const [currentBlueX, currentBlueY] = bluePoints[idx];
    // 'bestRedCandidate' stores the index and Y-coordinate of the best red point found so far
    // for the current blue point. Initialized to [-1, -1] to indicate no match yet.
    let bestRedCandidate = [-1, -1];

    // Search through the available red points.
    for (let redIdx = 0; redIdx < redPoints.length; redIdx++) {
      const [currentRedX, currentRedY] = redPoints[redIdx];

      // Check the conditions for a valid match:
      // 1. The red point's X-coordinate must be less than the blue point's X-coordinate.
      if (currentBlueX < currentRedX) {
        continue; // This red point is not suitable, move to the next.
      }
      // 2. The red point's Y-coordinate must be less than the blue point's Y-coordinate.
      // 3. Among suitable red points, we want the one with the largest Y-coordinate.
      if (currentBlueY > currentRedY && currentRedY > bestRedCandidate[1]) {
        bestRedCandidate = [redIdx, currentRedY]; // Update the best candidate.
      }
    }

    // If a valid red point was found (indicated by a Y-coordinate >= 0).
    if (bestRedCandidate[1] >= 0) {
      // Remove the matched red point from the array to prevent it from being reused.
      redPoints.splice(bestRedCandidate[0], 1);
      matchedPairs++; // Increment the count of successful matches.
    }
  }

  // The final result is the total number of matched pairs, converted to a string.
  return `${matchedPairs}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
