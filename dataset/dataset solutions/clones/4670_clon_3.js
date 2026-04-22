let inputLineBuffer = [];
const inputOutputManager = require('readline');

const consoleInterface = inputOutputManager.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener for each line of input received
consoleInterface.on('line', function (currentLineData) {
    inputLineBuffer.push(currentLineData);
});

// Main logic triggered when all input lines have been received
consoleInterface.on('close', function () {
    // Basic validation for ensuring enough input lines
    if (inputLineBuffer.length < 2) {
        console.error("Error: Insufficient input lines provided to the script.");
        return;
    }

    // Process the first line which contains configuration parameters (N, A, B)
    const configString = inputLineBuffer.shift();
    // Parse N, A, and B from the config string, converting them to numbers
    const [totalElements, minSelectionCount, maxSelectionCount] = configString.split(" ").map(Number);

    // Validate the parsed configuration parameters
    if (totalElements <= 0 || minSelectionCount <= 0 || maxSelectionCount <= 0 || minSelectionCount > maxSelectionCount || minSelectionCount > totalElements) {
        console.error("Error: Invalid configuration parameters detected (N, A, B values).");
        return;
    }

    // Process the second line containing the array of numeric values
    const rawValueStrings = inputLineBuffer.shift().split(" ");
    let numericValues = rawValueStrings.map(Number);

    // Validate if the number of provided values matches 'totalElements'
    if (numericValues.length !== totalElements) {
        console.error("Error: The count of provided numeric values does not match N.");
        return;
    }

    // Sort the numeric values in descending order to easily pick largest elements
    numericValues.sort((firstVal, secondVal) => secondVal - firstVal);

    let highestPossibleAverage = 0.0; // Stores the calculated maximum average
    const valueFrequencyMap = new Map(); // Stores the frequency of each unique number

    // Iterate through the sorted values to calculate the sum for the average and populate the frequency map
    for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
        const currentVal = numericValues[currentIdx];

        // Sum the top 'minSelectionCount' elements for average calculation
        if (currentIdx < minSelectionCount) {
            highestPossibleAverage += currentVal;
        }

        // Update the frequency count for the current value in the map
        valueFrequencyMap.set(currentVal, (valueFrequencyMap.get(currentVal) || 0) + 1);
    }

    // Finalize the average calculation and output it, formatted to 8 decimal places
    highestPossibleAverage = highestPossibleAverage / minSelectionCount;
    console.log(highestPossibleAverage.toFixed(8));

    // --- Begin combinatorial calculation for selecting numbers ---

    let totalArrangements = 0;

    // Identify the largest value and the value at the 'maxSelectionCount'-th position
    const largestValue = numericValues[0];
    // Note: maxSelectionCount - 1 because array is 0-indexed
    const bthLargestValue = numericValues[maxSelectionCount - 1];

    // Special case: If the largest value is the same as the 'maxSelectionCount'-th largest value,
    // it implies all numbers from the 1st to the 'maxSelectionCount'-th position are identical.
    // In this scenario, we sum combinations for selecting 'k' items, where 'k' ranges from 'minSelectionCount' to 'maxSelectionCount',
    // all of which must be this identical top value.
    if (largestValue === bthLargestValue) {
        const occurrencesOfTopValue = valueFrequencyMap.get(largestValue);

        for (let currentK = minSelectionCount; currentK <= maxSelectionCount; currentK++) {
            totalArrangements += calculateCombinations(occurrencesOfTopValue, currentK);
        }
    } else {
        // General case: The top 'maxSelectionCount' values are not all identical to the largest value.
        // We need to find the number of ways to pick *exactly* 'minSelectionCount' items
        // to achieve the maximum possible sum.
        // The maximum sum for 'minSelectionCount' items is achieved by picking `numericValues[0]` through `numericValues[minSelectionCount-1]`.
        // The critical value is `numericValues[minSelectionCount-1]`, as it might have duplicates.

        const thresholdValue = numericValues[minSelectionCount - 1];
        let neededThresholdValueCount = 0; // Count how many times 'thresholdValue' appears in the top 'minSelectionCount' elements

        // Count occurrences of 'thresholdValue' among the first 'minSelectionCount' elements
        for (let idx = 0; idx < minSelectionCount; idx++) {
            if (numericValues[idx] === thresholdValue) {
                neededThresholdValueCount++;
            }
        }

        // Get the total frequency of the 'thresholdValue' from the map
        const totalThresholdValueCount = valueFrequencyMap.get(thresholdValue);

        // The number of ways is the combination of choosing 'neededThresholdValueCount' items
        // from the 'totalThresholdValueCount' available occurrences of 'thresholdValue'.
        totalArrangements = calculateCombinations(totalThresholdValueCount, neededThresholdValueCount);
    }
    console.log(totalArrangements);
});

/**
 * Calculates the number of permutations of selecting 'selectedItems' from 'totalItems'.
 * P(n, r) = n! / (n-r)!
 * @param {number} totalItems - The total number of unique items (n).
 * @param {number} selectedItems - The number of items to be selected (r).
 * @returns {number} The number of permutations. Returns 0 for invalid input.
 */
function calculatePermutations(totalItems, selectedItems) {
    if (selectedItems < 0 || selectedItems > totalItems) {
        return 0; // Invalid input for permutations
    }
    let cumulativeProduct = 1;
    // Calculate n * (n-1) * ... * (n-selectedItems+1)
    for (let currentIteration = 0; currentIteration < selectedItems; currentIteration++) {
        cumulativeProduct *= (totalItems - currentIteration);
    }
    return cumulativeProduct;
}

/**
 * Calculates the number of combinations of selecting 'selectedItems' from 'totalItems'.
 * C(n, r) = n! / (r! * (n-r)!)
 * This implementation uses the formula C(n, r) = P(n, r) / P(r, r).
 * @param {number} totalItems - The total number of unique items (n).
 * @param {number} selectedItems - The number of items to be selected (r).
 * @returns {number} The number of combinations. Returns 0 for invalid input.
 */
function calculateCombinations(totalItems, selectedItems) {
    if (selectedItems < 0 || selectedItems > totalItems) {
        return 0; // Invalid input for combinations
    }
    // Optimization: C(n, 0) = 1 and C(n, n) = 1
    if (selectedItems === 0 || selectedItems === totalItems) {
        return 1;
    }
    // Optimization: C(n, r) = C(n, n-r) - choose the smaller 'r' for fewer calculations
    if (selectedItems > totalItems / 2) {
        selectedItems = totalItems - selectedItems;
    }

    const numeratorPermutations = calculatePermutations(totalItems, selectedItems);
    const denominatorPermutations = calculatePermutations(selectedItems, selectedItems); // This is r!
    return numeratorPermutations / denominatorPermutations;
}