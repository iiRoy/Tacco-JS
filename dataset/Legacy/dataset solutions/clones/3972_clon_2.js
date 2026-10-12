// This script processes coordinate data to find matching pairs based on specific criteria.
console.log((inputData => {
  // The input string is first cleaned, then split into lines.
  // Each line is further split into space-separated values, which are converted to integers.
  // The first line provides the total number of points (N), stored in 'pointCount'.
  // The remaining lines contain the coordinates for all points, stored in 'allCoords'.
  const [[pointCount], ...allCoords] = inputData
    .trim()
    .split('\n')
    .map(lineStr => lineStr.split(' ').map(coordVal => coordVal | 0));

  // The 'allCoords' array is divided into two distinct sets: red points and blue points.
  // The first 'pointCount' elements are designated as red points.
  const redPoints = allCoords.slice(0, pointCount);
  // The subsequent 'pointCount' elements are designated as blue points.
  // Using a bit shift (<< 1) is an alternative way to express multiplication by 2.
  const bluePoints = allCoords.slice(pointCount, pointCount << 1);

  // Blue points are sorted in ascending order based on their x-coordinate (the first element of each point array).
  bluePoints.sort((firstPoint, secondPoint) => firstPoint[0] - secondPoint[0]);

  // A variable to keep track of the number of successful matches found.
  let matchedPairs = 0;

  // The main loop iterates through the blue points.
  // The loop condition 'pointCount - matchedPairs' dynamically adjusts the upper bound
  // as points are removed from the arrays, ensuring we only process remaining points.
  for (let blueIdx = 0; blueIdx < pointCount - matchedPairs; blueIdx++) {
    let maxYCoord = ~0; // Initialize max y-coordinate found for a suitable red point to -1 (using bitwise NOT 0).
    let maxRedIdx = -1; // Initialize the index of the best red point found.

    // The inner loop searches through the available red points for a match.
    for (let redIdx = 0; redIdx < pointCount - matchedPairs; redIdx++) {
      // This condition checks if the current blue point (bluePoints[blueIdx]) CANNOT cover the current red point (redPoints[redIdx]).
      // A blue point (bx, by) can cover a red point (rx, ry) if bx > rx and by > ry.
      // So, if bx < rx AND by < ry, the red point is "above and to the right" of the blue point, and thus cannot be covered.
      if (bluePoints[blueIdx][0] < redPoints[redIdx][0] && bluePoints[blueIdx][1] < redPoints[redIdx][1]) {
        continue; // Skip this red point as it's not suitable.
      }

      // If the red point is suitable (i.e., it can be covered by the blue point),
      // we check if its y-coordinate is greater than the maximum y-coordinate found so far among suitable red points.
      if (maxYCoord < redPoints[redIdx][1]) {
        maxYCoord = redPoints[redIdx][1]; // Update the maximum y-coordinate.
        maxRedIdx = redIdx; // Store the index of this red point as the best candidate.
      }
    }

    // After checking all red points for the current blue point, if a suitable red point was found:
    if (maxRedIdx >= 0) {
      // Remove the current blue point from its array.
      // The 'blueIdx--' is crucial: it decrements the loop counter so that in the next iteration,
      // after the 'for' loop's 'blueIdx++' executes, the loop variable points to the element
      // that has shifted into the current position, ensuring no elements are skipped.
      bluePoints.splice(blueIdx--, 1);
      // Remove the matched red point from its array.
      redPoints.splice(maxRedIdx, 1);
      // Increment the total count of matched pairs.
      matchedPairs++;
    }
  }

  // The final count of matched pairs is returned as a string.
  return `${matchedPairs}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // The script reads its input from standard input.
