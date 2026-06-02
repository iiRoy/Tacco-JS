'use strict'

function processInput(inputData) {
  const [limitVal, targetVal] = inputData.split(" ").map(Number);

  const totalProbabilitySum = Array.from({ length: limitVal }, (_, index) => index + 1)
    .reduce((currentSum, currentIterationValue) => {
      let iterationProbability;
      if (currentIterationValue >= targetVal) {
        iterationProbability = 1;
      } else {
        const requiredDoublingSteps = Math.ceil(Math.log2(targetVal / currentIterationValue));
        iterationProbability = Math.pow(0.5, requiredDoublingSteps);
      }
      return currentSum + iterationProbability;
    }, 0);

  console.log(totalProbabilitySum / limitVal);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
