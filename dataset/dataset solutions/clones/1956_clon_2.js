"use strict";

// Input handling and parsing utilities
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

/**
 * Retrieves the next value from the input stream.
 * @param {boolean} isStringOutput - If true, returns as string; otherwise, as number.
 * @returns {string|number} The parsed value.
 */
function readNextValue(isStringOutput) {
  return isStringOutput ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Reads a specified number of values from the input stream.
 * @param {number} count - The number of values to read.
 * @param {boolean} asStrings - If true, returns values as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array containing the read values.
 */
function readMultipleValues(count, asStrings) {
  const segment = tokenStream.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return asStrings ? segment : segment.map(val => +val);
}

/**
 * Reads a 2D matrix of values from the input stream.
 * @param {number} rowsCount - Number of rows in the matrix.
 * @param {number} colsCount - Number of columns in each row.
 * @param {boolean} asStrings - If true, returns values as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function readMatrix(rowsCount, colsCount, asStrings) {
  const resultMatrix = [];
  for (let r = 0; r < rowsCount; r++) {
    const rowSegment = tokenStream.slice(tokenIndex, tokenIndex + colsCount);
    tokenIndex += colsCount;
    resultMatrix.push(asStrings ? rowSegment : rowSegment.map(val => +val));
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialFillValue - The value to fill array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialFillValue) {
  const dimensionArguments = arguments;
  let currentDimensionIndex = dimensionArguments.length;
  let arrayConstructionString = `Array(dimensionArguments[${--currentDimensionIndex}]).fill().map(element=>{return ${initialFillValue};})`;
  while (--currentDimensionIndex) {
    arrayConstructionString = `Array(dimensionArguments[${currentDimensionIndex}]).fill().map(element=>${arrayConstructionString})`;
  }
  return eval(arrayConstructionString);
}

// Min-priority queue implementation (using a factory pattern)
const minHeapFactory = (function() {
  /**
   * Provides a new instance of the MinPriorityQueue.
   * @returns {MinPriorityQueue} A fresh priority queue object.
   */
  function createHeapInstance() {
    return new MinPriorityQueue();
  }

  /**
   * Constructor for the MinPriorityQueue.
   * Stores elements as arrays where the first element is the priority.
   */
  function MinPriorityQueue() {
    this.elements = []; // The internal array representing the heap structure.
  }

  /**
   * Adds an element to the priority queue, maintaining heap property.
   * @param {Array} newItem - The element to add, with newItem[0] as its priority.
   */
  MinPriorityQueue.prototype.insertElement = function(newItem) {
    const heapArr = this.elements;
    let currIdx = heapArr.length++; // Start at the end, then increment length.
    let parentIdx;

    // Bubble up the new element to its correct position.
    while (currIdx) {
      parentIdx = (currIdx - 1) >> 1; // Calculate parent index.
      if (heapArr[parentIdx][0] <= newItem[0]) { // If parent has lower or equal priority, stop.
        break;
      }
      heapArr[currIdx] = heapArr[parentIdx]; // Move parent down.
      currIdx = parentIdx; // Move up to parent's position.
    }
    heapArr[currIdx] = newItem; // Place the new element.
  };

  /**
   * Removes and returns the element with the smallest priority.
   * @returns {Array} The element with the minimum priority.
   */
  MinPriorityQueue.prototype.extractMin = function() {
    const heapArr = this.elements;
    const minItem = heapArr[0]; // The root element (minimum priority).
    const lastItem = heapArr.pop(); // Remove the last element.

    const heapLen = heapArr.length;
    if (heapLen === 0) { // If the heap is now empty.
      return minItem;
    }

    let currIdx = 0; // Start bubbling down from the root.
    const halfLen = heapLen >> 1; // Optimization: only need to check up to half length.

    // Bubble down the last element to its correct position.
    while (currIdx < halfLen) {
      let childIdx = (currIdx << 1) + 1; // Left child index.
      // If right child exists and has higher priority than left child.
      if (childIdx < heapLen && heapArr[childIdx + 1][0] < heapArr[childIdx][0]) {
        childIdx++; // Use the right child.
      }
      if (lastItem[0] <= heapArr[childIdx][0]) { // If last item has lower or equal priority, stop.
        break;
      }
      heapArr[currIdx] = heapArr[childIdx]; // Move child up.
      currIdx = childIdx; // Move down to child's position.
    }
    heapArr[currIdx] = lastItem; // Place the last element.
    return minItem; // Return the original minimum element.
  };

  return createHeapInstance; // Expose the factory function.
})();

// Execute the main problem-solving routine.
const programResult = solveProblem();
// Output the result to console if it's not undefined.
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * Solves the main problem using a variation of Dijkstra's algorithm.
 * It finds the minimum time to reach each node with varying silver amounts.
 * @returns {string} The final answer formatted as a newline-separated string.
 */
function solveProblem() {
  // Read initial problem parameters: number of nodes, number of edges, starting silver.
  const [numNodes, numEdges, initialSilver] = readMultipleValues(3);

  // Initialize an adjacency list to represent the graph.
  const adjList = createMultiDimArray("[]", numNodes);
  // Populate the graph with edges and their associated costs.
  for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
    const [nodeA, nodeB, costSilver, costTime] = readMultipleValues(4);
    // Adjust node indices to be 0-based.
    const u = nodeA - 1;
    const v = nodeB - 1;
    // Add edges for an undirected graph.
    adjList[u].push([v, costSilver, costTime]);
    adjList[v].push([u, costSilver, costTime]);
  }

  // Read the silver exchange rates for each node.
  const exchangeRates = readMatrix(numNodes, 2); // exchangeRates[i][0] = silver gained, exchangeRates[i][1] = time cost.

  // Define constants for maximum silver capacity and a large number for infinity.
  const maxSilverCapacity = 2500;
  const infinity = 1e18;

  // Initialize a 3D array to store the minimum time to reach a node with a specific silver amount.
  // minTimeMap[node_index][silver_amount] = minimum_time.
  const minTimeMap = createMultiDimArray(infinity, numNodes, maxSilverCapacity + 1);

  // Counter for nodes whose final minimum time has not yet been determined.
  let unvisitedNodes = numNodes;
  // Array to store the final minimum time to reach each node, regardless of silver amount.
  const finalTimes = createMultiDimArray(infinity, numNodes);

  // Create a new priority queue instance for Dijkstra's algorithm.
  const priorityQueueInstance = minHeapFactory();

  // Cap the initial silver amount at the maximum capacity.
  const startingSilver = Math.min(initialSilver, maxSilverCapacity);

  // Push the initial state into the priority queue: [time, node, silver_amount].
  priorityQueueInstance.insertElement([0, 0, startingSilver]); // Start at node 0, with initial silver, and 0 time.

  // Main loop for Dijkstra's algorithm.
  while (unvisitedNodes > 0) {
    // Extract the state with the minimum time from the priority queue.
    const [currentTime, currentNode, currentSilver] = priorityQueueInstance.extractMin();

    // If this node's final minimum time hasn't been set yet, set it and decrement the counter.
    if (finalTimes[currentNode] === infinity) {
      unvisitedNodes--;
      finalTimes[currentNode] = currentTime;
    }

    // If we've already found a better or equal path to this specific state (node, silver), skip.
    if (minTimeMap[currentNode][currentSilver] < currentTime) {
      continue;
    }

    // Explore the option of exchanging silver at the current node.
    // This is only possible if the current silver is below the maximum capacity.
    if (currentSilver < maxSilverCapacity) {
      const timeToExchange = exchangeRates[currentNode][1]; // Time cost for exchange.
      const silverGained = exchangeRates[currentNode][0]; // Silver gained from exchange.
      const newTimeAfterExchange = currentTime + timeToExchange;
      let newSilverAfterExchange = currentSilver + silverGained;
      // Ensure the silver amount does not exceed the maximum capacity.
      if (newSilverAfterExchange >= maxSilverCapacity) {
        newSilverAfterExchange = maxSilverCapacity;
      }

      // If this new state (current node, new silver amount) offers a better time.
      if (minTimeMap[currentNode][newSilverAfterExchange] > newTimeAfterExchange) {
        minTimeMap[currentNode][newSilverAfterExchange] = newTimeAfterExchange;
        priorityQueueInstance.insertElement([newTimeAfterExchange, currentNode, newSilverAfterExchange]);
      }
    }

    // Explore the option of traveling to adjacent nodes.
    for (let neighborEdgeIdx = 0; neighborEdgeIdx < adjList[currentNode].length; neighborEdgeIdx++) {
      const [neighborNode, travelSilverCost, travelTimeCost] = adjList[currentNode][neighborEdgeIdx];

      // Check if there's enough silver to cover the travel cost.
      const silverAfterTravel = currentSilver - travelSilverCost;
      if (silverAfterTravel < 0) {
        continue; // Not enough silver to make this trip.
      }

      const timeAfterTravel = currentTime + travelTimeCost;

      // If this new state (neighbor node, silver after travel) is not an improvement.
      if (minTimeMap[neighborNode][silverAfterTravel] <= timeAfterTravel) {
        continue; // A path with less or equal time has already been found.
      }
      minTimeMap[neighborNode][silverAfterTravel] = timeAfterTravel;
      priorityQueueInstance.insertElement([timeAfterTravel, neighborNode, silverAfterTravel]);
    }
  }

  // The problem asks for the minimum time to reach nodes 1 through N-1 (excluding the starting node 0).
  // The finalTimes array is 0-indexed, so we slice from index 1.
  return finalTimes.slice(1).join("\n");
}
