function calculateResult(rawInputString) {
  const inputParts = rawInputString.split(" ");
  const [elementCount, initialValue] = inputParts.map(Number);

  const sequenceValues = Array.from({ length: elementCount }, (_, currentIndex) => initialValue + currentIndex);

  const firstValueInSequence = sequenceValues[0];
  const lastValueInSequence = sequenceValues[elementCount - 1];

  const totalArithmeticSum = (firstValueInSequence + lastValueInSequence) * elementCount / 2;

  let valueToExcludeFromSum;

  if (sequenceValues.includes(0)) {
    valueToExcludeFromSum = 0;
  } else if (lastValueInSequence < 0) {
    valueToExcludeFromSum = lastValueInSequence;
  } else {
    valueToExcludeFromSum = firstValueInSequence;
  }

  console.log(totalArithmeticSum - valueToExcludeFromSum);
}

calculateResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
