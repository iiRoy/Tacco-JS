"use strict";

const parseInteger = (numericString) => Number.parseInt(numericString, 10);

const processInputData = (rawDataLines) => {
  const totalElementsCountString = rawDataLines[0];
  const totalElementsCount = parseInteger(totalElementsCountString);

  const elementStrings = rawDataLines[1].split(" ");
  const numericValuesArray = elementStrings.map(parseInteger);

  let currentExpectedSequenceValue = 1;

  for (const currentArrayElement of numericValuesArray) {
    const doesElementMatchExpected = (currentArrayElement === currentExpectedSequenceValue);

    if (doesElementMatchExpected) {
      currentExpectedSequenceValue++;
    }
  }

  let finalCalculatedResult;
  if (currentExpectedSequenceValue === 1) {
    finalCalculatedResult = -1;
  } else {
    const matchedSequenceLength = currentExpectedSequenceValue - 1;
    finalCalculatedResult = totalElementsCount - matchedSequenceLength;
  }

  return finalCalculatedResult;
};

const readAndPrepareStdin = () => {
  const fileSystemModule = require("fs");
  const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf-8");
  const processedInputLines = rawInputContent.trim().split("\n");
  return processedInputLines;
};

const inputLinesFromStdin = readAndPrepareStdin();
const outputValue = processInputData(inputLinesFromStdin);
console.log(outputValue);
