(function(inputContent) {
  const numericData = inputContent.replace(/\n$/, '').split('\n').map(Number);

  function* numericValueIterator(sourceArray) {
    let currentPosition = 0;
    while (currentPosition < sourceArray.length) {
      yield sourceArray[currentPosition++];
    }
  }
  const dataStream = numericValueIterator(numericData);

  const kadaneAccumulator = (currentTotals, nextValue) => {
    const newCurrentMax = Math.max(nextValue, currentTotals.currentMaxEndingHere + nextValue);
    const newOverallMax = Math.max(currentTotals.overallMax, newCurrentMax);
    return { currentMaxEndingHere: newCurrentMax, overallMax: newOverallMax };
  };

  function processNextNumberSequence(iteratorSource) {
    const sequenceLengthResult = iteratorSource.next();
    if (sequenceLengthResult.done || sequenceLengthResult.value === 0) {
      return null;
    }
    const currentSequenceLength = sequenceLengthResult.value;

    const sequenceElements = Array.from({ length: currentSequenceLength }, () => iteratorSource.next().value);

    const initialKadaneState = { currentMaxEndingHere: -Infinity, overallMax: -Infinity };
    const finalKadaneState = sequenceElements.reduce(kadaneAccumulator, initialKadaneState);

    return finalKadaneState.overallMax;
  }

  function processAllInputSequences(iteratorSource) {
    const sequenceMaxSum = processNextNumberSequence(iteratorSource);
    if (sequenceMaxSum !== null) {
      console.log(sequenceMaxSum);
      processAllInputSequences(iteratorSource);
    }
  }

  processAllInputSequences(dataStream);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
