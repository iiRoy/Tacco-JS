function processInput(sourceText) {
  const lineSegments = sourceText.split('\n');
  const initialValue = Number(lineSegments.shift().split(' ')[0]);

  const computeDigitSum = (numberValue) => {
    return String(numberValue).split('').reduce((accumulator, digitChar) => accumulator + Number(digitChar), 0);
  };

  const minimumSum = Array.from({ length: 100000 }, (_, index) => index + 1)
    .reduce((currentMin, multiplier) => {
      const product = initialValue * multiplier;
      const sumOfDigits = computeDigitSum(product);
      return Math.min(currentMin, sumOfDigits);
    }, Infinity);

  console.log(minimumSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
