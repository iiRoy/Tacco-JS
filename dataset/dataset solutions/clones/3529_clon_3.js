const fileSystem = require("fs");

class DataQueue {
    constructor(initialElements = []) {
        this.queueItems = initialElements;
        this.currentHeadIndex = 0;
        this.currentSize = initialElements.length;
    }

    enqueueItem(itemValue) {
        this.queueItems.push(itemValue);
        this.currentSize++;
    }

    dequeueItem() {
        if (this.currentHeadIndex >= this.queueItems.length) {
            // This case should not be reached with valid input as per problem constraints
            return undefined;
        }
        const dequeuedElement = this.queueItems[this.currentHeadIndex];
        this.currentHeadIndex++;
        // Note: currentSize is decremented in original, but not strictly necessary for correctness
        // if headIndex is used to track logical size. Preserving original behavior.
        this.currentSize--;
        return dequeuedElement;
    }

    resetQueue() {
        this.queueItems = [];
        this.currentHeadIndex = 0;
        this.currentSize = 0;
    }

    get isEmpty() {
        return this.currentSize === 0;
    }
}

class InputProcessor {
    constructor(rawInputString) {
        this.tokenQueue = new DataQueue();
        this._parseAndQueueInput(rawInputString);
    }

    _parseAndQueueInput(inputData) {
        const trimmedInput = inputData.trim();
        const tokens = trimmedInput.split(/\s+/g);
        tokens.forEach(token => this.tokenQueue.enqueueItem(token));
    }

    readNextString() {
        return this.tokenQueue.dequeueItem();
    }

    readNextInteger() {
        const stringValue = this.tokenQueue.dequeueItem();
        return parseInt(stringValue, 10);
    }

    finalizeInput() {
        this.tokenQueue.resetQueue();
    }
}

function outputNoAndReturn() {
    console.log("No");
    return; // Explicitly return undefined, matching `void console.log("No")`
}

function validateCharacterMapping(inputReaderInstance) {
    const sequenceA = inputReaderInstance.readNextString();
    const sequenceB = inputReaderInstance.readNextString();

    const sequenceLength = sequenceA.length;

    // Using plain objects instead of Map, as the original code accessed Map instances
    // using bracket notation like plain objects, effectively treating them as such.
    // Object.create(null) is used to avoid prototype pollution and ensure clean maps.
    const forwardMapping = Object.create(null); // Maps char from A -> char from B
    const backwardMapping = Object.create(null); // Maps char from B -> char from A

    // First pass: Build mappings and check for immediate inconsistencies
    for (let k = 0; k < sequenceLength; k++) {
        const charA = sequenceA[k];
        const charB = sequenceB[k];

        // Check if charA already has a forward mapping
        if (Object.prototype.hasOwnProperty.call(forwardMapping, charA)) {
            // If charA maps to a different charB, it's inconsistent
            if (forwardMapping[charA] !== charB) {
                return outputNoAndReturn();
            }
        } else {
            // Establish new forward mapping
            forwardMapping[charA] = charB;
            // Establish new backward mapping.
            // Consistency for backward mapping is implicitly checked in the second loop.
            backwardMapping[charB] = charA;
        }
    }

    // Second pass: Validate permutation properties based on the established mappings
    const uniqueKeysInA = Object.keys(forwardMapping);
    for (const currentKey of uniqueKeysInA) {
        const mappedValue = forwardMapping[currentKey];

        // Condition 1: If currentKey maps to itself (it's a fixed point)
        if (currentKey === mappedValue) {
            // If currentKey is a fixed point, it must not be the target of any other mapping.
            // i.e., backwardMapping[currentKey] must also be currentKey.
            if (backwardMapping[currentKey] !== currentKey) {
                return outputNoAndReturn();
            }
        }
        // Condition 2: If currentKey maps to mappedValue (not a fixed point, currentKey !== mappedValue)
        else {
            // Original condition: i[u] == o[i[u]]
            // This translates to: forwardMapping[currentKey] == backwardMapping[forwardMapping[currentKey]]
            // Which means: mappedValue == backwardMapping[mappedValue]
            // This checks if the mappedValue (v) is a fixed point in the backward mapping (v -> v).
            if (mappedValue === backwardMapping[mappedValue]) {
                return outputNoAndReturn();
            }
        }
    }

    console.log("Yes");
}

function executeMainLogic(inputContent) {
    const inputReader = new InputProcessor(inputContent);
    validateCharacterMapping(inputReader);
}

executeMainLogic(fileSystem.readFileSync("/dev/stdin", "utf8"));
