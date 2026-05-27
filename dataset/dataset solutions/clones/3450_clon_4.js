function processInputData(rawContent) {
  const lineSegments = rawContent.split('\n');
  const [firstLine, secondLine, thirdLine] = lineSegments;

  // The first line (N) is not utilized in the original logic's core calculation.
  // const countOfLocations = Number(firstLine);

  const [initialTemperature, desiredTemperature] = secondLine.split(' ').map(Number);
  const elevationValues = thirdLine.split(' ').map(Number);

  return {
    baseTemperature: initialTemperature,
    targetTemperature: desiredTemperature,
    elevations: elevationValues
  };
}

function determineOptimalPoint(processedData) {
  const { baseTemperature, targetTemperature, elevations } = processedData;

  // Transform the array of elevations into an array of objects,
  // each containing its original index and the calculated absolute temperature difference.
  const temperatureDifferences = elevations.map((currentElevation, originalPosition) => {
    const effectiveTemperature = baseTemperature - (currentElevation * 0.006);
    const absoluteDifference = Math.abs(targetTemperature - effectiveTemperature);
    return {
      positionIdentifier: originalPosition,
      deviationMagnitude: absoluteDifference
    };
  });

  // Reduce the array of temperature difference objects to find the one with the minimum deviation.
  // If multiple points have the same minimum deviation, the one appearing later in the array is chosen,
  // replicating the original code's 'gap <= min_gap' behavior.
  const bestCandidate = temperatureDifferences.reduce((currentBest, candidateItem) => {
    if (candidateItem.deviationMagnitude <= currentBest.deviationMagnitude) {
      return candidateItem;
    }
    return currentBest;
  }, temperatureDifferences[0]); // Initialize with the first item for comparison

  return (bestCandidate.positionIdentifier + 1).toString(); // Convert to 1-based index and then to string
}

function entryPoint(inputString) {
  const parsedData = processInputData(inputString);
  const result = determineOptimalPoint(parsedData);
  console.log(result);
}

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
