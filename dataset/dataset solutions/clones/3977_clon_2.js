/* This module processes an input stream to determine the maximum number of compatible coordinate pairings. */
console.log((inputContent => {
  // First, parse the entire input string.
  // Each line is split into space-separated values, then converted to integers.
  const parsedEntries = inputContent
    .trim()
    .split(/\r?\n/)
    .map(currentLine => currentLine.split(' ').map(stringVal => parseInt(stringVal, 10)));

  // The very first number in the input specifies the total quantity of pairs.
  const totalQuantity = parsedEntries[0][0];
  // Subsequent lines contain the actual coordinate points.
  const coordinateData = parsedEntries.slice(1);

  const primarySet = []; // Array to store coordinates of the 'red' points.
  const secondarySet = []; // Array to store coordinates of the 'blue' points.

  // Populate the two sets from the parsed coordinate data.
  for (let entryIndex = 0; entryIndex < totalQuantity; ++entryIndex) {
    primarySet.push(coordinateData[entryIndex]);
    secondarySet.push(coordinateData[totalQuantity + entryIndex]);
  }

  // Sort the 'blue' points (secondarySet) based on their X-coordinate in ascending order.
  secondarySet.sort((pointOne, pointTwo) => pointOne[0] - pointTwo[0]);

  let matchedPairsCount = 0; // Initialize a counter for successful pairings.
  const temporaryBuffer = []; // An auxiliary variable, presently not utilized in the core logic.

  // Iterate through each 'blue' point to find a matching 'red' point.
  for (let bluePointIndex = 0; bluePointIndex < totalQuantity; ++bluePointIndex) {
    const [blueXCoord, blueYCoord] = secondarySet[bluePointIndex]; // Get current blue point's coordinates.

    let optimalRedCandidate = [-1, -1]; // Stores [index_in_primarySet, y_coordinate] of the best red match.

    // Search through the available 'red' points for a suitable partner.
    for (let redPointScanIndex = 0; redPointScanIndex < primarySet.length; ++redPointScanIndex) {
      const [redXCoord, redYCoord] = primarySet[redPointScanIndex]; // Get current red point's coordinates.

      // A red point (rx, ry) can be paired with a blue point (bx, by) if rx < bx and ry < by.
      // We seek the red point with the largest Y-coordinate that satisfies these conditions.
      if (blueXCoord < redXCoord) {
        // If the blue point's X is less than the red point's X, this red point is not a valid candidate.
        continue;
      }
      if (blueYCoord > redYCoord && redYCoord > optimalRedCandidate[1]) {
        // If the Y-coordinate condition is met, and this red point's Y is superior to the current best.
        optimalRedCandidate = [redPointScanIndex, redYCoord]; // Update the best matching red point found so far.
      }
    }

    // If an optimal red point was found for the current blue point (indicated by a non-sentinel Y-coordinate).
    if (optimalRedCandidate[1] >= 0) {
      primarySet.splice(optimalRedCandidate[0], 1); // Remove the matched red point from the pool.
      matchedPairsCount++; // Increment the total count of successful pairings.
    }
  }

  // Return the final tally of matched pairs as a string.
  return String(matchedPairsCount);
})(require('node:fs').readFileSync('/dev/stdin', 'utf8')));