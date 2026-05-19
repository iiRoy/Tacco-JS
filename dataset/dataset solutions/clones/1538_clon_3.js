const executeSolution = (rawInputString) => {
  const inputLines = rawInputString.split("\n");

  const parsePointCoordinates = (lineContent) => {
    return lineContent.split(" ").map(Number);
  };

  const totalPointsCount = Number(inputLines[0]);

  if (totalPointsCount < 2) {
    console.log(0);
    return;
  }

  const pointCoordinates = [];
  for (let i = 0; i < totalPointsCount; i++) {
    pointCoordinates.push(parsePointCoordinates(inputLines[i + 1]));
  }

  const getAbsoluteValue = Math.abs;

  const calculateManhattanDistance = (pointA, pointB) => {
    const deltaX = getAbsoluteValue(pointA[0] - pointB[0]);
    const deltaY = getAbsoluteValue(pointA[1] - pointB[1]);
    return deltaX + deltaY;
  };

  let maximumDistanceFound = 0;

  for (let idx1 = 0; idx1 < totalPointsCount; idx1++) {
    for (let idx2 = idx1 + 1; idx2 < totalPointsCount; idx2++) {
      const currentPointA = pointCoordinates[idx1];
      const currentPointB = pointCoordinates[idx2];
      const currentPairDistance = calculateManhattanDistance(currentPointA, currentPointB);

      if (currentPairDistance > maximumDistanceFound) {
        maximumDistanceFound = currentPairDistance;
      }
    }
  }

  console.log(maximumDistanceFound);
};

executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));
