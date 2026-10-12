function processInputData(rawInputString) {
  const MIN_ALLOWED_VALUE = 1;
  const MAX_ALLOWED_VALUE = 10;

  const numericParts = rawInputString.split(" ");

  const firstOperand = Number(numericParts[0]);
  const secondOperand = Number(numericParts[1]);

  const checkValueRange = (valueToCheck, lowerBound, upperBound) => {
    return valueToCheck >= lowerBound && valueToCheck <= upperBound;
  };

  const isFirstOperandValid = checkValueRange(firstOperand, MIN_ALLOWED_VALUE, MAX_ALLOWED_VALUE);
  const isSecondOperandValid = checkValueRange(secondOperand, MIN_ALLOWED_VALUE, MAX_ALLOWED_VALUE);

  if (!isFirstOperandValid || !isSecondOperandValid) {
    return console.log(-1);
  }

  const productResult = firstOperand * secondOperand;
  return console.log(productResult);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputData(fileContent);
