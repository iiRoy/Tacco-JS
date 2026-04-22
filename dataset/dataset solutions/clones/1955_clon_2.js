"use strict";

var dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = dataSource.split(/ |\n/),
  tokenIndex = 0;

function retrieveNextItem(isString) {
  return isString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

function fetchMultipleItems(count, asStrings) {
  return asStrings ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

function acquireMatrix(height, width, asStrings) {
  let resultRows = [],
    rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < height; rowIndex++) {
      resultRows.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      resultRows.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
  }
  return resultRows;
}

function createMultiDimArray(initialValue) {
  let args = arguments,
    len = args.length,
    resultExpr = "Array(args[" + --len + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--len) {
    resultExpr = "Array(args[" + len + "]).fill().map(x=>" + resultExpr + ")";
  }
  return eval(resultExpr);
}

var minHeapQueueFactory = (function() {
  function createNewQueue() {
    return new MinHeapDataStructure();
  }

  function MinHeapDataStructure() {
    this.internalStorage = [];
  }

  MinHeapDataStructure.prototype.insertElement = function(elementToInsert) {
    let storageRef = this.internalStorage,
      currentIndex = storageRef.length++,
      parentIndex;
    while (currentIndex) {
      parentIndex = (currentIndex - 1) >> 1;
      if (storageRef[parentIndex][0] <= elementToInsert[0]) break;
      storageRef[currentIndex] = storageRef[parentIndex], currentIndex = parentIndex;
    }
    storageRef[currentIndex] = elementToInsert;
  };

  MinHeapDataStructure.prototype.extractMinimum = function() {
    let storageRef = this.internalStorage,
      extractedMin = storageRef[0],
      lastElement = storageRef.pop(),
      currentLength = storageRef.length,
      heapIndex = 0,
      childIndex;
    if (currentLength === 0) return extractedMin;
    let lastParentIndex = currentLength >> 1;
    currentLength--;
    while (heapIndex < lastParentIndex) {
      childIndex = (heapIndex << 1) + 1;
      if (childIndex < currentLength && storageRef[childIndex + 1][0] < storageRef[childIndex][0]) childIndex++;
      if (lastElement[0] <= storageRef[childIndex][0]) break;
      storageRef[heapIndex] = storageRef[childIndex], heapIndex = childIndex;
    }
    storageRef[heapIndex] = lastElement;
    return extractedMin;
  };
  return createNewQueue;
})();

var programResult = executeMainLogic();
if (programResult !== undefined) console.log(programResult);

function executeMainLogic() {
  let [numNodes, numEdges, initialSilver] = fetchMultipleItems(3);
  const INFINITE_VALUE = 1e18,
    maxSilverCapacity = (numNodes - 1) * 50;
  let adjList = createMultiDimArray("[]", numNodes);
  for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
    let [nodeA, nodeB, silverCost, timeCost] = fetchMultipleItems(4);
    nodeA--, nodeB--;
    adjList[nodeA].push([nodeB, silverCost, timeCost]);
    adjList[nodeB].push([nodeA, silverCost, timeCost]);
  }
  let exchangeRates = acquireMatrix(numNodes, 2);
  let minTimes = createMultiDimArray(INFINITE_VALUE, numNodes, maxSilverCapacity + 1);
  let remainingNodes = numNodes;
  let finalTimes = createMultiDimArray(INFINITE_VALUE, numNodes);
  let priorityQueueInstance = minHeapQueueFactory();
  if (initialSilver > maxSilverCapacity) initialSilver = maxSilverCapacity;
  priorityQueueInstance.insertElement([0, 0, initialSilver]);
  minTimes[0][initialSilver] = 0;
  while (remainingNodes) {
    let [currentTime, currentNode, currentCoin] = priorityQueueInstance.extractMinimum();
    if (minTimes[currentNode][currentCoin] < currentTime) continue;
    if (finalTimes[currentNode] === INFINITE_VALUE) remainingNodes--, finalTimes[currentNode] = currentTime;
    if (currentCoin < maxSilverCapacity) {
      let newTime = currentTime + exchangeRates[currentNode][1];
      let newCoin = currentCoin + exchangeRates[currentNode][0];
      if (newCoin >= maxSilverCapacity) newCoin = maxSilverCapacity;
      if (minTimes[currentNode][newCoin] > newTime) minTimes[currentNode][newCoin] = newTime, priorityQueueInstance.insertElement([newTime, currentNode, newCoin]);
    }
    if (currentCoin && minTimes[currentNode][currentCoin - 1] > currentTime) minTimes[currentNode][currentCoin - 1] = currentTime, priorityQueueInstance.insertElement([currentTime, currentNode, currentCoin - 1]);
    for (let pathIdx = 0; pathIdx < adjList[currentNode].length; pathIdx++) {
      let newCoin = currentCoin - adjList[currentNode][pathIdx][1];
      if (newCoin < 0) continue;
      let newTime = currentTime + adjList[currentNode][pathIdx][2],
        neighborNode = adjList[currentNode][pathIdx][0];
      if (minTimes[neighborNode][newCoin] > newTime) minTimes[neighborNode][newCoin] = newTime, priorityQueueInstance.insertElement([newTime, neighborNode, newCoin]);
    }
  }
  return finalTimes.slice(1).join("\n");
}