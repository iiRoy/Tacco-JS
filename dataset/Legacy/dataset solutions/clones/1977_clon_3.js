"use strict";
const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenArray = sourceData.split(/ |\n/);
let currentIndex = 0;

function fetchNext(asString) {
  const tokenValue = tokenArray[currentIndex++];
  return asString ? tokenValue : Number(tokenValue);
}

function fetchMultiple(count, asStrings) {
  const segment = tokenArray.slice(currentIndex, currentIndex + count);
  currentIndex += count;
  return asStrings ? segment : segment.map(val => Number(val));
}

function fetchMatrix(height, width, asStrings) {
  let resultMatrix = [];
  let rowCounter = 0;
  if (asStrings) {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenArray.slice(currentIndex, currentIndex + width));
      currentIndex += width;
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenArray.slice(currentIndex, currentIndex + width).map(item => Number(item)));
      currentIndex += width;
    }
  }
  return resultMatrix;
}

function generateMultiDimArray(initialValue) {
  const args = arguments;
  let dimCount = args.length;
  let arrayCreationString = `Array(args[${--dimCount}]).fill().map(element => { return ${initialValue}; })`;
  while (--dimCount > 0) {
    arrayCreationString = `Array(args[${dimCount}]).fill().map(element => ${arrayCreationString})`;
  }
  return eval(arrayCreationString);
}

(function executeProgram() {
  function processInputAndDetermineOutcome() {
    const targetChar = '7';
    const firstSegment = fetchNext(true); // Retrieve the first token as a string

    let hasSeven = false;
    const checkLimit = Math.min(firstSegment.length, 3); // Check up to the first three characters

    for (let i = 0; i < checkLimit; i++) {
      if (firstSegment[i] == targetChar) { // Use loose equality to match original behavior (e.g., '7' == 7 is true)
        hasSeven = true;
        break; // Found the target character, no need to check further
      }
    }

    return hasSeven ? "Yes" : "No";
  }

  const programOutput = processInputAndDetermineOutcome();
  if (programOutput !== undefined) {
    console.log(programOutput);
  }
})();
