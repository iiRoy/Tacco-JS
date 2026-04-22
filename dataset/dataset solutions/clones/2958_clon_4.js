'use strict'

function AnotherProcessor(dataString) {
  const [firstVal, secondVal] = dataString.split(' ').map(Number);

  const determineSuccessLikelihood = (initialMagnitude, targetMagnitude) => {
    if (initialMagnitude >= targetMagnitude) {
      return 1.0;
    }
    const necessaryDoublingSteps = Math.ceil(Math.log2(targetMagnitude / initialMagnitude));
    return Math.pow(0.5, necessaryDoublingSteps);
  };

  const integerSequence = Array.from({ length: firstVal }, (_, index) => index + 1);

  const totalLikelihoodSum = integerSequence.reduce((cumulativeSum, currentMagnitude) => {
    return cumulativeSum + determineSuccessLikelihood(currentMagnitude, secondVal);
  }, 0.0);

  const finalAverageLikelihood = totalLikelihoodSum / firstVal;

  console.log(finalAverageLikelihood);
}

AnotherProcessor(require("fs").readFileSync("/dev/stdin", "utf8").trim());