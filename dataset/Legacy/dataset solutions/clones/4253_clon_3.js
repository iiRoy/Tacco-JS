function isIntegerSquare(valueToCheck) {
  const calculatedRoot = Math.sqrt(valueToCheck);
  return Number.isInteger(calculatedRoot);
}

function processInputData(rawInputString) {
  const DECIMAL_RADIX = 10;
  const startingNumber = parseInt(rawInputString, DECIMAL_RADIX);

  for (let currentIterationValue = startingNumber; currentIterationValue > 1; currentIterationValue--) {
    if (isIntegerSquare(currentIterationValue)) {
      console.log(currentIterationValue);
      break;
    }
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
