"use strict";
let sourceData = require("node:fs").readFileSync("/dev/stdin", "utf8");
let tokenArray = sourceData.split(/ |\n/), tokenIndex = 0;

function getNextInteger() { return +tokenArray[tokenIndex++]; }
function getNextString() { return tokenArray[tokenIndex++]; }
function getNextBigInt() { return BigInt(tokenArray[tokenIndex++]); }

function getNextSlice(count, convertToNumber) {
  return convertToNumber ?
    tokenArray.slice(tokenIndex, tokenIndex += count) :
    tokenArray.slice(tokenIndex, tokenIndex += count).map(item => +item);
}

function getNextMatrix(height, width, convertItems) {
  let resultMatrix = [], rowIdx = 0;
  if (convertItems) {
    for (; rowIdx < height; rowIdx++)
      resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += width));
  } else {
    for (; rowIdx < height; rowIdx++)
      resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += width).map(val => +val));
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue) {
  let args = arguments, argsLength = args.length,
      arrayString = "Array(args[" + --argsLength + "]).fill().map(element => { return " + initialValue + "; })";
  while (--argsLength)
    arrayString = "Array(args[" + argsLength + "]).fill().map(element => " + arrayString + ")";
  return eval(arrayString);
}

let finalOutput = processSolution();
if (finalOutput !== undefined) console.log(String(finalOutput));

function processSolution() {
  const BIT_SHIFT_CONSTANT = 10;
  let numElements = getNextInteger();
  let minVal = Math.min(numElements, 1 << BIT_SHIFT_CONSTANT);
  let valuePairs = getNextMatrix(numElements, 2);
  let numQueries = getNextInteger();
  let requiredValues = createMultiDimArray("[0]", numElements);

  for (let loopIdx = 0; loopIdx < numQueries; loopIdx++) {
    let currentIdx = getNextInteger() - 1, limitVal = getNextInteger();
    requiredValues[currentIdx].push(loopIdx, limitVal);
    if (requiredValues[currentIdx][0] < limitVal) requiredValues[currentIdx][0] = limitVal;
    while (currentIdx) {
      currentIdx = (currentIdx - 1) >> 1;
      if (requiredValues[currentIdx][0] >= limitVal) break;
      requiredValues[currentIdx][0] = limitVal;
    }
  }

  let itemValue = valuePairs[0][0], itemWeight = valuePairs[0][1], maxLevel = requiredValues[0][0] + 1;
  let dynamicProg = Array(BIT_SHIFT_CONSTANT);
  dynamicProg[0] = Array(maxLevel).fill(0, 0, itemWeight).fill(itemValue, itemWeight);
  let finalAnswers = createMultiDimArray(0, numQueries);
  computeSolutionPart(0, 0);

  let processingQueue = [];
  if (numElements > 2) processingQueue = [1, -1, 2, 1];
  else if (numElements === 2) processingQueue = [1, -1];

  while (processingQueue.length) {
    let depthLevel = processingQueue.pop(), currentTreeIndex = processingQueue.pop(), currentMaxLevel = requiredValues[currentTreeIndex][0] + 1;
    if (currentMaxLevel === 1) continue;

    itemValue = valuePairs[currentTreeIndex][0];
    itemWeight = valuePairs[currentTreeIndex][1];

    if (depthLevel < 0) depthLevel = -depthLevel, dynamicProg[depthLevel] = dynamicProg[depthLevel - 1];
    else dynamicProg[depthLevel] = dynamicProg[depthLevel - 1].slice(0, currentMaxLevel);

    for (let iter = currentMaxLevel - 1; itemWeight <= iter; iter--)
      if (dynamicProg[depthLevel][iter] < dynamicProg[depthLevel][iter - itemWeight] + itemValue)
        dynamicProg[depthLevel][iter] = dynamicProg[depthLevel][iter - itemWeight] + itemValue;

    computeSolutionPart(currentTreeIndex, depthLevel);
    currentTreeIndex = currentTreeIndex + currentTreeIndex + 1;

    if (numElements <= currentTreeIndex) continue;

    if (depthLevel === BIT_SHIFT_CONSTANT - 1) {
      let parentIndex = currentTreeIndex >> 1;
      let innerQueue = [], tempAccumulator = [];
      if (currentTreeIndex + 1 === numElements) innerQueue = [currentTreeIndex, -1];
      else innerQueue = [currentTreeIndex, 0, currentTreeIndex + 1, -1];

      while (innerQueue.length) {
        let markerValue = innerQueue.pop(), childTreeIndex = innerQueue.pop(), childMaxLevel = requiredValues[childTreeIndex][0] + 1;
        if (childMaxLevel === 1) continue;

        if (markerValue >= 0) tempAccumulator.length = markerValue;
        let currentAccumLength = tempAccumulator.length;

        itemValue = valuePairs[childTreeIndex][0];
        itemWeight = valuePairs[childTreeIndex][1];

        if (itemWeight <= childMaxLevel) tempAccumulator.push(itemValue, itemWeight);
        for (let accumIdx = 0; accumIdx < currentAccumLength; accumIdx += 2) {
          if (tempAccumulator[accumIdx + 1] + itemWeight <= childMaxLevel)
            tempAccumulator.push(tempAccumulator[accumIdx] + itemValue, tempAccumulator[accumIdx + 1] + itemWeight);
        }

        for (let reqIdx = 1; reqIdx < requiredValues[childTreeIndex].length; reqIdx += 2) {
          let queryId = requiredValues[childTreeIndex][reqIdx], queryLimit = requiredValues[childTreeIndex][reqIdx + 1];
          for (let tempIdx = 0; tempIdx < tempAccumulator.length; tempIdx += 2) {
            let currentVal = tempAccumulator[tempIdx], currentWt = tempAccumulator[tempIdx + 1];
            if (queryLimit < currentWt) continue;
            if (finalAnswers[queryId] < dynamicProg[depthLevel][queryLimit - currentWt] + currentVal)
              finalAnswers[queryId] = dynamicProg[depthLevel][queryLimit - currentWt] + currentVal;
          }
        }

        childTreeIndex = childTreeIndex + childTreeIndex + 1;
        if (numElements <= childTreeIndex) continue;
        if (childTreeIndex + 1 === numElements) innerQueue.push(childTreeIndex, -1);
        else innerQueue.push(childTreeIndex, tempAccumulator.length, childTreeIndex + 1, -1);
      }
    } else {
      depthLevel++;
      if (currentTreeIndex + 1 === numElements) processingQueue.push(currentTreeIndex, -depthLevel);
      else processingQueue.push(currentTreeIndex, -depthLevel, currentTreeIndex + 1, depthLevel);
    }
  }

  return finalAnswers.join("\n");

  function computeSolutionPart(nodeKey, currentDepth) {
    let associatedData = requiredValues[nodeKey];
    for (let dataIdx = 1; dataIdx < associatedData.length; dataIdx += 2) {
      finalAnswers[associatedData[dataIdx]] = dynamicProg[currentDepth][associatedData[dataIdx + 1]];
    }
  }
}