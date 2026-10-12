function calculateArrowValues(inputString) {
  const trimmedInput = inputString.trim();
  const inputLength = trimmedInput.length;
  const valueArray = Array(inputLength + 1).fill(0);

  for (let idx = 0; idx < inputLength; idx++) {
    const charAtIndex = trimmedInput[idx];
    if (charAtIndex === '<') {
      const previousPositionValue = valueArray[idx];
      const requiredNextValue = previousPositionValue + 1;
      valueArray[idx + 1] = Math.max(valueArray[idx + 1], requiredNextValue);
    }
  }

  for (let reverseIdx = inputLength - 1; reverseIdx >= 0; reverseIdx--) {
    const charAtReverseIndex = trimmedInput[reverseIdx];
    if (charAtReverseIndex === '>') {
      const nextPositionValue = valueArray[reverseIdx + 1];
      const requiredCurrentValue = nextPositionValue + 1;
      valueArray[reverseIdx] = Math.max(valueArray[reverseIdx], requiredCurrentValue);
    }
  }

  let totalSumOfValues = 0;
  for (const currentValue of valueArray) {
    totalSumOfValues += currentValue;
  }

  return `${totalSumOfValues}`;
}

console.log(calculateArrowValues(require('fs').readFileSync('/dev/stdin', 'utf8')));
