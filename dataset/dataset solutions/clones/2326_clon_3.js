function findGCD(operand1, operand2) {
  if (operand2 === 0) {
    return operand1;
  }
  return findGCD(operand2, operand1 % operand2);
}

function calculateLeastCommonMultiple(firstNum, secondNum) {
  const commonDivisor = findGCD(firstNum, secondNum);
  const productOfNumbers = firstNum * secondNum;
  const resultLCM = productOfNumbers / commonDivisor;
  return resultLCM;
}

function processInputData(rawInputString) {
  const trimmedInputContent = rawInputString.trim();
  const stringNumberParts = trimmedInputContent.split(' ');

  const numericValuesArray = stringNumberParts.map(currentStringValue => Number(currentStringValue));

  const valueOne = numericValuesArray[0];
  const valueTwo = numericValuesArray[1];

  const computedLCM = calculateLeastCommonMultiple(valueOne, valueTwo);

  console.log(computedLCM);
}

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const fileEncoding = "utf8";

const fileContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);
processInputData(fileContent);
