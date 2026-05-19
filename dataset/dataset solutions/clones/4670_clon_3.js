const computePermutations = (totalItems, itemsToPick) => {
    let productResult = 1;
    for (let iterCount = 0; iterCount < itemsToPick; iterCount++) {
        productResult *= totalItems - iterCount;
    }
    return productResult;
};

const computeCombinations = (totalAvailable, toSelect) => {
    // C(n, r) = P(n, r) / P(r, r)
    // Handle edge case C(n, 0) = 1
    if (toSelect === 0) {
        return 1;
    }
    // Handle edge case C(n, r) = 0 if r > n
    if (toSelect > totalAvailable) {
        return 0;
    }
    return computePermutations(totalAvailable, toSelect) / computePermutations(toSelect, toSelect);
};

const inputLines = [];
const ioModule = require('readline');

const inputReader = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', (currentInputLine) => {
    inputLines.push(currentInputLine);
});

inputReader.on('close', () => {
    // Parse initial parameters: N, A, B
    const paramLine = inputLines.shift();
    const [totalElementsCount, minElementsToSelect, maxElementsToSelect] = paramLine.split(" ").map(Number);

    // Read and parse the array of values
    const valueStrings = inputLines.shift().split(" ");
    const numericValues = new Array(totalElementsCount);
    for (let index = 0; index < totalElementsCount; index++) {
        numericValues[index] = Number(valueStrings[index]);
    }

    // Sort the values in descending order
    numericValues.sort((a, b) => b - a);

    let calculatedAverageValue = 0;
    const valueFrequencyMap = {}; // Using an object as a frequency map

    // Calculate sum for average of top 'A' elements and populate frequency map for all 'N' elements
    for (let currentValIndex = 0; currentValIndex < totalElementsCount; currentValIndex++) {
        const currentValue = numericValues[currentValIndex];
        if (currentValIndex < minElementsToSelect) {
            calculatedAverageValue += currentValue;
        }
        // Increment frequency count for the current value
        valueFrequencyMap[currentValue] = (valueFrequencyMap[currentValue] || 0) + 1;
    }

    // Finalize average calculation and print
    calculatedAverageValue /= minElementsToSelect;
    console.log(calculatedAverageValue);

    let elementsProcessed = 0;
    let totalPossibleCombinations = 0;

    // Determine combinations based on whether the first 'B' values are all the same
    const firstValueInSortedList = numericValues[0];
    const lastValueInMaxRange = numericValues[maxElementsToSelect - 1];

    if (firstValueInSortedList !== lastValueInMaxRange) {
        // Case 1: The first 'maxElementsToSelect' values are not all identical.
        // We need to count combinations for selecting exactly 'minElementsToSelect' items.
        totalPossibleCombinations = 1; // Initialize for multiplication

        for (let loopIndex = 0; loopIndex < totalElementsCount; loopIndex++) {
            const currentNumericValue = numericValues[loopIndex];
            const currentValFrequency = valueFrequencyMap[currentNumericValue];

            if (currentValFrequency >= 2) { // If this value appears multiple times
                // Calculate how many of this value we need to choose to reach 'minElementsToSelect'
                const countToChoose = Math.min(currentValFrequency, minElementsToSelect - elementsProcessed);
                totalPossibleCombinations *= computeCombinations(currentValFrequency, countToChoose);
                elementsProcessed += currentValFrequency;
                loopIndex += currentValFrequency - 1; // Skip identical elements already processed
            } else { // If this value appears only once
                // This branch is effectively `totalPossibleCombinations *= computeCombinations(1, Math.min(1, minElementsToSelect - elementsProcessed))`
                // which is always `totalPossibleCombinations *= 1`.
                elementsProcessed += currentValFrequency; // Add 1 to processed count
            }
        }
    } else {
        // Case 2: All values from the first up to 'maxElementsToSelect'-th are identical.
        // This implies all values from numericValues[0] to numericValues[maxElementsToSelect-1] are the same.
        // We need to count combinations where we pick 'selectionSize' items, where 'selectionSize' ranges from 'minElementsToSelect' to 'maxElementsToSelect'.
        // All these items must be the same value (firstValueInSortedList).
        for (let selectionSize = minElementsToSelect; selectionSize <= maxElementsToSelect; selectionSize++) {
            totalPossibleCombinations += computeCombinations(valueFrequencyMap[firstValueInSortedList], selectionSize);
        }
    }
    console.log(totalPossibleCombinations);
});
