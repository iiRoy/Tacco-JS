const calculateDiscrepancyRecursive = (basePoint, sourceSequence, currentIndex = 0, currentSum = 0) => {
  if (currentIndex >= sourceSequence.length) {
    return currentSum;
  }
  const term = Math.abs(sourceSequence[currentIndex] - (basePoint + currentIndex + 1));
  return calculateDiscrepancyRecursive(basePoint, sourceSequence, currentIndex + 1, currentSum + term);
};

const orchestrateComputation = (rawInputText) => {
  const textRows = rawInputText.split('\n');
  const elementCount = parseInt(textRows[0]);
  const originalValues = textRows[1].split(' ').map(val => parseInt(val));

  const transformedSeries = originalValues.map((val, idx) => val - (idx + 1));

  const centralIndexMarker = Math.floor(elementCount / 2);

  const candidateBasePoints = [
    transformedSeries[centralIndexMarker],
    transformedSeries[centralIndexMarker + 1],
    transformedSeries[centralIndexMarker + 2]
  ];

  const minimumDiscrepancy = Math.min(...candidateBasePoints.map(candidate =>
    calculateDiscrepancyRecursive(candidate, originalValues)
  ));

  console.log(minimumDiscrepancy);
};

orchestrateComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));