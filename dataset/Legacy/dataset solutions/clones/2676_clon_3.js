'use strict';

const parseNumericLine = (lineOfNumbers) => {
  const stringValues = lineOfNumbers.split(' ');
  const integerValues = stringValues.map(currentString => parseInt(currentString, 10));
  return integerValues;
};

const processInputData = (inputLines) => {
  const firstLine = inputLines[0];
  const parsedNumbers = parseNumericLine(firstLine);

  const valueA = parsedNumbers[0];
  const valueB = parsedNumbers[1];
  const valueC = parsedNumbers[2];

  const sumOfOtherSides = valueB + valueC;

  let calculatedResult;
  if (sumOfOtherSides > valueA) {
    calculatedResult = sumOfOtherSides - valueA;
  } else {
    calculatedResult = 0;
  }

  console.log(calculatedResult);
};

const fileSystemModule = require("fs");
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputLinesArray = standardInputContent.split('\n');

processInputData(inputLinesArray);
