let inputAccumulator = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
  inputAccumulator += dataChunk;
});

const parseCoordinateString = (rawInput) => {
  const trimmedInput = rawInput.trim();
  const stringComponents = trimmedInput.split(' ');
  const numericComponents = stringComponents.map(Number);
  return numericComponents;
};

const computeEuclideanDistance = (xCoord1, yCoord1, xCoord2, yCoord2) => {
  const deltaX = xCoord1 - xCoord2;
  const deltaY = yCoord1 - yCoord2;

  const squaredDeltaX = deltaX * deltaX;
  const squaredDeltaY = deltaY * deltaY;

  const sumOfSquaredDifferences = squaredDeltaX + squaredDeltaY;

  return Math.sqrt(sumOfSquaredDifferences);
};

process.stdin.on('end', () => {
  const coordinateValues = parseCoordinateString(inputAccumulator);
  const [firstPointX, firstPointY, secondPointX, secondPointY] = coordinateValues;

  const finalDistanceResult = computeEuclideanDistance(
    firstPointX,
    firstPointY,
    secondPointX,
    secondPointY
  );

  console.log(finalDistanceResult.toFixed(6));
});
