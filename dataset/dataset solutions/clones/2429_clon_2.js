'use strict';

/*
 * This module processes input data to calculate a specific geometric sum.
 * It reads coordinates, computes pairwise distances, and then outputs a derived value.
 */
const processInput = (dataLines) => {
  // Determine the total number of points from the first line of input.
  const pointCount = parseInt(dataLines[0], 10);

  // Initialize arrays to store the X and Y coordinates of each point.
  let xCoordinates = new Array(pointCount);
  let yCoordinates = new Array(pointCount);

  // Loop through the input lines to parse and store the coordinates.
  for (let idx = 0; idx < pointCount; idx++) {
    // Each subsequent line contains the X and Y coordinates, separated by a space.
    let currentPointCoords = dataLines[idx + 1].split(' ').map(coordinateString => parseInt(coordinateString, 10));
    xCoordinates[idx] = currentPointCoords[0]; // Store the X coordinate.
    yCoordinates[idx] = currentPointCoords[1]; // Store the Y coordinate.
  }

  // Debugging: Can uncomment to see parsed data.
  // console.log("Number of points:", pointCount, "X coords:", xCoordinates, "Y coords:", yCoordinates);

  // Initialize a variable to accumulate the sum of all pairwise distances.
  let totalPathLength = 0.0;

  // Calculate the Euclidean distance between every unique pair of points.
  // The outer loop iterates from the first point up to the second-to-last point.
  for (let firstPointIndex = 0; firstPointIndex < pointCount - 1; firstPointIndex++) {
    // The inner loop iterates from the current outer loop index to the last point.
    // This ensures each pair is considered exactly once (e.g., (P1, P2) but not (P2, P1)).
    for (let secondPointIndex = firstPointIndex; secondPointIndex < pointCount; secondPointIndex++) {
      // Calculate the difference in X coordinates.
      let deltaX = xCoordinates[firstPointIndex] - xCoordinates[secondPointIndex];
      // Calculate the difference in Y coordinates.
      let deltaY = yCoordinates[firstPointIndex] - yCoordinates[secondPointIndex];

      // Apply the distance formula: sqrt((deltaX)^2 + (deltaY)^2).
      totalPathLength += Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    }
  }

  // Debugging: Can uncomment to see the accumulated distance sum.
  // console.log("Accumulated distance sum:", totalPathLength);

  // Output the final calculated value, which is twice the average distance per point.
  console.log(totalPathLength / pointCount * 2);
};

// Read input from standard input, decode as UTF-8, and split into lines.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
