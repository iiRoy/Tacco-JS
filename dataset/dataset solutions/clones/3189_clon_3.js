'use strict'
function ProcessInput(rawData){
  const parsedNumbers = parseNumericInput(rawData);
  const elementCount = parsedNumbers.shift();
  const sortedElements = insertSortWithBinarySearch(parsedNumbers);

  if (elementCount === 1) {
    const singleElement = sortedElements[0];
    console.log(singleElement);
    return;
  }

  let currentGCD = sortedElements[0];
  const loopLimit = elementCount - 1;
  for (let currentIdx = 0; currentIdx < loopLimit; currentIdx++) {
    const nextElement = sortedElements[currentIdx + 1];
    currentGCD = calculateGCD(nextElement, currentGCD);
  }
  console.log(currentGCD);
}

function calculateGCD(val1, val2){
  const zeroValue = 0;
  while (val1 !== zeroValue && val2 !== zeroValue) {
    if (val1 > val2) {
      val1 %= val2;
    } else {
      val2 %= val1;
    }
  }
  const finalGCD = Math.max(val1, val2);
  return finalGCD;
}

function parseNumericInput(sourceString){
  let remainingString = sourceString;
  const parsedValues = [];
  let currentIdx = 0;

  const numberPattern = /^-*\d+/;
  const whitespacePattern = / +|\n+/;

  while (remainingString.length > 0) {
    const matchedNumber = remainingString.match(numberPattern);
    if (matchedNumber !== null) {
      const numStr = matchedNumber[0];
      parsedValues[currentIdx] = parseInt(numStr, 10);
      remainingString = remainingString.replace(numberPattern, "");
      currentIdx++;
      continue;
    }
    remainingString = remainingString.replace(whitespacePattern, "");
  }
  return parsedValues;
}

function insertSortWithBinarySearch(sourceArray){
  const arrayLength = sourceArray.length;
  const sortedResult = [];

  for (let outerLoopIdx = 0; outerLoopIdx < arrayLength; outerLoopIdx++) {
    let lowerBound = 0;
    let upperBound = arrayLength - 1;
    let midPoint = Math.floor((lowerBound + upperBound) / 2);

    const currentElement = sourceArray[outerLoopIdx];

    while (lowerBound <= upperBound) {
      if (sortedResult[midPoint] < currentElement) {
        lowerBound = midPoint + 1;
      } else {
        upperBound = midPoint - 1;
      }
      midPoint = Math.floor((lowerBound + upperBound) / 2);
    }
    const insertionPosition = midPoint + 1;
    sortedResult.splice(insertionPosition, 0, currentElement);
  }
  return sortedResult;
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const rawInputData = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
ProcessInput(rawInputData);
