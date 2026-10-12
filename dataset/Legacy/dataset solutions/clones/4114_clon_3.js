function calculateAndDisplayResult(inputString) {
  const constantValue = 48;
  const radixForParsing = 10;

  const numericInput = parseInt(inputString, radixForParsing);

  const computedResult = constantValue - numericInput;

  console.log(computedResult);
}

const fileSystemHandler = require('fs');
const standardInputFile = '/dev/stdin';
const fileEncoding = 'utf8';

const rawInputData = fileSystemHandler.readFileSync(standardInputFile, fileEncoding);

calculateAndDisplayResult(rawInputData);
