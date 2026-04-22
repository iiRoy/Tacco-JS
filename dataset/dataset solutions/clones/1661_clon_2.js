"use strict";
let dataStream = require("node:fs").readFileSync("/data/input.txt", "utf-8");
let tokenBuffer = dataStream.split(/ |\n/);
let tokenIndex = 0;

function retrieveNextNumber() {
  return +tokenBuffer[tokenIndex++];
}

function retrieveNextString() {
  return tokenBuffer[tokenIndex++];
}

function retrieveNextBigInt() {
  return BigInt(tokenBuffer[tokenIndex++]);
}

function retrieveNumberArray(numElements, asStrings) {
  let startIndex = tokenIndex;
  tokenIndex += numElements;
  return asStrings ? tokenBuffer.slice(startIndex, tokenIndex) : tokenBuffer.slice(startIndex, tokenIndex).map( (element) => +element );
}

function retrieveMatrix(numRows, numCols, asStrings) {
  let outputMatrix = [];
  let currentRow = 0;
  if (asStrings) {
    for (; currentRow < numRows; currentRow++) {
      outputMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += numCols));
    }
  } else {
    for (; currentRow < numRows; currentRow++) {
      outputMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += numCols).map( (element) => +element ));
    }
  }
  return outputMatrix;
}

function generateMultiDimensionalArray(initialValue) {
  let allArguments = arguments;
  let argumentCount = allArguments.length;
  let arrayConstructionString = "Array(allArguments[" + --argumentCount + "]).fill().map( (item) => { return " + initialValue + "; } )";
  while (--argumentCount) {
    arrayConstructionString = "Array(allArguments[" + argumentCount + "]).fill().map( (item) => " + arrayConstructionString + " )";
  }
  return eval(arrayConstructionString);
}

let finalOutcome = processAlgorithm();
if (finalOutcome !== undefined) {
  console.log(String(finalOutcome));
}

function processAlgorithm() {
  const largeNumber = 1_000_000_000;
  let totalItems = retrieveNextNumber();
  let categorizedCoordinates = generateMultiDimensionalArray("[]", 4);
  const directionMapping = { "UP": 0, "RIGHT": 1, "DOWN": 2, "LEFT": 3 };

  for (let loopCount = 0; loopCount < totalItems; loopCount++) {
    let pointX = retrieveNextNumber();
    let pointY = retrieveNextNumber();
    let directionLabel = retrieveNextString();
    categorizedCoordinates[directionMapping[directionLabel]].push([pointX, pointY, pointX - pointY, pointX + pointY]);
  }

  let minimumDistance = largeNumber;

  categorizedCoordinates[0].sort((pA, pB) => pA[0] - pB[0]);
  categorizedCoordinates[1].sort((pA, pB) => pA[1] - pB[1]);
  categorizedCoordinates[2].sort((pA, pB) => pA[0] - pB[0]);
  categorizedCoordinates[3].sort((pA, pB) => pA[1] - pB[1]);

  for (let sortAxis = 0; sortAxis < 2; sortAxis++) {
    let currentSearchIndex = 0;
    if (categorizedCoordinates[sortAxis + 2].length) {
      for (let pointIterator = 0; pointIterator < categorizedCoordinates[sortAxis].length; pointIterator++) {
        while (categorizedCoordinates[sortAxis + 2].length > currentSearchIndex && categorizedCoordinates[sortAxis + 2][currentSearchIndex][sortAxis] < categorizedCoordinates[sortAxis][pointIterator][sortAxis]) {
          currentSearchIndex++;
        }
        if (currentSearchIndex === categorizedCoordinates[sortAxis + 2].length) {
          break;
        }
        if (categorizedCoordinates[sortAxis][pointIterator][sortAxis] === categorizedCoordinates[sortAxis + 2][currentSearchIndex][sortAxis] && categorizedCoordinates[sortAxis][pointIterator][1 - sortAxis] < categorizedCoordinates[sortAxis + 2][currentSearchIndex][1 - sortAxis]) {
          minimumDistance = Math.min(minimumDistance, categorizedCoordinates[sortAxis + 2][currentSearchIndex][1 - sortAxis] - categorizedCoordinates[sortAxis][pointIterator][1 - sortAxis]);
        }
      }
    }
  }

  categorizedCoordinates[0].sort((pA, pB) => pA[3] - pB[3]);
  categorizedCoordinates[1].sort((pA, pB) => pA[3] - pB[3]);
  categorizedCoordinates[2].sort((pA, pB) => pA[3] - pB[3]);
  categorizedCoordinates[3].sort((pA, pB) => pA[3] - pB[3]);

  for (let comparisonIndex = 0; comparisonIndex < 4; comparisonIndex += 2) {
    let currentSearchIndex = 0;
    if (categorizedCoordinates[comparisonIndex + 1].length) {
      for (let pointIterator = 0; pointIterator < categorizedCoordinates[comparisonIndex].length; pointIterator++) {
        while (categorizedCoordinates[comparisonIndex + 1].length > currentSearchIndex && categorizedCoordinates[comparisonIndex + 1][currentSearchIndex][3] < categorizedCoordinates[comparisonIndex][pointIterator][3]) {
          currentSearchIndex++;
        }
        if (currentSearchIndex === categorizedCoordinates[comparisonIndex + 1].length) {
          break;
        }
        if (categorizedCoordinates[comparisonIndex][pointIterator][3] === categorizedCoordinates[comparisonIndex + 1][currentSearchIndex][3] && categorizedCoordinates[comparisonIndex][pointIterator][1 - comparisonIndex / 2] < categorizedCoordinates[comparisonIndex + 1][currentSearchIndex][1 - comparisonIndex / 2]) {
          minimumDistance = Math.min(minimumDistance, (categorizedCoordinates[comparisonIndex + 1][currentSearchIndex][1 - comparisonIndex / 2] - categorizedCoordinates[comparisonIndex][pointIterator][1 - comparisonIndex / 2]) * 2);
        }
      }
    }
  }

  categorizedCoordinates[0].sort((pA, pB) => pA[2] - pB[2]);
  categorizedCoordinates[1].sort((pA, pB) => pA[2] - pB[2]);
  categorizedCoordinates[2].sort((pA, pB) => pA[2] - pB[2]);
  categorizedCoordinates[3].sort((pA, pB) => pA[2] - pB[2]);

  for (let primaryCategory = 0; primaryCategory < 2; primaryCategory++) {
    let currentSearchIndex = 0;
    if (categorizedCoordinates[3 - primaryCategory].length) {
      for (let pointIterator = 0; pointIterator < categorizedCoordinates[primaryCategory].length; pointIterator++) {
        while (categorizedCoordinates[3 - primaryCategory].length > currentSearchIndex && categorizedCoordinates[3 - primaryCategory][currentSearchIndex][2] < categorizedCoordinates[primaryCategory][pointIterator][2]) {
          currentSearchIndex++;
        }
        if (currentSearchIndex === categorizedCoordinates[3 - primaryCategory].length) {
          break;
        }
        if (categorizedCoordinates[primaryCategory][pointIterator][2] === categorizedCoordinates[3 - primaryCategory][currentSearchIndex][2] && categorizedCoordinates[primaryCategory][pointIterator][0] < categorizedCoordinates[3 - primaryCategory][currentSearchIndex][0]) {
          minimumDistance = Math.min(minimumDistance, (categorizedCoordinates[3 - primaryCategory][currentSearchIndex][0] - categorizedCoordinates[primaryCategory][pointIterator][0]) * 2);
        }
      }
    }
  }

  return minimumDistance === largeNumber ? "NO_COLLISION" : minimumDistance * 5;
}