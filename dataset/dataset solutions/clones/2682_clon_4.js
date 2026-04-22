function assessNumericPattern(inputDataString) {
  const dataLines = inputDataString.split('\n');
  const numberTokens = (dataLines[1] || '').match(/-?\d+/g);

  if (!numberTokens || numberTokens.length === 0) {
    return console.log("Yes");
  }

  const initialNumbers = numberTokens.map(Number);

  const initialProcessingState = {
    resultantSequence: [],
    processingStatus: 'OK'
  };

  const finalProcessingState = initialNumbers.reduce((processingState, currentNumber, currentPosition) => {
    if (processingState.processingStatus === 'NO') {
      return processingState;
    }

    if (currentPosition === 0) {
      processingState.resultantSequence.push(currentNumber);
      return processingState;
    }

    const previousProcessedNumber = processingState.resultantSequence[currentPosition - 1];
    const numericalDifference = currentNumber - previousProcessedNumber;

    if (numericalDifference < -1) {
      processingState.processingStatus = 'NO';
      return processingState;
    }

    if (numericalDifference === -1) {
      processingState.resultantSequence[currentPosition - 1] = previousProcessedNumber - 1;

      if (currentPosition >= 2 && processingState.resultantSequence[currentPosition - 2] > processingState.resultantSequence[currentPosition - 1]) {
        processingState.processingStatus = 'NO';
        return processingState;
      }
    }
    processingState.resultantSequence.push(currentNumber);
    return processingState;
  }, initialProcessingState);

  if (finalProcessingState.processingStatus === 'NO') {
    return console.log("No");
  }

  const isOrderMaintained = finalProcessingState.resultantSequence.every((elementValue, currentPosition, fullSequence) => {
    if (currentPosition === 0) return true;
    return elementValue >= fullSequence[currentPosition - 1];
  });

  if (!isOrderMaintained) {
    return console.log("No");
  }

  console.log("Yes");
}