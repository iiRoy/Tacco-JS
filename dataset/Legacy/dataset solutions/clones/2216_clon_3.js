'use strict';

const generateRepeatedString = (characterToRepeat, repetitionCount) => {
  let resultAccumulator = '';
  let currentCount = 0;
  while (currentCount < repetitionCount) {
    resultAccumulator += characterToRepeat;
    currentCount++;
  }
  return resultAccumulator;
};

const processInputData = (inputLinesArray) => {
  const primaryInputLine = inputLinesArray[0];

  const stringParts = primaryInputLine.split(' ');

  const numericalValues = stringParts.map(strVal => parseInt(strVal, 10));

  const firstNumericalValue = numericalValues[0];
  const secondNumericalValue = numericalValues[1];

  const stringRepresentationOfFirst = String(firstNumericalValue);
  const stringRepresentationOfSecond = String(secondNumericalValue);

  const repeatedStringOne = generateRepeatedString(stringRepresentationOfFirst, secondNumericalValue);
  const repeatedStringTwo = generateRepeatedString(stringRepresentationOfSecond, firstNumericalValue);

  let finalOutputString;
  if (firstNumericalValue > secondNumericalValue) {
    finalOutputString = repeatedStringTwo;
  } else {
    finalOutputString = repeatedStringOne;
  }

  console.log(finalOutputString);
};

const fileSystemModule = require("fs");
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputLines = rawInputContent.split('\n');

processInputData(inputLines);
