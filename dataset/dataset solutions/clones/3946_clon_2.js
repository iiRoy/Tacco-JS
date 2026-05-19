'use strict';

/**
 * Processes the input string to calculate modified travel distances.
 * @param {string} inputString - The raw input string from stdin.
 */
function processInput(inputString) {
  // Parse the input string: skip the first line, then split the second line by spaces
  // and convert each part to a number.
  const parsedCoordinates = inputString.split('\n')[1].split(' ').map(numStr => Number(numStr));

  // Create a list of coordinates, adding a starting point (0) and an ending point (0)
  // to represent the journey's start and end.
  const coordinateList = [0, ...parsedCoordinates, 0];

  // This array will store the differences between consecutive coordinates.
  const segmentDifferences = [];

  // This array will store the final calculated results for each skipped point.
  const resultArray = [];

  // Calculate the difference between each adjacent pair of coordinates.
  coordinateList.forEach((currentCoord, idx, coordArray) => {
    // Ensure we don't go out of bounds when accessing the next element.
    if (idx < coordArray.length - 1) {
      segmentDifferences.push(coordArray[idx + 1] - coordArray[idx]);
    }
  });

  // Calculate the total absolute difference of all segments.
  // This represents the initial total travel distance.
  const totalAbsoluteDifference = segmentDifferences
    .map(differenceValue => Math.abs(differenceValue))
    .reduce((accumulator, currentValue) => accumulator + currentValue);

  // Iterate through each intermediate point (excluding the artificial start and end points).
  for (let loopIndex = 1; loopIndex < coordinateList.length - 1; loopIndex++) {
    // Calculate the distance if the current point (coordinateList[loopIndex]) were skipped.
    // This is the direct distance from the previous point to the next point.
    const distanceIfSkipped = Math.abs(coordinateList[loopIndex - 1] - coordinateList[loopIndex + 1]);

    // Calculate the original distance covered by traversing through the current point.
    // This is the sum of distances from previous to current, and current to next.
    const originalSegmentDistance =
      Math.abs(coordinateList[loopIndex - 1] - coordinateList[loopIndex]) +
      Math.abs(coordinateList[loopIndex] - coordinateList[loopIndex + 1]);

    // Determine the net change in total distance if the current point is skipped.
    // (New path distance) - (Old path distance)
    const netChangeInDistance = distanceIfSkipped - originalSegmentDistance;

    // Add the modified total distance to the results array.
    // This is the initial total distance plus the net change.
    resultArray.push(totalAbsoluteDifference + netChangeInDistance);
  }

  // Output the results, with each value on a new line.
  console.log(resultArray.join('\n'));
}

// Read the input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
