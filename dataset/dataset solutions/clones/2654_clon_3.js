function processInputData(inputString) {
  const tokenizedInput = inputString.split(' ');
  const valA = parseInt(tokenizedInput[0], 10);
  const valB = parseInt(tokenizedInput[1], 10);

  const sumOperation = valA + valB;
  const differenceOperation = valA - valB;
  const productOperation = valA * valB;

  const allCalculatedValues = [sumOperation, differenceOperation, productOperation];
  const computedMaximum = Math.max(...allCalculatedValues);
  
  console.log(computedMaximum);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputData(fileContent);
