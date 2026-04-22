"use strict";
process.stdin.resume();
process.stdin.setEncoding("utf-8");

function print(x) {
  console.log(x);
}

let inputString = "";
let currentLine = 0;

process.stdin.on("data", inputStdin => {
  inputString += inputStdin;
});
process.stdin.on("end", () => {
  inputString = inputString.split("\n");
  executeRoutine();
});
function readline() {
  return inputString[currentLine++];
}

// ************************ Ignore above this Line ******************************
// **************************** Main Code Start *********************************

function executeRoutine() {
  const lineContent = readline();
  const numericStrings = lineContent.split(" ");

  const firstOperand = parseInt(numericStrings[0], 10);
  const secondOperand = parseInt(numericStrings[1], 10);

  const findMaximum = (val1, val2) => (val1 > val2 ? val1 : val2);
  const findMinimum = (val1, val2) => (val1 < val2 ? val1 : val2);
  const getTruncatedQuotient = (dividend, divisor) => (dividend / divisor) | 0;

  const largerValue = findMaximum(firstOperand, secondOperand);
  const smallerValue = findMinimum(firstOperand, secondOperand);

  const divisionComponent = getTruncatedQuotient(largerValue, smallerValue);
  const productComponent = firstOperand * secondOperand;

  const finalOutput = getTruncatedQuotient(productComponent, divisionComponent);

  print(finalOutput);
}