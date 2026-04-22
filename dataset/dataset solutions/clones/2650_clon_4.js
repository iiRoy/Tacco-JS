const obtainNumericData = (sourceText) => {
    const lineProcessor = (function* () {
        const processedLines = sourceText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        for (const currentLineContent of processedLines) {
            yield currentLineContent;
        }
    })();

    const parseNumbersFromString = (textLine) => textLine.split(/\s+/).map(Number);

    const firstDataLine = lineProcessor.next().value;
    const elementCount = parseNumbersFromString(firstDataLine)[0];

    const secondDataLine = lineProcessor.next().value;
    const referenceQuantities = parseNumbersFromString(secondDataLine);

    const thirdDataLine = lineProcessor.next().value;
    const mutableQuantities = parseNumbersFromString(thirdDataLine);

    return {
        totalItems: elementCount,
        referenceStates: referenceQuantities,
        currentStates: mutableQuantities
    };
};

const createPrioritizedCollection = () => {
    const priorityMapping = new Map(); // priority_value -> Array of item_indices
    let orderedPriorityKeys = [];    // sorted list of priority_values

    const addEntry = (priority_value, item_index) => {
        if (!priorityMapping.has(priority_value)) {
            priorityMapping.set(priority_value, []);
            const insertionPoint = orderedPriorityKeys.findIndex(p => p > priority_value);
            if (insertionPoint === -1) {
                orderedPriorityKeys.push(priority_value);
            } else {
                orderedPriorityKeys.splice(insertionPoint, 0, priority_value);
            }
        }
        priorityMapping.get(priority_value).push(item_index);
    };

    const retrieveSmallestPriorityEntry = () => {
        if (orderedPriorityKeys.length === 0) {
            return undefined;
        }

        const minPriorityKey = orderedPriorityKeys[0];
        const indicesForMinPriority = priorityMapping.get(minPriorityKey);
        const extractedIndex = indicesForMinPriority.shift();

        if (indicesForMinPriority.length === 0) {
            priorityMapping.delete(minPriorityKey);
            orderedPriorityKeys.shift();
        }
        return { priority: minPriorityKey, index: extractedIndex };
    };

    const hasAnyElements = () => orderedPriorityKeys.length > 0;

    return {
        insert: addEntry,
        extractMin: retrieveSmallestPriorityEntry,
        emptyCheck: () => !hasAnyElements()
    };
};

const processTransformation = (sourceTextContent) => {
    const dataset = obtainNumericData(sourceTextContent);
    const elementQuantity = dataset.totalItems;
    const initialReference = dataset.referenceStates;
    const currentMutable = [...dataset.currentStates];

    const activeElementsQueue = createPrioritizedCollection();
    let cumulativeOperations = 0;

    initialReference.forEach((refVal, elementIdx) => {
        const currentVal = currentMutable[elementIdx];
        if (refVal === currentVal) {
            // Already matched, nothing to do
        } else if (refVal > currentVal) {
            throw new Error("-1"); // Cannot achieve reference state
        } else {
            activeElementsQueue.insert(-currentVal, elementIdx); // Prioritize larger current values (smaller negative)
        }
    });

    while (!activeElementsQueue.emptyCheck()) {
        const itemWithMinPriority = activeElementsQueue.extractMin();
        const currentElementIndex = itemWithMinPriority.index;

        const previousElementIndex = (currentElementIndex + elementQuantity - 1) % elementQuantity;
        const nextElementIndex = (currentElementIndex + 1) % elementQuantity;

        const sumOfNeighbors = currentMutable[previousElementIndex] + currentMutable[nextElementIndex];

        if (sumOfNeighbors === 0) {
            throw new Error("-1"); // Cannot make progress
        }

        const requiredDifference = currentMutable[currentElementIndex] - initialReference[currentElementIndex];
        const multiplier = Math.floor(requiredDifference / sumOfNeighbors);

        if (multiplier <= 0) {
            throw new Error("-1"); // No valid reduction possible
        }

        cumulativeOperations += multiplier;
        currentMutable[currentElementIndex] -= sumOfNeighbors * multiplier;

        const updatedValue = currentMutable[currentElementIndex];
        const targetValue = initialReference[currentElementIndex];

        if (targetValue === updatedValue) {
            // Element successfully adjusted
        } else if (targetValue > updatedValue) {
            throw new Error("-1"); // Over-adjusted past target
        } else {
            activeElementsQueue.insert(-updatedValue, currentElementIndex);
        }
    }

    return cumulativeOperations;
};

const executeMainLogic = (inputFeed) => {
    try {
        return processTransformation(inputFeed);
    } catch (failure) {
        if (failure.message === "-1") {
            return -1;
        }
        throw failure; // Re-throw any other unexpected errors
    }
};

const inputSource = require("fs").readFileSync("/dev/stdin","utf8");
console.log(executeMainLogic(inputSource));