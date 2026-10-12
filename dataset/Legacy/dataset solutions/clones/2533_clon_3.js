const InputParser = (function () {
    class DataProcessor {
        constructor(sourceString) {
            this._sourceLines = sourceString.trim().split("\n");
        }

        getLineValue(lineIndex) {
            return this._sourceLines[lineIndex];
        }

        getLineAsArray(lineIndex) {
            return this.stringToArray(this._sourceLines[lineIndex]);
        }

        getSlicedValues(startIndex, limitCount) {
            const effectiveEndIndex = (limitCount !== undefined && limitCount !== null) ? +limitCount + startIndex : undefined;
            return this._sourceLines.slice(startIndex, effectiveEndIndex).map(val => this.stringToValue(val));
        }

        getSlicedArrays(startIndex, limitCount) {
            const effectiveEndIndex = (limitCount !== undefined && limitCount !== null) ? +limitCount + startIndex : undefined;
            return this._sourceLines.slice(startIndex, effectiveEndIndex).map(val => this.stringToArray(val));
        }

        stringToArray(inputString) {
            return inputString.split(" ").map(val => this.stringToValue(val));
        }

        stringToValue(inputValue) {
            const parsedNumericValue = +inputValue;
            return (parsedNumericValue === parsedNumericValue) ? parsedNumericValue : inputValue;
        }
    }

    function createParserInstance(sourceString) {
        return new DataProcessor(sourceString);
    }

    return createParserInstance;
})();

const inputData = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(main());

function main() {
    const firstLineData = inputData.getLineAsArray(0);
    const numItems = firstLineData[0];
    const numPairs = firstLineData[1];

    const itemInfo = inputData.getSlicedArrays(1);
    const processedKeys = [];
    let targetBitmask = 0;

    // Calculate the target bitmask by summing powers of 2 from 1 to numItems
    for (let itemIdx = numItems; itemIdx > 0; itemIdx--) {
        targetBitmask += (1 << itemIdx);
    }

    // Helper function to compute bitmask from an array of bits
    const computeCombinedBitmask = (accumulator, currentBit) => accumulator | (1 << currentBit);

    // Process raw item information into a structured array of objects
    const totalPairIterations = numPairs * 2;
    for (let pairIdx = 0; pairIdx < totalPairIterations; pairIdx += 2) {
        const currentCost = itemInfo[pairIdx][0];
        const currentBitmask = itemInfo[pairIdx + 1].reduce(computeCombinedBitmask, 0);

        processedKeys.push({
            cost: currentCost,
            bitmask: currentBitmask
        });
    }

    const foundCosts = calculateCombinations(targetBitmask, processedKeys);

    if (foundCosts.length === 0) {
        return -1;
    }

    // Helper function for numeric ascending sort
    const sortNumericallyAscending = (a, b) => a - b;
    const sortedCosts = foundCosts.sort(sortNumericallyAscending);

    return sortedCosts[0];
}

function calculateCombinations(targetBitmask, availableKeys, currentAccumulatedKey) {
    // If there are no keys left to process, return an empty array of results
    if (availableKeys.length === 0) {
        return [];
    }

    // Initialize the current combination's cost and bitmask
    const initialCombination = currentAccumulatedKey || { cost: 0, bitmask: 0 };
    const currentCostAccumulator = initialCombination.cost;
    const currentBitmaskAccumulator = initialCombination.bitmask;

    let intermediateResults = [];

    // Iterate through each key in the current set of availableKeys
    for (let i = 0; i < availableKeys.length; i++) {
        const keyToConsider = availableKeys[i];

        // Form a new combination by adding the current key's values
        const nextCombinationCost = currentCostAccumulator + keyToConsider.cost;
        const nextCombinationBitmask = currentBitmaskAccumulator | keyToConsider.bitmask;

        const nextCombination = {
            cost: nextCombinationCost,
            bitmask: nextCombinationBitmask
        };

        // If this new combination achieves the target bitmask, record its cost
        if (nextCombination.bitmask === targetBitmask) {
            intermediateResults.push(nextCombination.cost);
        }

        // Recursively call with the *tail* of the current availableKeys array
        // and the newly formed combination. This specific slicing behavior
        // is preserved from the original code.
        const remainingKeysForRecursion = availableKeys.slice(1);
        const recursiveResults = calculateCombinations(targetBitmask, remainingKeysForRecursion, nextCombination);
        intermediateResults = intermediateResults.concat(recursiveResults);
    }

    return intermediateResults;
}
