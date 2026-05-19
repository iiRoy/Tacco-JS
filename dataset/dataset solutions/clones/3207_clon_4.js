let inputLines = [];

const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (receivedLine) => {
  inputLines.push(receivedLine);
});

inputProcessor.on('close', () => {
  const numericalParameters = inputLines[0].split(" ").map(Number);
  const totalSimulationSteps = numericalParameters[0];
  const conversionUnitA = numericalParameters[1];
  const conversionUnitB = numericalParameters[2];

  const initialResourceAmount = 1;

  const finalResourceAmount = determineFinalResource(
    1,
    totalSimulationSteps,
    initialResourceAmount,
    conversionUnitA,
    conversionUnitB
  );

  console.log(finalResourceAmount);
});

function determineFinalResource(
  currentStepIndex,
  maximumSteps,
  currentResourceQuantity,
  unitA,
  unitB
) {
  if (currentStepIndex > maximumSteps) {
    return currentResourceQuantity;
  }

  const conditionForSimpleIncrement =
    Math.abs(unitA - unitB) === 1 ||
    unitA > unitB ||
    currentResourceQuantity < unitA ||
    currentStepIndex === maximumSteps;

  if (conditionForSimpleIncrement) {
    const nextResourceQuantity = currentResourceQuantity + 1;
    return determineFinalResource(
      currentStepIndex + 1,
      maximumSteps,
      nextResourceQuantity,
      unitA,
      unitB
    );
  } else {
    const nextResourceQuantity =
      Math.floor(currentResourceQuantity / unitA) * unitB +
      (currentResourceQuantity % unitA);
    return determineFinalResource(
      currentStepIndex + 2,
      maximumSteps,
      nextResourceQuantity,
      unitA,
      unitB
    );
  }
}
