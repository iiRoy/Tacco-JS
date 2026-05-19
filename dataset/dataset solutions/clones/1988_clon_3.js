const calculatePairwiseGCD = (firstValue, secondValue) => {
  if (secondValue === 0) {
    return firstValue;
  }
  return calculatePairwiseGCD(secondValue, firstValue % secondValue);
};

function computeArrayGCD(numericValues) {
  if (numericValues.length === 0) {
    return 0;
  }

  if (numericValues.length === 1) {
    return numericValues[0];
  }

  const finalCommonDivisor = numericValues.reduce((currentAccumulator, nextElement) => {
    return calculatePairwiseGCD(currentAccumulator, nextElement);
  });

  return finalCommonDivisor;
}

function processCalculation(rawInputString) {
  const iterationLimit = parseInt(rawInputString, 10);
  let totalCumulativeSum = 0;

  const performNestedSummation = (upperBound) => {
    let currentIterationSum = 0;
    for (let valA = 1; valA <= upperBound; valA++) {
      for (let valB = 1; valB <= upperBound; valB++) {
        for (let valC = 1; valC <= upperBound; valC++) {
          const currentTripletValues = [valA, valB, valC];
          const tripletGCDResult = computeArrayGCD(currentTripletValues);
          currentIterationSum += tripletGCDResult;
        }
      }
    }
    return currentIterationSum;
  };

  totalCumulativeSum = performNestedSummation(iterationLimit);

  console.log(totalCumulativeSum);
}

processCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
