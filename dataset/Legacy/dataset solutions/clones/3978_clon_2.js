console.log((inputString => {
  // Process the raw input string: trim, split by lines, then split each line by spaces,
  // and convert all resulting string values to integers using the bitwise OR operator.
  // The first element of the first line is 'numItems', and the rest are 'tempData'.
  const [[numItems], ...tempData] = inputString.trim().split('\n').map(rowStr => rowStr.split(' ').map(valStr => valStr | 0));

  // Initialize two arrays to hold the red and blue coordinate pairs.
  // Each coordinate pair is represented as an array, e.g., [x, y].
  const redPoints = [];
  const bluePoints = [];

  // Populate the 'redPoints' and 'bluePoints' arrays.
  // The first 'numItems' entries in 'tempData' are for red points,
  // and the subsequent 'numItems' entries are for blue points.
  for (let pointIndex = 0x0; pointIndex < numItems; pointIndex++) {
    redPoints.push(tempData[pointIndex]);
    bluePoints.push(tempData[numItems + pointIndex]);
  }

  // Sort both arrays in descending order based on their X-coordinate.
  // This sorting strategy is crucial for the matching algorithm's efficiency and correctness.
  redPoints.sort(([coordA_x], [coordB_x]) => coordB_x - coordA_x);
  bluePoints.sort(([coordA_x], [coordB_x]) => coordB_x - coordA_x);

  let matchCount = 0x0; // Initialize a counter for the number of successful matches.

  // Iterate through each blue point to find a suitable red point match.
  for (let currentBlueIndex = 0x0; currentBlueIndex < numItems; currentBlueIndex++) {
    const [blueX, blueY] = bluePoints[currentBlueIndex]; // Extract coordinates of the current blue point.

    // 'bestMatch' stores the index of the matched red point and the Y-coordinate of the blue point.
    // It's initialized to [-1, -1] to indicate no match found yet.
    let bestMatch = [-1, -1];

    // Iterate through the 'redPoints' array to find a match for the current blue point.
    for (let currentRedIndex = 0x0; currentRedIndex < redPoints.length; currentRedIndex++) {
      let [redX, redY] = redPoints[currentRedIndex]; // Extract coordinates of the current red point.

      // Condition 1: The red point's X-coordinate must be strictly less than the blue point's X-coordinate.
      if (blueX < redX) {
        continue; // If this condition is not met, this red point is not a candidate.
      }

      // Condition 2: The red point's Y-coordinate must be strictly less than the blue point's Y-coordinate.
      // Additionally, the current blue point's Y-coordinate must be greater than the Y-value
      // stored in 'bestMatch[1]'. This ensures 'bestMatch' is updated only for the first valid red point
      // encountered in the sorted 'redPoints' array.
      if (blueY > redY && blueY > bestMatch[1]) {
        bestMatch = [currentRedIndex, blueY]; // Update 'bestMatch' with the red point's index and the blue point's Y.
      }
    }

    // If 'bestMatch[1]' is non-negative, it means a valid red point was found for the current blue point.
    if (bestMatch[1] >= 0) {
      // Remove the matched red point from the array to prevent it from being matched again.
      redPoints.splice(bestMatch[0], 1);
      matchCount++; // Increment the total count of successful matches.
    }
  }

  // Return the final count of matches as a string.
  return `${matchCount}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
