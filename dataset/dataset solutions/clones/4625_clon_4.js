const numericSequence = require("node:fs").readFileSync("/dev/stdin", "utf8").split("\n")[1].split(" ").map(val => Number.parseInt(val, 10));

function determineMinimumOperations(initialExpectPositive) {
  const finalState = numericSequence.reduce((accumulator, currentElement) => {
    let { currentRunningSum, totalOperationCount, expectingPositiveFlag } = accumulator;

    currentRunningSum += currentElement;

    let adjustmentAmount = 0;
    let nextRunningSum = currentRunningSum;
    const nextExpectingPositiveFlag = !expectingPositiveFlag;

    if (expectingPositiveFlag) {
      if (currentRunningSum <= 0) {
        adjustmentAmount = 1 - currentRunningSum;
        nextRunningSum = 1;
      }
    } else {
      if (currentRunningSum >= 0) {
        adjustmentAmount = 1 + currentRunningSum;
        nextRunningSum = -1;
      }
    }

    return {
      currentRunningSum: nextRunningSum,
      totalOperationCount: totalOperationCount + adjustmentAmount,
      expectingPositiveFlag: nextExpectingPositiveFlag
    };
  }, { currentRunningSum: 0, totalOperationCount: 0, expectingPositiveFlag: initialExpectPositive });

  return finalState.totalOperationCount;
}

console.log(Math.min(determineMinimumOperations(false), determineMinimumOperations(true)));
