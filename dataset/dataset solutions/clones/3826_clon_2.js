"use strict";

const processInput = (inputTxt) => {
    // Standard input data is processed here
    inputTxt = inputTxt
        .trim()
        .split("\n");

    // Extract the upper boundary from the first line
    const upperLimit = parseInt(inputTxt[0].split(" ")[0]);

    // Initialize a variable to store the ultimate output
    let ultimateResult = 1;

    // Begin iterating from the lower bound up to the determined upper limit
    for (let primaryIndex = 2; primaryIndex <= upperLimit; primaryIndex++) {
        // Start a nested iteration, checking values from 1 up to the current primary index
        for (let secondaryIndex = 1; secondaryIndex <= primaryIndex; secondaryIndex++) {
            let currentNumber = secondaryIndex; // Store the number being processed
            let operationTally = 0;             // Counter for mathematical operations

            /*
             * Development-time logging statements were present here.
             * They have been removed to streamline the final code.
             */

            // Repeatedly square the 'currentNumber' while conditions are met
            while (currentNumber < primaryIndex && secondaryIndex !== 1) {
                currentNumber = Math.pow(currentNumber, 2); // Apply squaring
                operationTally++;                           // Increment the operation counter
            }

            // Further debug comments were removed for clarity.

            // Evaluate if the processed number matches the primary index and operations occurred
            if (currentNumber === primaryIndex && operationTally !== 0) {
                ultimateResult = primaryIndex; // Update the final outcome
            }
        }
    }

    // Print the calculated final value to the console
    console.log(ultimateResult);
};

// Invoke the main processing function with data read from standard input
processInput(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);