'use strict';

const processInputAndCalculate = (rawData) => {
  const extractedLines = rawData.match(/[^\r\n]+/g);
  const primarySequence = extractedLines[0];
  const secondarySequence = extractedLines[1];

  const divergenceSum = [...primarySequence].reduce((currentSum, charFromPrimary, currentIdx) => {
    const charFromSecondary = secondarySequence[currentIdx];
    return currentSum + (charFromPrimary !== charFromSecondary ? 1 : 0);
  }, 0);

  return divergenceSum;
};

const orchestrateExecution = (dataFetcherModule) => {
  const acquiredData = dataFetcherModule.readFileSync("/dev/stdin", "utf8");
  const computedOutcome = processInputAndCalculate(acquiredData);
  console.log(computedOutcome);
};

orchestrateExecution(require("fs"));