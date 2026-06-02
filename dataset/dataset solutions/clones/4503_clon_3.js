"use strict";

const parseNumericInput = (inputString) => {
  const trimmedInput = inputString.trim();
  const stringComponents = trimmedInput.split(" ");
  const numericComponents = stringComponents.map(Number);
  return numericComponents;
};

const evaluateCondition = (currentDifference, limitValue) => {
  if (currentDifference < 0) {
    return "delicious";
  } else if (currentDifference < limitValue) {
    return "safe";
  } else {
    return "dangerous";
  }
};

const processInputData = (rawData) => {
  const parsedValues = parseNumericInput(rawData);
  const thresholdX = parsedValues[0];
  const valueA = parsedValues[1];
  const valueB = parsedValues[2];

  const calculatedDifference = valueB - valueA;

  const finalResult = evaluateCondition(calculatedDifference, thresholdX);
  return finalResult;
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
