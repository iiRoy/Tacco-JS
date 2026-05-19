function processInput(rawData) {
  const lineSegments = rawData.split('\n');
  const initialParameters = lineSegments[0].split(' ').map(Number);
  const upperBoundary = initialParameters[0] + 1;
  const desiredSum = initialParameters[1];
  const numericSequence = lineSegments[1].split(' ').map(Number);

  function findFirstExceedingIndex(
    sequenceData,
    targetValue,
    currentCumulative = 0,
    currentIndex = 0
  ) {
    if (currentIndex >= sequenceData.length) {
      return -1;
    }

    const nextCumulative = currentCumulative + sequenceData[currentIndex];

    if (nextCumulative >= targetValue) {
      return currentIndex + 1;
    }

    return findFirstExceedingIndex(
      sequenceData,
      targetValue,
      nextCumulative,
      currentIndex + 1
    );
  }

  const resultPosition = findFirstExceedingIndex(numericSequence, desiredSum);

  if (resultPosition !== -1) {
    console.log(resultPosition);
  } else {
    console.log(upperBoundary - 1);
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
