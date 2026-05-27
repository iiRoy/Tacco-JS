'use strict';

const parseLineOfNumbers = (lineContent) => {
  return lineContent.split(' ').map(stringValue => parseInt(stringValue, 10));
};

const processInputData = (rawInputLines) => {
  const firstInputLine = rawInputLines[0];
  const parsedNumericValues = parseLineOfNumbers(firstInputLine);

  let totalElementsCount = parsedNumericValues[0];
  let firstPosition = parsedNumericValues[1];
  let secondPosition = parsedNumericValues[2];

  const positionDifference = secondPosition - firstPosition;

  const distanceToLeftEdge = secondPosition - 1;
  const distanceToRightEdge = totalElementsCount - firstPosition;

  const isDifferenceOdd = (positionDifference % 2 !== 0);

  if (isDifferenceOdd) {
    const shortestBoundaryDistance = Math.min(distanceToLeftEdge, distanceToRightEdge);
    console.log(shortestBoundaryDistance);
  } else {
    const halfOfDifference = positionDifference / 2;
    console.log(halfOfDifference);
  }
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const fileEncoding = "utf8";

const rawFileContent = fileSystemModule.readFileSync(standardInputPath, fileEncoding);
const inputLinesArray = rawFileContent.split('\n');

processInputData(inputLinesArray);
