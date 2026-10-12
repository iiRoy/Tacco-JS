const parseInteger = (numericString) => parseInt(numericString, 10);

const calculateSmallestMultiple = (targetValue, divisor) => Math.ceil(targetValue / divisor) * divisor;

const executeCalculation = (rawInputData) => {
  const processedInput = rawInputData.trim();
  const inputLines = processedInput.split('\n');

  const firstLineValues = inputLines[0].split(' ').map(parseInteger);
  const totalElements = firstLineValues[0];

  const dataArray = inputLines[1].split(' ').map(parseInteger);

  let currentMinimum = 2;
  let currentMaximum = 2;

  const iterationStartIndex = totalElements - 2;
  for (let loopIndex = iterationStartIndex; loopIndex >= 0; loopIndex--) {
    const arrayValueAtIndex = dataArray[loopIndex];
    const arrayValueAtNextIndex = dataArray[loopIndex + 1];

    const potentialUpperLimit = currentMaximum + arrayValueAtNextIndex - 1;
    if (potentialUpperLimit < arrayValueAtIndex) {
      return '-1';
    }

    currentMinimum = calculateSmallestMultiple(currentMinimum, arrayValueAtIndex);

    const temporaryMaxCandidate = calculateSmallestMultiple(currentMaximum, arrayValueAtNextIndex) + arrayValueAtNextIndex - 1;
    currentMaximum = temporaryMaxCandidate - (temporaryMaxCandidate % arrayValueAtIndex);
  }

  const finalAdjustedMaximum = currentMaximum + dataArray[0] - 1;
  return `${currentMinimum} ${finalAdjustedMaximum}`;
};

console.log(executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf8')));
