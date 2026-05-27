"use strict";
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

// Helper for parsing input tokens
const getNextToken = (asString) => {
    const token = tokenStream[tokenIndex++];
    return asString ? token : Number(token);
};

const getTokens = (count, asString) => {
    const tokens = tokenStream.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    return asString ? tokens : tokens.map(Number);
};

const getMatrixTokens = (height, width, asString) => {
    const matrixRows = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        const rowTokens = tokenStream.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        matrixRows.push(asString ? rowTokens : rowTokens.map(Number));
    }
    return matrixRows;
};

// Helper for creating multi-dimensional arrays without eval
const createMultiDimArray = (initialValue, ...dimensions) => {
    const createDimension = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return Array(dimensions[dimIndex]).fill(initialValue);
        } else {
            return Array(dimensions[dimIndex]).fill(null).map(() => createDimension(dimIndex + 1));
        }
    };
    return createDimension(0);
};

// Priority Queue implementation using a Min-Heap
class MinHeapPriorityQueue {
    constructor() {
        this.internalHeap = [];
    }

    insertElement(element) { // element is [priority, data...]
        const heap = this.internalHeap;
        let currentIndex = heap.length;
        heap.push(element); // Add to the end initially

        // Bubble up the new element to maintain heap property
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            if (heap[parentIndex][0] <= element[0]) {
                break; // Correct position found
            }
            // Swap with parent
            heap[currentIndex] = heap[parentIndex];
            currentIndex = parentIndex;
        }
        heap[currentIndex] = element;
    }

    extractMin() {
        const heap = this.internalHeap;
        const heapSize = heap.length;

        if (heapSize === 0) {
            return undefined; // Heap is empty
        }
        if (heapSize === 1) {
            return heap.pop(); // Only one element, just remove and return
        }

        const minElement = heap[0]; // The smallest element is at the root
        const lastElement = heap.pop(); // Remove the last element
        heap[0] = lastElement; // Place it at the root

        let currentIndex = 0;
        const newHeapSize = heap.length;
        const halfNewHeapSize = Math.floor(newHeapSize / 2);

        // Bubble down the new root to maintain heap property
        while (currentIndex < halfNewHeapSize) {
            let leftChildIndex = (currentIndex * 2) + 1;
            let rightChildIndex = (currentIndex * 2) + 2;
            let smallestChildIndex = leftChildIndex;

            // Determine which child is smaller (if right child exists and is smaller)
            if (rightChildIndex < newHeapSize && heap[rightChildIndex][0] < heap[leftChildIndex][0]) {
                smallestChildIndex = rightChildIndex;
            }

            if (heap[currentIndex][0] <= heap[smallestChildIndex][0]) {
                break; // Correct position found
            }

            // Swap with the smallest child
            [heap[currentIndex], heap[smallestChildIndex]] = [heap[smallestChildIndex], heap[currentIndex]];
            currentIndex = smallestChildIndex;
        }
        return minElement;
    }

    isEmpty() {
        return this.internalHeap.length === 0;
    }
}

// Main program execution
const programOutput = solveProblem();
if (programOutput !== undefined) {
    console.log(programOutput);
}

function solveProblem() {
    const [numNodes, numEdges, initialSilver] = getTokens(3);
    const infinityVal = 1e18; // A large value representing infinity
    const maxSilverCapacity = (numNodes - 1) * 50; // Maximum possible silver needed

    // Adjacency list for graph: adjList[u] = [[v, silverCost, timeCost], ...]
    const adjList = createMultiDimArray([], numNodes);
    for (let i = 0; i < numEdges; i++) {
        const [nodeU, nodeV, silverCost, timeCost] = getTokens(4);
        const uZeroIndexed = nodeU - 1;
        const vZeroIndexed = nodeV - 1;
        adjList[uZeroIndexed].push([vZeroIndexed, silverCost, timeCost]);
        adjList[vZeroIndexed].push([uZeroIndexed, silverCost, timeCost]); // Undirected graph
    }

    // Exchange rates: exchangeRates[node] = [silverGained, timeCost]
    const exchangeRates = getMatrixTokens(numNodes, 2);

    // minCostMap[node][silverAmount] = minimum time to reach 'node' with 'silverAmount'
    const minCostMap = createMultiDimArray(infinityVal, numNodes, maxSilverCapacity + 1);

    let remainingNodesToVisit = numNodes; // Count of nodes whose final min cost is not yet determined
    const minCostsToNodes = createMultiDimArray(infinityVal, numNodes); // Final minimum costs to each node

    const priorityQ = new MinHeapPriorityQueue();

    // Helper function to update the minCostMap and push to the priority queue
    const tryUpdateAndPush = (targetNode, targetSilver, newTime, currentMap, priorityQueueInstance) => {
        // Guard against invalid silver amounts (negative or exceeding max capacity)
        if (targetSilver < 0 || targetSilver > maxSilverCapacity) {
            return;
        }
        // Only update and push if a shorter path to this state is found
        if (currentMap[targetNode][targetSilver] > newTime) {
            currentMap[targetNode][targetSilver] = newTime;
            priorityQueueInstance.insertElement([newTime, targetNode, targetSilver]);
        }
    };

    // Initialize starting state for Dijkstra's algorithm
    let currentSilverAtStart = initialSilver;
    if (currentSilverAtStart > maxSilverCapacity) {
        currentSilverAtStart = maxSilverCapacity;
    }
    priorityQ.insertElement([0, 0, currentSilverAtStart]); // [time, node, silver]
    minCostMap[0][currentSilverAtStart] = 0;

    // Dijkstra's algorithm main loop
    while (!priorityQ.isEmpty() && remainingNodesToVisit > 0) {
        const extractedItem = priorityQ.extractMin();
        // This check is for robustness, isEmpty() should prevent undefined
        if (extractedItem === undefined) {
            break;
        }
        const [currentTime, currentNode, currentSilver] = extractedItem;

        // If we have already found a better path to this specific state (node, silver), skip
        if (minCostMap[currentNode][currentSilver] < currentTime) {
            continue;
        }

        // If this is the first time we finalize the minimum cost to this node (regardless of silver amount)
        if (minCostsToNodes[currentNode] === infinityVal) {
            remainingNodesToVisit--;
            minCostsToNodes[currentNode] = currentTime;
        }

        // Action 1: Exchange silver at the current node
        // This action is only possible if currentSilver is not already at max capacity
        if (currentSilver < maxSilverCapacity) {
            const silverGainedFromExchange = exchangeRates[currentNode][0];
            const timeCostForExchange = exchangeRates[currentNode][1];
            const nextSilverAfterExchange = Math.min(currentSilver + silverGainedFromExchange, maxSilverCapacity);
            const timeAfterExchange = currentTime + timeCostForExchange;
            tryUpdateAndPush(currentNode, nextSilverAfterExchange, timeAfterExchange, minCostMap, priorityQ);
        }

        // Action 2: Discard 1 silver (if possible)
        // This action has no time cost, only reduces silver by 1.
        const silverAfterDecrement = currentSilver - 1;
        // tryUpdateAndPush handles the silverAfterDecrement < 0 check
        tryUpdateAndPush(currentNode, silverAfterDecrement, currentTime, minCostMap, priorityQ);

        // Action 3: Travel to adjacent nodes
        const neighbors = adjList[currentNode];
        for (let i = 0; i < neighbors.length; i++) {
            const [neighborNode, travelSilverCost, travelTimeCost] = neighbors[i];
            const silverAfterTravel = currentSilver - travelSilverCost;
            const timeAfterTravel = currentTime + travelTimeCost;
            // tryUpdateAndPush handles the silverAfterTravel < 0 check
            tryUpdateAndPush(neighborNode, silverAfterTravel, timeAfterTravel, minCostMap, priorityQ);
        }
    }

    // The problem asks for costs to nodes 1 to N-1 (excluding node 0)
    return minCostsToNodes.slice(1).join("\n");
}
