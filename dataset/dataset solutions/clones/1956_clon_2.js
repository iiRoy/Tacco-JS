"use strict";

const INF_VAL = 1e18;
const MAX_SILVER_CAP = 2500;

let dataString = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenArray = dataString.split(/ |\n/);
let tokenIndex = 0;

function getNextToken(asString) {
  return asString ? tokenArray[tokenIndex++] : +tokenArray[tokenIndex++];
}

function getMultipleTokens(count, asString) {
  return asString ? tokenArray.slice(tokenIndex, (tokenIndex += count)) : tokenArray.slice(tokenIndex, (tokenIndex += count)).map(val => +val);
}

function getMatrixTokens(rows, cols, asString) {
  let resultMatrix = [];
  let currentRows = 0;
  if (asString) {
    for (; currentRows < rows; currentRows++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    for (; currentRows < rows; currentRows++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += cols)).map(val => +val));
    }
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue) {
  let dimensions = arguments;
  let dimLength = dimensions.length;
  let arrayCreationString = "Array(dimensions[" + --dimLength + "]).fill().map(_=>{return " + initialValue + ";})";
  while (--dimLength) {
    arrayCreationString = "Array(dimensions[" + dimLength + "]).fill().map(_=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

const minHeapFactory = (function () {
  function createHeapInstance() {
    return new MinPriorityQueue();
  }

  function MinPriorityQueue() {
    this.dataStore = [];
  }

  MinPriorityQueue.prototype.insertElement = function (item) {
    const storeRef = this.dataStore;
    let currentIndex = storeRef.length++;
    let parentIndex;

    while (currentIndex) {
      parentIndex = (currentIndex - 1) >> 1;
      if (storeRef[parentIndex][0] <= item[0]) break;
      storeRef[currentIndex] = storeRef[parentIndex];
      currentIndex = parentIndex;
    }
    storeRef[currentIndex] = item;
  };

  MinPriorityQueue.prototype.extractMin = function () {
    const storeRef = this.dataStore;
    const minElement = storeRef[0];
    const lastElement = storeRef.pop();

    const currentLength = storeRef.length;
    if (currentLength === 0) return minElement;

    let currentIndex = 0;
    const halfLength = currentLength >> 1;
    const finalLengthMinusOne = currentLength - 1;

    while (currentIndex < halfLength) {
      let childIndex = (currentIndex << 1) + 1;
      if (childIndex < finalLengthMinusOne && storeRef[childIndex + 1][0] < storeRef[childIndex][0]) {
        childIndex++;
      }
      if (lastElement[0] <= storeRef[childIndex][0]) break;
      storeRef[currentIndex] = storeRef[childIndex];
      currentIndex = childIndex;
    }
    storeRef[currentIndex] = lastElement;
    return minElement;
  };

  return createHeapInstance;
})();

let programResult = executeProgram();
if (programResult !== undefined) {
  console.log(programResult);
}

function executeProgram() {
  const [nodeCount, edgeCount, initialSilver] = getMultipleTokens(3);

  const adjList = createMultiDimArray("[]", nodeCount);

  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    const [nodeA, nodeB, silverCost, timeCost] = getMultipleTokens(4);
    const u_idx = nodeA - 1;
    const v_idx = nodeB - 1;
    adjList[u_idx].push([v_idx, silverCost, timeCost]);
    adjList[v_idx].push([u_idx, silverCost, timeCost]);
  }

  const exchangeRates = getMatrixTokens(nodeCount, 2);

  const minTimeMap = createMultiDimArray(INF_VAL, nodeCount, MAX_SILVER_CAP + 1);

  let remainingNodes = nodeCount;
  const finalTimes = createMultiDimArray(INF_VAL, nodeCount);

  const priorityQueueInstance = minHeapFactory();

  let currentInitialSilver = initialSilver > MAX_SILVER_CAP ? MAX_SILVER_CAP : initialSilver;
  
  priorityQueueInstance.insertElement([0, 0, currentInitialSilver]);
  minTimeMap[0][currentInitialSilver] = 0;

  while (remainingNodes) {
    const extractedState = priorityQueueInstance.extractMin();
    if (!extractedState) break;

    const [currentTime, currentNode, currentSilver] = extractedState;

    if (minTimeMap[currentNode][currentSilver] < currentTime) {
        continue;
    }
    
    if (finalTimes[currentNode] === INF_VAL) {
      remainingNodes--;
      finalTimes[currentNode] = currentTime;
    }

    if (currentSilver < MAX_SILVER_CAP) {
      const timeForExchange = exchangeRates[currentNode][1];
      const silverGained = exchangeRates[currentNode][0];
      
      const nextTimeAfterExchange = currentTime + timeForExchange;
      let nextSilverAfterExchange = currentSilver + silverGained;

      if (nextSilverAfterExchange > MAX_SILVER_CAP) {
        nextSilverAfterExchange = MAX_SILVER_CAP;
      }

      if (minTimeMap[currentNode][nextSilverAfterExchange] > nextTimeAfterExchange) {
        minTimeMap[currentNode][nextSilverAfterExchange] = nextTimeAfterExchange;
        priorityQueueInstance.insertElement([nextTimeAfterExchange, currentNode, nextSilverAfterExchange]);
      }
    }

    for (let neighborEdgeIdx = 0; neighborEdgeIdx < adjList[currentNode].length; neighborEdgeIdx++) {
      const [neighborNode, edgeSilverCost, edgeTimeCost] = adjList[currentNode][neighborEdgeIdx];

      const silverAfterTravel = currentSilver - edgeSilverCost;

      if (silverAfterTravel < 0) {
        continue;
      }

      const timeAfterTravel = currentTime + edgeTimeCost;

      if (minTimeMap[neighborNode][silverAfterTravel] > timeAfterTravel) {
        minTimeMap[neighborNode][silverAfterTravel] = timeAfterTravel;
        priorityQueueInstance.insertElement([timeAfterTravel, neighborNode, silverAfterTravel]);
      }
    }
  }
  return finalTimes.slice(1).join("\n");
}