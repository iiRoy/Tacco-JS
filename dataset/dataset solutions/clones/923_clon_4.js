var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var contentLines = fileContent.trim().split("\n");
var initialValue = contentLines.shift();
var operandSequence = contentLines.shift().split(" ");

const binaryOperationMap = new Map([
  ["TT", "T"],
  ["TF", "F"],
  ["FT", "T"],
  ["FF", "T"]
]);

const evaluatePair = (leftOperand, rightOperand) => {
  return binaryOperationMap.get(leftOperand + rightOperand);
};

const computedOutcome = operandSequence.slice(1).reduce(evaluatePair, operandSequence[0]);

console.log(computedOutcome);
