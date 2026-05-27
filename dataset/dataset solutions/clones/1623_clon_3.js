function processInput(rawData) {
  const allInputLines = rawData.split('\n');
  const processedNumericLines = allInputLines.map(lineString => lineString.split(' ').map(Number));

  const initialParameters = processedNumericLines[0];
  const totalPointsExpected = initialParameters[0]; // N from original
  const maximumAllowedDistance = initialParameters[1]; // D from original

  const pointCoordinateList = processedNumericLines.slice(1); // pList from original

  let pointsWithinRangeCount = 0;

  // Helper function to determine if a point is within the specified distance
  const checkPointDistance = (xCoordinate, yCoordinate, distanceLimit) => {
    const xSquared = xCoordinate * xCoordinate;
    const ySquared = yCoordinate * yCoordinate;
    const sumOfSquaredCoordinates = xSquared + ySquared;
    const calculatedDistance = Math.sqrt(sumOfSquaredCoordinates);
    return calculatedDistance <= distanceLimit;
  };

  for (const currentPointData of pointCoordinateList) { // Changed from forEach to for...of
    const [xVal, yVal] = currentPointData;

    if (checkPointDistance(xVal, yVal, maximumAllowedDistance)) { // Using helper function
      pointsWithinRangeCount = pointsWithinRangeCount + 1; // Rewritten increment
    }
  }

  console.log(pointsWithinRangeCount);
}

const standardInputPath = '/dev/stdin'; // Helper constant for input path
const fileContents = require('fs').readFileSync(standardInputPath, 'utf8');
processInput(fileContents);
