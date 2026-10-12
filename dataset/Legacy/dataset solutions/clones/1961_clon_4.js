const computeResult = (dataRows) => {
  const firstRowElements = dataRows[0].split(' ');
  const limitValue = parseInt(firstRowElements[0], 10);
  // The second element from the first row (M) is not utilized in the original logic.

  const secondRowNumbersAsStrings = dataRows[1].split(' ');
  let accumulatedSum = 0;
  for (const numericString of secondRowNumbersAsStrings) {
    accumulatedSum += parseInt(numericString, 10);
  }

  const finalOutcome = (accumulatedSum > limitValue) ? -1 : (limitValue - accumulatedSum);
  console.log(finalOutcome);
};

let inputAccumulator = '';
process.stdin.on('data', (dataChunk) => {
  inputAccumulator += dataChunk;
});
process.stdin.on('end', () => {
  const { EOL } = require('os');
  const allInputLines = inputAccumulator.split(EOL);
  computeResult(allInputLines);
});
