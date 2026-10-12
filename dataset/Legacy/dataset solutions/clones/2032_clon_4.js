"use strict";

const fileContentSource = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokenStream = fileContentSource.split(/ |\n/);
let currentTokenPointer = 0;

function retrieveNextValue(asString) {
  return asString ? inputTokenStream[currentTokenPointer++] : +inputTokenStream[currentTokenPointer++];
}

function retrieveMultipleValues(count, asString) {
  const values = inputTokenStream.slice(currentTokenPointer, currentTokenPointer + count);
  currentTokenPointer += count;
  return asString ? values : values.map(v => +v);
}

function retrieveMatrixValues(height, width, asString) {
  const resultMatrix = [];
  for (let r = 0; r < height; r++) {
    const rowValues = inputTokenStream.slice(currentTokenPointer, currentTokenPointer + width);
    currentTokenPointer += width;
    resultMatrix.push(asString ? rowValues : rowValues.map(v => +v));
  }
  return resultMatrix;
}

function createMultiDimArray(initialVal, ...dimensions) {
    if (dimensions.length === 0) {
        return initialVal;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array(currentDimensionSize).fill(null).map(() => createMultiDimArray(initialVal, ...remainingDimensions));
}

function modularProduct() {
    for (var args = arguments, res = args[0], idx = args.length; --idx;) {
        // This function relies on a global 'mod' variable which is not defined.
        // It is included for behavioral equivalence of unused code, but its execution
        // would require 'mod' to be defined in the global scope.
        res = ((res >> 16) * args[idx] % mod * 65536 + (res & 65535) * args[idx]) % mod;
    }
    return res;
}

const finalOutput = calculateAllPairDistances();
if (finalOutput !== undefined) {
    console.log(finalOutput);
}

function calculateAllPairDistances() {
  const nodeCount = retrieveNextValue();
  const specialConnectionA = retrieveNextValue();
  const specialConnectionB = retrieveNextValue();

  const adjacencyList = createMultiDimArray([], nodeCount + 1);

  for (let i = 1; i < nodeCount; i++) {
    adjacencyList[i].push(i + 1);
    adjacencyList[i + 1].push(i);
  }

  adjacencyList[specialConnectionA].push(specialConnectionB);
  adjacencyList[specialConnectionB].push(specialConnectionA);

  const distanceFrequency = createMultiDimArray(0, nodeCount - 1);

  for (let startNode = 1; startNode <= nodeCount; startNode++) {
    const currentDistances = createMultiDimArray(Infinity, nodeCount + 1);
    const traversalQueue = [];
    
    currentDistances[startNode] = 0;
    traversalQueue.push(startNode);

    let queueHead = 0;
    while (queueHead < traversalQueue.length) {
      const currentNode = traversalQueue[queueHead++];

      for (const neighborNode of adjacencyList[currentNode]) {
        if (currentDistances[neighborNode] === Infinity) {
          currentDistances[neighborNode] = currentDistances[currentNode] + 1;
          traversalQueue.push(neighborNode);
        }
      }
    }

    for (let targetNode = startNode + 1; targetNode <= nodeCount; targetNode++) {
      const pathLength = currentDistances[targetNode];
      if (pathLength > 0 && pathLength <= nodeCount - 1) {
        distanceFrequency[pathLength - 1]++;
      }
    }
  }

  return distanceFrequency.join("\n");
}
