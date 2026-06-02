const parseNumericValue = (strVal) => Number.parseInt(strVal, 10);

const getAbsoluteDifference = (valA, valB) => Math.abs(valA - valB);

function processInputData(rawData){
  const inputLines = rawData.split("\n");

  const firstLineParts = inputLines[0].split(" ");
  const numSteps = parseNumericValue(firstLineParts[0]);
  const maxJumpDistance = parseNumericValue(firstLineParts[1]);

  const secondLineParts = inputLines[1].split(" ");
  const heightsArray = secondLineParts.map(parseNumericValue);

  const minCostToReachStep = new Array(numSteps);

  minCostToReachStep[0] = 0;

  if (numSteps > 1) {
    minCostToReachStep[1] = getAbsoluteDifference(heightsArray[1], heightsArray[0]);
  }

  for (let currentStepIndex = 2; currentStepIndex < numSteps; currentStepIndex++) {
    let minCostForCurrentStep = Infinity;

    for (let prevStepOffset = 1; prevStepOffset <= maxJumpDistance; prevStepOffset++) {
      const previousStepIndex = currentStepIndex - prevStepOffset;

      if (previousStepIndex < 0) {
        break;
      }

      const costFromPrevious = minCostToReachStep[previousStepIndex] +
                               getAbsoluteDifference(heightsArray[currentStepIndex], heightsArray[previousStepIndex]);

      minCostForCurrentStep = Math.min(minCostForCurrentStep, costFromPrevious);
    }
    minCostToReachStep[currentStepIndex] = minCostForCurrentStep;
  }

  console.log(minCostToReachStep[numSteps - 1]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
