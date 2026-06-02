function countCombinationsOfTwo(upperBound) {
  if (upperBound < 2) {
    return 0;
  }
  let currentSum = 0;
  for (let index = 1; index < upperBound; index++) {
    currentSum += index;
  }
  return currentSum;
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataRows = fileData.trim().split("\n");

const numericTokens = dataRows[0].split(' ');
const firstOperand = Number(numericTokens[0]);
const secondOperand = Number(numericTokens[1]);

const resultValue = countCombinationsOfTwo(firstOperand) + countCombinationsOfTwo(secondOperand);

console.log(resultValue);
