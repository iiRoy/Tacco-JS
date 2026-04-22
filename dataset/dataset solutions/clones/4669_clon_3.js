// This script processes numerical data from standard input to calculate a maximum average
// and then determines a count of specific combinations based on the input values.

// An array to buffer all incoming lines of text from standard input.
const inputDataLines = [];

// Leverage the 'readline' module for stream-based input/output handling.
const ioInterfaceModule = require('readline');

// Establish an interactive interface for reading from stdin and writing to stdout.
const ioHandler = ioInterfaceModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener: when a line of input is received, append it to our buffer.
ioHandler.on('line', (currentLineText) => {
    inputDataLines.push(currentLineText);
});

// Event listener: triggered when the input stream concludes (e.g., EOF or Ctrl+D).
ioHandler.on('close', () => {
    // Implement a guard clause for insufficient input.
    if (inputDataLines.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines.");
        return; // Terminate execution if critical input is missing.
    }

    // Parse the first line to extract key numerical parameters.
    const [totalElementsCountStr, minSelectionSizeStr, maxSelectionSizeStr] = inputDataLines.shift().split(" ");

    // Convert string-based parameters to their numerical equivalents.
    const totalElementsCount = Number(totalElementsCountStr);
    const minSelectionSize = Number(minSelectionSizeStr);
    const maxSelectionSize = Number(maxSelectionSizeStr);

    // Robust validation for the initial parameters (Type III: added guard clauses).
    if (isNaN(totalElementsCount) || isNaN(minSelectionSize) || isNaN(maxSelectionSize) ||
        totalElementsCount < 0 || minSelectionSize < 0 || maxSelectionSize < 0 ||
        minSelectionSize > totalElementsCount || maxSelectionSize > totalElementsCount) {
        console.error("Error: One or more input parameters (N, A, B) are invalid or out of range.");
        return;
    }

    // Retrieve and process the second line containing the array of element values.
    // Utilize the `map` function for a concise conversion to an array of numbers.
    const elementValues = inputDataLines.shift().split(" ").map(Number);

    // Validate if the number of provided elements matches the declared totalElementsCount.
    if (elementValues.length !== totalElementsCount) {
        console.error(`Error: Expected ${totalElementsCount} elements, but received ${elementValues.length}.`);
        return;
    }

    // Sort the numeric array in descending order. This ensures the largest values are at the beginning.
    elementValues.sort((valA, valB) => valB - valA);

    let maxAchievableAverage = 0;
    // An object to store the frequency of each unique value within the elementValues array.
    const valueFrequencyMap = {};

    // Iterate through the sorted elements to compute the sum for the maximum average
    // and simultaneously populate the frequency map.
    for (let idx = 0; idx < totalElementsCount; ++idx) {
        const currentValue = elementValues[idx];
        // Sum the top `minSelectionSize` elements to calculate the maximum possible sum.
        if (idx < minSelectionSize) {
            maxAchievableAverage += currentValue;
        }
        // Increment the count for the current value in the frequency map.
        valueFrequencyMap[currentValue] = (valueFrequencyMap[currentValue] || 0) + 1;
    }

    // Calculate the final maximum average by dividing the sum by the count of selected elements.
    // Add a check to prevent division by zero if `minSelectionSize` could theoretically be zero.
    if (minSelectionSize > 0) {
        maxAchievableAverage /= minSelectionSize;
    } else {
        // If no elements are selected, the average is zero (or undefined, depending on context).
        maxAchievableAverage = 0;
    }

    // Output the computed maximum average to standard output.
    console.log(maxAchievableAverage);

    let totalCombinations = 0; // This variable will store the final count of combinations.

    // --- Logic for determining the number of combinations ---
    // This section evaluates two distinct scenarios for calculating combinations,
    // based on the relationship between the first and (minSelectionSize + 1)-th elements.

    // Scenario 1: The first element is distinct from the (minSelectionSize + 1)-th element.
    // This implies that the top `minSelectionSize` elements may not all be identical,
    // or if they are, the element immediately following them is smaller.
    if (elementValues[0] !== elementValues[minSelectionSize]) {
        // In this case, the maximum average is achieved by selecting the top `minSelectionSize` elements.
        // We need to count the ways to pick exactly `minSelectionSize` elements such that
        // the smallest value among them is `elementValues[minSelectionSize - 1]`.
        // First, count how many elements among the top `minSelectionSize` are strictly greater
        // than `elementValues[minSelectionSize - 1]`. These must be included.
        let elementsStrictlyGreaterThanTarget = 0;
        for (let k = 0; k < minSelectionSize; ++k) {
            if (elementValues[k] > elementValues[minSelectionSize - 1]) {
                elementsStrictlyGreaterThanTarget++;
            }
        }
        // Then, determine how many elements equal to `elementValues[minSelectionSize - 1]`
        // need to be chosen to complete the `minSelectionSize` selection.
        const neededTargetValues = minSelectionSize - elementsStrictlyGreaterThanTarget;
        // Calculate combinations: choose `neededTargetValues` from the total available
        // count of `elementValues[minSelectionSize - 1]`.
        totalCombinations = calculateCombinations(valueFrequencyMap[elementValues[minSelectionSize - 1]], neededTargetValues);
    } else {
        // Scenario 2: The first element is identical to the (minSelectionSize + 1)-th element.
        // This indicates that all elements from index 0 up to at least `minSelectionSize`
        // (and potentially up to `maxSelectionSize`) are the same maximum value.
        // In this situation, any selection of `j` items (where `minSelectionSize <= j <= maxSelectionSize`),
        // all equal to the maximum value (`elementValues[0]`), will yield the same maximum average.
        // We sum the combinations for picking `j` items from the total count of the maximum value.
        const maxValFrequency = valueFrequencyMap[elementValues[0]];

        // Iterate from `minSelectionSize` up to `maxSelectionSize`.
        for (let j = minSelectionSize; j <= maxSelectionSize; ++j) {
            // Add combinations, ensuring `j` does not exceed the available frequency of the max value.
            if (j <= maxValFrequency) { // Added a guard for valid combination arguments.
                totalCombinations += calculateCombinations(maxValFrequency, j);
            }
        }
    }

    // Output the final count of combinations.
    console.log(totalCombinations);
});

// A cache for memoization of combination results to improve performance for repeated calculations.
const combinationCache = new Map();

/**
 * Computes the number of k-permutations of n items (P(n, k)).
 * P(n, k) = n! / (n-k)!
 * @param {number} totalItems - The total number of distinct items (n).
 * @param {number} itemsToChoose - The number of items to select and arrange (k).
 * @returns {number} The calculated number of permutations.
 */
const calculatePermutations = (totalItems, itemsToChoose) => {
    // Input validation for permutation parameters (Type III: added validation).
    if (itemsToChoose < 0 || itemsToChoose > totalItems) {
        return 0; // Invalid input: cannot choose negative items or more than available.
    }
    if (itemsToChoose === 0) {
        return 1; // By definition, P(n, 0) = 1.
    }

    let resultProduct = 1;
    // Calculate the product of `itemsToChoose` terms starting from `totalItems` downwards.
    for (let loopIndex = 0; loopIndex < itemsToChoose; ++loopIndex) {
        resultProduct *= (totalItems - loopIndex);
    }
    return resultProduct;
};

/**
 * Computes the number of k-combinations of n items (C(n, k)).
 * C(n, k) = n! / (k! * (n-k)!)
 * This function utilizes memoization to cache previously computed results.
 * @param {number} totalItems - The total number of distinct items (n).
 * @param {number} itemsToChoose - The number of items to choose without regard to order (k).
 * @returns {number} The calculated number of combinations.
 */
const calculateCombinations = (totalItems, itemsToChoose) => {
    // Input validation for combination parameters (Type III: added validation).
    if (itemsToChoose < 0 || itemsToChoose > totalItems) {
        return 0; // Invalid input: cannot form combinations with these parameters.
    }
    if (itemsToChoose === 0 || itemsToChoose === totalItems) {
        return 1; // By definition, C(n, 0) = 1 and C(n, n) = 1.
    }

    // Optimization: C(n, k) = C(n, n-k). Choose the smaller k for fewer calculations.
    if (itemsToChoose > totalItems / 2) {
        itemsToChoose = totalItems - itemsToChoose;
    }

    // Construct a unique cache key for the current (totalItems, itemsToChoose) pair.
    const cacheKey = `${totalItems}-${itemsToChoose}`;
    // Check if the result for this combination has already been computed and cached.
    if (combinationCache.has(cacheKey)) {
        return combinationCache.get(cacheKey); // Return cached result (Type III: added memoization).
    }

    // Compute the combination using the formula C(n, k) = P(n, k) / P(k, k).
    // P(k, k) is equivalent to k!.
    const result = calculatePermutations(totalItems, itemsToChoose) / calculatePermutations(itemsToChoose, itemsToChoose);

    // Store the newly computed result in the cache for future use.
    combinationCache.set(cacheKey, result);

    return result;
};