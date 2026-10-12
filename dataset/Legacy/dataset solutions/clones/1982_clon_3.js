const determineOutputValue = (numberToCheck) => {
  const DIVISOR_THREE = 3;
  const DIVISOR_FIVE = 5;

  const isMultipleOfThree = (numberToCheck % DIVISOR_THREE === 0);
  const isMultipleOfFive = (numberToCheck % DIVISOR_FIVE === 0);

  if (isMultipleOfThree || isMultipleOfFive) {
    return '0';
  } else {
    return numberToCheck;
  }
};

const processInput = (rawData) => {
  const trimmedInput = rawData.trim();
  const upperLimit = parseInt(trimmedInput);

  const computedValues = [];

  for (let currentIteration = 0; currentIteration < upperLimit; currentIteration++) {
    const actualNumber = currentIteration + 1;
    const valueForArray = determineOutputValue(actualNumber);
    computedValues.push(valueForArray);
  }

  const totalSum = computedValues.reduce((accumulator, currentItem) => {
    const numericValue = parseInt(currentItem);
    return accumulator + numericValue;
  }, 0);

  console.log(totalSum);
  return totalSum;
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
