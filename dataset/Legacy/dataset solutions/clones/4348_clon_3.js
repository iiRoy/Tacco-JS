function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const itemCountString = inputLines[0].trim();
  const itemCount = parseInt(itemCountString, 10);

  const targetValueString = inputLines[1].trim();
  const targetValue = parseInt(targetValueString, 10);

  const pointValuesString = inputLines[2].trim();
  const dataPoints = pointValuesString.split(' ').map(valueStr => parseInt(valueStr, 10));

  let totalAccumulatedDistance = 0;

  const calculateDoubledMinimumDistance = (currentPoint, limit) => {
    const distanceToOrigin = currentPoint;
    const distanceToLimit = limit - currentPoint;
    const smallerOfTwoDistances = Math.min(distanceToOrigin, distanceToLimit);
    const doubledDistance = smallerOfTwoDistances * 2;
    return doubledDistance;
  };

  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    const pointValue = dataPoints[currentIdx];
    totalAccumulatedDistance += calculateDoubledMinimumDistance(pointValue, targetValue);
  }

  console.log(totalAccumulatedDistance);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
