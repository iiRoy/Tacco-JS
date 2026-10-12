"use strict";

const fileSystem = require("fs");
let rawData = fileSystem.readFileSync("/dev/stdin", "utf8");
let tokenArray = rawData.split(/ |\n/);
let currentTokenIndex = 0;

function readNextInt() {
  return +tokenArray[currentTokenIndex++];
}

function readNextString() {
  return tokenArray[currentTokenIndex++];
}

function readNextBigInt() {
  return BigInt(tokenArray[currentTokenIndex++]);
}

function readIntsArray(count, mapToNumber = true) {
  const sliceEnd = currentTokenIndex + count;
  const slicedTokens = tokenArray.slice(currentTokenIndex, sliceEnd);
  currentTokenIndex = sliceEnd;
  return mapToNumber ? slicedTokens.map(val => +val) : slicedTokens;
}

function readSortedIntsArray(count, descending = false) {
  const numbers = readIntsArray(count);
  return descending ? numbers.sort((a, b) => b - a) : numbers.sort((a, b) => a - b);
}

function readMatrixData(height, width, mapToNumber = true) {
  const matrixRows = [];
  for (let rowIdx = 0; rowIdx < height; rowIdx++) {
    const rowSliceEnd = currentTokenIndex + width;
    const rowTokens = tokenArray.slice(currentTokenIndex, rowSliceEnd);
    currentTokenIndex = rowSliceEnd;
    matrixRows.push(mapToNumber ? rowTokens.map(val => +val) : rowTokens);
  }
  return matrixRows;
}

function createMultiDimensionalArray(initialValue) {
  const args = arguments;
  let argCount = args.length;
  let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

let outputLinesBuffer = [];
function addLineToOutput(content) {
  outputLinesBuffer.push(content);
}

class FenwickTree { // 1-indexed
  constructor(treeSize) {
    this.dataArray = Array(treeSize + 1).fill(0);
  }

  static getLowBit(val) {
    return val & -val;
  }

  update(value, idx) {
    const currentArray = this.dataArray;
    for (let i = idx; i < currentArray.length; i += FenwickTree.getLowBit(i)) {
      currentArray[i] += value;
    }
  }

  query(idx) {
    let cumulativeSum = 0;
    for (let i = idx; i > 0; i -= FenwickTree.getLowBit(i)) {
      cumulativeSum += this.dataArray[i];
    }
    return cumulativeSum;
  }

  queryRange(startIdx, endIdx) { // [startIdx, endIdx]
    return this.query(endIdx) - this.query(startIdx - 1);
  }
}

const MIN_COORDINATE_VALUE = 0;
const MAX_COORDINATE_VALUE = 300000;
const FENWICK_TREE_CAPACITY = MAX_COORDINATE_VALUE + 1;

function executeSolution() {
  const [numElements, rangeK] = readIntsArray(2);
  const valueArray = readIntsArray(numElements);

  const fenwickTreeInstance = new FenwickTree(FENWICK_TREE_CAPACITY);

  for (let loopIndex = 0; loopIndex < numElements; loopIndex++) {
    const currentValue = valueArray[loopIndex];
    
    const potentialLower = currentValue - rangeK;
    const potentialUpper = currentValue + rangeK;

    const currentLowerBound = Math.max(MIN_COORDINATE_VALUE, potentialLower);
    const currentUpperBound = Math.min(MAX_COORDINATE_VALUE, potentialUpper);

    fenwickTreeInstance.update(1, currentLowerBound + 1);
    fenwickTreeInstance.update(-1, currentUpperBound + 1);
  }

  let maximumOverlap = 0;
  for (let loopIndex = 0; loopIndex < numElements; loopIndex++) {
    const currentOverlapCount = fenwickTreeInstance.query(loopIndex + 1);
    maximumOverlap = Math.max(maximumOverlap, currentOverlapCount);
  }

  return maximumOverlap;
}

const programResult = executeSolution();
if (programResult !== undefined) {
  console.log(String(programResult));
}
if (outputLinesBuffer.length > 0) {
  console.log(outputLinesBuffer.join("\n"));
}
