const acquireRawData = () => {
  const fileSystemUtility = require("fs");
  return fileSystemUtility.readFileSync("/dev/stdin", "utf8");
};

const fabricateTokenIterator = (rawContent) => {
  const whitespaceSeparatedTokens = rawContent.trim().split(/\s+/);
  let iterationPointer = 0;

  return {
    advanceAndExtractInteger: () => {
      const value = Number(whitespaceSeparatedTokens[iterationPointer]);
      iterationPointer++;
      return value;
    },
    advanceAndExtractLargeInteger: () => {
      const value = BigInt(whitespaceSeparatedTokens[iterationPointer]);
      iterationPointer++;
      return value;
    },
    advanceAndExtractIntegerArray: (quantity) => {
      const collectedValues = [];
      for (let index = 0; index < quantity; index++) {
        collectedValues.push(Number(whitespaceSeparatedTokens[iterationPointer]));
        iterationPointer++;
      }
      return collectedValues;
    },
  };
};

const executionEntry = () => {
  const initialData = acquireRawData();
  const dataProcessor = fabricateTokenIterator(initialData);

  const elementCount = dataProcessor.advanceAndExtractInteger();
  const stepMagnitude = dataProcessor.advanceAndExtractLargeInteger();
  const transitionMap = dataProcessor.advanceAndExtractIntegerArray(elementCount);

  const visitedTimestamps = new Map();
  const traversalHistory = [];

  let currentLocation = 0;
  visitedTimestamps.set(currentLocation, 0);
  traversalHistory.push(currentLocation);

  for (let currentStep = 1; currentStep <= stepMagnitude; currentStep++) {
    currentLocation = transitionMap[currentLocation] - 1;

    if (visitedTimestamps.has(currentLocation)) {
      const firstEncounterStep = visitedTimestamps.get(currentLocation);
      const cycleDuration = currentStep - firstEncounterStep;

      const remainingStepsInTotal = stepMagnitude - BigInt(currentStep);
      const effectiveStepsWithinCycle = remainingStepsInTotal % BigInt(cycleDuration);

      const finalLocationIndexInHistory = firstEncounterStep + Number(effectiveStepsWithinCycle);
      return traversalHistory[finalLocationIndexInHistory] + 1;
    }

    visitedTimestamps.set(currentLocation, currentStep);
    traversalHistory.push(currentLocation);
  }

  return currentLocation + 1;
};

const finalResult = executionEntry();
if (finalResult !== undefined) {
  console.log(finalResult);
}