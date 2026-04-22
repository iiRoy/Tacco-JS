function logResult(messageToDisplay) {
  console.log(messageToDisplay);
}

function getSolutionCount(currentGoal, indexInCoefficients, availableCoefficients) {
  if (currentGoal === 0) {
    return 1;
  }
  if (currentGoal < 0 || indexInCoefficients === availableCoefficients.length) {
    return 0;
  }

  let currentCoefficientValue = availableCoefficients[indexInCoefficients];
  let accumulatedWays = 0;

  for (let currentMultiplier = 0; currentMultiplier * currentCoefficientValue <= currentGoal; currentMultiplier++) {
    accumulatedWays += getSolutionCount(
      currentGoal - currentMultiplier * currentCoefficientValue,
      indexInCoefficients + 1,
      availableCoefficients
    );
  }
  return accumulatedWays;
}

function executeCalculation(rawInputString) {
  let numericalComponents = rawInputString.trim().split(" ").map(Number);

  let firstValue = numericalComponents[0];
  let secondValue = numericalComponents[1];
  let thirdValue = numericalComponents[2];
  let targetSumValue = numericalComponents[3];

  let listOfCoefficients = [firstValue, secondValue, thirdValue];

  listOfCoefficients.sort((a, b) => b - a);

  let finalCount = getSolutionCount(targetSumValue, 0, listOfCoefficients);

  logResult(finalCount);
}

executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));