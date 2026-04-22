'use strict'

function findWays(remainingElements, runningTotal, elementConstraint, targetGoal) {
  if (remainingElements === 0) {
    return runningTotal === targetGoal ? 1 : 0;
  }

  if (runningTotal > targetGoal || runningTotal + (remainingElements * elementConstraint) < targetGoal) {
    return 0;
  }

  let validPathways = 0;
  for (let iterationValue = 0; iterationValue <= elementConstraint; iterationValue++) {
    validPathways += findWays(
      remainingElements - 1,
      runningTotal + iterationValue,
      elementConstraint,
      targetGoal
    );
  }
  return validPathways;
}

function processInputData(inputPayload) {
  const firstLineSegment = inputPayload.substring(0, inputPayload.indexOf('\n') !== -1 ? inputPayload.indexOf('\n') : inputPayload.length);
  const numericalTokens = firstLineSegment.match(/\d+/g);

  const upperBound = parseInt(numericalTokens[0], 10);
  const desiredSum = parseInt(numericalTokens[1], 10);

  const finalCount = findWays(3, 0, upperBound, desiredSum);

  console.log(finalCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));