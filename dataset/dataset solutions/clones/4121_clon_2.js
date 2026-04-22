"use strict";

const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

let tokenStream = rawData.split(/ |\n/);
let tokenIdx = 0;

function readInt() {
  return +tokenStream[tokenIdx++];
}

function readString() {
  return tokenStream[tokenIdx++];
}

function readBigInt() {
  return BigInt(tokenStream[tokenIdx++]);
}

function readArray(count, asStrings) {
  if (asStrings) {
    return tokenStream.slice(tokenIdx, (tokenIdx += count));
  } else {
    return tokenStream.slice(tokenIdx, (tokenIdx += count)).map(elem => +elem);
  }
}

function readMatrix(rows, cols, asStrings) {
  let resultMatrix = [];
  let rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIdx, (tokenIdx += cols)));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(
        tokenStream.slice(tokenIdx, (tokenIdx += cols)).map(element => +element)
      );
    }
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue) {
  const dimensions = arguments;
  let dimLength = dimensions.length;
  let arrayCreatorString =
    "Array(dimensions[" +
    --dimLength +
    "]).fill().map(_ => {return " +
    initialValue +
    ";})";
  while (--dimLength) {
    arrayCreatorString =
      "Array(dimensions[" + dimLength + "]).fill().map(_ => " +
      arrayCreatorString +
      ")";
  }
  return eval(arrayCreatorString);
}

const finalResult = solutionEntry();

if (finalResult !== undefined) {
  console.log(finalResult);
}

function solutionEntry() {
  const numElements = readInt();
  let outputValues = createMultiDimArray(0, numElements);
  const configMatrix = readMatrix(numElements - 1, 3);
  for (let outerIndex = 0; outerIndex < numElements - 1; outerIndex++) {
    for (let innerIndex = 0; innerIndex <= outerIndex; innerIndex++) {
      if (outputValues[innerIndex] < configMatrix[outerIndex][1]) {
        outputValues[innerIndex] = configMatrix[outerIndex][1];
      }
      outputValues[innerIndex] =
        Math.ceil(outputValues[innerIndex] / configMatrix[outerIndex][2]) *
          configMatrix[outerIndex][2] +
        configMatrix[outerIndex][0];
    }
  }
  return outputValues.join("\n");
}