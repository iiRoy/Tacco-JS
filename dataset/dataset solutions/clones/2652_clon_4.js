var dataParser = (function() {
    let inputLinesStorage;
    let currentInputLinePointer = 0;

    function prepareInput(rawInputContent) {
        inputLinesStorage = rawInputContent.split('\n').filter(lineContent => lineContent.length > 0);
        currentInputLinePointer = 0;
    }

    function acquireSingleNumericValue() {
        if (currentInputLinePointer >= inputLinesStorage.length) {
            throw new Error("Input exhaustion detected.");
        }
        const numericValue = parseInt(inputLinesStorage[currentInputLinePointer].trim(), 10);
        currentInputLinePointer++;
        return numericValue;
    }

    function acquireNumericSequence() {
        if (currentInputLinePointer >= inputLinesStorage.length) {
            throw new Error("Input exhaustion detected.");
        }
        const sequenceOfNumbers = inputLinesStorage[currentInputLinePointer].trim().split(' ').map(Number);
        currentInputLinePointer++;
        return sequenceOfNumbers;
    }

    return {
        setup: prepareInput,
        fetchSingle: acquireSingleNumericValue,
        fetchSequence: acquireNumericSequence
    };
})();

class ItemPriorityTracker {
    #priorityMap = new Map(); // Stores Map<numericPriority, Set<itemIdentifier>>

    constructor() {}

    enroll(numericPriority, itemIdentifier) {
        if (!this.#priorityMap.has(numericPriority)) {
            this.#priorityMap.set(numericPriority, new Set());
        }
        this.#priorityMap.get(numericPriority).add(itemIdentifier);
    }

    retrieveAndRemoveHighest() {
        if (this.isEmpty()) {
            return undefined;
        }

        let currentHighestPriorityKey = -Infinity;
        for (const pKey of this.#priorityMap.keys()) {
            if (pKey > currentHighestPriorityKey) {
                currentHighestPriorityKey = pKey;
            }
        }
        
        const identifiersSet = this.#priorityMap.get(currentHighestPriorityKey);
        const anIdentifier = identifiersSet.values().next().value;

        identifiersSet.delete(anIdentifier);

        if (identifiersSet.size === 0) {
            this.#priorityMap.delete(currentHighestPriorityKey);
        }
        return { priorityVal: currentHighestPriorityKey, identifier: anIdentifier };
    }

    isEmpty() {
        return this.#priorityMap.size === 0;
    }
}

function getPreviousPos(currentPos, totalElements) {
    return (currentPos - 1 + totalElements) % totalElements;
}

function getNextPos(currentPos, totalElements) {
    return (currentPos + 1) % totalElements;
}

function performCalculation() {
    dataParser.setup(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalItems = dataParser.fetchSingle();
    const targetValues = dataParser.fetchSequence();
    const currentValues = dataParser.fetchSequence();

    const processingQueue = new ItemPriorityTracker();
    let totalAdjustments = 0;

    let processingIndex = 0;
    while(processingIndex < totalItems) {
        if (targetValues[processingIndex] === currentValues[processingIndex]) {
            // Item already matches target, no action required
        } else if (targetValues[processingIndex] > currentValues[processingIndex]) {
            return -1; // Target value is unachievable
        } else {
            processingQueue.enroll(-currentValues[processingIndex], processingIndex);
        }
        processingIndex++;
    }

    while (!processingQueue.isEmpty()) {
        const processedItem = processingQueue.retrieveAndRemoveHighest();
        const currentPosition = processedItem.identifier;
        const actualValue = -processedItem.priorityVal;

        const previousPosition = getPreviousPos(currentPosition, totalItems);
        const nextPosition = getNextPos(currentPosition, totalItems);

        const sumOfNeighbors = currentValues[previousPosition] + currentValues[nextPosition];

        const adjustmentCount = currentValues[currentPosition] / sumOfNeighbors | 0;

        if (adjustmentCount === 0) {
            return -1;
        }

        totalAdjustments += adjustmentCount;
        currentValues[currentPosition] %= sumOfNeighbors;

        if (targetValues[currentPosition] === currentValues[currentPosition]) {
            // Item now aligns with target, no re-enrollment
        } else if (targetValues[currentPosition] > currentValues[currentPosition]) {
            return -1;
        } else {
            processingQueue.enroll(-currentValues[currentPosition], currentPosition);
        }
    }

    return totalAdjustments;
}

console.log(performCalculation());