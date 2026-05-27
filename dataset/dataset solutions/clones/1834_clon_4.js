const processInputData = (rawTextContent) => {
  const contentLines = rawTextContent.trim().split('\n');
  const elementCount = Number(contentLines[0]);
  const sourceValues = contentLines[1].split(' ').map(Number);

  const initialDerivedElement = 1 - sourceValues[0];
  const derivedSequence = sourceValues.slice(1, elementCount).reduce((accumulatorArray, currentSourceVal) => {
    const previousDerivedVal = accumulatorArray[accumulatorArray.length - 1];
    accumulatorArray.push(previousDerivedVal * 2 - currentSourceVal);
    return accumulatorArray;
  }, [initialDerivedElement]);
  derivedSequence.push(0);

  const initialProcessingState = {
    cumulativeSum: sourceValues[elementCount],
    adjustedSequence: derivedSequence
  };

  const finalProcessingState = Array.from({ length: elementCount }, (_, index) => elementCount - 1 - index)
    .reduce((currentAccumulatedState, currentIterationIndex) => {
      if (currentAccumulatedState.cumulativeSum === -1) {
        return currentAccumulatedState;
      }

      const { cumulativeSum, adjustedSequence } = currentAccumulatedState;
      const nextIndex = currentIterationIndex + 1;
      const upperLimit = adjustedSequence[nextIndex] + sourceValues[nextIndex];
      let currentDerivedValue = adjustedSequence[currentIterationIndex];

      if (currentDerivedValue > upperLimit) {
        currentDerivedValue = upperLimit;
      } else if (currentDerivedValue * 2 < upperLimit) {
        return { cumulativeSum: -1, adjustedSequence: [] };
      }

      adjustedSequence[currentIterationIndex] = currentDerivedValue;
      return {
        cumulativeSum: cumulativeSum + currentDerivedValue + sourceValues[currentIterationIndex],
        adjustedSequence: adjustedSequence
      };
    }, initialProcessingState);

  if (finalProcessingState.cumulativeSum === -1) {
    return '-1';
  } else {
    return String(finalProcessingState.cumulativeSum);
  }
};

console.log(processInputData(require('fs').readFileSync('/dev/stdin', 'utf8')));
