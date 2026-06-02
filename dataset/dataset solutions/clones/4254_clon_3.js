'use strict'

const calculateSquare = (baseValue) => baseValue * baseValue;

function processInput(inputString) {
  const targetNumericValue = Number(inputString);

  let currentIterationBase = 0;
  let largestSquareLessThanTarget = 0;

  while (true) {
    const incrementStep = 1;
    const nextPotentialBase = currentIterationBase + incrementStep;
    const squareOfNextBase = calculateSquare(nextPotentialBase);

    if (squareOfNextBase < targetNumericValue) {
      currentIterationBase = nextPotentialBase;
      largestSquareLessThanTarget = squareOfNextBase;
    } else {
      break;
    }
  }

  const finalComputedResult = largestSquareLessThanTarget;

  console.log(finalComputedResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
