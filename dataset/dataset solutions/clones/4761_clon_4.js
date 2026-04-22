'use strict';

const productOfSequence = (val) => {
  if (val === 0) {
    return 1;
  }
  return Array.from({ length: val }, (_, idx) => idx + 1).reduce((accumulator, currentNumber) => accumulator * currentNumber, 1);
};

const factorCount = (targetNumber) => {
  if (targetNumber === 1) {
    return 1;
  }

  let workingNumber = targetNumber;
  let totalDivisors = 1;
  let primeIterator = 2;

  const primePowerMap = new Map();

  while (primeIterator * primeIterator <= workingNumber) {
    if (workingNumber % primeIterator === 0) {
      primePowerMap.set(primeIterator, (primePowerMap.get(primeIterator) || 0) + 1);
      workingNumber /= primeIterator;
    } else {
      primeIterator++;
    }
  }

  if (workingNumber > 1) {
    primePowerMap.set(workingNumber, (primePowerMap.get(workingNumber) || 0) + 1);
  }

  for (const exponentValue of primePowerMap.values()) {
    totalDivisors *= (exponentValue + 1);
  }

  return totalDivisors;
};

const orchestrateComputation = (rawData) => {
  const numericInput = Number(rawData);
  const computedFactorial = productOfSequence(numericInput);
  console.log(factorCount(computedFactorial));
};

const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");
orchestrateComputation(standardInputData);