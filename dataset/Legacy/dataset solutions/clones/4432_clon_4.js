const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const [lineContent] = sourceData.split('\n');
const [firstString, secondString] = lineContent.split(' ');
const numOne = Number(firstString);
const numTwo = Number(secondString);

const computeResult = (operandA, operandB) => {
  return operandA * operandB - operandA - operandB + 1;
};

const finalOutcome = computeResult(numOne, numTwo);

console.log(finalOutcome);
