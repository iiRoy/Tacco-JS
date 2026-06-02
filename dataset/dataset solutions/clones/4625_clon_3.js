const fileSystemModule = require("fs");
const rawFileData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const dataLineContent = rawFileData.split("\n")[1];
const numericInputArray = dataLineContent.split(" ").map(strValue => parseInt(strValue, 10));

function calculateMinimumOperations(initialPhaseFlag) {
  let currentRunningSum = 0;
  let totalOperationCount = 0;
  let isCurrentlyNegativeTargetPhase = initialPhaseFlag;

  for (const currentNumber of numericInputArray) {
    currentRunningSum += currentNumber;

    let targetValueForSum;
    let requiredAdjustment;

    if (isCurrentlyNegativeTargetPhase) {
      targetValueForSum = -1;
      if (currentRunningSum >= 0) {
        requiredAdjustment = 1 + currentRunningSum;
        totalOperationCount += requiredAdjustment;
        currentRunningSum = targetValueForSum;
      }
      isCurrentlyNegativeTargetPhase = false;
    } else {
      targetValueForSum = 1;
      if (currentRunningSum <= 0) {
        requiredAdjustment = 1 - currentRunningSum;
        totalOperationCount += requiredAdjustment;
        currentRunningSum = targetValueForSum;
      }
      isCurrentlyNegativeTargetPhase = true;
    }
  }
  return totalOperationCount;
}

const resultFromFalseStart = calculateMinimumOperations(false);
const resultFromTrueStart = calculateMinimumOperations(true);

console.log(Math.min(resultFromFalseStart, resultFromTrueStart));
