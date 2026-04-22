const strToNum = (inputStr) => Number.parseInt(inputStr, 10);
const strArrToNumArr = (stringArray) => stringArray.map((currentString) => strToNum(currentString));
const absoluteValue = (numericValue) => (numericValue > 0) ? numericValue : -numericValue;

function findMinimum() {
  let argList = arguments;
  let currentMin = argList[0];
  for (let idx = 1; idx < argList.length; idx++) {
    if (argList[idx] < currentMin) {
      currentMin = argList[idx];
    }
  }
  return currentMin;
}

function findMaximum() {
  let argumentCollection = arguments;
  let currentMax = argumentCollection[0];
  for (let index = 1; index < argumentCollection.length; index++) {
    if (argumentCollection[index] > currentMax) {
      currentMax = argumentCollection[index];
    }
  }
  return currentMax;
}

ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));

function ExecuteProgram(rawData) {
  const inputParts = rawData.split(' ');
  const firstNum = strToNum(inputParts[0]);
  const secondNum = strToNum(inputParts[1]);

  const resultSymbol = ((firstNum + secondNum) === 15)
    ? '+'
    : ((firstNum * secondNum) === 15)
      ? '*'
      : 'x';

  console.log(resultSymbol);
}