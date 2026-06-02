function processData(rawInputString) {
  const numericStrings = rawInputString.split(' ');

  const numA = Number(numericStrings[0]);
  const numB = Number(numericStrings[1]);
  const kthElementIndex = Number(numericStrings[2]);

  const minVal = Math.min(numA, numB);
  const maxVal = Math.max(numA, numB);

  const checkCommonDivisibility = (candidateDivisor, value1, value2) => {
    const isDivisorOfFirst = Number.isInteger(value1 / candidateDivisor);
    const isDivisorOfSecond = Number.isInteger(value2 / candidateDivisor);
    return isDivisorOfFirst && isDivisorOfSecond;
  };

  let foundDivisors = [];
  for (let i = 1; i <= minVal; i++) {
    if (checkCommonDivisibility(i, minVal, maxVal)) {
      foundDivisors.push(i);
    }
  }

  const targetIndex = foundDivisors.length - kthElementIndex;
  const desiredDivisor = foundDivisors[targetIndex];

  console.log(desiredDivisor);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
