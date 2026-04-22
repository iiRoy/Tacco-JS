"use strict";

// This module provides utilities for reading input from stdin.
// It tokenizes the entire input and offers methods to retrieve values.
const fileSystem = require("fs");
const NEWLINE_SPLIT_PATTERN = / |\n/; // Delimiter for splitting input into tokens

let rawInputBuffer = fileSystem.readFileSync("/dev/stdin", "utf8");
let inputTokenBuffer = rawInputBuffer.split(NEWLINE_SPLIT_PATTERN);
let currentTokenPointer = 0; // Tracks the current position in the token buffer

/**
 * Retrieves the next token from the input stream.
 * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, attempts to parse as a number.
 * @returns {string|number} The next token.
 */
function retrieveNextToken(asString = false) {
    if (currentTokenPointer >= inputTokenBuffer.length) {
        // Optionally throw an error or return a default value for out-of-bounds access
        console.error("Attempted to read past end of input stream.");
        return asString ? "" : NaN;
    }
    const tokenValue = inputTokenBuffer[currentTokenPointer++];
    return asString ? tokenValue : Number(tokenValue);
}

/**
 * Reads a specified number of tokens from the input stream.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, parses as numbers.
 * @returns {Array<string|number>} An array containing the read tokens.
 */
function readNTokens(count, asStrings = false) {
    if (count <= 0) return [];
    const startIdx = currentTokenPointer;
    currentTokenPointer += count;
    const tokens = inputTokenBuffer.slice(startIdx, currentTokenPointer);

    if (asStrings) {
        return tokens;
    } else {
        return tokens.map(str => Number(str));
    }
}

/**
 * Constructs a multi-dimensional array initialized with a specific value.
 * This function recursively builds nested arrays based on provided dimensions.
 * @param {*} initialValue - The value to initialize all elements with.
 * @param {...number} dimensions - A variable number of arguments representing the size of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function createInitializedNestedArray(initialValue, ...dimensions) {
    const totalDimensions = dimensions.length;
    if (totalDimensions === 0) {
        return initialValue;
    }

    let currentDimensionIndex = 0;

    function createDimension(currentDim) {
        const size = dimensions[currentDim];
        if (size <= 0) return [];
        const newArray = new Array(size);
        for (let i = 0; i < size; i++) {
            if (currentDim === totalDimensions - 1) {
                newArray[i] = initialValue;
            } else {
                newArray[i] = createDimension(currentDim + 1);
            }
        }
        return newArray;
    }

    return createDimension(currentDimensionIndex);
}

/**
 * Implements Dijkstra's algorithm to find the shortest paths from a source node
 * in a graph.
 */
class GraphShortestPathFinder {
    /**
     * Initializes a new graph with a specified number of nodes.
     * @param {number} nodeCount - The total number of nodes in the graph.
     */
    constructor(nodeCount) {
        this.nodeAdjacencyList = Array(nodeCount).fill(null).map(() => []);
    }

    /**
     * Adds a directed edge to the graph.
     * @param {number} sourceNode - The starting node of the edge.
     * @param {number} targetNode - The ending node of the edge.
     * @param {number} edgeWeight - The cost or weight of traversing this edge.
     */
    addDirectedConnection(sourceNode, targetNode, edgeWeight) {
        if (sourceNode < 0 || sourceNode >= this.nodeAdjacencyList.length) {
            console.warn(`Invalid source node index: ${sourceNode}`);
            return;
        }
        this.nodeAdjacencyList[sourceNode].push({ target: targetNode, weight: edgeWeight });
    }

    /**
     * Adds an undirected (bidirectional) edge to the graph.
     * @param {number} nodeA - The first node of the edge.
     * @param {number} nodeB - The second node of the edge.
     * @param {number} edgeWeight - The cost or weight of traversing this edge.
     */
    addUndirectedConnection(nodeA, nodeB, edgeWeight) {
        this.addDirectedConnection(nodeA, nodeB, edgeWeight);
        this.addDirectedConnection(nodeB, nodeA, edgeWeight);
    }

    /**
     * Computes the shortest paths from a given starting node to all other nodes.
     * @param {number} startNodeIndex - The index of the starting node for path calculation.
     * @returns {Array<number>} An array where each element `i` is the minimum cost to reach node `i` from the start node.
     */
    computeShortestPaths(startNodeIndex) {
        const MAX_PATH_COST = Number.MAX_SAFE_INTEGER; // Represents infinity for path costs
        const currentGraph = this.nodeAdjacencyList;
        const totalNodes = currentGraph.length;

        if (startNodeIndex < 0 || startNodeIndex >= totalNodes) {
            console.error(`Starting node index ${startNodeIndex} is out of bounds for a graph of ${totalNodes} nodes.`);
            return Array(totalNodes).fill(MAX_PATH_COST);
        }

        let distanceToNode = Array(totalNodes).fill(MAX_PATH_COST);
        distanceToNode[startNodeIndex] = 0;

        let minCostPriorityQueue = new MinimumPriorityQueue();
        minCostPriorityQueue.insertElement(0, startNodeIndex); // Push [cost, node]

        // Process nodes until the priority queue is empty
        while (!minCostPriorityQueue.isEmpty()) {
            const [currentCost, currentNode] = minCostPriorityQueue.extractMin();

            // If we found a shorter path to this node previously, skip
            if (currentCost > distanceToNode[currentNode]) {
                continue;
            }

            // Explore neighbors of the current node
            for (const edge of currentGraph[currentNode]) {
                const neighborNode = edge.target;
                const edgeWeight = edge.weight;
                const potentialNewCost = currentCost + edgeWeight;

                // If a shorter path to the neighbor is found
                if (potentialNewCost < distanceToNode[neighborNode]) {
                    distanceToNode[neighborNode] = potentialNewCost;
                    minCostPriorityQueue.insertElement(potentialNewCost, neighborNode);
                }
            }
        }
        return distanceToNode;
    }
}

/**
 * A min-priority queue implementation using a binary heap,
 * allowing for storage of multiple associated values per priority.
 * This class is designed to store numerical priorities and arbitrary associated data.
 */
class MinimumPriorityQueue {
    constructor() {
        this.heapElements = []; // Stores priorities in a min-heap structure
        this.dataAssociations = new Map(); // Maps priority to an array of associated data
    }

    /**
     * Inserts an element into the priority queue.
     * @param {number} priorityValue - The numerical priority of the element.
     * @param {*} associatedData - The data associated with this priority.
     */
    insertElement(priorityValue, associatedData) {
        const elements = this.heapElements;
        const associations = this.dataAssociations;

        // Add associated data to its priority's list
        if (!associations.has(priorityValue)) {
            associations.set(priorityValue, []);
        }
        associations.get(priorityValue).push(associatedData);

        // Heapify-up operation
        let currentIndex = elements.length;
        elements.push(priorityValue); // Temporarily add at end for placement
        let parentIndex = Math.floor((currentIndex - 1) / 2);

        while (currentIndex > 0 && elements[currentIndex] < elements[parentIndex]) {
            [elements[currentIndex], elements[parentIndex]] = [elements[parentIndex], elements[currentIndex]]; // Swap
            currentIndex = parentIndex;
            parentIndex = Math.floor((currentIndex - 1) / 2);
        }
    }

    /**
     * Extracts the element with the smallest priority from the queue.
     * @returns {Array<number|*>} An array containing [priorityValue, associatedData], or undefined if the queue is empty.
     */
    extractMin() {
        const elements = this.heapElements;
        const associations = this.dataAssociations;
        const heapSize = elements.length;

        if (heapSize === 0) {
            return undefined; // Queue is empty
        }

        const minPriority = elements[0];
        const associatedData = associations.get(minPriority).pop();

        // If no more data for this priority, remove the entry from the map
        if (associations.get(minPriority).length === 0) {
            associations.delete(minPriority);
        }

        if (heapSize === 1) {
            elements.pop(); // Last element, just remove it
            return [minPriority, associatedData];
        }

        // Replace root with last element and heapify-down
        elements[0] = elements.pop();
        let currentIndex = 0;
        const lastIndex = elements.length - 1;

        while (true) {
            let leftChildIndex = 2 * currentIndex + 1;
            let rightChildIndex = 2 * currentIndex + 2;
            let smallestIndex = currentIndex;

            if (leftChildIndex <= lastIndex && elements[leftChildIndex] < elements[smallestIndex]) {
                smallestIndex = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && elements[rightChildIndex] < elements[smallestIndex]) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex !== currentIndex) {
                [elements[currentIndex], elements[smallestIndex]] = [elements[smallestIndex], elements[currentIndex]]; // Swap
                currentIndex = smallestIndex;
            } else {
                break; // Heap property restored
            }
        }

        return [minPriority, associatedData];
    }

    /**
     * Checks if the priority queue is empty.
     * @returns {boolean} True if the queue contains no elements, false otherwise.
     */
    isEmpty() {
        return this.heapElements.length === 0;
    }

    /**
     * Returns the number of elements in the priority queue.
     * @returns {number} The current size of the queue.
     */
    get size() {
        return this.heapElements.length;
    }

    /**
     * Retrieves the minimum priority value without removing it.
     * @returns {number|undefined} The minimum priority value, or undefined if the queue is empty.
     */
    peekMin() {
        return this.heapElements.length > 0 ? this.heapElements[0] : undefined;
    }
}

// Define a constant for the maximum currency value or state capacity
const MAX_STATE_UNITS = 2500;

// Execute the primary solution logic and print the result
const applicationResult = executeProblemSolver();
if (applicationResult !== undefined) {
    console.log(applicationResult);
}

/**
 * Main function to process input, build the graph, solve the problem, and format output.
 * This function orchestrates the entire solution flow.
 * @returns {string} The formatted result string.
 */
function executeProblemSolver() {
    // Read initial problem parameters: number of cities, number of roads, initial currency amount
    const [numCities, numRoads, initialCurrencyAmount] = readNTokens(3);

    // Validate input parameters
    if (numCities <= 0 || numRoads < 0 || initialCurrencyAmount < 0) {
        console.error("Invalid input parameters: numCities, numRoads, or initialCurrencyAmount must be non-negative.");
        return "";
    }

    // The graph nodes represent (city_id * MAX_STATE_UNITS + currency_amount)
    // This creates a state-space graph where each node is a (city, currency) pair.
    const totalGraphNodes = numCities * MAX_STATE_UNITS;
    const pathOptimizer = new GraphShortestPathFinder(totalGraphNodes);

    // --- Populate road connections (type 1 edges) ---
    // Each road connects two cities with a cost and currency exchange requirement.
    for (let roadIndex = 0; roadIndex < numRoads; roadIndex++) {
        const [cityA_idx, cityB_idx, currencyCost_A, timeCost_B] = readNTokens(4);
        // Adjust city indices to be 0-based
        const u_base = (cityA_idx - 1) * MAX_STATE_UNITS;
        const v_base = (cityB_idx - 1) * MAX_STATE_UNITS;

        // Iterate through possible currency amounts at the source city
        // If we have 'j' currency, and road costs 'currencyCost_A', we arrive at target with 'j - currencyCost_A' currency.
        // We only consider paths where we have enough currency.
        for (let currentCurrency = MAX_STATE_UNITS - 1; currentCurrency >= currencyCost_A; currentCurrency--) {
            const sourceNode_u = u_base + currentCurrency;
            const targetNode_v = v_base + (currentCurrency - currencyCost_A);
            pathOptimizer.addUndirectedConnection(sourceNode_u, targetNode_v, timeCost_B);
        }
    }

    // --- Populate currency exchange connections (type 2 edges) ---
    // Each city has an exchange rate and fee. This allows changing currency within a city.
    for (let cityIndex = 0; cityIndex < numCities; cityIndex++) {
        const [exchangeRate_C, exchangeFee_D] = readNTokens(2);
        const cityNodeBase = cityIndex * MAX_STATE_UNITS;

        // Iterate through possible currency amounts at the current city
        for (let currentCurrency = 0; currentCurrency < MAX_STATE_UNITS; currentCurrency++) {
            // Calculate new currency after exchange: currentCurrency + exchangeRate_C
            const newCurrencyAfterExchange = Math.min(MAX_STATE_UNITS - 1, currentCurrency + exchangeRate_C);

            // If the exchange results in a different currency amount and is valid
            if (newCurrencyAfterExchange > currentCurrency) { // Only add if currency increases
                const sourceNode_currentCurrency = cityNodeBase + currentCurrency;
                const targetNode_exchangedCurrency = cityNodeBase + newCurrencyAfterExchange;
                pathOptimizer.addDirectedConnection(sourceNode_currentCurrency, targetNode_exchangedCurrency, exchangeFee_D);
            }
        }
    }

    // Calculate shortest paths from the starting state (initial city, initial currency)
    // The initial currency might exceed MAX_STATE_UNITS, so cap it.
    const startingStateNode = Math.min(MAX_STATE_UNITS - 1, initialCurrencyAmount);
    const calculatedDistances = pathOptimizer.computeShortestPaths(startingStateNode);

    // --- Determine minimum costs for each city ---
    // For each city, find the minimum time to reach it, regardless of the final currency amount.
    const minTimePerCity = createInitializedNestedArray(Number.MAX_SAFE_INTEGER, numCities);

    // Iterate through all cities (excluding city 0, which is the starting city implicitly handled)
    for (let cityIter = 1; cityIter < numCities; cityIter++) {
        const cityNodeOffset = cityIter * MAX_STATE_UNITS;
        // Check all possible currency states for the current city
        for (let currencyState = 0; currencyState < MAX_STATE_UNITS; currencyState++) {
            const fullNodeIndex = cityNodeOffset + currencyState;
            // Update the minimum time to reach this city
            if (calculatedDistances[fullNodeIndex] < minTimePerCity[cityIter]) {
                minTimePerCity[cityIter] = calculatedDistances[fullNodeIndex];
            }
        }
    }

    // Format the results: join the minimum times for cities (excluding city 0) with newlines.
    // The original code uses `ans.slice(1)`, implying city 0's result is not needed in output.
    const outputLines = [];
    for (let i = 1; i < numCities; i++) {
        // If a city is unreachable, its value will be MAX_SAFE_INTEGER, which might need special handling
        // For this problem, it seems unreachable cities should also be printed as their large value.
        outputLines.push(minTimePerCity[i]);
    }
    return outputLines.join("\n");
}