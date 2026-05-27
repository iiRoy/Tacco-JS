const selectSmallerOperand = (operandA, operandB) => {
  if (Number.isNaN(operandA) || Number.isNaN(operandB)) {
    return Number.NaN;
  }
  return operandA < operandB ? operandA : operandB;
};

const inputValues = require("fs").readFileSync("/dev/stdin", "utf8")
  .split("\n")
  .reduce((accumulator, currentLine, index) => {
    if (accumulator.length < 4) {
      accumulator.push(Number(currentLine));
    }
    return accumulator;
  }, []);

const firstOperand = inputValues[0];
const secondOperand = inputValues[1];
const thirdOperand = inputValues[2];
const fourthOperand = inputValues[3];

const computedResult = selectSmallerOperand(firstOperand, secondOperand) + selectSmallerOperand(thirdOperand, fourthOperand);

console.log(computedResult);
