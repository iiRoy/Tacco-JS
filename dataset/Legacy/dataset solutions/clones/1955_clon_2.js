"use strict";

// This script reads input from standard input, processes it, and prints results.

// Import the Node.js file system module to read data.
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the entire input string into an array of tokens using spaces or newlines as delimiters.
// A pointer `tokenPointer` keeps track of the current position in the `inputTokens` array.
var inputTokens = fileContent.split(/ |\n/);
var tokenPointer = 0;

/**
 * Retrieves the next token from the global input stream.
 *
 * @param {boolean} asString - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token.
 */
function retrieveNextValue(asString) {
  return asString ? inputTokens[tokenPointer++] : +inputTokens[tokenPointer++];
}

/**
 * Retrieves a specified number of consecutive tokens from the input stream.
 *
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asString - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function retrieveMultipleValues(count, asString) {
  const startIndex = tokenPointer;
  tokenPointer += count; // Advance the pointer by 'count'.
  if (asString) {
    return inputTokens.slice(startIndex, tokenPointer);
  } else {
    return inputTokens.slice(startIndex, tokenPointer).map(value => +value);
  }
}

/**
 * Retrieves a 2D array (matrix) of tokens from the input stream.
 *
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asString - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<Array<string|number>>} The constructed matrix.
 */
function retrieveMatrix(height, width, asString) {
  let resultMatrix = [];
  let currentRow = 0;
  if (asString) {
    for (; currentRow < height; currentRow++) {
      resultMatrix.push(inputTokens.slice(tokenPointer, tokenPointer += width));
    }
  } else {
    for (; currentRow < height; currentRow++) {
      resultMatrix.push(inputTokens.slice(tokenPointer, tokenPointer += width).map(value => +value));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a specified value or expression.
 * This function uses `eval` to construct the array based on provided dimensions.
 *
 * @param {string} initValueExpr - A string representing the initial value or expression for the innermost array elements.
 * @param {...number} dimensions - A variable number of arguments representing the sizes of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initValueExpr) {
  const dimensions = arguments;
  let currentDimIndex = dimensions.length;
  // Start building the array creation string from the innermost dimension.
  let arrayConstructionCode = "Array(dimensions[" + --currentDimIndex + "]).fill().map(item => { return " + initValueExpr + "; })";
  // Wrap with outer dimensions.
  while (--currentDimIndex) {
    arrayConstructionCode = "Array(dimensions[" + currentDimIndex + "]).fill().map(item => " + arrayConstructionCode + ")";
  }
  return eval(arrayConstructionCode); // Execute the generated code.
}

// An Immediately Invoked Function Expression (IIFE) to encapsulate the priority queue implementation.
var priorityQueueFactory = (function() {
  /**
   * Factory function that returns a new instance of the MinHeapQueue.
   *
   * @returns {MinHeapQueue} A new priority queue object.
   */
  function createQueueInstance() {
    return new MinHeapQueue();
  }

  /**
   * Constructor for a Min-Priority Queue, implemented using a binary heap.
   * Elements are expected to be arrays, where the first element `[0]` is the priority key.
   */
  function MinHeapQueue() {
    this.dataStore = []; // The internal array representing the heap.
  }

  /**
   * Inserts a new element into the priority queue, maintaining the min-heap property.
   *
   * @param {Array} element - The element to insert. Its first component `element[0]` is treated as the priority.
   */
  MinHeapQueue.prototype.insertElement = function(element) {
    const heapArray = this.dataStore;
    let currentPosition = heapArray.length++; // Get current length, then increment for new element.
    let parentPosition;

    // Bubble up the new element until its correct position is found.
    while (currentPosition > 0) {
      parentPosition = (currentPosition - 1) >> 1; // Calculate parent index.
      if (heapArray[parentPosition][0] <= element[0]) {
        break; // If parent's priority is less than or equal to element's, correct position found.
      }
      heapArray[currentPosition] = heapArray[parentPosition]; // Move parent down.
      currentPosition = parentPosition; // Move up to parent's position.
    }
    heapArray[currentPosition] = element; // Place the new element.
  };

  /**
   * Extracts and returns the element with the minimum priority from the queue.
   * The heap property is restored after extraction.
   *
   * @returns {Array|undefined} The element with the lowest priority, or `undefined` if the queue was empty.
   */
  MinHeapQueue.prototype.extractMin = function() {
    const heapArray = this.dataStore;
    const minElement = heapArray[0]; // The minimum element is always at the root (index 0).
    const lastElement = heapArray.pop(); // Remove the last element from the heap.
    const currentSize = heapArray.length;

    if (currentSize === 0) {
      return minElement; // If the heap is now empty, return the extracted element.
    }

    let rootPosition = 0;
    const halfSize = currentSize >> 1; // Optimization: only need to check nodes up to half the size.
    const lastValidIndex = currentSize - 1;

    // Bubble down the `lastElement` to its correct position.
    while (rootPosition < halfSize) {
      let childPosition = (rootPosition << 1) + 1; // Left child index.
      // If a right child exists and has a lower priority than the left child, choose the right child.
      if (childPosition < lastValidIndex && heapArray[childPosition + 1][0] < heapArray[childPosition][0]) {
        childPosition++;
      }
      if (lastElement[0] <= heapArray[childPosition][0]) {
        break; // If `lastElement`'s priority is less than or equal to the chosen child's, correct position found.
      }
      heapArray[rootPosition] = heapArray[childPosition]; // Move child up.
      rootPosition = childPosition; // Move down to child's position.
    }
    heapArray[rootPosition] = lastElement; // Place the `lastElement`.
    return minElement; // Return the original minimum element.
  };

  return createQueueInstance; // Return the factory function for creating priority queues.
})();

// Execute the main program logic and store its return value.
var programResult = executeProgram();

// If the program's execution produced a result (not undefined), print it to the console.
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * The main function implementing the core algorithm to find minimum travel times.
 * This appears to be a variation of Dijkstra's algorithm, considering both time and silver as state.
 *
 * @returns {string} A newline-separated string of minimum times to reach each city (excluding the start city).
 */
function executeProgram() {
  // Read the number of cities (N), number of roads (M), and initial silver (S).
  var [nodeCount, edgeCount, initialSilver] = retrieveMultipleValues(3);

  // Define a very large number to represent infinity for distances/times.
  const MAX_DIST = 1e18;
  // Calculate the maximum possible silver capacity, which is (N-1) * 50.
  // This is likely derived from problem constraints where 50 is the max silver cost/gain.
  const maxSilverCapacity = (nodeCount - 1) * 50;

  // Initialize the adjacency list for the graph. Each entry `adjacencyList[u]`
  // will contain an array of `[neighbor_node, silver_cost_to_travel, travel_time]`.
  var adjacencyList = createMultiDimArray("[]", nodeCount);

  // Read `edgeCount` roads and populate the adjacency list.
  for (var roadIdx = 0; roadIdx < edgeCount; roadIdx++) {
    var [startNode, endNode, silverCost, travelTime] = retrieveMultipleValues(4);
    startNode--; // Convert to 0-indexed.
    endNode--; // Convert to 0-indexed.
    adjacencyList[startNode].push([endNode, silverCost, travelTime]);
    adjacencyList[endNode].push([startNode, silverCost, travelTime]); // Graph is undirected.
  }

  // Read the silver exchange rates for each city.
  // `exchangeRates[city_idx]` will be `[silver_gain_on_exchange, time_cost_of_exchange]`.
  var exchangeRates = retrieveMatrix(nodeCount, 2);

  // Initialize a 2D array `minTimeMap` to store the minimum time to reach a specific city
  // with a specific amount of silver. `minTimeMap[city_idx][silver_amount] = min_time`.
  var minTimeMap = createMultiDimArray(MAX_DIST, nodeCount, maxSilverCapacity + 1);

  // `remainingNodes` tracks how many cities still need their final minimum time determined.
  var remainingNodes = nodeCount;

  // `finalTimes` stores the ultimate minimum time to reach each city, regardless of silver amount.
  var finalTimes = createMultiDimArray(MAX_DIST, nodeCount);

  // Create a new min-priority queue for Dijkstra's algorithm.
  // Elements in the queue are `[current_time, current_city_node, current_silver_amount]`.
  var minPriorityQueue = new priorityQueueFactory();

  // Cap the initial silver at `maxSilverCapacity` if it exceeds it.
  if (initialSilver > maxSilverCapacity) {
    initialSilver = maxSilverCapacity;
  }

  // Add the starting state to the priority queue: 0 time, city 0, with initial silver.
  minPriorityQueue.insertElement([0, 0, initialSilver]);
  minTimeMap[0][initialSilver] = 0; // Mark the starting state's time as 0.

  // Main loop for Dijkstra's algorithm. Continues until all nodes have their final times determined.
  while (remainingNodes > 0) {
    // Extract the state with the minimum time from the priority queue.
    var [currentTime, currentNode, currentSilver] = minPriorityQueue.extractMin();

    // If we've already found a shorter path to this exact state (city, silver), skip.
    if (minTimeMap[currentNode][currentSilver] < currentTime) {
      continue;
    }

    // If this is the first time we've finalized the minimum time for `currentNode`,
    // record it and decrement the `remainingNodes` counter.
    if (finalTimes[currentNode] === MAX_DIST) {
      remainingNodes--;
      finalTimes[currentNode] = currentTime;
    }

    // --- Explore possible actions from the current state ---

    // Action 1: Exchange silver at the current city.
    // This is only possible if `currentSilver` is not yet at its maximum capacity.
    if (currentSilver < maxSilverCapacity) {
      const timeToExchange = currentTime + exchangeRates[currentNode][1]; // Calculate time after exchange.
      let silverAfterExchange = currentSilver + exchangeRates[currentNode][0]; // Calculate silver after exchange.
      // Ensure silver doesn't exceed `maxSilverCapacity`.
      if (silverAfterExchange >= maxSilverCapacity) {
        silverAfterExchange = maxSilverCapacity;
      }
      // If this new state (same city, new silver amount) can be reached faster, update and push to queue.
      if (minTimeMap[currentNode][silverAfterExchange] > timeToExchange) {
        minTimeMap[currentNode][silverAfterExchange] = timeToExchange;
        minPriorityQueue.insertElement([timeToExchange, currentNode, silverAfterExchange]);
      }
    }

    // Action 2: Discard 1 silver (or transition to 1 less silver with same time).
    // This is an unusual mechanic, but it's part of the original algorithm.
    // If `currentSilver` is positive, we can transition to `currentSilver - 1`
    // with no additional time cost.
    if (currentSilver > 0 && minTimeMap[currentNode][currentSilver - 1] > currentTime) {
      minTimeMap[currentNode][currentSilver - 1] = currentTime;
      minPriorityQueue.insertElement([currentTime, currentNode, currentSilver - 1]);
    }

    // Action 3: Travel to adjacent cities.
    for (var neighborIdx = 0; neighborIdx < adjacencyList[currentNode].length; neighborIdx++) {
      const edgeData = adjacencyList[currentNode][neighborIdx];
      const silverNeededForTravel = edgeData[1];
      const travelDuration = edgeData[2];
      const neighborNode = edgeData[0];

      // Check if there's enough silver to afford the travel.
      let silverAfterTravel = currentSilver - silverNeededForTravel;
      if (silverAfterTravel < 0) {
        continue; // Cannot travel this road.
      }

      const timeAfterTravel = currentTime + travelDuration;
      // If this new state (neighbor city, new silver amount) can be reached faster, update and push to queue.
      if (minTimeMap[neighborNode][silverAfterTravel] > timeAfterTravel) {
        minTimeMap[neighborNode][silverAfterTravel] = timeAfterTravel;
        minPriorityQueue.insertElement([timeAfterTravel, neighborNode, silverAfterTravel]);
      }
    }
  }

  // The problem asks for results for cities 1 to N-1 (0-indexed: 1 to nodeCount-1).
  // Slice the `finalTimes` array to exclude the starting city (index 0) and join the results with newlines.
  return finalTimes.slice(1).join("\n");
}
