const processInputData = (inputStr) => {
  const parseNumericLine = (lineContent) => lineContent.split(' ').map(valueString => Number(valueString));

  const allInputLines = inputStr.trim().split('\n');
  const processedLines = allInputLines.map(parseNumericLine);

  const totalPairsCount = processedLines[0][0];
  const coordinateData = processedLines.slice(1);

  const redPointsCollection = coordinateData.slice(0, totalPairsCount);
  const bluePointsCollection = coordinateData.slice(totalPairsCount, 2 * totalPairsCount);

  const getMinCoordValue = (pointEntry) => Math.min(pointEntry[0], pointEntry[1]);
  const coordinateComparisonFunction = (pointA, pointB) => getMinCoordValue(pointA) - getMinCoordValue(pointB);

  redPointsCollection.sort(coordinateComparisonFunction);
  bluePointsCollection.sort(coordinateComparisonFunction);

  let successfulMatches = 0;
  let nextBluePointStartIndex = 0;

  const canFormMatch = (currentRed, currentBlue) => currentRed[0] < currentBlue[0] && currentRed[1] < currentBlue[1];

  for (let redPointIndex = 0; redPointIndex < totalPairsCount; redPointIndex++) {
    const currentRedPoint = redPointsCollection[redPointIndex];
    for (let bluePointIndex = nextBluePointStartIndex; bluePointIndex < totalPairsCount; bluePointIndex++) {
      const currentBluePoint = bluePointsCollection[bluePointIndex];
      if (canFormMatch(currentRedPoint, currentBluePoint)) {
        successfulMatches++;
        nextBluePointStartIndex = bluePointIndex + 1;
        break;
      }
    }
  }
  return `${successfulMatches}`;
};

const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputData(fileContents));
