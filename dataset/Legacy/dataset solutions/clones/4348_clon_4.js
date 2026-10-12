function ComputeTotalDistance(inputString) {
  const inputLines = inputString.split('\n').map(s => s.trim());

  const elementCount = parseInt(inputLines[0]);
  const thresholdValue = parseInt(inputLines[1]);
  const coordinateArray = inputLines[2].split(' ').map(Number);

  const finalSum = coordinateArray
    .slice(0, elementCount)
    .reduce((currentTotal, currentCoord) => {
      const distToOrigin = currentCoord;
      const distToK = thresholdValue - currentCoord;
      const minDistanceToTarget = Math.min(distToOrigin, distToK);
      return currentTotal + (minDistanceToTarget * 2);
    }, 0);

  console.log(finalSum);
}

ComputeTotalDistance(require('fs').readFileSync('/dev/stdin', 'utf8'));
