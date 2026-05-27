class FenwickTree {
    constructor(sizeLimit) {
        this.treeStorage = new Array(sizeLimit + 1).fill(0);
        this.maxIndex = sizeLimit;
    }

    // Modifies the value at a specific index (1-based) by adding a delta
    adjustValue(position, changeAmount) {
        for (; position <= this.maxIndex; position += position & -position) {
            this.treeStorage[position] += changeAmount;
        }
    }

    // Computes the cumulative sum from the first element up to a given index (1-based)
    retrievePrefixSum(position) {
        let currentSum = 0;
        for (; position > 0; position -= position & -position) {
            currentSum += this.treeStorage[position];
        }
        return currentSum;
    }

    // Calculates the sum of values within a specified range (1-based, inclusive)
    calculateRangeSum(startPosition, endPosition) {
        if (startPosition > endPosition) return 0;
        return this.retrievePrefixSum(endPosition) - this.retrievePrefixSum(startPosition - 1);
    }
}

function Main(inputContent) {
    const dataLines = inputContent.split("\n");
    const [arrayLength, queryCount] = dataLines.shift().split(" ").map(Number);
    const valueSequence = dataLines.shift().split(" ").map(Number);

    const previousOccurrenceIndices = new Array(arrayLength).fill(-1);
    const lastSeenPositionMap = new Map();

    for (let i = 0; i < arrayLength; i++) {
        const currentElement = valueSequence[i];
        if (lastSeenPositionMap.has(currentElement)) {
            previousOccurrenceIndices[i] = lastSeenPositionMap.get(currentElement);
        }
        lastSeenPositionMap.set(currentElement, i);
    }

    const queriesGroupedByRightEndpoint = new Array(arrayLength).fill(null).map(() => []);
    for (let qi = 0; qi < queryCount; qi++) {
        let [queryLeft, queryRight] = dataLines[qi].split(" ").map(Number);
        // Convert to 0-indexed
        queryLeft--;
        queryRight--;
        queriesGroupedByRightEndpoint[queryRight].push([queryLeft, qi]);
    }

    const finalResults = new Array(queryCount);
    const bitStructure = new FenwickTree(arrayLength);

    for (let currentProcessingIndex = 0; currentProcessingIndex < arrayLength; currentProcessingIndex++) {
        const prevPosition = previousOccurrenceIndices[currentProcessingIndex];
        if (prevPosition !== -1) {
            bitStructure.adjustValue(prevPosition + 1, -1); // Remove contribution of previous occurrence
        }
        bitStructure.adjustValue(currentProcessingIndex + 1, 1); // Add contribution of current occurrence

        for (const [leftBoundary, originalQueryIndex] of queriesGroupedByRightEndpoint[currentProcessingIndex]) {
            finalResults[originalQueryIndex] = bitStructure.calculateRangeSum(leftBoundary + 1, currentProcessingIndex + 1);
        }
    }

    for (let i = 0; i < queryCount; i++) {
        console.log(finalResults[i]);
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
