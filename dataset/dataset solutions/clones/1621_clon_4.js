function processInputData(rawInputString) {
  const lineSegments = rawInputString.split('\n');

  const firstLineValues = lineSegments[0].split(' ').map(parseFloat);
  const pointQuantity = firstLineValues[0];
  const distanceLimit = firstLineValues[1];

  const distanceSquaredThreshold = distanceLimit * distanceLimit;

  const pointCoordinates = Array.from({ length: pointQuantity }, (_, lineIndex) => {
    const currentLine = lineSegments[lineIndex + 1];
    const coordinateValues = currentLine.split(' ').map(parseFloat);
    return [coordinateValues[0], coordinateValues[1]];
  });

  const finalCount = pointCoordinates.filter(coordPair => {
    const xVal = coordPair[0];
    const yVal = coordPair[1];
    return (xVal * xVal + yVal * yVal) <= distanceSquaredThreshold;
  }).length;

  console.log(finalCount);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
