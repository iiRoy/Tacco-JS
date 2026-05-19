const fs = require('fs');

class TokenQueue {
    constructor(initialItems = []) {
        this.queueItems = initialItems;
        this.dequeueIndex = 0;
        this.queueSize = initialItems.length;
    }

    enqueue(item) {
        this.queueItems.push(item);
        this.queueSize++;
    }

    dequeue() {
        if (this.dequeueIndex >= this.queueItems.length) {
            return undefined;
        }
        const dequeuedItem = this.queueItems[this.dequeueIndex];
        this.dequeueIndex++;
        this.queueSize--;
        return dequeuedItem;
    }

    clear() {
        this.queueItems = [];
        this.dequeueIndex = 0;
        this.queueSize = 0;
    }
}

class InputParser {
    constructor(rawDataString) {
        const tokens = rawDataString.trim().split(/\s+/g);
        this.tokenStream = new TokenQueue(tokens);
    }

    readStringToken() {
        return this.tokenStream.dequeue();
    }

    readIntToken() {
        const token = this.tokenStream.dequeue();
        return parseInt(token, 10);
    }

    clearTokens() {
        this.tokenStream.clear();
    }
}

function solveProblem(inputReader) {
    const numItems = inputReader.readIntToken();

    const itemConditions = new Array(numItems);
    const conditionCounts = new Array(numItems);

    for (let itemIdx = 0; itemIdx < numItems; itemIdx++) {
        const currentItemConditionCount = inputReader.readIntToken();
        conditionCounts[itemIdx] = currentItemConditionCount;

        const conditionsForCurrentItem = new Array(currentItemConditionCount);
        for (let condIdx = 0; condIdx < currentItemConditionCount; condIdx++) {
            const targetItemIdx = inputReader.readIntToken() - 1;
            const expectedBitValue = inputReader.readIntToken();
            conditionsForCurrentItem[condIdx] = {
                targetItemIdx: targetItemIdx,
                expectedBitValue: expectedBitValue
            };
        }
        itemConditions[itemIdx] = conditionsForCurrentItem;
    }

    let maxValidCount = 0;

    const checkSingleItemValidity = (itemIndex, currentMask, conditions) => {
        const numConditions = conditions.length;
        for (let condIdx = 0; condIdx < numConditions; condIdx++) {
            const condition = conditions[condIdx];
            const targetBit = (currentMask >> condition.targetItemIdx) & 1;
            if (targetBit !== condition.expectedBitValue) {
                return false;
            }
        }
        return true;
    };

    const totalSubsets = 1 << numItems;
    for (let currentMask = 0; currentMask < totalSubsets; currentMask++) {
        let isValidSubset = true;
        let currentSubsetCount = 0;

        for (let checkItemIdx = 0; checkItemIdx < numItems; checkItemIdx++) {
            if (((currentMask >> checkItemIdx) & 1) === 1) {
                currentSubsetCount++;
                if (!checkSingleItemValidity(checkItemIdx, currentMask, itemConditions[checkItemIdx])) {
                    isValidSubset = false;
                    break;
                }
            }
        }

        if (isValidSubset) {
            maxValidCount = Math.max(currentSubsetCount, maxValidCount);
        }
    }

    console.log(maxValidCount);
}

try {
    const inputContent = fs.readFileSync("/dev/stdin", "utf8");
    const parserInstance = new InputParser(inputContent);
    solveProblem(parserInstance);
} catch (error) {
    throw error;
}
