"use strict";

const generateSequenceProduct = (upperBound) => {
  let accumulatedProduct = 1;
  for (let currentFactor = 2; currentFactor <= upperBound; currentFactor++) {
    accumulatedProduct *= currentFactor;
  }
  return accumulatedProduct;
};

const executeComputation = (incomingData) => {
  incomingData = incomingData.trim().split("\n");
  const [initialParamA, initialParamB] = incomingData[0].split(" ").map(Number);

  const potentialA_numerator = 2 * initialParamA - initialParamB;
  const potentialB_numerator = 2 * initialParamB - initialParamA;
  const commonDivisorForSolution = 3;

  let finalResultCollection = [];

  if (
    potentialA_numerator >= 0 &&
    potentialB_numerator >= 0 &&
    potentialA_numerator % commonDivisorForSolution === 0 &&
    potentialB_numerator % commonDivisorForSolution === 0
  ) {
    const actualA_count = potentialA_numerator / commonDivisorForSolution;
    const actualB_count = potentialB_numerator / commonDivisorForSolution;

    const valueOne = generateSequenceProduct(initialParamA);
    const valueTwo = generateSequenceProduct(2 * actualA_count);
    const valueThree = generateSequenceProduct(actualB_count);

    finalResultCollection.push(valueOne / (valueTwo + valueThree));
  }

  if (finalResultCollection.length === 0) {
    console.log(0);
  } else {
    const totalSum = finalResultCollection.reduce((acc, curr) => acc + curr, 0);
    console.log(totalSum % 10000000000);
  }
};

executeComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));