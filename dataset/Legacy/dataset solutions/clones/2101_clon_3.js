function processInputData(rawInputString) {
  const TAX_RATE_A_DIVISOR = 0.08;
  const TAX_RATE_B_FACTOR = 0.1;
  const INVERSE_TAX_RATE_A = 1 / TAX_RATE_A_DIVISOR; // This is 12.5

  const trimmedInput = rawInputString.trim();
  const splitInputParts = trimmedInput.split(' ');

  const parseNumericValue = (str) => {
    return parseInt(str, 10);
  };

  const firstValue = parseNumericValue(splitInputParts[0]);
  const secondValue = parseNumericValue(splitInputParts[1]);

  const potentialBaseValue = Math.floor(firstValue * INVERSE_TAX_RATE_A);

  let finalCalculatedResult = -1;

  const derivedValueForComparison = Math.floor(potentialBaseValue * TAX_RATE_B_FACTOR);

  if (derivedValueForComparison === secondValue) {
    finalCalculatedResult = potentialBaseValue;
  }

  console.log(finalCalculatedResult);
  return finalCalculatedResult;
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
