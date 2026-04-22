let processingModulo = 1000000007; // A prime number for modular arithmetic operations

/**
 * Orchestrates the entire data processing workflow.
 * Reads raw input, parses it, generates combinations, calculates metrics,
 * and outputs the final aggregated result.
 * @param {string} rawInputContent The complete raw input string from stdin.
 */
function executeProcessing(rawInputContent) {
    // Ensure input is not empty or just whitespace
    if (!rawInputContent || rawInputContent.trim().length === 0) {
        // In a competitive programming context, usually no specific error handling is required for invalid input formats,
        // but for robustness, we could throw an error or return 0.
        // For this Type III clone, we'll assume valid input structure but add a check.
        console.log(0);
        return;
    }

    // Step 1: Parse the raw input string into a structured numerical matrix.
    // This function now combines line splitting, word splitting, and integer conversion.
    const numericalMatrix = readAndProcessNumericalData(rawInputContent);

    // Extract problem parameters from the first row of the parsed data.
    // The original code implies numericalMatrix[0][0] is 'n' and numericalMatrix[0][1] is 'k'.
    const setUpperBound = numericalMatrix[0][0]; // Represents 'n'
    const selectionSize = numericalMatrix[0][1]; // Represents 'k'

    // Extract the array of values from the second row.
    const dataValuesArray = numericalMatrix[1]; // Represents 'arr' from fx

    // Step 2: Generate all unique combinations of 'selectionSize' indices from '1' to 'setUpperBound'.
    // These combinations represent the 'patterns' or subsequences to evaluate.
    const potentialSubsequenceIndices = generateSubsequenceIndices(setUpperBound, selectionSize);

    let cumulativeDifferenceSum = 0; // Initialize aggregator for differences.

    // Step 3: Iterate through each generated combination and calculate its metric.
    // The metric here is the difference between the maximum and minimum values in the subsequence.
    if (potentialSubsequenceIndices.length > 0) {
        for (let combIdx = 0; combIdx < potentialSubsequenceIndices.length; combIdx++) {
            const currentPattern = potentialSubsequenceIndices[combIdx];
            // Calculate the range (max - min) for the current subsequence.
            const subsequenceRange = computeRangeMetric(dataValuesArray, currentPattern);
            // Add the calculated range to the cumulative sum, applying modular arithmetic at each step
            // to prevent overflow and keep the sum within the required bounds.
            cumulativeDifferenceSum = (cumulativeDifferenceSum + subsequenceRange) % processingModulo;
        }
    } else {
        // If no combinations are generated (e.g., k > n or k=0), the sum remains 0.
        // This is a subtle guard clause.
        console.log(0);
        return;
    }


    // Step 4: Output the final aggregated sum, ensuring it is also modulo the processing number.
    console.log(cumulativeDifferenceSum % processingModulo);
}

/**
 * Calculates the difference between the maximum and minimum values
 * within a specified subsequence of a given array.
 * @param {number[]} sourceArray The array from which values are selected.
 * @param {number[]} selectionIndices An array of 1-based indices defining the subsequence.
 * @returns {number} The difference between the maximum and minimum values in the subsequence.
 */
function computeRangeMetric(sourceArray, selectionIndices) {
    // Handle edge case: if no indices are provided, the range is undefined or 0.
    // For this problem, it's safer to return 0.
    if (!selectionIndices || selectionIndices.length === 0) {
        return 0;
    }

    // Initialize min and max with the first element of the subsequence.
    // Indices are 1-based, so subtract 1 for 0-based array access.
    let currentMinimum = sourceArray[selectionIndices[0] - 1];
    let currentMaximum = sourceArray[selectionIndices[0] - 1];

    // Iterate through the rest of the indices to find the true min and max.
    // Start from the second element (index 1) as the first was used for initialization.
    for (let i = 1; i < selectionIndices.length; i++) {
        const valueAtIndex = sourceArray[selectionIndices[i] - 1];
        currentMinimum = Math.min(currentMinimum, valueAtIndex);
        currentMaximum = Math.max(currentMaximum, valueAtIndex);
    }

    // The result is the difference between the maximum and minimum values found.
    return currentMaximum - currentMinimum;
}

/**
 * Converts a raw input string into a 2D array of integers.
 * Each line is split by newline, then each line is split by spaces,
 * and finally, each resulting string element is parsed into an integer.
 * @param {string} rawDataString The input string containing multiple lines and space-separated numbers.
 * @returns {number[][]} A matrix (2D array) of integers.
 */
function readAndProcessNumericalData(rawDataString) {
    // Split the raw string into individual lines. Filter out any empty lines.
    const lines = rawDataString.split('\n').filter(line => line.trim() !== '');

    // Map each line to an array of integers.
    // For each line, split by spaces, then parse each part as an integer.
    const numericalDataMatrix = lines.map(line => {
        return line.split(' ').map(strNum => {
            // Use parseInt with radix 10 for explicit base conversion.
            const parsedValue = parseInt(strNum, 10);
            // Optionally, handle NaN if conversion fails (e.g., return 0 or throw error).
            // For competitive programming, assume valid integer strings.
            return isNaN(parsedValue) ? 0 : parsedValue; // Default to 0 if not a number
        });
    });

    return numericalDataMatrix;
}

/**
 * Generates all unique combinations (subsequences) of 'k' elements chosen from 'n' elements.
 * The elements are represented as 1-based indices from 1 to 'n'.
 * This function implements a lexicographical combination generation algorithm.
 * @param {number} totalElements The upper bound 'n' for elements (1 to n).
 * @param {number} numToSelect The number of elements 'k' to select for each combination.
 * @returns {number[][]} A 2D array, where each inner array is a combination of indices.
 */
function generateSubsequenceIndices(totalElements, numToSelect) {
    const allCombinations = []; // Stores all generated combinations.

    // Basic validation for input parameters.
    if (numToSelect <= 0 || numToSelect > totalElements) {
        // No valid combinations can be formed.
        return allCombinations;
    }

    // Initialize the first combination: [1, 2, ..., numToSelect]
    const currentWorkingCombination = Array.from({ length: numToSelect }, (_, i) => i + 1);

    // Loop to generate combinations lexicographically.
    // The loop continues as long as we can find a 'pivot' element to increment.
    while (true) {
        // Add a copy of the current combination to the results.
        allCombinations.push([...currentWorkingCombination]);

        // Find the rightmost element that can be incremented.
        // This is the 'pivot' index.
        let pivotIndex = -1;
        for (let i = numToSelect - 1; i >= 0; i--) {
            // An element at index 'i' can be incremented if it's not yet at its maximum possible value.
            // The maximum possible value for currentWorkingCombination[i] is totalElements - (numToSelect - 1 - i).
            // (numToSelect - 1 - i) is the count of elements to the right of 'i'.
            if (currentWorkingCombination[i] < totalElements - (numToSelect - 1 - i)) {
                pivotIndex = i;
                break;
            }
        }

        // If no pivot is found, all combinations have been generated.
        if (pivotIndex === -1) {
            break;
        }

        // Increment the pivot element.
        currentWorkingCombination[pivotIndex]++;

        // Reset elements to the right of the pivot.
        // Each element to the right is set to be one greater than its left neighbor.
        for (let i = pivotIndex + 1; i < numToSelect; i++) {
            currentWorkingCombination[i] = currentWorkingCombination[i - 1] + 1;
        }
    }

    return allCombinations;
}

// The following lines are for standard input/output handling in a competitive programming environment.
// They should not be modified.
executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
// Example test cases (commented out for submission):
// executeProcessing("6 3\n10 10 10 -10 -10 -10");
// executeProcessing("10 6\n1000000000 1000000000 1000000000 1000000000 1000000000 0 0 0 0 0");
// executeProcessing("3 2\n1 5 10"); // Expected: (5-1) + (10-1) + (10-5) = 4 + 9 + 5 = 18
// executeProcessing("1 1\n100"); // Expected: 0
// executeProcessing("5 0\n1 2 3 4 5"); // Expected: 0 (due to k=0 validation)
// executeProcessing(""); // Expected: 0 (due to empty input validation)