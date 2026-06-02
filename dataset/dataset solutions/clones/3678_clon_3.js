function processInput(inputStr) {
  const stringParts = inputStr.split(" ");
  const numArr = stringParts.map(currentVal => Number(currentVal));

  const firstOperand = numArr[0];
  const secondOperand = numArr[1];

  let resultChar = "x";

  const sumResult = firstOperand + secondOperand;
  const productResult = firstOperand * secondOperand;

  if (sumResult === 15) {
    resultChar = "+";
  } else if (productResult === 15) {
    resultChar = "*";
  }

  console.log(resultChar);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

const inputData = fileSystemModule.readFileSync(standardInputPath, encodingType);
processInput(inputData);
