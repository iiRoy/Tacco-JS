"use strict";
// This script processes input from standard input to solve a graph problem.
// It uses a custom Dijkstra implementation with a priority queue.

// Read all input data from /dev/stdin
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input into tokens by spaces or newlines
var tokenStream = rawData.split(/ |\n/);

// Current index for reading tokens from the stream
var tokenIndex = 0;

/**
 * Retrieves the next token from the input stream.
 * @param {boolean} asString - If true, returns the token as a string; otherwise, as a number.
 * @returns {string|number} The next token.
 */
function getNextValue(asString) {
  return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Retrieves multiple tokens from the input stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asString - If true, returns tokens as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function getMultipleValues(count, asString) {
  // Slice the array to get 'count' elements and advance the index
  const values = tokenStream.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  // If not as string, map them to numbers
  return asString ? values : values.map(val => +val);
}

/**
 * Retrieves a 2D matrix of values from the input stream.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asString - If true, returns values as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function getMatrixValues(height, width, asString) {
  var resultMatrix = [];
  var rowCounter = 0;
  if (asString) {
    // For string values, just slice and push
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    // For numeric values, slice and map to numbers
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function uses `eval` for dynamic array creation based on arguments.
 * @param {*} initialValue - The value to fill the innermost array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., `createMultiDimArray(0, 2, 3)` creates a 2x3 array of zeros).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments;
  var argLength = args.length;
  var evalString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    evalString = "Array(args[" + argLength + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
}

/**
 * Implements Dijkstra's algorithm for finding shortest paths in a graph.
 */
class ShortestPathFinder {
  /**
   * Initializes a new graph with a specified number of nodes.
   * @param {number} nodeCount - The total number of nodes in the graph.
   */
  constructor(nodeCount) {
    // Adjacency list representation of the graph. Each node has an array of [neighbor, weight] pairs.
    this.adjacencyList = Array.from({
      length: nodeCount
    }, () => []);
  }

  /**
   * Adds a directed edge to the graph.
   * @param {number} sourceNode - The starting node of the edge.
   * @param {number} targetNode - The ending node of the edge.
   * @param {number} edgeWeight - The weight (cost) of the edge.
   */
  addDirectedEdge(sourceNode, targetNode, edgeWeight) {
    this.adjacencyList[sourceNode].push(targetNode, edgeWeight);
  }

  /**
   * Adds an undirected edge to the graph (two directed edges).
   * @param {number} sourceNode - One end of the edge.
   * @param {number} targetNode - The other end of the edge.
   * @param {number} edgeWeight - The weight (cost) of the edge.
   */
  addUndirectedEdge(sourceNode, targetNode, edgeWeight) {
    this.adjacencyList[sourceNode].push(targetNode, edgeWeight);
    this.adjacencyList[targetNode].push(sourceNode, edgeWeight);
  }

  /**
   * Computes the shortest path from a starting node to all other nodes using Dijkstra's algorithm.
   * @param {number} startNode - The node from which to start the pathfinding.
   * @returns {Array<number>} An array where `distances[i]` is the shortest distance from `startNode` to node `i`.
   */
  findShortestPaths(startNode) {
    // A very large number representing infinity for initial distances
    const infinityVal = 1_000_000_000_000_000_000; // 1e18

    // Reference to the graph's adjacency list
    const currentGraph = this.adjacencyList;

    // Priority queue to store [distance, node] pairs, ordered by distance
    var minPriorityQueue = new MinHeap();
    minPriorityQueue.insert(0, startNode); // Start with distance 0 to the start node

    // Array to store the shortest distances found so far to each node
    var distances = new Array(currentGraph.length).fill(infinityVal);
    distances[startNode] = 0; // Distance to start node is 0

    // Process nodes while the priority queue is not empty
    while (minPriorityQueue.sizeOfHeap) {
      // Extract the node with the smallest distance from the priority queue
      var [currentDist, currentNode] = minPriorityQueue.extractMin();

      // If we've already found a shorter path to this node, skip it
      if (distances[currentNode] < currentDist) {
        continue;
      }

      // Iterate through all neighbors of the current node
      // Edges are stored as [neighbor, weight, neighbor, weight, ...]
      for (var edgeIdx = 0; edgeIdx < currentGraph[currentNode].length; edgeIdx += 2) {
        var neighborNode = currentGraph[currentNode][edgeIdx];
        var edgeCost = currentGraph[currentNode][edgeIdx + 1];
        var newDist = edgeCost + currentDist; // Calculate new distance to neighbor

        // If this new path is shorter than the previously known shortest path to neighborNode
        if (distances[neighborNode] > newDist) {
          distances[neighborNode] = newDist; // Update shortest distance
          minPriorityQueue.insert(newDist, neighborNode); // Add/update neighbor in priority queue
        }
      }
    }
    return distances; // Return the array of shortest distances
  }
}

/**
 * Implements a min-priority queue (min-heap) data structure.
 * It stores numeric priorities and associated items, allowing for duplicate priorities.
 */
class MinHeap {
  constructor() {
    // The underlying array representing the heap structure
    this.heapArray = [];
    // A map to store associated items for each priority value.
    // Key: priority (number), Value: array of associated items (e.g., node indices).
    this.valueMap = new Map();
  }

  /**
   * Inserts an item with a given priority into the heap.
   * @param {number} priorityVal - The priority value (key for ordering).
   * @param {*} associatedItem - The item associated with the priority.
   */
  insert(priorityVal, associatedItem) {
    const heapRef = this.heapArray;
    const mapRef = this.valueMap;

    // Bubble up the new element to maintain heap property
    var currentIndex;
    var parentIndex;
    for (currentIndex = heapRef.length; currentIndex > 0; currentIndex = parentIndex) {
      parentIndex = (currentIndex - 1) >> 1; // Calculate parent index
      if (priorityVal >= heapRef[parentIndex]) {
        break; // Correct position found
      }
      heapRef[currentIndex] = heapRef[parentIndex]; // Move parent down
    }
    heapRef[currentIndex] = priorityVal; // Place new element

    // Store the associated item in the map
    if (mapRef.has(priorityVal)) {
      mapRef.get(priorityVal).push(associatedItem);
    } else {
      mapRef.set(priorityVal, [associatedItem]);
    }
  }

  /**
   * Extracts the item with the smallest priority from the heap.
   * @returns {Array<number|*>} An array containing `[priority, associatedItem]` of the minimum element.
   *                           Returns `undefined` if the heap is empty.
   */
  extractMin() {
    const heapRef = this.heapArray;
    const mapRef = this.valueMap;
    const heapLength = heapRef.length;

    // Handle empty or single-element heap cases
    if (heapLength === 0) {
      return; // Heap is empty
    }
    if (heapLength === 1) {
      const singleElement = heapRef.pop();
      return [singleElement, mapRef.get(singleElement).pop()];
    }

    // Store the root (minimum element) to be returned
    var rootElement = heapRef[0];
    // Take the last element and place it at the root temporarily
    var lastElement = heapRef.pop();

    // Bubble down the last element from the root to maintain heap property
    var currentPos = 0;
    var childPos;
    // Loop while currentPos has at least one child within the heap bounds
    while (currentPos < (heapLength - 1) >> 1) {
      childPos = currentPos * 2 + 1; // Left child
      // If right child exists and is smaller than left child, choose right child
      if (childPos + 1 < heapLength - 1 && heapRef[childPos] > heapRef[childPos + 1]) {
        childPos++;
      }
      // If the last element is smaller than or equal to the smallest child, its position is found
      if (lastElement <= heapRef[childPos]) {
        break;
      }
      heapRef[currentPos] = heapRef[childPos]; // Move child up
      currentPos = childPos; // Move down to the child's position
    }
    heapRef[currentPos] = lastElement; // Place the last element in its final position

    // Retrieve and return the associated item for the extracted root priority
    return [rootElement, mapRef.get(rootElement).pop()];
  }

  /**
   * Gets the current number of elements in the heap.
   * @returns {number} The size of the heap.
   */
  get sizeOfHeap() {
    return this.heapArray.length;
  }

  /**
   * Gets the priority value of the minimum element without removing it.
   * @returns {number|undefined} The priority of the top element, or undefined if empty.
   */
  get topElementPriority() {
    return this.heapArray[0];
  }
}

// Define a constant for the maximum silver currency allowed at any city-state.
const maxCurrency = 2500;

// Execute the main program logic and store its output.
var programOutput = executeProgram();

// If the program produced output, print it to the console.
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * Main function containing the problem-specific logic.
 * It models a transportation network with currency exchange using Dijkstra's algorithm.
 * @returns {string} The formatted result string.
 */
function executeProgram() {
  // Read N (number of cities), M (number of roads), S (initial silver).
  var [numCities, numRoads, initialSilver] = getMultipleValues(3);

  // Create a ShortestPathFinder instance.
  // The graph nodes are (city_id * maxCurrency + silver_amount).
  // This creates a state space graph where each node represents a city at a certain silver level.
  var pathSolver = new ShortestPathFinder(maxCurrency * numCities);

  // Process M road connections.
  for (var i = 0; i < numRoads; i++) {
    // Read cityA, cityB, silverCost, timeCost for each road.
    var [cityA, cityB, silverCost, timeCost] = getMultipleValues(4);
    cityA--; // Adjust to 0-indexed
    cityB--; // Adjust to 0-indexed

    // Scale city indices to represent the base index for silver levels.
    var cityABase = cityA * maxCurrency;
    var cityBBase = cityB * maxCurrency;

    // For each possible silver amount (silverAmount) at cityA, if it's enough to pay silverCost,
    // add an edge to cityB with (silverAmount - silverCost) silver and timeCost.
    // This models traveling from cityA with silverAmount silver to cityB with silverAmount-silverCost silver.
    for (var silverAmount = maxCurrency; silverAmount-- > silverCost;) {
      pathSolver.addUndirectedEdge(cityABase + silverAmount, cityBBase + silverAmount - silverCost, timeCost);
    }
  }

  // Process N currency exchange stations.
  for (var cityIndex = 0; cityIndex < numCities; cityIndex++) {
    // Read exchangeRate (exchangeRate) and exchangeTime (exchangeTime) for the current city.
    var [exchangeRate, exchangeTime] = getMultipleValues(2);

    // Calculate the base index for the current city's silver levels.
    var cityBaseIndex = cityIndex * maxCurrency;

    // Add edges for currency exchange within the same city.
    // From currentSilver to min(maxCurrency-1, currentSilver+exchangeRate) silver, with exchangeTime.
    for (var currentSilver = 0; currentSilver < maxCurrency - 1; currentSilver++) {
      pathSolver.addDirectedEdge(cityBaseIndex + currentSilver, cityBaseIndex + Math.min(maxCurrency - 1, currentSilver + exchangeRate), exchangeTime);
    }
  }

  // Solve for shortest paths starting from city 0 with initialSilver.
  // The starting node is (city 0 * maxCurrency + min(maxCurrency-1, initialSilver)).
  var minTimes = pathSolver.findShortestPaths(Math.min(maxCurrency - 1, initialSilver));

  // Initialize an array to store the minimum time to reach each city, regardless of silver amount.
  var finalResults = createMultiDimArray(1_000_000_000_000_000_000, numCities); // 1e18

  // For each city (excluding city 0, which is the start), find the minimum time.
  // Iterate through all possible silver amounts at that city.
  for (var cityIndex = 1; cityIndex < numCities; cityIndex++) {
    var cityOffset = cityIndex * maxCurrency;
    for (var silverLevel = 0; silverLevel < maxCurrency; silverLevel++) {
      finalResults[cityIndex] = Math.min(finalResults[cityIndex], minTimes[cityOffset + silverLevel]);
    }
  }

  // Format the results: slice to exclude city 0, then join with newlines.
  return finalResults.slice(1).join("\n");
}
