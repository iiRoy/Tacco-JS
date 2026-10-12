// Helper function to process raw input string into a 2D array of strings
function transformInputString(inputStr) {
    // Split the input string by newlines to get individual lines
    let lines = inputStr.split("\n");
    // Map each line to an array of strings by splitting it by spaces
    let stringMatrix = lines.map(line => line.split(" "));
    return stringMatrix;
}

// Helper function to convert a 2D array of strings into a 2D array of integers
function convertStringsToInts(stringArrayMatrix) {
    // Use nested map to iterate through rows and then through string values
    let integerResultMatrix = stringArrayMatrix.map(row =>
        row.map(strVal => parseInt(strVal, 10)) // Parse each string to an integer with radix 10
    );
    return integerResultMatrix;
}

// Function to calculate the difference between the maximum and minimum values
// within a subset of an array, specified by a list of 1-based indices.
function calculateRangeDifference(valueArray, combinationIndices) {
    // A guard clause for an empty set of indices.
    // While problem constraints might prevent this, it's a good practice.
    if (combinationIndices.length === 0) {
        return 0; // If no indices, no range, so difference is 0.
    }

    // Helper to retrieve the actual value from the array using a 1-based index
    const getValueAtIndex = (oneBasedIndex) => valueArray[oneBasedIndex - 1];

    let currentMin = getValueAtIndex(combinationIndices[0]);
    // IMPORTANT: Preserving the original bug where max is compared against min, not max itself.
    // This is crucial for "exact observable behavior".
    let currentMax = getValueAtIndex(combinationIndices[0]);

    // Iterate from the second index in the combination
    for (let i = 1; i < combinationIndices.length; i++) {
        let currentValue = getValueAtIndex(combinationIndices[i]);
        currentMin = Math.min(currentMin, currentValue);
        currentMax = Math.max(currentMin, currentValue); // Original bug preserved: Math.max(mi, arr[pat[i]-1])
    }
    return (currentMax - currentMin);
}

// Function to generate all k-combinations of numbers from 1 to n
function computeCombinations(upperLimit, comboSize) {
    let allGeneratedCombinations = [];
    let currentWorkingCombination = [];

    // Initialize the first combination: [1, 2, ..., comboSize]
    for (let elementValue = 1; elementValue <= comboSize; elementValue++) {
        currentWorkingCombination.push(elementValue);
    }

    // Loop indefinitely until all combinations are generated
    while (true) {
        // Add a copy of the current combination to the results list
        allGeneratedCombinations.push([...currentWorkingCombination]);

        let pivotIndexToIncrement = -1; // Sentinel value indicating no pivot found

        // Find the rightmost element that can be incremented
        // An element at index 'i' (0-based) can be incremented if its value
        // is less than 'upperLimit - (comboSize - 1 - i)'.
        // This ensures there's enough room for subsequent elements to be consecutive.
        for (let i = comboSize - 1; i >= 0; i--) {
            const maxPossibleValueForThisPosition = upperLimit - (comboSize - 1 - i);
            if (currentWorkingCombination[i] < maxPossibleValueForThisPosition) {
                pivotIndexToIncrement = i;
                break; // Found the pivot, exit loop
            }
        }

        // If no pivot element was found, all combinations have been generated
        if (pivotIndexToIncrement === -1) {
            break;
        } else {
            // Increment the pivot element
            currentWorkingCombination[pivotIndexToIncrement]++;

            // Fill the elements after the pivot with consecutive values
            // starting from (pivot element's new value + 1)
            for (let j = pivotIndexToIncrement + 1; j < comboSize; j++) {
                currentWorkingCombination[j] = currentWorkingCombination[j - 1] + 1;
            }
        }
    }
    return allGeneratedCombinations;
}

// Main processing function for the input data
function processInputData(rawInputString) {
    const MODULO_CONSTANT = 1000000007; // Define the modulo constant

    // Process the raw input string into a 2D array of integers
    let stringDataMatrix = transformInputString(rawInputString);
    let numericDataMatrix = convertStringsToInts(stringDataMatrix);

    // Extract N and K values from the first row of the numeric data
    const N_VALUE = numericDataMatrix[0][0];
    const K_VALUE = numericDataMatrix[0][1];

    // Generate all combinations of K indices from 1 to N
    let indexCombinations = computeCombinations(N_VALUE, K_VALUE);

    // Helper function to apply the modulo operation
    const applyModulo = (value) => value % MODULO_CONSTANT;

    // Calculate the total sum of range differences, applying modulo at each step
    // to prevent potential overflow for large sums and ensure correct modulo arithmetic.
    let totalSum = indexCombinations.reduce((accumulator, currentCombination) => {
        let difference = calculateRangeDifference(numericDataMatrix[1], currentCombination);
        // Add the difference (modulo constant) to the accumulator, then apply modulo again
        return applyModulo(accumulator + applyModulo(difference));
    }, 0);

    // Output the final calculated sum
    console.log(totalSum);
}

// This line handles reading from standard input and calling the main processing function.
// It should not be modified.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
