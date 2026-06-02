const main = (inputString) => {
  const inputLines = inputString.split("\n");

  // Helper function to parse a single line of coordinates
  const parseCoordLine = (lineContent) => {
    return lineContent.split(" ").map(val => Number(val));
  };

  const totalPointCount = Number(inputLines[0]);
  let allCoordinates = [];

  // Populate allCoordinates from input lines
  // The original code's `point.indexOf(value)` check for array objects
  // will always return -1 because `value` is a new array object in each iteration.
  // This means it effectively adds all points without content-based duplicate filtering.
  // This exact behavior is preserved.
  for (let i = 1; i <= totalPointCount; i++) {
    let currentCoordPair = parseCoordLine(inputLines[i]);
    if (allCoordinates.indexOf(currentCoordPair) === -1) {
      allCoordinates.push(currentCoordPair);
    }
  }

  const numStoredCoords = allCoordinates.length;

  // Prepare x and y values for finding overall min/max.
  // The original code creates arrays of single-element arrays (e.g., [[x1], [x2], ...]).
  // This structure is maintained for behavioral equivalence during sorting.
  let xValueWrappers = [];
  let yValueWrappers = [];
  for (let i = 0; i < numStoredCoords; i++) {
    xValueWrappers.push([allCoordinates[i][0]]);
    yValueWrappers.push([allCoordinates[i][1]]);
  }

  // Sort x-coordinate wrappers in descending order to find max and min
  xValueWrappers.sort((a, b) => b[0] - a[0]);
  const overallMaxX = xValueWrappers[0][0];
  const overallMinX = xValueWrappers[numStoredCoords - 1][0];

  // Sort y-coordinate wrappers in descending order to find max and min
  yValueWrappers.sort((a, b) => b[0] - a[0]);
  const overallMaxY = yValueWrappers[0][0];
  const overallMinY = yValueWrappers[numStoredCoords - 1][0];

  // Helper function to determine if a coordinate value is an extreme (min or max)
  const isCoordinateExtreme = (valueToCheck, maxBoundary, minBoundary) => {
    return valueToCheck === maxBoundary || valueToCheck === minBoundary;
  };

  let extremePointIndices = [];

  // Identify and collect indices of points that lie on the extreme x or y boundaries
  for (let i = 0; i < numStoredCoords; i++) {
    const currentX = allCoordinates[i][0];
    const currentY = allCoordinates[i][1];

    // Check if the current point's x-coordinate is an extreme
    if (isCoordinateExtreme(currentX, overallMaxX, overallMinX)) {
      if (extremePointIndices.indexOf(i) === -1) {
        extremePointIndices.push(i);
      }
    }
    // Check if the current point's y-coordinate is an extreme
    if (isCoordinateExtreme(currentY, overallMaxY, overallMinY)) {
      if (extremePointIndices.indexOf(i) === -1) {
        extremePointIndices.push(i);
      }
    }
  }

  const numExtremePoints = extremePointIndices.length;
  let allCalculatedDistances = [];

  // Helper function to compute Manhattan distance between two points
  const computeManhattanDistance = (pointOne, pointTwo) => {
    return Math.abs(pointOne[0] - pointTwo[0]) + Math.abs(pointOne[1] - pointTwo[1]);
  };

  // Calculate Manhattan distances between all unique pairs of identified extreme points
  for (let i = 0; i < numExtremePoints; i++) {
    for (let j = i + 1; j < numExtremePoints; j++) {
      const p1OriginalIndex = extremePointIndices[i];
      const p2OriginalIndex = extremePointIndices[j];
      const point1Coords = allCoordinates[p1OriginalIndex];
      const point2Coords = allCoordinates[p2OriginalIndex];
      allCalculatedDistances.push(computeManhattanDistance(point1Coords, point2Coords));
    }
  }

  // Sort the calculated distances in descending order to find the maximum
  allCalculatedDistances.sort((a, b) => b - a);

  // Output the largest Manhattan distance found
  console.log(allCalculatedDistances[0]);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
