function ProcessInput(rawData) {
  'use strict';

  // Split the entire input string into individual lines
  const linesData = rawData.split("\n");

  // Parse the first line to get the number of points
  const pointCount = parseInt(linesData.shift());

  // Initialize arrays to store difference vectors and their reverses
  const diffVectors = [];
  const revDiffVectors = [];

  // Process each line to split coordinates
  for (let idx = 0; idx < pointCount; idx++) {
    linesData[idx] = linesData[idx].split(" ");
  }

  // Calculate all unique difference vectors between pairs of points
  for (let outerIdx = 0; outerIdx < pointCount - 1; outerIdx++) {
    for (let innerIdx = outerIdx + 1; innerIdx < pointCount; innerIdx++) {
      // Store the vector from point 'outerIdx' to 'innerIdx'
      diffVectors.push([
        linesData[outerIdx][0] - linesData[innerIdx][0],
        linesData[outerIdx][1] - linesData[innerIdx][1]
      ]);
      // Store the vector from point 'innerIdx' to 'outerIdx' (reversed)
      revDiffVectors.push([
        linesData[innerIdx][0] - linesData[outerIdx][0],
        linesData[innerIdx][1] - linesData[outerIdx][1]
      ]);
    }
  }

  // Sort both arrays to group identical vectors
  diffVectors.sort();
  revDiffVectors.sort();

  // Variables to track current and maximum consecutive identical vectors
  let currentCount = 1;
  let maxCount = 0;

  // Iterate through the sorted difference vectors to find the longest sequence
  for (let vecIdx = 0; vecIdx < diffVectors.length - 1; vecIdx++) {
    // Check if the current vector is identical to the next one, or its reverse
    if (JSON.stringify(diffVectors[vecIdx]) === JSON.stringify(diffVectors[vecIdx + 1]) ||
        JSON.stringify(diffVectors[vecIdx]) === JSON.stringify(revDiffVectors[vecIdx + 1])) {
      currentCount++; // Increment count if a match is found
    } else {
      // If no match, update maxCount if currentCount is greater
      if (maxCount < currentCount) {
        maxCount = currentCount;
      }
      currentCount = 1; // Reset currentCount for the next sequence
    }
  }

  // Output the result: total points minus the maximum count of collinear points
  console.log(pointCount - maxCount);
}

// This part handles reading input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
