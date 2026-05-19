const fileSystem = require('node:fs');

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputLinesArray = rawInputContent.split('\n');
const numericTarget = Number(inputLinesArray[0]);

let computedResult;

if (numericTarget <= 0) {
  computedResult = 0;
} else {
  const quadraticDiscriminant = 1 + 8 * numericTarget;
  const positiveQuadraticRoot = (-1 + Math.sqrt(quadraticDiscriminant)) / 2;
  computedResult = Math.ceil(positiveQuadraticRoot);
}

console.log(computedResult);
