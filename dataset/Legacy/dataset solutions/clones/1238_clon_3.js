var immutLib = require('immutable');

let memoizedInputData = null;
const getAndParseInput = () => {
  if (memoizedInputData === null) {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    memoizedInputData = fileContent.split(" ").map(Number);
  }
  return memoizedInputData;
};

const outputValue = (val) => {
  console.log(val);
  return val;
};

const createNumericSequence = (startBoundary, endBoundary) => {
  const sequenceElements = [];
  let currentIterationValue = startBoundary;
  while (currentIterationValue <= endBoundary) {
    sequenceElements.push(currentIterationValue);
    currentIterationValue++;
  }
  return sequenceElements;
};

const calculateAndDisplayDivisorCount = (parameters) => {
  let totalDivisorsFound = 0;

  const targetDivisor = parameters[2];

  const potentialDivisors = createNumericSequence(parameters[0], parameters[1]);

  for (const candidate of potentialDivisors) {
    const isDivisible = (targetDivisor % candidate) === 0;
    if (isDivisible) {
      totalDivisorsFound++;
    }
  }
  outputValue(totalDivisorsFound);
};

calculateAndDisplayDivisorCount(getAndParseInput());
