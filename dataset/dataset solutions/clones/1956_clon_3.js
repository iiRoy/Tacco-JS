"use strict";

// --- Input Processing Utilities ---
// Custom input reading functions to handle various data types from standard input.
let cachedRawInput = require("fs").readFileSync("/dev/stdin", "utf8");
let inputDataChunks = cachedRawInput.split(/ |\n/);
let currentDataChunkIndex = 0;

/**
 * Fetches the next single token from the input stream.
 * @param {boolean} retrieveAsString If true, token is returned as a string; otherwise, as a number.
 * @returns {string|number} The next token.
 */
const retrieveNextValue = (retrieveAsString) => {
  const tokenValue = inputDataChunks[currentDataChunkIndex++];
  return retrieveAsString ? tokenValue : Number(tokenValue);
};

/**
 * Fetches a specified quantity of tokens from the input stream.
 * @param {number} quantity The number of tokens to retrieve.
 * @param {boolean} retrieveAsString If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array of the retrieved tokens.
 */
const retrieveValueBatch = (quantity, retrieveAsString) => {
  const batchOfTokens = inputDataChunks.slice(currentDataChunkIndex, currentDataChunkIndex + quantity);
  currentDataChunkIndex += quantity;
  return retrieveAsString ? batchOfTokens : batchOfTokens.map(item => Number(item));
};

/**
 * Fetches a 2D matrix of tokens from the input stream.
 * @param {number} numRows The number of rows in the matrix.
 * @param {number} numCols The number of columns per row.
 * @param {boolean} retrieveAsString If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
const retrieveMatrixData = (numRows, numCols, retrieveAsString) => {
  const resultingMatrix = [];
  for (let rowCounter = 0; rowCounter < numRows; ++rowCounter) {
    const rowContent = inputDataChunks.slice(currentDataChunkIndex, currentDataChunkIndex + numCols);
    currentDataChunkIndex += numCols;
    resultingMatrix.push(retrieveAsString ? rowContent : rowContent.map(item => Number(item)));
  }
  return resultingMatrix;
};

/**
 * Generates a multi-dimensional array initialized with a specific value.
 * This function avoids `eval` for safer and clearer array construction.
 * @param {*} defaultValue The value to use for initializing all array elements.
 * @param {...number} arrayDimensions The sizes of each dimension.
 * @returns {Array} The constructed multi-dimensional array.
 */
const initializeMultiDimensionalArray = (defaultValue, ...arrayDimensions) => {
  const recursiveArrayBuilder = (remainingDims) => {
    if (remainingDims.length === 0) {
      // For objects or arrays, deep copy is often desired.
      // For primitives, direct return is sufficient.
      return JSON.parse(JSON.stringify(defaultValue));
    }
    const currentDimSize = remainingDims[0];
    const subsequentDims = remainingDims.slice(1);
    return Array.from({ length: currentDimSize }, () => recursiveArrayBuilder(subsequentDims));
  };
  return recursiveArrayBuilder(arrayDimensions);
};


// --- Min-Priority Queue Implementation ---
// An efficient data structure for Dijkstra's algorithm, maintaining elements in sorted order.
const createMinHeapQueue = (() => {
  /**
   * Represents an item stored in the priority queue.
   * @typedef {Array<number>} HeapItem - Typically [priority, ...associatedData]
   */

  class MinimumPriorityQueue {
    constructor() {
      this.heapElements = []; // The underlying array storing heap elements
    }

    /**
     * Adds a new item to the priority queue, maintaining the min-heap property.
     * @param {HeapItem} newItem The item to add. Its first element is its priority.
     */
    add(newItem) {
      let currentPosition = this.heapElements.length;
      this.heapElements.push(newItem); // Initially place at the end

      // Bubble up the new item to its correct position
      while (currentPosition > 0) {
        const parentPosition = (currentPosition - 1) >>> 1; // Faster way to get floor(idx/2)
        // If parent's priority is less than or equal to current item's, heap property is restored
        if (this.heapElements[parentPosition][0] <= newItem[0]) {
          break;
        }
        // Swap current item with its parent
        this.heapElements[currentPosition] = this.heapElements[parentPosition];
        this.heapElements[parentPosition] = newItem;
        currentPosition = parentPosition;
      }
    }

    /**
     * Removes and returns the item with the smallest priority (root of the heap).
     * @returns {HeapItem|undefined} The item with the minimum priority, or undefined if the queue is empty.
     */
    extractMin() {
      const heapSize = this.heapElements.length;
      if (heapSize === 0) {
        return undefined; // Queue is empty
      }
      if (heapSize === 1) {
        return this.heapElements.pop(); // Only one item, just remove it
      }

      const minItem = this.heapElements[0]; // The item to be returned
      const lastItem = this.heapElements.pop(); // The item to re-heapify with
      this.heapElements[0] = lastItem; // Place last item at the root

      let currentPosition = 0;
      const lastNonLeafIndex = (this.heapElements.length >>> 1) - 1; // Index of the last node that is not a leaf

      // Bubble down the new root to its correct position
      while (currentPosition <= lastNonLeafIndex) {
        let leftChildPosition = (currentPosition << 1) + 1; // 2 * idx + 1
        let rightChildPosition = leftChildPosition + 1;
        let smallestChildPosition = leftChildPosition;

        // Determine which child has the smaller priority
        if (rightChildPosition < this.heapElements.length &&
            this.heapElements[rightChildPosition][0] < this.heapElements[leftChildPosition][0]) {
          smallestChildPosition = rightChildPosition;
        }

        // If the current element is smaller than or equal to its smallest child, heap property is restored
        if (lastItem[0] <= this.heapElements[smallestChildPosition][0]) {
          break;
        }

        // Swap with the smallest child
        this.heapElements[currentPosition] = this.heapElements[smallestChildPosition];
        this.heapElements[smallestChildPosition] = lastItem;
        currentPosition = smallestChildPosition;
      }
      return minItem;
    }

    /**
     * Checks if the priority queue contains any elements.
     * @returns {boolean} True if the queue is empty, false otherwise.
     */
    isQueueEmpty() {
      return this.heapElements.length === 0;
    }
  }

  // The factory function returns a new instance of MinimumPriorityQueue.
  return () => new MinimumPriorityQueue();
})();


// --- Global Constants for Problem Logic ---
const MAX_CURRENCY_STORED = 2500; // Maximum currency a state can track
const LARGE_NUMBER_FOR_INFINITY = Number.MAX_SAFE_INTEGER; // Represents an unreachable state or infinite cost


// --- Core Problem Solver Function ---
/**
 * Solves the problem using a modified Dijkstra's algorithm.
 * It finds the minimum time to reach each city, considering currency exchange and travel costs.
 * @returns {string} The minimum arrival times for cities (excluding the starting city if it's 0-indexed and output is 1-indexed), each on a new line.
 */
function determineMinimumTravelTimes() {
  // Read initial configuration: total cities, number of roads, and starting currency.
  const [totalCities, totalRoads, initialStartingCurrency] = retrieveValueBatch(3);

  // Graph representation: Adjacency list where each edge is an object.
  // Edge format: { targetCity: number, currencyCost: number, duration: number }
  const cityGraph = initializeMultiDimensionalArray([], totalCities);

  // Populate the graph with road connections. Roads are bidirectional.
  for (let roadCounter = 0; roadCounter < totalRoads; ++roadCounter) {
    const [cityOne, cityTwo, requiredCurrency, travelDuration] = retrieveValueBatch(4);
    // Adjust city indices from 1-based to 0-based for array access.
    const cityOneIndex = cityOne - 1;
    const cityTwoIndex = cityTwo - 1;

    // Add edge for travel from cityOne to cityTwo
    cityGraph[cityOneIndex].push({
      targetCity: cityTwoIndex,
      currencyCost: requiredCurrency,
      duration: travelDuration,
    });
    // Add reverse edge for travel from cityTwo to cityOne
    cityGraph[cityTwoIndex].push({
      targetCity: cityOneIndex,
      currencyCost: requiredCurrency,
      duration: travelDuration,
    });
  }

  // Read currency exchange details for each city.
  // Format: [currency_gain_per_transaction, time_penalty_per_transaction]
  const currencyExchangeRates = retrieveMatrixData(totalCities, 2);

  // `minTimeStates[city_idx][currency_amount]` stores the minimum time to reach
  // `city_idx` with `currency_amount` in hand. Initialize with infinity.
  const minTimeStates = initializeMultiDimensionalArray(LARGE_NUMBER_FOR_INFINITY, totalCities, MAX_CURRENCY_STORED + 1);

  // `finalNodeArrivalTimes` stores the overall minimum time to reach each city,
  // irrespective of the currency amount upon arrival.
  const finalNodeArrivalTimes = new Array(totalCities).fill(LARGE_NUMBER_FOR_INFINITY);
  let remainingCitiesToFinalize = totalCities; // Counter for finalized cities

  // Initialize the priority queue for Dijkstra's algorithm.
  const traversalQueue = createMinHeapQueue();

  // Clamp the initial currency to the maximum trackable amount.
  const actualStartingCurrency = Math.min(initialStartingCurrency, MAX_CURRENCY_STORED);

  // Add the starting state to the priority queue: [time, city_index, current_currency]
  // Start at city 0 (index 0) with 0 time and the adjusted initial currency.
  traversalQueue.add([0, 0, actualStartingCurrency]);
  minTimeStates[0][actualStartingCurrency] = 0; // Mark the initial state's cost

  // Main loop for the Dijkstra-like search. Continues until all cities are finalized
  // or the queue becomes empty (no more reachable states).
  while (!traversalQueue.isQueueEmpty() && remainingCitiesToFinalize > 0) {
    const [currentTime, currentCityIndex, currentCurrency] = traversalQueue.extractMin();

    // If we've already found a path to this state (city, currency) that is shorter
    // than the current one, then this path is suboptimal, so skip.
    if (currentTime > minTimeStates[currentCityIndex][currentCurrency]) {
      continue;
    }

    // If this city hasn't been finalized yet, record its minimum arrival time
    // and decrement the counter for remaining cities.
    if (finalNodeArrivalTimes[currentCityIndex] === LARGE_NUMBER_FOR_INFINITY) {
      finalNodeArrivalTimes[currentCityIndex] = currentTime;
      remainingCitiesToFinalize--;
    }

    // --- Explore possibility 1: Perform currency exchange at the current city ---
    // Exchange is only possible if current currency is below the maximum capacity.
    if (currentCurrency < MAX_CURRENCY_STORED) {
      const timeCostForExchange = currencyExchangeRates[currentCityIndex][1];
      const currencyUnitsGained = currencyExchangeRates[currentCityIndex][0];

      const newTimeAfterExchange = currentTime + timeCostForExchange;
      // Ensure the currency amount does not exceed the defined maximum.
      const newCurrencyAfterExchange = Math.min(currentCurrency + currencyUnitsGained, MAX_CURRENCY_STORED);

      // If this new state can be reached with a lower time cost, update and enqueue.
      if (newTimeAfterExchange < minTimeStates[currentCityIndex][newCurrencyAfterExchange]) {
        minTimeStates[currentCityIndex][newCurrencyAfterExchange] = newTimeAfterExchange;
        traversalQueue.add([newTimeAfterExchange, currentCityIndex, newCurrencyAfterExchange]);
      }
    }

    // --- Explore possibility 2: Travel to neighboring cities ---
    for (const connectedRoad of cityGraph[currentCityIndex]) {
      const { targetCity: nextCityIndex, currencyCost: requiredTravelCurrency, duration: travelDuration } = connectedRoad;

      // Check if there's enough currency to pay for this road.
      if (currentCurrency < requiredTravelCurrency) {
        continue; // Cannot afford this road.
      }

      const currencyRemainingAfterTravel = currentCurrency - requiredTravelCurrency;
      const timeAfterTravel = currentTime + travelDuration;

      // If this new state (nextCityIndex, currencyRemainingAfterTravel) can be reached faster, update and enqueue.
      if (timeAfterTravel < minTimeStates[nextCityIndex][currencyRemainingAfterTravel]) {
        minTimeStates[nextCityIndex][currencyRemainingAfterTravel] = timeAfterTravel;
        traversalQueue.add([timeAfterTravel, nextCityIndex, currencyRemainingAfterTravel]);
      }
    }
  }

  // The problem typically asks for results for cities 1 to N.
  // Since internal cities are 0-indexed (0 to N-1), `slice(1)` effectively skips
  // the result for city 0 (which corresponds to input city 1), and provides results
  // for input cities 2 through N. This is often the case if city 1 is the starting point
  // and its own trivial arrival time (0) is not part of the expected output.
  return finalNodeArrivalTimes.slice(1).join("\n");
}

// Execute the main problem-solving logic and output the result.
const calculatedOutput = determineMinimumTravelTimes();
console.log(calculatedOutput);