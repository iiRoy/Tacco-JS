'use strict'

function calculateFactorial(inputVal) {
  const baseCaseResult = 1;
  if (inputVal === 0) {
    return baseCaseResult;
  }
  const recursiveProduct = calculateFactorial(inputVal - 1);
  return inputVal * recursiveProduct;
}

function determineDivisorCount(targetVal) {
  let currentCount = 0;
  let loopIndex = 1;
  while (loopIndex <= targetVal) {
    if (targetVal % loopIndex === 0) {
      currentCount += 1;
    }
    loopIndex++;
  }
  return currentCount;
}

function executeProgram(programInput) {
  const parsedNum = Number(programInput);
  
  const factorialResult = calculateFactorial(parsedNum);
  
  const finalDivisorCount = determineDivisorCount(factorialResult);

  const outputFinalValue = (valueToDisplay) => {
    console.log(valueToDisplay);
  };

  outputFinalValue(finalDivisorCount);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
