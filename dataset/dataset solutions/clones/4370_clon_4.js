"use strict";

const dataTransformer = (rawInput) => {
  const processedNumbers = rawInput
    .split(/\n/)
    .slice(1)
    .map(entry => ~~entry);

  const frequencyRegister = processedNumbers.reduce((accumulator, currentNumber) => {
    accumulator.set(currentNumber, (accumulator.get(currentNumber) || 0) + 1);
    return accumulator;
  }, new Map());

  const oddFrequencyCount = Array.from(frequencyRegister.values()).reduce((totalOdd, currentCount) => {
    return totalOdd + (currentCount % 2 !== 0 ? 1 : 0);
  }, 0);

  return oddFrequencyCount;
};

const retrieveDataFromSource = (pathIdentifier, dataEncoding) => {
    const externalModuleLoader = typeof require !== 'undefined' ? require : null;
    if (externalModuleLoader) {
        const fileSystemAccess = externalModuleLoader("fs");
        const fileContentReader = (p, e) => fileSystemAccess.readFileSync(p, e);
        return fileContentReader(pathIdentifier, dataEncoding);
    }
    throw new Error("File system operations not available in this runtime.");
};

const displayOutputValue = (resultValue) => {
    console.log(resultValue);
};

const orchestrateExecution = () => {
  try {
    const sourceContent = retrieveDataFromSource("/dev/stdin", "utf8");
    const computedResult = dataTransformer(sourceContent);
    displayOutputValue(computedResult);
  } catch (operationError) {
    displayOutputValue("Error encountered: " + operationError.message);
  }
};

orchestrateExecution();