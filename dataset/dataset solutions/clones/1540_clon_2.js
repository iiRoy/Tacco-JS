/* This module handles the processing of coordinate data
 * to identify and measure specific distances.
 */
const analyzeInputData = (sourceText) => {
  // Break down the raw input into separate string lines.
  sourceText = sourceText.split("\n");

  // Extract the initial integer indicating the number of coordinate entries.
  const totalItemCount = Number(sourceText[0]);

  // A dynamic array to hold the parsed coordinate pairs.
  let coordinateSet = [];

  // Iterate through the input string array from the second element onward.
  for (let currentLineIndex = 1; currentLineIndex <= totalItemCount; currentLineIndex++) {
    // Convert each line string into an array of two numbers [x, y].
    const currentCoordinatePair = sourceText[currentLineIndex].split(" ").map(coordinateString => Number(coordinateString));

    // Only append the coordinate pair if it's not already present by reference.
    // Note: This comparison checks for object identity, not deep equality of contents.
    if (coordinateSet.indexOf(currentCoordinatePair) === -1) {
      coordinateSet.push(currentCoordinatePair);
    }
  }

  // Determine the current size of the coordinate data array.
  let datasetSize = coordinateSet.length;

  // Allocate arrays to store X and Y components separately.
  let xDimensionValues = [];
  let yDimensionValues = [];

  // Populate the X and Y component arrays from the coordinate pairs.
  for (let dataPointIndex = 0; dataPointIndex < datasetSize; dataPointIndex++) {
    xDimensionValues[dataPointIndex] = coordinateSet[dataPointIndex][0];
    yDimensionValues[dataPointIndex] = coordinateSet[dataPointIndex][1];
  }

  // Sort X values to find the highest and lowest.
  xDimensionValues.sort((firstVal, secondVal) => secondVal - firstVal);
  const highestXValue = xDimensionValues[0];
  const lowestXValue = xDimensionValues[datasetSize - 1];

  // Sort Y values to find the highest and lowest.
  yDimensionValues.sort((valA, valB) => valB - valA);
  const highestYValue = yDimensionValues[0];
  const lowestYValue = yDimensionValues[datasetSize - 1];

  // An array to collect indices of points that are on the extreme boundaries.
  const boundaryPointIndexes = [];

  // Loop through the coordinate set to identify boundary points.
  for (let pointIter = 0; pointIter < datasetSize; pointIter++) {
    // Check if the current point's X-coordinate matches an extreme X value.
    if (coordinateSet[pointIter][0] === highestXValue || coordinateSet[pointIter][0] === lowestXValue) {
      if (boundaryPointIndexes.indexOf(pointIter) === -1) {
        boundaryPointIndexes.push(pointIter);
      }
    }
    // Check if the current point's Y-coordinate matches an extreme Y value.
    if (coordinateSet[pointIter][1] === highestYValue || coordinateSet[pointIter][1] === lowestYValue) {
      if (boundaryPointIndexes.indexOf(pointIter) === -1) {
        boundaryPointIndexes.push(pointIter);
      }
    }
  }

  // Update the dataset size to reflect only the extreme points.
  datasetSize = boundaryPointIndexes.length;

  // Array to store the computed Manhattan distances.
  let calculatedDistances = [];

  // Compute Manhattan distances between all unique pairs of boundary points.
  for (let primaryIndex = 0; primaryIndex < datasetSize; primaryIndex++) {
    for (let secondaryIndex = primaryIndex + 1; secondaryIndex < datasetSize; secondaryIndex++) {
      const pointOne = coordinateSet[boundaryPointIndexes[primaryIndex]];
      const pointTwo = coordinateSet[boundaryPointIndexes[secondaryIndex]];
      const currentManhattanDistance = Math.abs(pointOne[0] - pointTwo[0]) + Math.abs(pointOne[1] - pointTwo[1]);
      calculatedDistances.push(currentManhattanDistance);
    }
  }

  // Arrange the distances in descending order.
  calculatedDistances.sort((d1, d2) => d2 - d1);

  // Print the largest calculated distance.
  console.log(calculatedDistances[0]);
};

// Execute the analysis function, providing input from the standard input stream.
analyzeInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));