"use strict";

const dataStore = {
  initialContent: null,
  processedNumbers: []
};

const obtainSource = (debugStatus) => {
  if (debugStatus) {
    return "30000 30000 30000";
  } else {
    return Buffer.from(require("node:fs").readFileSync("/dev/stdin")).toString("utf8").trim();
  }
};

const decomposeText = (inputLine) => {
  let firstDivider = inputLine.indexOf(' ');
  let secondDivider = inputLine.indexOf(' ', firstDivider + 1);

  let firstValue = Number(inputLine.substring(0, firstDivider));
  let secondValue = Number(inputLine.substring(firstDivider + 1, secondDivider));
  let thirdValue = Number(inputLine.substring(secondDivider + 1));

  dataStore.processedNumbers = [firstValue, secondValue, thirdValue];
};

const determineOutcome = (numericParameters) => {
  const [paramOne, paramTwo, paramThree] = numericParameters;
  
  if (paramOne < paramTwo + paramThree) {
    return "";
  } else {
    return "-1";
  }
};

const presentResult = (finalText) => {
  process.stdout.write(finalText + "\n");
};

const allowDebugging = false;
dataStore.initialContent = obtainSource(allowDebugging);
decomposeText(dataStore.initialContent);
const computedResult = determineOutcome(dataStore.processedNumbers);
presentResult(computedResult);