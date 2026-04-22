function processNumericalSequence(textualData) {
  const numericComponents = textualData.split(' ').map(Number);
  const sourceValue = numericComponents[0];
  const targetValue = numericComponents[1];
  const selectionIndex = numericComponents[2];

  const upperBound = Math.min(sourceValue, targetValue);

  const commonDivisorsDescending = Array.from({ length: upperBound }, (_, idx) => upperBound - idx)
    .filter(candidateFactor => sourceValue % candidateFactor === 0 && targetValue % candidateFactor === 0);

  const resultantDivisor = commonDivisorsDescending[selectionIndex - 1];

  console.log(resultantDivisor);
}

processNumericalSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));