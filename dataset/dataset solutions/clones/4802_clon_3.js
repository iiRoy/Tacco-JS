function processInput(rawData) {
  const inputSegments = rawData.split(" ");

  const firstOperandString = inputSegments[0];
  const operatorSymbol = inputSegments[1];
  const secondOperandString = inputSegments[2];

  let calculatedOutcome;

  if (operatorSymbol === "+") {
    calculatedOutcome = firstOperandString + secondOperandString;
  } else {
    calculatedOutcome = firstOperandString - secondOperandString;
  }
  
  console.log(calculatedOutcome);
}

const fileSystemUtility = require('fs');
const standardInputFilePath = '/dev/stdin';
const textEncoding = 'utf8';

const rawContentFromStdin = fileSystemUtility.readFileSync(standardInputFilePath, textEncoding);

processInput(rawContentFromStdin);
