function computeDigitSum(numberStringRepresentation) {
  let currentSumOfDigits = 0;
  const individualDigitChars = numberStringRepresentation.split('');

  for (let charIdx = 0; charIdx < individualDigitChars.length; charIdx++) {
    const digitValue = parseInt(individualDigitChars[charIdx], 10);
    currentSumOfDigits += digitValue;
  }
  return currentSumOfDigits;
}

function processInputData(rawInputVal) {
  const stringifiedInput = rawInputVal.toString();
  const calculatedDigitSum = computeDigitSum(stringifiedInput);

  let finalVerdict = 'No'; // Default outcome

  // Check if the sum of digits is non-zero to avoid division by zero issues,
  // and then perform the divisibility check.
  // Note: JavaScript's `0 % 0` results in `NaN`, which is not strictly equal to 0.
  // This condition correctly mirrors the original behavior for `input % sum == 0`.
  const isInputDivisibleBySum = (calculatedDigitSum !== 0) && (rawInputVal % calculatedDigitSum === 0);

  if (isInputDivisibleBySum) {
    finalVerdict = 'Yes';
  }

  console.log(finalVerdict);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
