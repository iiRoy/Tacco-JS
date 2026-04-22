"use strict";

const dataStore = (function() {
    let tokensBuffer = [];
    let currentPosition = 0;

    const populateTokens = () => {
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        tokensBuffer = fileContent.split(/\s+/).filter(Boolean);
        currentPosition = 0;
    };

    const retrieveNextToken = (asNumeric = true) => {
        if (currentPosition >= tokensBuffer.length) {
            throw new Error("Input exhausted.");
        }
        const item = tokensBuffer[currentPosition++];
        return asNumeric ? Number(item) : item;
    };

    const retrieveMultipleTokens = (count, asNumeric = true) => {
        const collection = [];
        for (let i = 0; i < count; i++) {
            collection.push(retrieveNextToken(asNumeric));
        }
        return collection;
    };

    const retrieveTokenGrid = (rows, columns, asNumeric = true) => {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            grid.push(retrieveMultipleTokens(columns, asNumeric));
        }
        return grid;
    };

    populateTokens(); // Initialize buffer upon creation

    return {
        grabNext: retrieveNextToken,
        grabMany: retrieveMultipleTokens,
        grabGrid: retrieveTokenGrid,
    };
})();

const initializeDeepArray = (dimensions, initialDatum) => {
    if (dimensions.length === 0) {
        return initialDatum;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        initializeDeepArray(remainingDimensions, initialDatum)
    );
};

class TaskQueue {
    constructor() {
        this.tasks = [];
    }

    // task is [priority, ...data]
    insertTask(task) {
        this.tasks.push(task);
        this._heapifyUp(this.tasks.length - 1);
    }

    // Extracts the task with the lowest priority
    extractMinTask() {
        if (this.isQueueEmpty()) {
            return undefined;
        }
        const minimumTask = this.tasks[0];
        const lastTask = this.tasks.pop();
        if (!this.isQueueEmpty()) {
            this.tasks[0] = lastTask;
            this._heapifyDown(0);
        }
        return minimumTask;
    }

    isQueueEmpty() {
        return this.tasks.length === 0;
    }

    _heapifyUp(idx) {
        let current = idx;
        while (current > 0) {
            const parent = Math.floor((current - 1) / 2);
            if (this.tasks[parent][0] <= this.tasks[current][0]) {
                break;
            }
            [this.tasks[parent], this.tasks[current]] = [this.tasks[current], this.tasks[parent]];
            current = parent;
        }
    }

    _heapifyDown(idx) {
        let current = idx;
        const totalElements = this.tasks.length;
        while (true) {
            const left = 2 * current + 1;
            const right = 2 * current + 2;
            let smallestPriorityIndex = current;

            if (left < totalElements && this.tasks[left][0] < this.tasks[smallestPriorityIndex][0]) {
                smallestPriorityIndex = left;
            }
            if (right < totalElements && this.tasks[right][0] < this.tasks[smallestPriorityIndex][0]) {
                smallestPriorityIndex = right;
            }

            if (smallestPriorityIndex === current) {
                break;
            }

            [this.tasks[current], this.tasks[smallestPriorityIndex]] = [this.tasks[smallestPriorityIndex], this.tasks[current]];
            current = smallestPriorityIndex;
        }
    }
}

function calculateOptimalTravel() {
    const [numberOfCities, numberOfRoads, startingCurrency] = dataStore.grabMany(3);
    const INFINITE_COST = 10 ** 18;
    const MAXIMUM_CURRENCY_CAP = (numberOfCities - 1) * 50;

    const cityConnections = initializeDeepArray([numberOfCities], []);
    for (let r = 0; r < numberOfRoads; r++) {
        const [origin, destination, currencyRequired, travelDuration] = dataStore.grabMany(4);
        const originIndex = origin - 1;
        const destinationIndex = destination - 1;
        cityConnections[originIndex].push([destinationIndex, currencyRequired, travelDuration]);
        cityConnections[destinationIndex].push([originIndex, currencyRequired, travelDuration]);
    }

    const cityTransactionDetails = dataStore.grabGrid(numberOfCities, 2);

    const minimumTimePerState = new Map(); // Map<city, Map<currency, time>>
    const finalMinimumTimes = initializeDeepArray([numberOfCities], INFINITE_COST);

    const taskScheduler = new TaskQueue();

    let adjustedStartingCurrency = Math.min(startingCurrency, MAXIMUM_CURRENCY_CAP);

    // Initial state: 0 time, city 0, adjustedStartingCurrency
    minimumTimePerState.set(0, new Map([[adjustedStartingCurrency, 0]]));
    taskScheduler.insertTask([0, 0, adjustedStartingCurrency]); // [time, city, currency]

    while (!taskScheduler.isQueueEmpty()) {
        const [currentTravelTime, currentCityIdentifier, currentCoinBalance] = taskScheduler.extractMinTask();

        // If a faster path to this state has already been found, skip
        const recordedTimeForState = minimumTimePerState.get(currentCityIdentifier)?.get(currentCoinBalance) || INFINITE_COST;
        if (recordedTimeForState < currentTravelTime) {
            continue;
        }

        // If this is the first time we determine the final minimum time for this city
        if (finalMinimumTimes[currentCityIdentifier] === INFINITE_COST) {
            finalMinimumTimes[currentCityIdentifier] = currentTravelTime;
        }

        // Action 1: Stay in current city to gain currency
        if (currentCoinBalance < MAXIMUM_CURRENCY_CAP) {
            const [currencyGained, durationSpent] = cityTransactionDetails[currentCityIdentifier];
            const nextCoinBalance = Math.min(currentCoinBalance + currencyGained, MAXIMUM_CURRENCY_CAP);
            const nextTravelTime = currentTravelTime + durationSpent;

            const existingStateTime = minimumTimePerState.get(currentCityIdentifier)?.get(nextCoinBalance) || INFINITE_COST;
            if (nextTravelTime < existingStateTime) {
                if (!minimumTimePerState.has(currentCityIdentifier)) {
                    minimumTimePerState.set(currentCityIdentifier, new Map());
                }
                minimumTimePerState.get(currentCityIdentifier).set(nextCoinBalance, nextTravelTime);
                taskScheduler.insertTask([nextTravelTime, currentCityIdentifier, nextCoinBalance]);
            }
        }

        // Action 2: Discard 1 unit of currency (0 time cost)
        if (currentCoinBalance > 0) {
            const nextCoinBalance = currentCoinBalance - 1;
            const existingStateTime = minimumTimePerState.get(currentCityIdentifier)?.get(nextCoinBalance) || INFINITE_COST;
            if (currentTravelTime < existingStateTime) {
                if (!minimumTimePerState.has(currentCityIdentifier)) {
                    minimumTimePerState.set(currentCityIdentifier, new Map());
                }
                minimumTimePerState.get(currentCityIdentifier).set(nextCoinBalance, currentTravelTime);
                taskScheduler.insertTask([currentTravelTime, currentCityIdentifier, nextCoinBalance]);
            }
        }

        // Action 3: Traverse to connected cities
        for (const [connectedCity, requiredCurrency, journeyDuration] of cityConnections[currentCityIdentifier]) {
            if (currentCoinBalance >= requiredCurrency) {
                const nextCoinBalance = currentCoinBalance - requiredCurrency;
                const nextTravelTime = currentTravelTime + journeyDuration;

                const existingStateTime = minimumTimePerState.get(connectedCity)?.get(nextCoinBalance) || INFINITE_COST;
                if (nextTravelTime < existingStateTime) {
                    if (!minimumTimePerState.has(connectedCity)) {
                        minimumTimePerState.set(connectedCity, new Map());
                    }
                    minimumTimePerState.get(connectedCity).set(nextCoinBalance, nextTravelTime);
                    taskScheduler.insertTask([nextTravelTime, connectedCity, nextCoinBalance]);
                }
            }
        }
    }

    return finalMinimumTimes.slice(1).join("\n");
}

const journeyOutcome = calculateOptimalTravel();
if (journeyOutcome !== undefined) {
    console.log(journeyOutcome);
}