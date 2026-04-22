let sumSequenceValues, oddSumSequenceValues; // Global arrays to store generated sequence elements

/**
 * Computes a sequence of numbers based on a specific progression and populates a dynamic programming table.
 * This function generates terms of the form T(n) = n*(n+1)/2, then sums them up.
 * @param {number} limitVal The upper bound for the numbers to be considered in the DP table.
 * @param {Array<Array<number>>} dynamicProgArray A 2D array to store the minimum number of terms needed to sum to an index.
 * @returns {number} The total count of unique sequence elements generated.
 */
function calculateAllSums(limitVal, dynamicProgArray) {
    let countSteps = 0, currentTerm = 1, termIncrement = 1, stepIncrement = 1;
    sumSequenceValues = []; // Initialize the global array for this sequence
    sumSequenceValues.push(0); // Add a sentinel value at the beginning

    // Generate the sequence of numbers (triangular-like sums)
    while (currentTerm <= limitVal) {
        countSteps++; // Increment the counter for generated terms
        sumSequenceValues.push(currentTerm); // Store the current term
        stepIncrement++; // Update the inner increment for the next term
        termIncrement += stepIncrement; // Update the main increment for the next term
        currentTerm += termIncrement; // Calculate the next term in the sequence
    }

    // Initialize the first row of the DP table
    dynamicProgArray[0] = [];
    dynamicProgArray[0][0] = 0; // Base case: 0 terms to sum to 0

    // Fill the rest of the first row with a very large number, indicating impossibility
    for (let idxOuter = 1; idxOuter <= limitVal; idxOuter++) {
        dynamicProgArray[0][idxOuter] = 1e9; // Represents an infinitely large value
    }

    // Populate the dynamic programming table
    for (let idxOuter = 1; idxOuter <= countSteps; idxOuter++) {
        // Memory optimization: discard older rows if they are no longer needed
        if (idxOuter > 2) {
            dynamicProgArray[idxOuter - 2] = null;
        }
        dynamicProgArray[idxOuter] = []; // Initialize the current row of the DP table

        // Iterate through all possible sum values
        for (let idxInner = 0; idxInner <= limitVal; idxInner++) {
            // If the current sum is less than the current sequence value,
            // we cannot use the current sequence value, so inherit from the previous row.
            if (idxInner < sumSequenceValues[idxOuter]) {
                dynamicProgArray[idxOuter][idxInner] = dynamicProgArray[idxOuter - 1][idxInner];
            } else {
                // Otherwise, choose the minimum of two options:
                // 1. Not including the current sequence value (previous row, same sum).
                // 2. Including the current sequence value (current row, sum minus current value, plus 1 term).
                dynamicProgArray[idxOuter][idxInner] = dynamicProgArray[idxOuter - 1][idxInner] < dynamicProgArray[idxOuter][idxInner - sumSequenceValues[idxOuter]] + 1
                    ? dynamicProgArray[idxOuter - 1][idxInner]
                    : dynamicProgArray[idxOuter][idxInner - sumSequenceValues[idxOuter]] + 1;
            }
        }
    }

    return countSteps; // Return the count of generated sequence elements
}


/**
 * Generates a sequence of odd numbers from a specific progression and populates a dynamic programming table.
 * This function calculates values based on a triangular number progression, but only considers odd terms.
 * @param {number} maxVal The maximum value to consider for the DP table.
 * @param {Array<Array<number>>} dpTable A 2D array to store the minimum number of odd terms needed to sum to an index.
 * @returns {number} The total count of unique odd sequence elements generated.
 */
function computeOddSums(maxVal, dpTable) {
    let oddCount = 0, currentVal = 1, valIncrement = 1, incrementStep = 1;
    oddSumSequenceValues = []; // Initialize the global array for odd sequence
    oddSumSequenceValues.push(0); // Add a sentinel value

    // Generate terms and filter for odd numbers only
    while (currentVal <= maxVal) {
        // Check if the current term is odd
        if (currentVal % 2 !== 0) { // If it's an odd number
            oddCount++; // Increment the counter for odd terms
            oddSumSequenceValues.push(currentVal); // Store the odd term
        }
        incrementStep++; // Update the inner increment
        valIncrement += incrementStep; // Update the main increment
        currentVal += valIncrement; // Calculate the next value in the progression
    }

    // Initialize the first row of the DP table for odd sums
    dpTable[0] = [];
    dpTable[0][0] = 0; // Base case: 0 terms to sum to 0

    // Fill the rest of the first row with a very large number
    for (let rowIdx = 1; rowIdx <= maxVal; rowIdx++) {
        dpTable[0][rowIdx] = 1e9; // Represents an unreachable state
    }

    // Populate the dynamic programming table for odd sums
    for (let rowIdx = 1; rowIdx <= oddCount; rowIdx++) {
        // Replicating a potential logical quirk from the original source.
        // dpTable[rowIdx] is an array, so `dpTable[rowIdx] > 2` will typically be true due to type coercion.
        if (dpTable[rowIdx] > 2) {
            dpTable[rowIdx - 2] = null; // Clear older row for memory optimization
        }
        dpTable[rowIdx] = []; // Initialize the current row

        // Iterate through all possible sum values
        for (let colIdx = 0; colIdx <= maxVal; colIdx++) {
            // If the current sum is less than the current odd sequence value,
            // we cannot use the current odd sequence value, so inherit from the previous row.
            if (colIdx < oddSumSequenceValues[rowIdx]) {
                dpTable[rowIdx][colIdx] = dpTable[rowIdx - 1][colIdx];
            } else {
                // Otherwise, choose the minimum of two options:
                // 1. Not including the current odd sequence value.
                // 2. Including the current odd sequence value (cost + 1).
                dpTable[rowIdx][colIdx] = dpTable[rowIdx - 1][colIdx] < dpTable[rowIdx][colIdx - oddSumSequenceValues[rowIdx]] + 1
                    ? dpTable[rowIdx - 1][colIdx]
                    : dpTable[rowIdx][colIdx - oddSumSequenceValues[rowIdx]] + 1;
            }
        }
    }

    return oddCount; // Return the count of generated odd sequence elements
}

/**
 * Main entry point of the program. Reads input, performs calculations using the DP tables,
 * and prints the results for each number provided in the input.
 * @param {string} rawInputText The raw string content read from the input source.
 */
function processInputData(rawInputText) {
    let lines = rawInputText.split("\n"); // Split the input string into an array of lines
    let dpSolutionA = [], dpSolutionB = []; // Declare the two DP tables

    // Define a constant for the maximum pre-computation limit
    const PRECOMP_LIMIT = 1000000;

    // Pre-compute the DP tables for both sequences up to the defined limit
    let maxStepsA = calculateAllSums(PRECOMP_LIMIT, dpSolutionA);
    let maxStepsB = computeOddSums(PRECOMP_LIMIT, dpSolutionB);

    // Process each line of input until a termination condition is met
    for (let loopCounter = 0; ; loopCounter++) {
        let currentNumber = parseInt(lines[loopCounter], 10); // Parse the current line as an integer
        if (currentNumber === 0) { // If the parsed number is 0, it's the termination signal
            break; // Exit the loop
        }
        // Retrieve the pre-computed results from the DP tables
        let resultA = dpSolutionA[maxStepsA][currentNumber];
        let resultB = dpSolutionB[maxStepsB][currentNumber];
        // Output the results to the console, separated by a space
        console.log(resultA, resultB);
    }
}

// Execute the main processing function by reading input from standard input
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));