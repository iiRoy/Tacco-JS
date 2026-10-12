"use strict";

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenStream = (function* () {
    const tokens = fileContent.split(/\s+/).filter(t => t.length > 0);
    let currentIdx = 0;
    while (currentIdx < tokens.length) {
        yield tokens[currentIdx++];
    }
})();

function obtainNumericValue() {
    return Number(tokenStream.next().value);
}

function obtainNumericSequence(count) {
    return Array.from({ length: count }, obtainNumericValue);
}

function obtainNumericGrid(rows, columns) {
    return Array.from({ length: rows }, () => obtainNumericSequence(columns));
}

function constructMultiArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDim = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDim }, () => constructMultiArray(initialValue, ...remainingDims));
}

class PriorityQueueAlternative {
    #priorityBuckets = new Map();
    #minPriority = Infinity;
    #size = 0;

    enqueue(priority, city, silver) {
        if (priority < this.#minPriority) {
            this.#minPriority = priority;
        }
        const bucket = this.#priorityBuckets.get(priority);
        if (bucket) {
            bucket.push([city, silver]);
        } else {
            this.#priorityBuckets.set(priority, [[city, silver]]);
        }
        this.#size++;
    }

    dequeue() {
        if (this.#size === 0) {
            return undefined;
        }

        while (!this.#priorityBuckets.has(this.#minPriority) || this.#priorityBuckets.get(this.#minPriority).length === 0) {
            const currentKeys = Array.from(this.#priorityBuckets.keys());
            if (currentKeys.length === 0) {
                this.#minPriority = Infinity;
                return undefined;
            }
            this.#minPriority = Math.min(...currentKeys);
        }

        const bucket = this.#priorityBuckets.get(this.#minPriority);
        const [city, silver] = bucket.shift();
        this.#size--;

        if (bucket.length === 0) {
            this.#priorityBuckets.delete(this.#minPriority);
        }
        return [this.#minPriority, city, silver];
    }

    get isEmpty() {
        return this.#size === 0;
    }
}

const result = processMainLogic();
if (result !== undefined) {
    console.log(result);
}

function processMainLogic() {
    const [cityCount, roadCount, initialSilver] = obtainNumericSequence(3);
    const maxSilverCapacity = cityCount * 50 - cityCount;

    const cityConnections = new Map();
    for (let i = 0; i < cityCount; i++) {
        cityConnections.set(i, []);
    }

    for (let i = 0; i < roadCount; i++) {
        const [uRaw, vRaw, silverReq, timeReq] = obtainNumericSequence(4);
        const uAdjusted = uRaw - 1;
        const vAdjusted = vRaw - 1;
        cityConnections.get(uAdjusted).push({ destination: vAdjusted, silverCost: silverReq, timeCost: timeReq });
        cityConnections.get(vAdjusted).push({ destination: uAdjusted, silverCost: silverReq, timeCost: timeReq });
    }

    const exchangeRates = obtainNumericGrid(cityCount, 2);

    const minTimeState = new Map();
    for (let i = 0; i < cityCount; i++) {
        const silverMap = new Map();
        for (let j = 0; j <= maxSilverCapacity; j++) {
            silverMap.set(j, 1e18);
        }
        minTimeState.set(i, silverMap);
    }

    const finalCityTimes = new Map();
    for (let i = 0; i < cityCount; i++) {
        finalCityTimes.set(i, 1e18);
    }

    const explorationQueue = new PriorityQueueAlternative();
    let citiesRemaining = cityCount;

    const startingSilver = Math.min(initialSilver, maxSilverCapacity);
    explorationQueue.enqueue(0, 0, startingSilver);
    minTimeState.get(0).set(startingSilver, 0);

    while (!explorationQueue.isEmpty) {
        const [currentTime, currentCity, currentSilver] = explorationQueue.dequeue();

        if (finalCityTimes.get(currentCity) === 1e18) {
            citiesRemaining--;
            finalCityTimes.set(currentCity, currentTime);
        }

        if (minTimeState.get(currentCity).get(currentSilver) < currentTime) {
            continue;
        }

        if (currentSilver < maxSilverCapacity) {
            const silverGain = exchangeRates[currentCity][0];
            const timeCost = exchangeRates[currentCity][1];

            const nextSilver = Math.min(currentSilver + silverGain, maxSilverCapacity);
            const nextTime = currentTime + timeCost;

            if (minTimeState.get(currentCity).get(nextSilver) > nextTime) {
                minTimeState.get(currentCity).set(nextSilver, nextTime);
                explorationQueue.enqueue(nextTime, currentCity, nextSilver);
            }
        }

        for (const connection of cityConnections.get(currentCity)) {
            const { destination: nextCity, silverCost: travelSilverCost, timeCost: travelTimeCost } = connection;

            if (currentSilver >= travelSilverCost) {
                const nextSilver = currentSilver - travelSilverCost;
                const nextTime = currentTime + travelTimeCost;

                if (minTimeState.get(nextCity).get(nextSilver) > nextTime) {
                    minTimeState.get(nextCity).set(nextSilver, nextTime);
                    explorationQueue.enqueue(nextTime, nextCity, nextSilver);
                }
            }
        }
    }

    const outputLines = [];
    for (let i = 1; i < cityCount; i++) {
        outputLines.push(finalCityTimes.get(i));
    }
    return outputLines.join("\n");
}
