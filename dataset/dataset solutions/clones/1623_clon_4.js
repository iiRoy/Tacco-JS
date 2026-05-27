function processCoordinates(rawData) {
  const lineSegments = rawData.split('\n');
  const [initialConfig, ...pointDataLines] = lineSegments;

  const [totalPoints, maxDistance] = initialConfig.split(' ').map(Number);

  const coordinatePairs = pointDataLines.map(line => line.split(' ').map(Number));

  const withinRange = coordinatePairs.filter(currentPair => {
    const [abscissa, ordinate] = currentPair;
    const squaredMagnitude = abscissa * abscissa + ordinate * ordinate;
    const squaredLimit = maxDistance * maxDistance;
    return squaredMagnitude <= squaredLimit;
  }).length;

  console.log(withinRange);
}

processCoordinates(require('fs').readFileSync('/dev/stdin', 'utf8'));
