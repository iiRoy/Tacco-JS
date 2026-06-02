const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const targetValues = ['3', '5', '7'];

function isTargetValue(valueToCheck) {
  return targetValues.includes(valueToCheck);
}

const finalOutput = isTargetValue(inputData) ? 'YES' : 'NO';
console.log(finalOutput);
