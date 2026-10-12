const fs = require('fs');

const parseInputValues = (rawText) => {
  const lines = rawText.trim().split('\n');
  return lines.slice(1).map(Number);
};

const computeSpecialSum = (numericSequence) => {
  if (numericSequence.length === 0) {
    return 0;
  }

  const peakValue = Math.max(...numericSequence);
  const firstPeakIndex = numericSequence.indexOf(peakValue);

  let finalAccumulation = 0;
  for (let i = 0; i < numericSequence.length; i++) {
    const currentElement = numericSequence[i];
    if (i === firstPeakIndex) {
      finalAccumulation += currentElement / 2;
    } else {
      finalAccumulation += currentElement;
    }
  }
  return finalAccumulation;
};

const runProgram = () => {
  const fileData = fs.readFileSync('/dev/stdin', 'utf8');
  const numbersForProcessing = parseInputValues(fileData);
  const result = computeSpecialSum(numbersForProcessing);
  console.log(result);
};

runProgram();
