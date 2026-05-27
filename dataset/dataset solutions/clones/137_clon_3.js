(function(rawInputString) {
  const parseLineData = (lineStr) => {
    const parts = lineStr.split(',').map(Number);
    const secondDivisor = parts.pop();
    const firstDivisor = parts.pop();
    return { sequence: parts, d1: firstDivisor, d2: secondDivisor };
  };

  let processedLines = rawInputString.replace(/\n$/, '').split('\n');
  const totalLineCount = processedLines.length;

  for (let lineIterator = 0; lineIterator < totalLineCount; lineIterator++) {
    const currentLine = processedLines.shift();
    const { sequence: numberSequence, d1: firstDivisor, d2: secondDivisor } = parseLineData(currentLine);
    console.log(determineCrossPoint(numberSequence, firstDivisor, secondDivisor));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function determineCrossPoint(numberSequence, firstDivisor, secondDivisor) {
  const prefixSums = [];
  let currentRunningSum = 0;

  for (let sumIterator = 0; sumIterator < numberSequence.length; sumIterator++) {
    currentRunningSum += numberSequence[sumIterator];
    prefixSums.push(currentRunningSum);
  }

  if (prefixSums.length === 0) {
      return 1;
  }

  const divisorSum = firstDivisor + secondDivisor;
  const thresholdValue = prefixSums[prefixSums.length - 1] * firstDivisor / divisorSum;

  const findAppropriateCount = (sums, threshold) => {
    let currentCount = 1;
    for (let checkIterator = 0; checkIterator < sums.length; checkIterator++) {
      if (threshold > sums[checkIterator]) {
        currentCount = checkIterator + 2;
      } else {
        return currentCount;
      }
    }
    return currentCount;
  };

  return findAppropriateCount(prefixSums, thresholdValue);
}
