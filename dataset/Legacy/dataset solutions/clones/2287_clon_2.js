"use strict";

/**
 * Processes the provided input string to calculate a specific count.
 * This function implements a unique number filtering and iterative calculation logic.
 * @param {string} inputString - The raw input data from stdin.
 */
function processInput(inputString) {
    // Split the input into individual lines and remove any leading/trailing whitespace.
    const inputLines = inputString.trim().split("\n");

    // Parse the second number from the first line as the maximum value.
    const maxValue = Number(inputLines[0].split(" ")[1]);

    // Parse numbers from the second line, sort them in descending order,
    // and store them temporarily.
    const initialNumbers = inputLines[1].split(" ").map(Number).sort((valA, valB) => valB - valA);

    // Filter out duplicate numbers, keeping only the first occurrence,
    // and store the unique, sorted numbers.
    const uniqueSortedNumbers = initialNumbers.filter(function (currentNum, idx, originalArray) {
        return originalArray.indexOf(currentNum) === idx;
    });

    // Extract the first unique number to use as the base for calculations.
    const firstElement = uniqueSortedNumbers.shift();

    // This variable is declared but not used in the current logic.
    // It's kept to preserve the original structure.
    const unusedList = [];

    // Initialize a counter for the successful conditions.
    let resultCount = 0;

    // Begin an infinite loop, incrementing a multiplier.
    for (let multiplier = 1; ; multiplier++) {
        // Calculate a potential product based on the base and multiplier.
        const currentProduct = firstElement * (multiplier + 0.5);

        // If the potential product exceeds the maximum allowed value, exit the loop.
        if (currentProduct > maxValue) {
            break;
        }

        // Flag to track if any error condition is met in the inner loop.
        let encounteredIssue = false;

        // Iterate through the remaining unique sorted numbers.
        for (let indexVal = 0; indexVal < uniqueSortedNumbers.length; indexVal++) {
            // Calculate a potential integer value.
            const potentialInteger = currentProduct / uniqueSortedNumbers[indexVal] - 0.5;

            // Check if the calculated value is not an integer.
            if (!Number.isInteger(potentialInteger)) {
                encounteredIssue = true; // Set the error flag.
                break; // Exit the inner loop early.
            }
        }

        // If no error was encountered in the inner loop, increment the result counter.
        if (!encounteredIssue) {
            resultCount++;
        }
    }

    // Output the final calculated count to the console.
    console.log(resultCount);
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
