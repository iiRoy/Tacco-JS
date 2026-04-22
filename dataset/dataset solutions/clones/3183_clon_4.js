const performAddition = (firstVal, secondVal) => firstVal + secondVal;
const performSubtraction = (firstVal, secondVal) => secondVal - firstVal;

const operationSelector = [performSubtraction, performAddition];

function evaluateInputExpression(rawTextLine) {
  const whitespaceIndex = rawTextLine.indexOf(' ');
  const primaryTerm = Number(rawTextLine.slice(0, whitespaceIndex));
  const secondaryTerm = Number(rawTextLine.slice(whitespaceIndex + 1));

  const moduloZero = (secondaryTerm % primaryTerm === 0);
  const chosenFunction = operationSelector[Number(moduloZero)];

  return chosenFunction(primaryTerm, secondaryTerm);
}

const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLine = sourceData.trim().split('\n')[0];
const finalComputation = evaluateInputExpression(processedLine);
process.stdout.write(finalComputation.toString() + '\n');