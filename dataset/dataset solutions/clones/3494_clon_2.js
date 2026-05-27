'use strict';

// This function processes the input data to find a specific coordinate and height.
const processInput = (dataLines) => {
  // Determine the total number of data points from the first line.
  const countOfPoints = parseInt(dataLines[0], 10);

  // Initialize arrays to store X, Y coordinates, and heights for each point.
  let xCoordinates = new Array(countOfPoints);
  let yCoordinates = new Array(countOfPoints);
  let heights = new Array(countOfPoints);

  // Populate the coordinate and height arrays by parsing subsequent input lines.
  for (let idx = 0; idx < countOfPoints; idx++) {
    // Split each line by space to get individual values.
    let lineParts = dataLines[idx + 1].split(' ');
    xCoordinates[idx] = parseInt(lineParts[0], 10);
    yCoordinates[idx] = parseInt(lineParts[1], 10);
    heights[idx] = parseInt(lineParts[2], 10);
  }

  // Iterate through all possible X coordinates (0 to 100).
  for (let currentX = 0; currentX <= 100; currentX++) {
    // Iterate through all possible Y coordinates (0 to 100).
    for (let currentY = 0; currentY <= 100; currentY++) {
      // Calculate the potential peak height based on the first data point.
      // This assumes the first point is valid and uses its data to derive a candidate height.
      let calculatedPeakHeight = heights[0] + Math.abs(currentX - xCoordinates[0]) + Math.abs(currentY - yCoordinates[0]);

      // A flag to check if this calculated peak height is consistent with all other data points.
      let allMatch = true;

      // Verify the calculated peak height against all other data points.
      for (let pointIndex = 1; pointIndex < countOfPoints; pointIndex++) {
        // If the calculated height doesn't match the height derived from the current point,
        // then this (currentX, currentY) is not the correct center.
        if (calculatedPeakHeight !== heights[pointIndex] + Math.abs(currentX - xCoordinates[pointIndex]) + Math.abs(currentY - yCoordinates[pointIndex])) {
          allMatch = false; // Mark as inconsistent.
          break;            // No need to check further points for this (currentX, currentY).
        }
      }

      // If all data points are consistent with the calculated peak height,
      // then we've found the solution.
      if (allMatch) {
        // Output the found coordinates and the peak height.
        console.log(currentX, currentY, calculatedPeakHeight);
        return 0; // Exit the function as the solution is found.
      }
    }
  }
};

// Read input from standard input, decode as UTF-8, and split into lines.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
