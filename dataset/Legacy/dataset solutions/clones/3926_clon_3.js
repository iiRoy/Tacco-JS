'use strict';

function readInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function writeOutput(dataToOutput) {
  console.log(dataToOutput);
}

const conversionStrategies = {
  0: (inputString) => inputString,
  1: (inputString) => parseInt(inputString, 10),
  2: (inputString) => inputString.split(" "),
  3: (inputString) => inputString.split("\n"),
  4: (inputString) => inputString.split(" ").map((itemStr) => Number(itemStr)),
  5: (inputString) => inputString.split("\n").map((itemStr) => Number(itemStr)),
  6: (inputString) => inputString.split(""),
  7: (inputString) => inputString.split("").map((itemStr) => Number(itemStr)),
};

function processInputData(inputString, conversionType) {
  if (conversionType in conversionStrategies) {
    return conversionStrategies[conversionType](inputString);
  }
  return undefined;
}

function executeLogic(rawData) {
  const LINE_DELIMITER = "\n";
  const SPACE_DELIMITER = " ";

  let processedLines = processInputData(rawData, 3);
  processedLines.shift();

  let totalSum = 0;

  const parseLineValues = (lineContent) => {
    const parts = lineContent.split(SPACE_DELIMITER);
    const valA = parseInt(parts[0], 10);
    const valB = parseInt(parts[1], 10);
    return { valA, valB };
  };

  for (let lineIndex = 0; lineIndex < processedLines.length; lineIndex++) {
    const currentLine = processedLines[lineIndex];

    if (!currentLine.trim()) {
      continue;
    }

    const { valA, valB } = parseLineValues(currentLine);

    if (valA < valB) {
      totalSum += valB;
    }
  }

  writeOutput(totalSum);
}

executeLogic(readInput());
