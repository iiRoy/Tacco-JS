"use strict";

// This module provides a utility function for calculating factorials
// and a main routine for processing mathematical input.

function computeProduct(inputVal) {
    // The 'computeProduct' function determines the product of all positive integers
    // from unity up to the given 'inputVal'. This is a recursive calculation.
    if (inputVal === 1) { // Base case: If the value is one, return it directly.
        return inputVal;
    } else { // Recursive step: Multiply the current value by the product of (value minus one).
        return inputVal * computeProduct(inputVal - 1);
    }
}


const evaluateInput = (incomingData) => {
    // The 'evaluateInput' function serves as the primary entry point,
    // handling the parsing of input and orchestrating the core logic.

    // Step 1: Pre-process the raw input string.
    // It's first trimmed to remove any incidental whitespace from edges,
    // then segmented into an array of strings based on newline characters.
    incomingData = incomingData.trim().split("\n");

    // Step 2: Extract and parse numerical parameters from the first line of input.
    // The initial number represents a primary quantity for calculations.
    const primaryQuantity = parseInt(incomingData[0].split(" ")[0]);
    // The second number represents a specific target sum that combinations must achieve.
    const targetSum = parseInt(incomingData[0].split(" ")[1]);

    // Step 3: Calculate the maximum possible count of 'two-unit' components.
    // This is derived by dividing the primary quantity by two and rounding down.
    const maxTwoUnits = Math.floor(primaryQuantity / 2);

    // Step 4: Initialize a dynamic array to store the outcomes of successful combinations.
    const calculationOutcomes = [];

    // Step 5: Begin an iterative process, decrementing the count of 'two-unit' components.
    // The loop runs from the maximum possible count down to zero, inclusive.
    for (let currentTwoCount = maxTwoUnits; currentTwoCount >= 0; currentTwoCount--) {
        // Within each iteration, determine the corresponding count of 'one-unit' components.
        const currentOneCount = primaryQuantity - (2 * currentTwoCount);

        // Step 6: Validate the current combination against the 'targetSum' condition.
        // If the sum of 'two-unit' count and twice the 'one-unit' count equals the target sum,
        // then this combination is considered valid for further processing.
        if (currentTwoCount + (2 * currentOneCount) === targetSum) {
            // Note: Prior versions of this code included commented-out debugging messages
            // for visualizing the formation of primaryQuantity and targetSum. These are now omitted.

            // Step 7: Compute the first term for the ratio.
            // This term involves a factorial calculation based on a weighted sum of counts.
            const termOne = computeProduct((2 * currentTwoCount) + currentOneCount);
            // Step 8: Compute the second term for the ratio.
            // This term is the sum of two separate factorial calculations,
            // one for twice the 'two-unit' count and another for the 'one-unit' count.
            const termTwo = computeProduct((2 * currentTwoCount)) + computeProduct(currentOneCount);

            // Step 9: Store the resulting ratio of 'termOne' to 'termTwo' into the outcomes array.
            calculationOutcomes.push(termOne / termTwo);
        }
    }

    // Step 10: Final output determination.
    // If no valid outcomes were generated, print a zero.
    if (calculationOutcomes.length === 0) {
        console.log(0);
        return;
    }

    // Otherwise, sum all the collected outcomes and print the result
    // modulo 10 billion (10^10).
    console.log((calculationOutcomes.reduce((aggregate, element) => aggregate + element)) % 10e9);
};

// Initiate the program by calling the main evaluation function.
// Input data is sourced from the standard input stream, read as UTF-8 encoded text.
evaluateInput(require('fs').readFileSync('/dev/stdin', 'utf8'));