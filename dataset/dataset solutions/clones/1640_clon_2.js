"use strict";

let dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenStream = dataSource.split(/[ \n]/), streamPointer = 0;

function readNumericDatum() {
  return +tokenStream[streamPointer++];
}

function readStringDatum() {
  return tokenStream[streamPointer++];
}

function readLargeInteger() {
  return BigInt(tokenStream[streamPointer++]);
}

function getArraySlice(count, asStrings) {
  return asStrings ? tokenStream.slice(streamPointer, streamPointer += count) : tokenStream.slice(streamPointer, streamPointer += count).map(valItem => +valItem);
}

function getMatrixData(rowDimension, columnDimension, stringMode) {
  let resultContainer = [], rowIndex = 0;
  if (stringMode) {
    for (; rowIndex < rowDimension; rowIndex++) {
      resultContainer.push(tokenStream.slice(streamPointer, streamPointer += columnDimension));
    }
  } else {
    for (; rowIndex < rowDimension; rowIndex++) {
      resultContainer.push(tokenStream.slice(streamPointer, streamPointer += columnDimension).map(valItem => +valItem));
    }
  }
  return resultContainer;
}

function buildMultiDimensionalArray(baseValue) {
  let dimensionArgs = arguments, loopLength = dimensionArgs.length, constructionString = "Array(dimensionArgs[" + --loopLength + "]).fill().map( _ => { return " + baseValue + "; })";
  while (--loopLength) {
    constructionString = "Array(dimensionArgs[" + loopLength + "]).fill().map( _ => " + constructionString + ")";
  }
  return eval(constructionString);
}


class FenwickAccumulator {
  constructor(sizeParam) {
    this.valueStore = Array(sizeParam + 1).fill(0.0);
  }

  incrementValue(delta, position) {
    for (let currentDelta = delta, idx = position; idx < this.valueStore.length; idx += idx & -idx) {
      this.valueStore[idx] += currentDelta;
    }
  }

  querySum(position) {
    let totalSum = 0.0;
    for (let idx = position; idx > 0; idx -= idx & -idx) {
      totalSum += this.valueStore[idx];
    }
    return totalSum;
  }
}


let finalResult = processInputAndSolve();

if (finalResult !== void 0) {
  console.log(String(finalResult));
}


function processInputAndSolve() {
  let totalItems = readNumericDatum();
  let totalQueries = readNumericDatum();
  let itemCategories = getArraySlice(totalItems);
  let categoryIndices = buildMultiDimensionalArray("[1.0]", totalItems);
  let accumulatorTree = new FenwickAccumulator(totalItems + 1);
  let activeCategories = new Set();

  for (let itemIdx = 0; itemIdx < totalItems; itemIdx++) {
    let currentCategory = --itemCategories[itemIdx];
    categoryIndices[currentCategory].push(itemIdx + 1);
    if (!activeCategories.has(currentCategory)) {
      activeCategories.add(currentCategory);
      accumulatorTree.incrementValue(1.0, itemIdx + 1);
    }
  }

  for (let itemIdx = 0; itemIdx < totalItems; itemIdx++) {
    categoryIndices[itemIdx].push(totalItems + 1);
  }

  let queryRanges = Array(totalQueries);
  for (let queryIdx = 0; queryIdx < totalQueries; queryIdx++) {
    queryRanges[queryIdx] = [readNumericDatum(), readNumericDatum(), queryIdx];
  }

  queryRanges.sort((queryA, queryB) => queryA[0] - queryB[0]);

  let solutionResults = Array(totalQueries), currentSegmentEnd = 1;

  for (let queryIdx = 0; queryIdx < totalQueries; queryIdx++) {
    let [leftBoundary, rightBoundary, originalQueryIndex] = queryRanges[queryIdx];
    while (currentSegmentEnd < leftBoundary) {
      let markerCategory = itemCategories[currentSegmentEnd - 1];
      let nextCategoryPosition = ++categoryIndices[markerCategory][0];
      accumulatorTree.incrementValue(-1.0, currentSegmentEnd);
      accumulatorTree.incrementValue(1.0, categoryIndices[markerCategory][nextCategoryPosition]);
      currentSegmentEnd++;
    }
    solutionResults[originalQueryIndex] = accumulatorTree.querySum(rightBoundary);
  }
  return solutionResults.join("\n");
}