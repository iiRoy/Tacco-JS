const fileSystem = require("fs");

const calculateGreatestCommonDivisor = (firstNumber, secondNumber) => {
  if (secondNumber === 0) {
    return firstNumber;
  }
  return calculateGreatestCommonDivisor(secondNumber, firstNumber % secondNumber);
};

const determineLeastCommonMultiple = (valA, valB, commonDivisor) => {
  return (valA * valB) / commonDivisor;
};

const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const dataLines = inputContent.trim().split('\n');

for (const currentLine of dataLines) {
  const numericStrings = currentLine.split(' ');
  const operandOne = Number(numericStrings[0]);
  const operandTwo = Number(numericStrings[1]);

  const gcdResult = calculateGreatestCommonDivisor(operandOne, operandTwo);
  const lcmResult = determineLeastCommonMultiple(operandOne, operandTwo, gcdResult);

  console.log(gcdResult, lcmResult);
}
