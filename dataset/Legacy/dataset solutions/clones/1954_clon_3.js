"use strict";

// --- Input Parsing Utilities (Type III Refactor) ---
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokens = rawInputData.split(/ |\n/); // Original behavior: empty strings from split are converted to 0 by Number()
let currentTokenPointer = 0;

/**
 * Reads a specified number of tokens from the input stream.
 * @param {number} count The number of tokens to read.
 * @param {boolean} [asString=false] If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readTokens(count, asString = false) {
    const tokens = [];
    for (let i = 0; i < count; i++) {
        const token = inputTokens[currentTokenPointer++];
        tokens.push(asString ? token : Number(token));
    }
    return tokens;
}

/**
 * Reads a matrix of tokens from the input stream.
 * @param {number} height The number of rows.
 * @param {number} width The number of columns.
 * @param {boolean} [asString=false] If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function readMatrixTokens(height, width, asString = false) {
    const matrix = [];
    for (let i = 0; i < height; i++) {
        matrix.push(readTokens(width, asString));
    }
    return matrix;
}

/**
 * Creates an N-dimensional array initialized with a given value.
 * This function replaces the original xArray, avoiding the use of eval.
 * @param {*} initialValue The value to initialize array elements with.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} The N-dimensional array.
 */
function createNDimensionalArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array(currentDimSize).fill(null).map(() => createNDimensionalArray(initialValue, ...remainingDims));
}

// --- Priority Queue Implementation (Type III Refactor to Class) ---
class MinHeapQueue {
    constructor() {
        this.heapElements = [];
    }

    _getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    _getLeftChildIndex(idx) { return 2 * idx + 1; }
    _getRightChildIndex(idx) { return 2 * idx + 2; }

    _swap(idx1, idx2) {
        [this.heapElements[idx1], this.heapElements[idx2]] = [this.heapElements[idx2], this.heapElements[idx1]];
    }

    push(item) {
        this.heapElements.push(item);
        this._siftUp();
    }

    _siftUp() {
        let currentIndex = this.heapElements.length - 1;
        while (currentIndex > 0) {
            const parentIndex = this._getParentIndex(currentIndex);
            // Compare based on the first element of the item (priority)
            if (this.heapElements[parentIndex][0] <= this.heapElements[currentIndex][0]) {
                break;
            }
            this._swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
        }
    }

    pop() {
        if (this.heapElements.length === 0) {
            return undefined;
        }
        if (this.heapElements.length === 1) {
            return this.heapElements.pop();
        }

        const extractedElement = this.heapElements[0];
        this.heapElements[0] = this.heapElements.pop(); // Move last element to root
        this._siftDown();
        return extractedElement;
    }

    _siftDown() {
        let currentIndex = 0;
        const currentHeapSize = this.heapElements.length;
        
        while (true) {
            const leftChildIndex = this._getLeftChildIndex(currentIndex);
            const rightChildIndex = this._getRightChildIndex(currentIndex);
            let smallestChildIndex = currentIndex;

            // Check left child
            if (leftChildIndex < currentHeapSize && this.heapElements[leftChildIndex][0] < this.heapElements[smallestChildIndex][0]) {
                smallestChildIndex = leftChildIndex;
            }

            // Check right child
            if (rightChildIndex < currentHeapSize && this.heapElements[rightChildIndex][0] < this.heapElements[smallestChildIndex][0]) {
                smallestChildIndex = rightChildIndex;
            }

            // If current element is already smaller than its children, stop
            if (smallestChildIndex === currentIndex) {
                break;
            }

            this._swap(currentIndex, smallestChildIndex);
            currentIndex = smallestChildIndex;
        }
    }

    isEmpty() {
        return this.heapElements.length === 0;
    }
}

// --- Main Program Logic (Type III Modifications) ---
const INFINITY = 1e18; // Extracted magic number into a named constant

/**
 * Helper function to update the minimum time map and push to priority queue if a better path is found.
 * This encapsulates the common logic for updating states in Dijkstra's.
 * @param {number} time The new calculated time.
 * @param {number} city The target city.
 * @param {number} silver The silver amount at the target city.
 * @param {MinHeapQueue} queue The priority queue instance.
 * @param {Array<Array<number>>} timeMap The 2D array storing min times for (city, silver) states.
 */
function tryUpdateAndPushToQueue(time, city, silver, queue, timeMap) {
    if (timeMap[city][silver] > time) {
        timeMap[city][silver] = time;
        queue.push([time, city, silver]);
    }
}

function solve() {
    const [numCities, numRoads, initialSilverAmount] = readTokens(3);
    
    // Calculate maximum silver capacity. Original expression: n*50-n.
    const maxSilverCapacity = numCities * 50 - numCities; 

    // Adjacency list for graph: adjacencyList[u] = [[v, silver_cost, time_cost], ...]
    const adjacencyList = createNDimensionalArray([], numCities);
    for (let i = 0; i < numRoads; i++) {
        const [cityU, cityV, silverCost, timeCost] = readTokens(4);
        // Adjust to 0-indexed cities
        const adjustedU = cityU - 1;
        const adjustedV = cityV - 1;
        adjacencyList[adjustedU].push([adjustedV, silverCost, timeCost]);
        adjacencyList[adjustedV].push([adjustedU, silverCost, timeCost]); // Graph is undirected
    }

    // Exchange rates: exchangeRates[city] = [silver_gain, time_cost]
    const exchangeRates = readMatrixTokens(numCities, 2);

    // minTravelTimes[city][silver_amount] = minimum_time_to_reach_this_state
    const minTravelTimes = createNDimensionalArray(INFINITY, numCities, maxSilverCapacity + 1);
    
    // shortestTimesToAllCities[city] = minimum_time_to_reach_this_city regardless of silver amount
    const shortestTimesToAllCities = createNDimensionalArray(INFINITY, numCities);
    
    const dijkstraQueue = new MinHeapQueue();

    // Clamp initial silver amount to the maximum allowed capacity
    const clampedInitialSilver = Math.min(initialSilverAmount, maxSilverCapacity);
    
    // Initialize Dijkstra's with the starting city (city 0), 0 time, and clamped initial silver
    dijkstraQueue.push([0, 0, clampedInitialSilver]);
    minTravelTimes[0][clampedInitialSilver] = 0; // Set initial state time

    let unvisitedCitiesCount = numCities; // Counter for cities whose shortest path is not yet finalized

    // Dijkstra's algorithm main loop
    while (!dijkstraQueue.isEmpty() && unvisitedCitiesCount > 0) {
        const [currentTime, currentCity, currentSilver] = dijkstraQueue.pop();

        // Guard clause: If a shorter path to this (city, silver) state has already been found, skip
        if (minTravelTimes[currentCity][currentSilver] < currentTime) {
            continue;
        }

        // If this is the first time we finalize the shortest path to currentCity (regardless of silver)
        if (shortestTimesToAllCities[currentCity] === INFINITY) {
            unvisitedCitiesCount--;
            shortestTimesToAllCities[currentCity] = currentTime;
        }

        // Option 1: Exchange silver at the current city
        // This action is only possible if current silver is less than the maximum capacity
        if (currentSilver < maxSilverCapacity) {
            const silverGain = exchangeRates[currentCity][0];
            const exchangeTimeCost = exchangeRates[currentCity][1];

            const newTimeAfterExchange = currentTime + exchangeTimeCost;
            let newSilverAfterExchange = currentSilver + silverGain;
            
            // Ensure the new silver amount does not exceed the maximum capacity
            if (newSilverAfterExchange > maxSilverCapacity) {
                newSilverAfterExchange = maxSilverCapacity;
            }
            
            tryUpdateAndPushToQueue(newTimeAfterExchange, currentCity, newSilverAfterExchange, dijkstraQueue, minTravelTimes);
        }

        // Option 2: Travel to adjacent cities via roads
        for (const roadDetails of adjacencyList[currentCity]) {
            const [targetCity, silverCost, timeCost] = roadDetails;

            // Check if there is enough silver to travel this road
            const remainingSilverAfterTravel = currentSilver - silverCost;
            if (remainingSilverAfterTravel < 0) {
                continue; // Cannot afford this road, skip to next road
            }

            const newTimeAfterTravel = currentTime + timeCost;
            
            tryUpdateAndPushToQueue(newTimeAfterTravel, targetCity, remainingSilverAfterTravel, dijkstraQueue, minTravelTimes);
        }
    }
    
    // The problem asks for shortest times to cities 1 to N-1 (excluding city 0).
    return shortestTimesToAllCities.slice(1).join("\n");
}

const finalOutput = solve();
if (finalOutput !== undefined) {
    console.log(finalOutput);
}
