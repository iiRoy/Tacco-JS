const { createInterface: establishInputChannel } = require('readline');

let storedSegments = [];

const interactionAgent = establishInputChannel({
  input: process.stdin,
  output: process.stdout
});

interactionAgent.on('line', (segmentEntry) => {
  storedSegments.push(segmentEntry);
});

interactionAgent.on('close', () => {
  initiateTransformation(storedSegments);
});

function initiateTransformation(entireInputCollection) {
  const quantityOfTests = parseInt(entireInputCollection[0], 10);
  const primaryIdentifier = entireInputCollection[1];
  const testScenarios = entireInputCollection.slice(2, 2 + quantityOfTests);

  const terminalSymbolOfIdentifier = primaryIdentifier.slice(-1);
  const identifierUnitLength = primaryIdentifier.length;

  let positiveResultsAccumulator = 0;

  const evaluateScenarioRecursively = (
    currentTestString,
    targetFinalChar,
    targetStringLen,
    currentStepOffset = 0
  ) => {
    if (currentStepOffset >= currentTestString.length) {
      return false;
    }

    const derivedIndexPosition = (targetStringLen - 1) * (1 + currentStepOffset);

    if (
      derivedIndexPosition < currentTestString.length &&
      currentTestString[derivedIndexPosition] === targetFinalChar
    ) {
      return true;
    }

    return evaluateScenarioRecursively(
      currentTestString,
      targetFinalChar,
      targetStringLen,
      currentStepOffset + 1
    );
  };

  testScenarios.forEach((singleScenario) => {
    if (
      evaluateScenarioRecursively(
        singleScenario,
        terminalSymbolOfIdentifier,
        identifierUnitLength
      )
    ) {
      positiveResultsAccumulator++;
    }
  });

  console.log(positiveResultsAccumulator);
}