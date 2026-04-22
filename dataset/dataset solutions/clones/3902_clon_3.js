"use strict";

// This function calculates the number of ordered arrangements (permutations)
// of 'itemsToSelect' elements chosen from a total set of 'totalItems' distinct elements.
// It computes P(n, r) = n * (n-1) * ... * (n-r+1).
const computeOrderedSelections = (totalItems, itemsToSelect) => {
    // Pre-validation: Ensure inputs are non-negative and 'itemsToSelect'
    // does not exceed 'totalItems'. If invalid, return 0 as a default.
    // In a production environment, an error might be thrown.
    if (totalItems < 0 || itemsToSelect < 0 || itemsToSelect > totalItems) {
        console.warn(`Invalid input for permutations: totalItems=${totalItems}, itemsToSelect=${itemsToSelect}. Returning 0.`);
        return 0;
    }

    let productAccumulator = 1; // Initialize the result with a multiplicative identity.
    
    // Loop 'itemsToSelect' times, multiplying by 'totalItems' and decrementing it.
    for (let currentFactorIndex = 0; currentFactorIndex < itemsToSelect; ++currentFactorIndex) {
        productAccumulator *= (totalItems - currentFactorIndex);
    }
    
    return productAccumulator; // Deliver the computed permutation value.
};

// The original 'combination' function was not utilized within the main logic.
// As a Type III transformation, it has been deliberately removed to streamline
// the codebase and eliminate unused functionality.

// This is the primary function to process the input, perform the core calculation,
// and output the result based on the problem's requirements.
const executeCalculation = (rawInputData) => {
    // Step 1: Prepare the input data.
    // Trim any leading/trailing whitespace from the raw input string,
    // then split it into individual lines. A filter is applied to discard
    // any potential empty lines, enhancing robustness.
    const processedInputLines = rawInputData
                                    .trim()
                                    .split("\n")
                                    .filter(lineContent => lineContent.length > 0);

    // In the original problem, the first line typically contained 'N',
    // representing the count of elements. However, this 'N' was not
    // subsequently used in the calculation logic. As a Type III modification,
    // we omit parsing and storing this unused value to simplify the code.
    // const elementCountFromInput = Number(processedInputLines[0]); // This line is now removed.

    // Step 2: Parse and sort the array of numbers.
    // The second line of input contains space-separated numbers.
    // These are converted to numerical types and then sorted in descending order.
    // Using `Number()` is a concise way to convert string to number.
    const sortedNumericCollection = processedInputLines[1]
                                        .split(" ")
                                        .map(numericString => Number(numericString))
                                        .sort((valA, valB) => valB - valA); // Sort from largest to smallest.

    // Step 3: Implement robustness checks for the input array.
    // If the input collection is unexpectedly empty after processing,
    // an error message is logged, and the function exits gracefully.
    if (sortedNumericCollection.length === 0) {
        console.error("Error: The input numeric collection is empty. Cannot perform calculations.");
        return;
    }

    // Step 4: Identify the largest element and calculate the target midpoint.
    // The largest element is always at the first index due to descending sort.
    const largestValueInCollection = sortedNumericCollection[0];
    // The target midpoint is half of the largest value. Explicitly using 2.0
    // ensures floating-point division, though JavaScript handles this by default.
    const idealMidpointTarget = largestValueInCollection / 2.0;

    // Step 5: Find the element in the collection closest to the ideal midpoint.
    let smallestAbsoluteDifference = Number.MAX_VALUE; // Initialize with a very large number.
    let selectedClosestElement; // This variable will hold the element found to be closest.

    // Iterate through each element in the sorted collection.
    // A standard `for` loop is used for direct index control.
    for (let currentElementIndex = 0; currentElementIndex < sortedNumericCollection.length; ++currentElementIndex) {
        const currentElementCandidate = sortedNumericCollection[currentElementIndex];
        // Calculate the absolute difference between the candidate and the midpoint.
        const differenceToMidpoint = Math.abs(idealMidpointTarget - currentElementCandidate);

        // If this candidate is closer to the midpoint than any previous one,
        // update our tracking variables.
        if (differenceToMidpoint < smallestAbsoluteDifference) {
            smallestAbsoluteDifference = differenceToMidpoint;
            selectedClosestElement = currentElementCandidate;
        }
    }
    
    // Step 6: Output the final results.
    // The largest value and the element closest to its half are printed.
    // Using template literals for a clean and readable output format.
    console.log(`${largestValueInCollection} ${selectedClosestElement}`);
};

// Entry point of the script:
// Reads all data from standard input ('/dev/stdin') using the Node.js 'fs' module,
// decodes it as UTF-8, and then passes it to the main processing function.
const fileSystemUtility = require('fs');
executeCalculation(fileSystemUtility.readFileSync('/dev/stdin', 'utf8'));