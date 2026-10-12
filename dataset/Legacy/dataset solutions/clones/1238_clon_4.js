const immutableModule = require('immutable'); // Retain unused import as per rules

let memoizedInputData = null;

const retrieveNumericInput = () => {
  if (memoizedInputData === null) {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    memoizedInputData = fileContent.split(" ").map(Number);
  }
  return memoizedInputData;
};

const emitOutputValue = (valueToDisplay) => {
  console.log(valueToDisplay);
  return valueToDisplay;
};

const constructIntegerSequence = (initialValue, finalValue) => {
  if (initialValue > finalValue) {
    return [];
  }
  return Array.from({ length: finalValue - initialValue + 1 }, (_, index) => initialValue + index);
};

const determineDivisorCount = (parameters) => {
  const lowerBound = parameters[0];
  const upperBound = parameters[1];
  const targetDivisor = parameters[2];

  const numbersInSpan = constructIntegerSequence(lowerBound, upperBound);

  const countOfDivisible = numbersInSpan.filter(currentNumber => targetDivisor % currentNumber === 0).length;

  emitOutputValue(countOfDivisible);
};

determineDivisorCount(retrieveNumericInput());
