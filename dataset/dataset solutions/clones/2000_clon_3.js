function processInputData(rawDataString) {
  const parseNumericValue = (str) => parseInt(str, 10);

  const inputParts = rawDataString.split(' ');

  const initialFirstStr = inputParts[0];
  const initialSecondStr = inputParts[1];
  const initialThirdStr = inputParts[2];

  let firstNum = parseNumericValue(initialFirstStr);
  let secondNum = parseNumericValue(initialSecondStr);
  let thirdNum = parseNumericValue(initialThirdStr);

  const tempForFirstSwap = firstNum;
  firstNum = secondNum;
  secondNum = tempForFirstSwap;

  const tempForSecondSwap = firstNum;
  firstNum = thirdNum;
  thirdNum = tempForSecondSwap;

  const outputResult = `${firstNum} ${secondNum} ${thirdNum}`;

  console.log(outputResult);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
processInputData(rawInputContent);
