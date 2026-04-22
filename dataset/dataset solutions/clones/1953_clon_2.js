"use strict";

// This module handles file system operations to read input.
const systemIO = require("fs");

// Obtain all content from the standard input file.
const dataStream = systemIO.readFileSync("/std/input.txt", "utf8");

// Parse the input data into an array of tokens, separated by spaces or newlines.
const tokenArray = dataStream.split(/ |\n/);

// Initialize an index to keep track of the current token being processed.
let tokenIndex = 0;

/**
 * Retrieves the next token from the input stream.
 * @param {boolean} asString - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token.
 */
function retrieveNextToken(asString) {
  // Check if a string representation is requested.
  if (asString) {
    return tokenArray[tokenIndex++];
  } else {
    // Convert to a number using the unary plus operator.
    return +tokenArray[tokenIndex++];
  }
}

/**
 * Fetches multiple tokens from the input stream.
 * @param {number} count - The number of tokens to fetch.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array containing the fetched tokens.
 */
function fetchMultipleTokens(count, asStrings) {
  // Extract a slice of tokens from the token array.
  const fetched = tokenArray.slice(tokenIndex, tokenIndex + count);
  // Advance the token index.
  tokenIndex += count;

  // If string representation is requested, return as is; otherwise, map to numbers.
  if (asStrings) {
    return fetched;
  } else {
    return fetched.map(val => Number(val));
  }
}

/**
 * Acquires a matrix of tokens from the input stream.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in each row.
 * @param {boolean} asText - If true, returns matrix elements as strings; otherwise, converts them to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function acquireMatrix(rows, cols, asText) {
  const resultMatrix = [];
  let rowIndex = 0;

  // Iterate through each row of the matrix.
  while (rowIndex < rows) {
    // Extract a row's worth of tokens.
    const rowTokens = tokenArray.slice(tokenIndex, tokenIndex + cols);
    // Advance the token index.
    tokenIndex += cols;

    // If text representation is requested, push raw tokens; otherwise, map to numbers.
    if (asText) {
      resultMatrix.push(rowTokens);
    } else {
      resultMatrix.push(rowTokens.map(element => Number(element)));
    }
    rowIndex++;
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array with a specified initial value.
 * @param {*} initialValue - The value to fill the innermost array with.
 * @param {...number} dimensions - The sizes of each dimension of the array.
 * @returns {Array} A multi-dimensional array.
 */
function multiDimArrayCreator(initialValue) {
  // Capture all dimension arguments.
  const dimensions = arguments;
  let dimCount = dimensions.length;
  // Start building the array creation string from the innermost dimension.
  let arrayCreationString = `Array(dimensions[${--dimCount}]).fill().map(_ => ${initialValue})`;

  // Work outwards, wrapping the string with `Array(...).fill().map(...)` for each dimension.
  while (--dimCount) {
    arrayCreationString = `Array(dimensions[${dimCount}]).fill().map(_ => ${arrayCreationString})`;
  }
  // Use `eval` to execute the dynamically constructed array creation string.
  return eval(arrayCreationString);
}


// Represents a utility for finding shortest paths in a graph using Dijkstra's algorithm.
class ShortestPathFinder {
  /**
   * Initializes a new graph with a specified number of nodes.
   * @param {number} nodeCount - The total number of nodes in the graph.
   */
  constructor(nodeCount) {
    // The graph is represented as an adjacency list, where each node has an array of connected edges.
    this.adjacencyList = Array(nodeCount).fill().map(() => []);
  }

  /**
   * Adds a directed edge from a source node to a target node with a given weight.
   * @param {number} sourceNode - The starting node of the edge.
   * @param {number} targetNode - The ending node of the edge.
   * @param {number} edgeWeight - The cost or weight associated with traversing this edge.
   */
  addOneWayEdge(sourceNode, targetNode, edgeWeight) {
    // Store the target node and its associated weight in the source node's list.
    this.adjacencyList[sourceNode].push(targetNode, edgeWeight);
  }

  /**
   * Adds an undirected (two-way) edge between two nodes with a given weight.
   * @param {number} nodeA - The first node.
   * @param {number} nodeB - The second node.
   * @param {number} edgeWeight - The cost or weight for traversing the edge in either direction.
   */
  addTwoWayEdge(nodeA, nodeB, edgeWeight) {
    // Add edges in both directions.
    this.adjacencyList[nodeA].push(nodeB, edgeWeight);
    this.adjacencyList[nodeB].push(nodeA, edgeWeight);
  }

  /**
   * Computes the shortest distances from a specified start node to all other nodes in the graph.
   * Implements Dijkstra's algorithm using a priority queue.
   * @param {number} startNode - The node from which to start computing distances.
   * @returns {Array<number>} An array where `distanceArray[i]` is the shortest distance from `startNode` to node `i`.
   */
  computeDistances(startNode) {
    // Define a large number to represent infinity for unreachable nodes.
    const MAX_DIST = 1e18;
    // Reference to the graph's adjacency list for convenience.
    const adjList = this.adjacencyList;

    // Initialize a min-priority queue to store nodes to visit, ordered by their current shortest distance.
    const priorityQueueInstance = new MinHeapPriorityQueue();
    // Add the start node to the priority queue with a distance of 0.
    priorityQueueInstance.insertElement(0, startNode);

    // Initialize an array to store the shortest distance found so far from the start node to each node.
    // All distances are initially set to infinity.
    const distanceArray = Array(adjList.length).fill(MAX_DIST);
    // The distance from the start node to itself is 0.
    distanceArray[startNode] = 0;

    // Continue as long as there are nodes in the priority queue to process.
    while (priorityQueueInstance.elementCount > 0) {
      // Extract the node with the smallest current distance from the priority queue.
      // `currentDistance` is the distance to `currentNode`.
      const [currentDistance, currentNode] = priorityQueueInstance.extractMin();

      // If we've already found a shorter path to `currentNode`, skip processing it.
      if (distanceArray[currentNode] < currentDistance) {
        continue;
      }

      // Iterate through all neighbors of the `currentNode`.
      // Edges are stored as [neighbor, weight, neighbor, weight, ...]
      for (let edgeIndex = 0; edgeIndex < adjList[currentNode].length; edgeIndex += 2) {
        // `neighborNode` is the adjacent node.
        const neighborNode = adjList[currentNode][edgeIndex];
        // `edgeWeight` is the weight of the edge from `currentNode` to `neighborNode`.
        const edgeWeight = adjList[currentNode][edgeIndex + 1];
        // `newCalculatedDistance` is the distance to `neighborNode` through `currentNode`.
        const newCalculatedDistance = edgeWeight + currentDistance;

        // If this new path to `neighborNode` is shorter than any previously found path, update it.
        if (distanceArray[neighborNode] > newCalculatedDistance) {
          distanceArray[neighborNode] = newCalculatedDistance;
          // Add the `neighborNode` to the priority queue with its new, shorter distance.
          priorityQueueInstance.insertElement(newCalculatedDistance, neighborNode);
        }
      }
    }
    // Return the array of shortest distances from the start node to all other nodes.
    return distanceArray;
  }
}

// Implements a min-priority queue using a binary heap.
class MinHeapPriorityQueue {
  /**
   * Initializes an empty priority queue.
   */
  constructor() {
    // The array representing the heap structure.
    this.heapArray = [];
    // A map to store associated data (nodes) for each priority value.
    // This allows multiple nodes to have the same priority value.
    this.valueToNodeMap = new Map();
  }

  /**
   * Inserts an element into the priority queue.
   * @param {number} priorityValue - The priority value of the element (smaller means higher priority).
   * @param {*} associatedNode - The data associated with this priority (e.g., a graph node ID).
   */
  insertElement(priorityValue, associatedNode) {
    const heapArray = this.heapArray;
    const valueToNodeMap = this.valueToNodeMap;

    // Heapify-up: place the new element at the end and bubble it up.
    let currentIndex = heapArray.length;
    let parentIndex;
    for (; currentIndex; currentIndex = parentIndex) {
      parentIndex = (currentIndex - 1) >>> 1; // Calculate parent index.
      // If the new element's priority is greater than or equal to its parent's, it's in the correct position.
      if (priorityValue >= heapArray[parentIndex]) {
        break;
      }
      // Otherwise, move the parent down.
      heapArray[currentIndex] = heapArray[parentIndex];
    }
    // Place the new element in its final position.
    heapArray[currentIndex] = priorityValue;

    // Store the associated node in the map.
    if (valueToNodeMap.has(priorityValue)) {
      valueToNodeMap.get(priorityValue).push(associatedNode);
    } else {
      valueToNodeMap.set(priorityValue, [associatedNode]);
    }
  }

  /**
   * Removes and returns the element with the smallest priority value (the root of the min-heap).
   * @returns {Array<number|*>} An array containing the minimum priority value and its associated node.
   */
  extractMin() {
    const heapArray = this.heapArray;
    const valueToNodeMap = this.valueToNodeMap;
    const currentLength = heapArray.length;
    // Get the last element and remove it from the heap array.
    const lastElement = heapArray.pop();

    // Handle edge cases for empty or single-element heap.
    if (currentLength < 2) {
      if (currentLength === 0) {
        return undefined; // Heap was empty.
      }
      // Single element heap: return it and remove from map.
      return [lastElement, valueToNodeMap.get(lastElement).pop()];
    }

    // The minimum element is at the root. Store it before replacing.
    const minElementValue = heapArray[0];

    // Heapify-down: move the last element to the root and bubble it down.
    let currentIndex = 0;
    let childIndex;
    // Iterate while the current node has at least one child.
    while (currentIndex < (currentLength - 1) >>> 1) {
      childIndex = (currentIndex << 1) + 1; // Left child index.

      // If there's a right child and it's smaller than the left child, use the right child.
      if (childIndex + 1 < currentLength - 1 && heapArray[childIndex] > heapArray[childIndex + 1]) {
        childIndex++;
      }

      // If the last element (which is at `currentIndex`) is smaller than or equal to its smallest child,
      // it's in the correct position.
      if (heapArray[childIndex] >= lastElement) {
        break;
      }
      // Otherwise, move the child up.
      heapArray[currentIndex] = heapArray[childIndex];
      currentIndex = childIndex; // Move down to the child's position.
    }
    // Place the `lastElement` in its final position.
    heapArray[currentIndex] = lastElement;

    // Retrieve and remove the associated node from the map.
    const associatedNode = valueToNodeMap.get(minElementValue).pop();
    // If no more nodes are associated with this priority value, remove the entry from the map.
    if (valueToNodeMap.get(minElementValue).length === 0) {
      valueToNodeMap.delete(minElementValue);
    }

    return [minElementValue, associatedNode];
  }

  /**
   * Gets the number of elements currently in the priority queue.
   * @returns {number} The count of elements.
   */
  get elementCount() {
    return this.heapArray.length;
  }

  /**
   * Peeks at the minimum priority value without removing it.
   * @returns {number|undefined} The minimum priority value, or undefined if the queue is empty.
   */
  get peekMin() {
    return this.heapArray[0];
  }
}

// Define a constant for the maximum currency value or "silver" level.
const MAX_CURRENCY_VALUE = 2500;

// Execute the main calculation function.
const programOutput = calculateResult();

// If the calculation produced a result, print it to the console.
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * Main function to solve the problem logic.
 * @returns {string} The formatted result string.
 */
function calculateResult() {
  // Read the number of cities, number of roads, and initial silver funds.
  const [numCities, numRoads, initialFunds] = fetchMultipleTokens(3);

  // Initialize a shortest path calculator for a graph with nodes representing (city, silver_amount).
  // Total nodes: numCities * MAX_CURRENCY_VALUE.
  const pathCalculator = new ShortestPathFinder(MAX_CURRENCY_VALUE * numCities);

  // Process all road connections.
  for (let roadIndex = 0; roadIndex < numRoads; roadIndex++) {
    // Read city A, city B, silver cost to travel, and time to travel.
    let [cityA, cityB, silverCost, travelTime] = fetchMultipleTokens(4);
    // Adjust city indices to be 0-based.
    cityA--;
    cityB--;

    // Offset city indices by MAX_CURRENCY_VALUE to create unique base node IDs for each city.
    cityA *= MAX_CURRENCY_VALUE;
    cityB *= MAX_CURRENCY_VALUE;

    // For each possible silver amount `currentSilver` (from MAX_CURRENCY_VALUE-1 down to `silverCost`),
    // add edges representing travel between cities.
    for (let currentSilver = MAX_CURRENCY_VALUE - 1; currentSilver >= silverCost; currentSilver--) {
      // Add a directed edge from (cityA, currentSilver) to (cityB, currentSilver - silverCost) with `travelTime`.
      pathCalculator.addOneWayEdge(cityA + currentSilver, cityB + currentSilver - silverCost, travelTime);
      // Add a directed edge from (cityB, currentSilver) to (cityA, currentSilver - silverCost) with `travelTime`.
      pathCalculator.addOneWayEdge(cityB + currentSilver, cityA + currentSilver - silverCost, travelTime);
    }
  }

  // Process all silver exchange stations.
  for (let cityIndex = 0; cityIndex < numCities; cityIndex++) {
    // Read silver gained from exchange and time taken for exchange.
    const [exchangeSilver, exchangeTime] = fetchMultipleTokens(2);
    // Calculate the base node offset for the current city.
    const nodeOffset = cityIndex * MAX_CURRENCY_VALUE;

    // For each possible silver amount `currentSilverAmount` at this city.
    for (let currentSilverAmount = 0; currentSilverAmount < MAX_CURRENCY_VALUE - 1; currentSilverAmount++) {
      // Add an edge representing an exchange operation within the same city.
      // From (cityIndex, currentSilverAmount) to (cityIndex, min(MAX_CURRENCY_VALUE-1, currentSilverAmount + exchangeSilver))
      // with `exchangeTime`.
      pathCalculator.addOneWayEdge(
        nodeOffset + currentSilverAmount,
        nodeOffset + Math.min(MAX_CURRENCY_VALUE - 1, currentSilverAmount + exchangeSilver),
        exchangeTime
      );
    }
  }

  // Compute shortest distances from the starting node (city 0, initialFunds).
  // The initial funds might exceed MAX_CURRENCY_VALUE-1, so cap it.
  const finalDistances = pathCalculator.computeDistances(Math.min(MAX_CURRENCY_VALUE - 1, initialFunds));

  // Initialize an array to store the minimum travel time to each city.
  // Set initial minimum times to a very large value (effectively infinity).
  const minTimes = multiDimArrayCreator(1e18, numCities);

  // Iterate through each city (starting from city 1, as city 0 is the start).
  for (let cityResultIndex = 1; cityResultIndex < numCities; cityResultIndex++) {
    // Calculate the base node offset for the current city.
    const currentCityOffset = cityResultIndex * MAX_CURRENCY_VALUE;

    // For each possible silver level at this city.
    for (let silverLevel = 0; silverLevel < MAX_CURRENCY_VALUE; silverLevel++) {
      // Update the minimum time to reach this city if a shorter path is found.
      minTimes[cityResultIndex] = Math.min(minTimes[cityResultIndex], finalDistances[currentCityOffset + silverLevel]);
    }
  }

  // Format the results: exclude city 0's result and join the rest with newlines.
  return minTimes.slice(1).join("\n");
}