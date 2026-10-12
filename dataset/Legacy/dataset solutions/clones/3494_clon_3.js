'use strict';

// Helper function to parse a single line of point data from the input
const parsePointLine = (lineString) => {
  const lineSegments = lineString.split(' ');
  // Using radix 10 for parseInt for explicit base conversion
  const xCoordinate = parseInt(lineSegments[0], 10);
  const yCoordinate = parseInt(lineSegments[1], 10);
  const heightValue = parseInt(lineSegments[2], 10);
  return { x: xCoordinate, y: yCoordinate, h: heightValue };
};

// Helper function to compute the expected height at a specific point (pointX, pointY)
// given a potential pyramid center (centerX, centerY) and its base height (centerBaseHeight)
const computeHeightAtPoint = (centerX, centerY, centerBaseHeight, pointX, pointY) => {
  const distanceX = Math.abs(centerX - pointX);
  const distanceY = Math.abs(centerY - pointY);
  return centerBaseHeight + distanceX + distanceY;
};

const solveProblem = (rawInputLines) => {
  // The first line of input contains the number of observation points
  const numberOfPoints = parseInt(rawInputLines[0], 10);

  // Initialize arrays to store the x, y coordinates and observed heights for each point
  const observationXCoords = new Array(numberOfPoints);
  const observationYCoords = new Array(numberOfPoints);
  const observationHeights = new Array(numberOfPoints);

  // Populate the observation arrays by parsing each subsequent line of input
  for (let pointIdx = 0; pointIdx < numberOfPoints; pointIdx++) {
    const pointData = parsePointLine(rawInputLines[pointIdx + 1]);
    observationXCoords[pointIdx] = pointData.x;
    observationYCoords[pointIdx] = pointData.y;
    observationHeights[pointIdx] = pointData.h;
  }

  // Iterate through all possible X coordinates for the pyramid's center (0 to 100)
  for (let candidateCenterX = 0; candidateCenterX <= 100; candidateCenterX++) {
    // Iterate through all possible Y coordinates for the pyramid's center (0 to 100)
    for (let candidateCenterY = 0; candidateCenterY <= 100; candidateCenterY++) {

      // Determine the potential base height of the pyramid at (candidateCenterX, candidateCenterY)
      // using the first observation point as a reference.
      const firstPointX = observationXCoords[0];
      const firstPointY = observationYCoords[0];
      const firstPointH = observationHeights[0];
      const potentialPyramidBaseHeight = firstPointH + Math.abs(candidateCenterX - firstPointX) + Math.abs(candidateCenterY - firstPointY);

      // Flag to track if the current candidate center and its base height are consistent with all points
      let isConsistentWithAllPoints = true;

      // Check consistency against all observation points
      for (let checkIdx = 0; checkIdx < numberOfPoints; checkIdx++) {
        const currentPointX = observationXCoords[checkIdx];
        const currentPointY = observationYCoords[checkIdx];
        const actualObservedHeight = observationHeights[checkIdx];

        // Calculate the height expected at the current observation point
        // if the pyramid center is (candidateCenterX, candidateCenterY) with potentialPyramidBaseHeight
        const calculatedHeight = computeHeightAtPoint(
          candidateCenterX,
          candidateCenterY,
          potentialPyramidBaseHeight,
          currentPointX,
          currentPointY
        );

        // If the calculated height does not match the actual observed height,
        // this candidate center is invalid.
        if (calculatedHeight !== actualObservedHeight) {
          isConsistentWithAllPoints = false;
          break; // No need to check further points for this candidate center
        }
      }

      // If the candidate center and its base height are consistent with all points,
      // we have found the solution.
      if (isConsistentWithAllPoints) {
        console.log(candidateCenterX, candidateCenterY, potentialPyramidBaseHeight);
        return; // Exit the function immediately after finding the solution
      }
    }
  }
};

// Read the input from standard input, split it by newlines, and pass to the solver function
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
