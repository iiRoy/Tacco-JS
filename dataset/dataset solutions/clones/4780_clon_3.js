function calculateCombinations(inputString) {
  const parseInputValues = (rawInput) => {
    const parts = rawInput.split(' ');
    const limitK = parseInt(parts[0], 10);
    const sumS = parseInt(parts[1], 10);
    return { limitK, sumS };
  };

  const isValidThirdValue = (value, upperLimit) => {
    const lowerLimit = 0;
    return value >= lowerLimit && value <= upperLimit;
  };

  const { limitK: maxVal, sumS: targetSum } = parseInputValues(inputString);

  let count = 0;

  for (let val1 = 0; val1 <= maxVal; val1++) {
    for (let val2 = 0; val2 <= maxVal; val2++) {
      const val3 = targetSum - (val1 + val2);
      if (isValidThirdValue(val3, maxVal)) {
        count++;
      }
    }
  }

  console.log(count);
}

calculateCombinations(require('fs').readFileSync('/dev/stdin', 'utf8'));
