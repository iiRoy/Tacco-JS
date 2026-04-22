const retrieveInputManager = () => {
  const lineBuffer = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
  let currentLineIndex = 0;
  return {
    obtainNextLine: () => {
      if (currentLineIndex >= lineBuffer.length) {
        throw new Error("No further input lines available.");
      }
      return lineBuffer[currentLineIndex++];
    },
    hasRemainingLines: () => currentLineIndex < lineBuffer.length
  };
};

const inputGateway = retrieveInputManager();

const transformStringToNumericArray = (sourceString) => sourceString.split(" ").map(Number);

const outputResult = (dataValue) => console.log(dataValue);

const determineFinalCount = (firstParameter, secondParameter) => {
  // Original logic:
  // if (N >= M / 2) { output = Math.floor(M / 2); }
  // else { output = Math.floor(N + ((M - (N * 2)) / 4)); }
  // firstParameter is N, secondParameter is M
  return (firstParameter * 2 >= secondParameter)
    ? Math.floor(secondParameter / 2)
    : Math.floor(firstParameter + ((secondParameter - (firstParameter * 2)) / 4));
};

const orchestrateExecution = () => {
  const inputLine = inputGateway.obtainNextLine();
  const numericValues = transformStringToNumericArray(inputLine);
  const valueN = numericValues[0];
  const valueM = numericValues[1];

  const calculatedOutcome = determineFinalCount(valueN, valueM);
  outputResult(calculatedOutcome);
};

orchestrateExecution();