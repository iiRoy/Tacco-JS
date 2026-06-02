function processInputData(rawData) {
  const parsedValues = rawData.split(' ');

  const firstOperandString = parsedValues[0];
  const secondOperandString = parsedValues[1];

  const numericFactorOne = Number(firstOperandString);
  const numericFactorTwo = Number(secondOperandString);

  const calculatedProduct = numericFactorOne * numericFactorTwo;

  const comparisonTargetString = parsedValues[2];
  const numericComparisonTarget = Number(comparisonTargetString);

  let resultToOutput;

  if (calculatedProduct < numericComparisonTarget) {
    resultToOutput = calculatedProduct;
  } else {
    resultToOutput = numericComparisonTarget;
  }

  console.log(resultToOutput);
}

const fileSystemUtility = require('fs');
const standardInputFilePath = '/dev/stdin';
const inputEncoding = 'utf8';

const fileContent = fileSystemUtility.readFileSync(standardInputFilePath, inputEncoding);

processInputData(fileContent);
