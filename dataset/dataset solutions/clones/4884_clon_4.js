const processInputData = (rawText) => {
  const extractionResult = rawText.match(/(\d+)\n([\d\s]+)/);
  if (!extractionResult || extractionResult.length < 3) {
    return 0;
  }

  const numericalSequence = extractionResult[2].trim().split(/\s+/).map(Number);

  if (numericalSequence.length === 0) {
      return 0; // Edge case for empty sequence
  }

  const initialElement = numericalSequence[0];
  const startingState = {
    currentLow: initialElement,
    greatestSpread: 0,
    occurrenceCount: 1,
  };

  const transformationEngine = (accumulatedState, currentFigure) => {
    const newLow = Math.min(accumulatedState.currentLow, currentFigure);
    const potentialSpread = currentFigure - accumulatedState.currentLow;

    let updatedGreatestSpread = accumulatedState.greatestSpread;
    let updatedOccurrenceCount = accumulatedState.occurrenceCount;

    if (potentialSpread > updatedGreatestSpread) {
      updatedGreatestSpread = potentialSpread;
      updatedOccurrenceCount = 1;
    } else if (potentialSpread === updatedGreatestSpread) {
      updatedOccurrenceCount++;
    }

    return {
      currentLow: newLow,
      greatestSpread: updatedGreatestSpread,
      occurrenceCount: updatedOccurrenceCount,
    };
  };

  const finalOutcome = numericalSequence.slice(1).reduce(transformationEngine, startingState);

  return finalOutcome.occurrenceCount;
};

const programEntry = (sourceData) => {
  const finalResult = processInputData(sourceData);
  console.log('%s', finalResult);
};

programEntry(require("fs").readFileSync("/dev/stdin", "utf8"));