'use strict';

function processInput(inputStringData) {
  const firstLineContent = inputStringData.split('\n')[0];
  const numberStrings = firstLineContent.split(' ');
  const parsedNumbersArray = numberStrings.map(strValue => Number(strValue));

  const startingSum = 0;
  const totalSumOfElements = parsedNumbersArray.reduce((currentAccumulator, elementValue) => currentAccumulator + elementValue, startingSum);

  const highestValue = Math.max(...parsedNumbersArray);
  let tripledHighestValue = highestValue * 3;

  const totalSumParity = totalSumOfElements % 2;
  const tripledHighestValueParity = tripledHighestValue % 2;

  if (totalSumParity !== tripledHighestValueParity) {
    tripledHighestValue = tripledHighestValue + 3;
  }

  const differenceValue = tripledHighestValue - totalSumOfElements;
  const finalCalculatedResult = differenceValue / 2;

  console.log(finalCalculatedResult);
}

const fileSystemUtility = require("fs");
const standardInputPath = "/dev/stdin";
const inputBuffer = fileSystemUtility.readFileSync(standardInputPath, "utf8");
processInput(inputBuffer);
