"use strict";

// Input processing utilities
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenArray = rawData.split(/ |\n/);
var tokenIndex = 0;

function getNextNum() {
  return +tokenArray[tokenIndex++];
}

function getNextStr() {
  return tokenArray[tokenIndex++];
}

function getNextBigInt() {
  return BigInt(tokenArray[tokenIndex++]);
}

function getNNums(count, asStrings) {
  if (asStrings) {
    return tokenArray.slice(tokenIndex, tokenIndex += count);
  } else {
    return tokenArray.slice(tokenIndex, tokenIndex += count).map(val => +val);
  }
}

function getNSortedNums(count, descending) {
  if (descending) {
    return tokenArray.slice(tokenIndex, tokenIndex += count).map(val => +val).sort((valA, valB) => valB - valA);
  } else {
    return tokenArray.slice(tokenIndex, tokenIndex += count).map(val => +val).sort((valA, valB) => valA - valB);
  }
}

function getMatrix(height, width, asStrings) {
  var resultMatrix = [];
  var rowIdx = 0;
  if (asStrings) {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue) {
  var args = arguments;
  var argLength = args.length;
  var evalString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    evalString = "Array(args[" + argLength + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
}

var outputBuffer = [];

function appendToBuffer(content) {
  outputBuffer.push(content);
}

// Fenwick Tree (BIT) class implementation
class FenwickTree {
  // This data structure is 1-indexed
  constructor(size) {
    this.treeData = Array(size + 1).fill(0);
  }

  // Adds a value to a specific position
  update(valueToAdd, position) {
    for (var idx = position, dataRef = this.treeData; idx < dataRef.length; idx += idx & -idx) {
      dataRef[idx] += valueToAdd;
    }
  }

  // Retrieves the prefix sum up to a specific position
  queryPrefixSum(position) {
    for (var currentSum = 0, idx = position; idx > 0; idx -= idx & -idx) {
      currentSum += this.treeData[idx];
    }
    return currentSum;
  }

  // Calculates the sum within a given range [leftBound, rightBound]
  queryRangeSum(leftBound, rightBound) {
    return this.queryPrefixSum(rightBound) - this.queryPrefixSum(leftBound - 1);
  }
}

// Main execution flow
var finalResult = solveProblem();
if (finalResult !== undefined) {
  console.log(String(finalResult));
}
if (outputBuffer.length) {
  console.log(outputBuffer.join("\n"));
}

// Problem solving function
function solveProblem() {
  var [elementCount, rangeParam] = getNNums(2);
  var inputArray = getNNums(elementCount);
  var fenwickInstance = new FenwickTree(300001);

  for (var loopVar = 0; loopVar < elementCount; loopVar++) {
    var lowerBound = Math.max(0, inputArray[loopVar] - rangeParam);
    var upperBound = Math.min(300000, inputArray[loopVar] + rangeParam);
    fenwickInstance.update(1, lowerBound + 1);
    fenwickInstance.update(-1, upperBound + 1);
  }

  var maximumOverlap = 0;
  for (var loopVar = 0; loopVar < elementCount; loopVar++) {
    maximumOverlap = Math.max(maximumOverlap, fenwickInstance.queryPrefixSum(loopVar + 1));
  }
  return maximumOverlap;
}
