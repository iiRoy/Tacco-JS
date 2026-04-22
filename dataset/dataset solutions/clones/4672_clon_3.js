const inputBuffer = [];
const inputReaderModule = require('readline');

// Establish an interface for standard input and output operations
const interfaceHandle = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Register an event listener to capture each incoming line of text
interfaceHandle.on('line', (currentLineText) => {
    // Append the received line to our internal buffer for later processing
    inputBuffer.push(currentLineText);
});

// Register an event listener for when the input stream concludes
interfaceHandle.on('close', () => {
    // Perform initial validation: ensure at least two lines of input are available
    if (inputBuffer.length < 2) {
        console.error("Error: Insufficient input data. Expected at least two lines.");
        return; // Terminate execution if input is incomplete
    }

    // --- Step 1: Parse and validate the first line of input ---
    // This line typically contains key parameters: total elements, selection count, and a specific limit.
    const parameterLine = inputBuffer.shift();
    if (!parameterLine) {
        console.error("Error: The first line of input (parameters) is unexpectedly empty.");
        return;
    }

    // Destructure string parts and convert them to numeric types
    const [totalElementsStr, selectionSizeStr, maxConsideredIndexStr] = parameterLine.split(" ");
    const totalElementsCount = Number(totalElementsStr);
    const selectionSize = Number(selectionSizeStr);
    const maxConsideredIndex = Number(maxConsideredIndexStr); // Renamed from 'B' for clarity

    // Validate the parsed numeric parameters
    if (isNaN(totalElementsCount) || isNaN(selectionSize) || isNaN(maxConsideredIndex) ||
        totalElementsCount <= 0 || selectionSize <= 0 || maxConsideredIndex <= 0 ||
        selectionSize > totalElementsCount) {
        console.error("Error: Invalid input parameters. N, A, B must be positive integers, and A must not exceed N.");
        return;
    }

    // --- Step 2: Parse and validate the second line of input ---
    // This line contains the actual numeric values, space-separated.
    const valuesLine = inputBuffer.shift();
    if (!valuesLine) {
        console.error("Error: The second line of input (values) is unexpectedly empty.");
        return;
    }

    // Convert string values to numbers and store them
    const rawNumericStrings = valuesLine.split(" ");
    const numericValues = rawNumericStrings.map(Number);

    // Final check for non-numeric data within the values array
    if (numericValues.some(isNaN)) {
        console.error("Error: One or more input values are not valid numbers.");
        return;
    }

    // --- Step 3: Sort the numeric values in descending order ---
    // Sorting is essential to easily identify the largest values for maximum average calculation.
    numericValues.sort((valA, valB) => (valB - valA));

    // --- Step 4: Compute the maximum possible average value ---
    // This is achieved by summing the 'selectionSize' largest elements.
    let sumOfTopSelection = 0;
    for (let index = 0; index < selectionSize; index++) {
        sumOfTopSelection += numericValues[index];
    }

    // Calculate the average, handling the edge case where selectionSize might be zero (though validated above)
    const calculatedMean = (selectionSize === 0) ? 0 : sumOfTopSelection / selectionSize;
    console.log(calculatedMean); // Output the calculated maximum average

    // --- Step 5: Build a frequency map for all distinct numeric values ---
    // This map stores the count of each unique value, useful for combination calculations.
    const valueFrequencyMap = new Map(); // Using Map for better performance and key handling
    for (const currentNum of numericValues) {
        valueFrequencyMap.set(currentNum, (valueFrequencyMap.get(currentNum) || 0) + 1);
    }

    // --- Step 6: Calculate the number of ways to achieve this maximum average ---
    let waysToMaximizeAverage = 0n; // Using BigInt for potentially large combination results

    // The logic for combinations often has a special case if the top 'maxConsideredIndex' values are identical.
    // This structure reflects a common pattern in problems involving 'B' as a boundary.
    const highestValue = numericValues[0];
    const valueAtMaxConsideredIndex = numericValues[maxConsideredIndex - 1];

    if (highestValue === valueAtMaxConsideredIndex) {
        // Special case: If the largest 'maxConsideredIndex' values are all the same.
        // This implies we must pick 'selectionSize' instances of this single highest value.
        const totalOccurrencesOfHighestValue = valueFrequencyMap.get(highestValue) || 0;
        waysToMaximizeAverage = calculateCombinations(totalOccurrencesOfHighestValue, selectionSize);
    } else {
        // General case: The largest 'maxConsideredIndex' values are not all identical.
        // We identify the smallest value among the top 'selectionSize' elements (the threshold).
        const thresholdValue = numericValues[selectionSize - 1];

        // Determine how many elements among the top 'selectionSize' are strictly greater than the threshold.
        let elementsStrictlyAboveThreshold = 0;
        for (let index = 0; index < selectionSize; index++) {
            if (numericValues[index] > thresholdValue) {
                elementsStrictlyAboveThreshold++;
            }
        }

        // Calculate how many instances of the 'thresholdValue' we need to pick.
        const requiredThresholdValueCount = selectionSize - elementsStrictlyAboveThreshold;

        // Get the total available instances of the 'thresholdValue' from the entire array.
        const totalAvailableThresholdValue = valueFrequencyMap.get(thresholdValue) || 0;

        // The number of ways is the combinations of picking the required count from available count.
        waysToMaximizeAverage = calculateCombinations(totalAvailableThresholdValue, requiredThresholdValueCount);
    }

    console.log(waysToMaximizeAverage.toString()); // Output the number of ways as a string (for BigInt)
});


// --- Helper Functions for Combinatorics ---

// A memoization cache for factorial calculations to improve performance
const factorialCache = new Map();
factorialCache.set(0, 1n); // Base case: 0! is 1 (as BigInt)

/**
 * Computes the factorial of a given non-negative integer.
 * Uses BigInt to handle potentially very large numbers and memoization for efficiency.
 * @param {number} num - The number for which to calculate the factorial.
 * @returns {bigint} The factorial of 'num'. Returns 0n for negative input.
 */
const calculateFactorial = (num) => {
    if (num < 0) return 0n; // Factorial is not defined for negative numbers
    if (factorialCache.has(num)) {
        return factorialCache.get(num); // Return cached result if available
    }

    let result = 1n; // Initialize result as BigInt
    for (let i = 1; i <= num; i++) {
        result *= BigInt(i); // Multiply with BigInt(i)
    }
    factorialCache.set(num, result); // Cache the computed result
    return result;
};

/**
 * Computes the number of permutations (nPr) of choosing 'chosenItems' from 'totalItems'.
 * Uses BigInt for calculations.
 * @param {number} totalItems - The total number of distinct items (n).
 * @param {number} chosenItems - The number of items to choose (r).
 * @returns {bigint} The number of permutations. Returns 0n for invalid inputs.
 */
const calculatePermutations = (totalItems, chosenItems) => {
    if (chosenItems < 0 || chosenItems > totalItems) {
        return 0n; // Invalid input: cannot choose negative or more items than available
    }
    // nPr = n! / (n-r)!
    const numerator = calculateFactorial(totalItems);
    const denominator = calculateFactorial(totalItems - chosenItems);
    return numerator / denominator;
};

/**
 * Computes the number of combinations (nCr) of choosing 'chosenItems' from 'totalItems'.
 * Uses BigInt for calculations and includes optimizations.
 * @param {number} totalItems - The total number of distinct items (n).
 * @param {number} chosenItems - The number of items to choose (r).
 * @returns {bigint} The number of combinations. Returns 0n for invalid inputs.
 */
const calculateCombinations = (totalItems, chosenItems) => {
    // Handle edge cases and invalid inputs for combinations
    if (chosenItems < 0 || chosenItems > totalItems) {
        return 0n;
    }
    if (chosenItems === 0 || chosenItems === totalItems) {
        return 1n; // C(n, 0) = 1 and C(n, n) = 1
    }
    // Optimization: C(n, k) = C(n, n-k) to reduce calculation size
    if (chosenItems > totalItems / 2) {
        chosenItems = totalItems - chosenItems;
    }

    // nCr = n! / (r! * (n-r)!)
    const numerator = calculateFactorial(totalItems);
    const denominator = calculateFactorial(chosenItems) * calculateFactorial(totalItems - chosenItems);
    return numerator / denominator;
};