"use strict";

class InputParser {
    constructor(sourceText) {
        this.dataUnits = sourceText.split(/ |\n/);
        this.currentPosition = 0;
    }

    retrieveNext(asString = false) {
        if (this.currentPosition >= this.dataUnits.length) {
            throw new Error("Input exhausted.");
        }
        const unit = this.dataUnits[this.currentPosition++];
        return asString ? unit : Number(unit);
    }

    retrieveMultiple(count, asString = false) {
        const collection = [];
        for (let i = 0; i < count; i++) {
            collection.push(this.retrieveNext(asString));
        }
        return collection;
    }

    retrieveGrid(rows, columns, asString = false) {
        const grid = [];
        for (let i = 0; i < rows; i++) {
            grid.push(this.retrieveMultiple(columns, asString));
        }
        return grid;
    }
}

class BinaryMinHeap {
    constructor() {
        this.storage = [];
    }

    add(element) { // element is {cost, vertex, currency}
        this.storage.push(element);
        this._heapifyUp(this.storage.length - 1);
    }

    extractMinimum() {
        if (this.isEmpty()) {
            return undefined;
        }
        const minElement = this.storage[0];
        const lastElement = this.storage.pop();
        if (!this.isEmpty()) {
            this.storage[0] = lastElement;
            this._heapifyDown(0);
        }
        return minElement;
    }

    isEmpty() {
        return this.storage.length === 0;
    }

    _heapifyUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.storage[idx].cost >= this.storage[parentIdx].cost) {
                break;
            }
            [this.storage[idx], this.storage[parentIdx]] = [this.storage[parentIdx], this.storage[idx]];
            idx = parentIdx;
        }
    }

    _heapifyDown(idx) {
        const lastIdx = this.storage.length - 1;
        while (true) {
            let leftChild = 2 * idx + 1;
            let rightChild = 2 * idx + 2;
            let smallestChildIdx = idx;

            if (leftChild <= lastIdx && this.storage[leftChild].cost < this.storage[smallestChildIdx].cost) {
                smallestChildIdx = leftChild;
            }

            if (rightChild <= lastIdx && this.storage[rightChild].cost < this.storage[smallestChildIdx].cost) {
                smallestChildIdx = rightChild;
            }

            if (smallestChildIdx === idx) {
                break;
            }

            [this.storage[idx], this.storage[smallestChildIdx]] = [this.storage[smallestChildIdx], this.storage[idx]];
            idx = smallestChildIdx;
        }
    }
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const parser = new InputParser(fileContent);

const finalResult = processGraphProblem();
if (finalResult !== undefined) {
    console.log(finalResult);
}

function processGraphProblem() {
    const [nodeCount, edgeCount, initialCurrency] = parser.retrieveMultiple(3);
    const LARGE_VALUE = 1e18;
    const MAX_CURRENCY_AMOUNT = (nodeCount - 1) * 50;

    const adjacencyStructure = Array.from({ length: nodeCount }, () => []);
    for (let i = 0; i < edgeCount; i++) {
        const [sourceNode, targetNode, silverCost, timeCost] = parser.retrieveMultiple(4);
        const srcIdx = sourceNode - 1;
        const tgtIdx = targetNode - 1;
        adjacencyStructure[srcIdx].push({ destination: tgtIdx, silverRequired: silverCost, travelTime: timeCost });
        adjacencyStructure[tgtIdx].push({ destination: srcIdx, silverRequired: silverCost, travelTime: timeCost });
    }

    const currencyExchangeRates = parser.retrieveGrid(nodeCount, 2).map(([silverGained, timeSpent]) => ({ silverGained, timeSpent }));

    const minCostState = Array.from({ length: nodeCount }, () => new Array(MAX_CURRENCY_AMOUNT + 1).fill(LARGE_VALUE));
    const shortestPathTimes = new Array(nodeCount).fill(LARGE_VALUE);

    let unvisitedNodeCount = nodeCount;
    const traversalQueue = new BinaryMinHeap();

    const effectiveInitialCurrency = Math.min(initialCurrency, MAX_CURRENCY_AMOUNT);

    traversalQueue.add({ cost: 0, vertex: 0, currency: effectiveInitialCurrency });
    minCostState[0][effectiveInitialCurrency] = 0;

    while (!traversalQueue.isEmpty() && unvisitedNodeCount > 0) {
        const { cost: currentCost, vertex: currentVertex, currency: currentCurrency } = traversalQueue.extractMinimum();

        if (minCostState[currentVertex][currentCurrency] < currentCost) {
            continue;
        }

        if (shortestPathTimes[currentVertex] === LARGE_VALUE) {
            unvisitedNodeCount--;
            shortestPathTimes[currentVertex] = currentCost;
        }

        // Option 1: Exchange currency at the current vertex
        if (currentCurrency < MAX_CURRENCY_AMOUNT) {
            const { silverGained, timeSpent } = currencyExchangeRates[currentVertex];
            const nextCurrencyLevel = Math.min(currentCurrency + silverGained, MAX_CURRENCY_AMOUNT);
            const newAccumulatedCost = currentCost + timeSpent;

            if (newAccumulatedCost < minCostState[currentVertex][nextCurrencyLevel]) {
                minCostState[currentVertex][nextCurrencyLevel] = newAccumulatedCost;
                traversalQueue.add({ cost: newAccumulatedCost, vertex: currentVertex, currency: nextCurrencyLevel });
            }
        }

        // Option 2: Consider states with less currency at the same vertex and cost
        // This propagates the minimum cost to states with fewer currency units,
        // as having more currency is never worse.
        if (currentCurrency > 0) {
            const reducedCurrencyLevel = currentCurrency - 1;
            // The cost remains the same for this conceptual transition
            if (currentCost < minCostState[currentVertex][reducedCurrencyLevel]) {
                minCostState[currentVertex][reducedCurrencyLevel] = currentCost;
                traversalQueue.add({ cost: currentCost, vertex: currentVertex, currency: reducedCurrencyLevel });
            }
        }

        // Option 3: Travel along connected edges
        for (const connection of adjacencyStructure[currentVertex]) {
            const { destination: neighborVertex, silverRequired, travelTime } = connection;

            if (currentCurrency >= silverRequired) {
                const remainingCurrency = currentCurrency - silverRequired;
                const newAccumulatedCost = currentCost + travelTime;

                if (newAccumulatedCost < minCostState[neighborVertex][remainingCurrency]) {
                    minCostState[neighborVertex][remainingCurrency] = newAccumulatedCost;
                    traversalQueue.add({ cost: newAccumulatedCost, vertex: neighborVertex, currency: remainingCurrency });
                }
            }
        }
    }

    return shortestPathTimes.slice(1).join("\n");
}
