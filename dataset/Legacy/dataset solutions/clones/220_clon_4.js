function greatestCommonDivisor(firstValue, secondValue) {
  return secondValue === 0 ? firstValue : greatestCommonDivisor(secondValue, firstValue % secondValue);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

fileContent.trim().split('\n').forEach(currentLine => {
  const numericalComponents = currentLine.split(' ').map(Number);

  const numerator = numericalComponents[0];
  const denominator = numericalComponents[1];
  const iterationCount = numericalComponents[2];

  const targetFraction = numerator / denominator;

  const accumulatedDigitSum = Array.from({ length: iterationCount }, (_, index) => {
    const p = index + 1;

    const roundingPrecision = p + 1;
    const powerForRounding = Math.pow(10, roundingPrecision);
    const roundedIntermediate = Math.round(targetFraction * powerForRounding) / powerForRounding;

    const powerForDigitExtraction = Math.pow(10, p);
    const digit = Math.floor(roundedIntermediate * powerForDigitExtraction) % 10;

    return digit;
  }).reduce((accumulator, currentDigit) => accumulator + currentDigit, 0);

  console.log(accumulatedDigitSum);
});
