function parsePointString(pointCoordinatesString) {
  const coordinateParts = pointCoordinatesString.split(' ');
  return [parseFloat(coordinateParts[0]), parseFloat(coordinateParts[1])];
}

function calculateEuclideanDistance(pointOne, pointTwo) {
  const deltaX = pointOne[0] - pointTwo[0];
  const deltaY = pointOne[1] - pointTwo[1];
  const squaredDistance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
  return Math.sqrt(squaredDistance);
}

function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const dataCount = parseInt(inputLines[0], 10);

  const allParsedPoints = [];
  for (let pointLineIndex = 1; pointLineIndex <= dataCount; pointLineIndex++) {
    allParsedPoints.push(parsePointString(inputLines[pointLineIndex]));
  }

  let totalDistanceSum = 0;

  for (let outerPointIdx = 0; outerPointIdx < dataCount; outerPointIdx++) {
    const currentPointA = allParsedPoints[outerPointIdx];

    for (let innerPointIdx = outerPointIdx + 1; innerPointIdx < dataCount; innerPointIdx++) {
      const currentPointB = allParsedPoints[innerPointIdx];
      const pairDistance = calculateEuclideanDistance(currentPointA, currentPointB);
      totalDistanceSum += pairDistance;
    }
  }

  const finalScalingFactor = 2 / dataCount;
  const finalComputedResult = totalDistanceSum * finalScalingFactor;

  console.log(finalComputedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
