"use strict"; // Enforce strict mode for better code quality and error handling

// Read raw input data from standard input, assuming UTF-8 encoding.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of tokens using spaces or newlines as delimiters.
// Initialize a pointer to keep track of the current token being processed.
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0;

/**
 * Retrieves the next token from the global token stream.
 * @param {boolean} asString - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token from the stream.
 */
function getNextValue(asString) {
  return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Retrieves a specified number of tokens from the global token stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asString - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function getMultipleValues(count, asString) {
  return asString
    ? tokenStream.slice(tokenIndex, (tokenIndex += count))
    : tokenStream.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
}

/**
 * Retrieves a 2D matrix of tokens from the global token stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} asString - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function getMatrixValues(height, width, asString) {
  var resultMatrix = [];
  var rowCounter = 0;
  if (asString) {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(
        tokenStream.slice(tokenIndex, (tokenIndex += width)).map((val) => +val)
      );
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The arguments after the initial value define the dimensions of the array.
 * Example: createMultiDimArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} initialValue - The value to initialize all elements of the array with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensionArgs = arguments;
  var numDimensions = dimensionArgs.length;
  // Construct the innermost array creation string.
  var arrayCreationString =
    "Array(dimensionArgs[" +
    --numDimensions +
    "]).fill().map(element => {return " +
    initialValue +
    ";})";
  // Wrap with outer array creations for remaining dimensions.
  while (--numDimensions) {
    arrayCreationString =
      "Array(dimensionArgs[" + numDimensions + "]).fill().map(element => " + arrayCreationString + ")";
  }
  // Use eval to execute the dynamically constructed array creation string.
  return eval(arrayCreationString);
}

// Immediately-invoked function expression (IIFE) to encapsulate the MinPriorityQueue implementation.
var minHeap = (function () {
  /**
   * Factory function to create a new instance of MinPriorityQueue.
   * @returns {MinPriorityQueue} A new priority queue object.
   */
  function createMinHeap() {
    return new MinPriorityQueue();
  }

  /**
   * Constructor for the MinPriorityQueue.
   * Initializes an empty array to store the heap elements.
   */
  function MinPriorityQueue() {
    this.dataStore = [];
  }

  /**
   * Inserts an element into the priority queue.
   * The element is expected to be an array where the first element (index 0) is the priority key.
   * @param {Array} item - The element to insert.
   */
  MinPriorityQueue.prototype.insertElement = function (item) {
    var currentHeap = this.dataStore;
    var currentIndex = currentHeap.length++; // Position for the new element, then increment length.
    var parentIndex;

    // Bubble up the new element to maintain the min-heap property.
    while (currentIndex) {
      parentIndex = (currentIndex - 1) >> 1; // Calculate parent index.
      // If parent's priority is less than or equal to the item's priority, the heap property is satisfied.
      if (currentHeap[parentIndex][0] <= item[0]) {
        break;
      }
      currentHeap[currentIndex] = currentHeap[parentIndex]; // Move parent down.
      currentIndex = parentIndex; // Move up to the parent's position.
    }
    currentHeap[currentIndex] = item; // Place the new item in its final sorted position.
  };

  /**
   * Removes and returns the element with the smallest priority from the queue.
   * @returns {Array} The element with the minimum priority.
   */
  MinPriorityQueue.prototype.extractMin = function () {
    var currentHeap = this.dataStore;
    var minElement = currentHeap[0]; // The root of the heap is the minimum element.
    var lastElement = currentHeap.pop(); // Remove the last element to replace the root.
    var heapSize = currentHeap.length;
    var currentIndex = 0;
    var childIndex;

    // If the heap becomes empty after removing the root, return the min element directly.
    if (heapSize === 0) {
      return minElement;
    }

    var halfHeapSize = heapSize >> 1; // Optimization: only need to check up to half the size for bubbling down.
    heapSize--; // Adjust for 0-based indexing in loop condition.

    // Bubble down the last element to maintain the min-heap property.
    while (currentIndex < halfHeapSize) {
      childIndex = (currentIndex << 1) + 1; // Calculate left child index.
      // Check if a right child exists and has a higher priority than the left child.
      if (
        childIndex < heapSize &&
        currentHeap[childIndex + 1][0] < currentHeap[childIndex][0]
      ) {
        childIndex++; // If so, use the right child for comparison.
      }
      // If the last element's priority is less than or equal to the smaller child's priority, stop.
      if (lastElement[0] <= currentHeap[childIndex][0]) {
        break;
      }
      currentHeap[currentIndex] = currentHeap[childIndex]; // Move child up.
      currentIndex = childIndex; // Move down to the child's position.
    }
    currentHeap[currentIndex] = lastElement; // Place the last element in its final sorted position.
    return minElement; // Return the original minimum element.
  };

  return createMinHeap; // Return the factory function for creating priority queue instances.
})();

// Execute the main program logic and store its return value.
var programOutput = executeProgram();

// If the program's execution produced a defined output, print it to the console.
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * The main function containing the core algorithm to solve the problem.
 * This implements a variation of Dijkstra's algorithm to find minimum times
 * to reach nodes with varying silver amounts.
 * @returns {string} The final calculated times for nodes (excluding the start node), joined by newlines.
 */
function executeProgram() {
  // Read the number of nodes, number of edges, and the initial silver amount.
  var [nodeCount, edgeCount, initialSilver] = getMultipleValues(3);

  // Calculate the maximum possible silver capacity, which is a function of nodeCount.
  const maxSilverCapacity = nodeCount * 50 - nodeCount;

  // Initialize an adjacency list to represent the graph. Each node starts with an empty array of edges.
  var adjacencyList = createMultiDimArray("[]", nodeCount);

  // Populate the adjacency list with edges based on input.
  for (var idx = 0; idx < edgeCount; idx++) {
    // Read edge details: two connected nodes, silver cost to traverse, and time cost to traverse.
    var [nodeA, nodeB, silverCost, timeCost] = getMultipleValues(4);
    nodeA--; // Adjust node indices to be 0-based.
    nodeB--; // Adjust node indices to be 0-based.
    // Add bidirectional edges to the graph.
    adjacencyList[nodeA].push([nodeB, silverCost, timeCost]);
    adjacencyList[nodeB].push([nodeA, silverCost, timeCost]);
  }

  // Read the exchange rates for each node: [silver_gain_on_exchange, time_cost_for_exchange].
  var exchangeRates = getMatrixValues(nodeCount, 2);

  // Initialize a 2D array `minTimeMap[node][silver]` to store the minimum time
  // to reach a specific `node` with a specific `silver` amount.
  // All values are initialized to a very large number (effectively infinity).
  var minTimeMap = createMultiDimArray(1e18, nodeCount, maxSilverCapacity + 1);

  // Counter for remaining nodes whose final minimum time has not yet been determined.
  var remainingNodes = nodeCount;

  // Initialize an array `finalTimes[node]` to store the minimum time to reach each node
  // and convert all silver to time (i.e., the final answer for each node).
  // All values are initialized to a very large number.
  var finalTimes = createMultiDimArray(1e18, nodeCount);

  // Create a new instance of the min-priority queue.
  var priorityQueueInstance = new minHeap();

  // Cap the initial silver amount at the maximum allowed capacity.
  if (initialSilver > maxSilverCapacity) {
    initialSilver = maxSilverCapacity;
  }

  // Push the initial state into the priority queue: [time, node, silver].
  // Starting at time 0, node 0, with the initial silver amount.
  priorityQueueInstance.insertElement([0, 0, initialSilver]);

  // Continue the Dijkstra-like search as long as there are nodes whose final times are not yet determined.
  while (remainingNodes) {
    // Extract the state with the minimum time from the priority queue.
    var [currentTime, currentNode, currentSilver] = priorityQueueInstance.extractMin();

    // If this node's final time hasn't been recorded yet, record it and decrement the counter.
    if (finalTimes[currentNode] === 1e18) {
      remainingNodes--;
      finalTimes[currentNode] = currentTime;
    }

    // If we've already found a path to this specific state (node, silver) with less time, skip.
    if (minTimeMap[currentNode][currentSilver] < currentTime) {
      continue;
    }

    // Consider the action of exchanging silver for time at the current node,
    // provided the current silver amount is not at its maximum capacity.
    if (currentSilver < maxSilverCapacity) {
      // Calculate the new time after performing the exchange.
      var newTime = currentTime + exchangeRates[currentNode][1];
      // Calculate the new silver amount after the exchange.
      var newSilver = currentSilver + exchangeRates[currentNode][0];
      // Cap the new silver amount at the maximum capacity.
      if (newSilver >= maxSilverCapacity) {
        newSilver = maxSilverCapacity;
      }
      // If this new state (currentNode, newSilver) can be reached with less time,
      // update the `minTimeMap` and push this new state to the priority queue.
      if (minTimeMap[currentNode][newSilver] > newTime) {
        minTimeMap[currentNode][newSilver] = newTime;
        priorityQueueInstance.insertElement([newTime, currentNode, newSilver]);
      }
    }

    // Explore all neighbors reachable from the current node via edges.
    for (var edgeIdx = 0; edgeIdx < adjacencyList[currentNode].length; edgeIdx++) {
      // Calculate the silver remaining after traversing this edge.
      var newSilverAfterTravel = currentSilver - adjacencyList[currentNode][edgeIdx][1];
      // If there isn't enough silver to traverse this edge, skip it.
      if (newSilverAfterTravel < 0) {
        continue;
      }
      // Calculate the new time after traversing this edge and identify the neighbor node.
      var newTimeAfterTravel = currentTime + adjacencyList[currentNode][edgeIdx][2];
      var neighborNode = adjacencyList[currentNode][edgeIdx][0];

      // If we've already found a path to this specific state (neighborNode, newSilverAfterTravel)
      // with less than or equal time, skip this path.
      if (minTimeMap[neighborNode][newSilverAfterTravel] <= newTimeAfterTravel) {
        continue;
      }
      // Otherwise, update the `minTimeMap` for this state and push it to the priority queue.
      minTimeMap[neighborNode][newSilverAfterTravel] = newTimeAfterTravel;
      priorityQueueInstance.insertElement([newTimeAfterTravel, neighborNode, newSilverAfterTravel]);
    }
  }
  // Return the final minimum times for all nodes, excluding the starting node (node 0),
  // formatted as a string with each time on a new line.
  return finalTimes.slice(1).join("\n");
}
