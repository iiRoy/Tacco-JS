'use strict'

function parseSpaceSeparatedNumbers(lineString) {
  const spaceDelimiter = ' ';
  return lineString.split(spaceDelimiter).map(strValue => Number(strValue));
}

function calculateRangeDifference(numberArray) {
  if (numberArray.length === 0) {
    // Consistent behavior with Math.max/min on empty arrays
    return Math.max(...numberArray) - Math.min(...numberArray);
  }
  const highestValue = Math.max(...numberArray);
  const lowestValue = Math.min(...numberArray);
  return highestValue - lowestValue;
}

function processInputData(rawData) {
  const newlineSeparator = '\n';
  const inputLines = rawData.split(newlineSeparator);

  // The first line typically contains the count of elements, though not used in the original logic.
  const elementCount = Number(inputLines[0]);

  // The second line contains the actual numeric values, space-separated.
  const numericValues = parseSpaceSeparatedNumbers(inputLines[1]);

  const finalResult = calculateRangeDifference(numericValues);

  console.log(finalResult);
}

const fileSystemUtility = require("fs");
const standardInputFile = "/dev/stdin";
const textEncoding = "utf8";

const fileContentBuffer = fileSystemUtility.readFileSync(standardInputFile, textEncoding);
const processedContent = fileContentBuffer.trim();

processInputData(processedContent);
