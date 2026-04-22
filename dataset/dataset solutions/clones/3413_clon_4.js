const calculateOptimalGap = (sourcePayload) => {
  const contentSegments = sourcePayload.trim().split('\n');
  const [initialMetadata, ...numericalEntries] = contentSegments;

  const windowDimension = parseInt(initialMetadata.split(' ')[1], 10);
  const orderedNumericSequence = numericalEntries.map(Number).sort((first, second) => first - second);

  const totalElementsAvailable = orderedNumericSequence.length;

  if (totalElementsAvailable < windowDimension) {
    // Mimics the original's behavior when no valid window can be formed,
    // where the initial 'ans' value of 9999 is printed.
    return 9999;
  }

  const potentialStartingPoints = Array.from({ length: totalElementsAvailable - windowDimension + 1 }, (_, currentIdx) => currentIdx);

  const spanValues = potentialStartingPoints.map(startPoint => {
    const floorValue = orderedNumericSequence[startPoint];
    const ceilingValue = orderedNumericSequence[startPoint + windowDimension - 1];
    return ceilingValue - floorValue;
  });

  const leastDifference = spanValues.reduce((accumulatedMinimum, currentDifference) => Math.min(accumulatedMinimum, currentDifference), Number.MAX_VALUE);

  return leastDifference;
};

const executeProcessing = () => {
  const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
  const finalOutcome = calculateOptimalGap(fileData);
  console.log(finalOutcome);
};

executeProcessing();