"use strict";

/**
 * Executes the primary logic to determine if a target remainder can be achieved.
 * This function processes a raw input string containing numerical parameters.
 *
 * @param {string} rawInputContent - The complete input string, typically from stdin.
 * @returns {string} "YES" if a matching remainder is found, "NO" otherwise, or "ERROR" on invalid input.
 */
const determineModuloReachability = (rawInputContent) => {
    // Normalize and segment the input string for further processing.
    const trimmedPayload = rawInputContent.trim();

    // --- Input Validation and Pre-processing (Type III: Guard Clauses) ---
    if (!trimmedPayload.length) {
        // If the input is unexpectedly empty after trimming, report an issue.
        // This prevents errors in subsequent string operations.
        console.error("Input payload is unexpectedly empty. Cannot proceed with computation.");
        return "ERROR";
    }

    // Split the first line of the input to extract the numerical components.
    const dataSegments = trimmedPayload.split('\n')[0].split(' ');

    // Ensure that exactly three numerical values are provided in the input line.
    if (dataSegments.length < 3) {
        console.error("Insufficient numerical components detected in the input string. Expected 3 values.");
        return "ERROR";
    }

    // --- Parsing Input Values (Type II: Renamed Variables, Type III: Intermediate Steps) ---
    // Extract string representations of the three primary operands.
    const initialFactorString = dataSegments[0];
    const iterationLimitString = dataSegments[1];
    const desiredOutcomeString = dataSegments[2];

    // Convert string representations to integer values using radix 10 for safety.
    const coefficientOperand = parseInt(initialFactorString, 10);
    const modulusBase = parseInt(iterationLimitString, 10);
    const targetValue = parseInt(desiredOutcomeString, 10);

    // --- Numerical Validation (Type III: Guard Clauses) ---
    // Check if any of the parsed values resulted in NaN (Not-a-Number).
    if (isNaN(coefficientOperand) || isNaN(modulusBase) || isNaN(targetValue)) {
        console.error("One or more parsed input values are not valid integers.");
        return "ERROR";
    }

    // The modulus base (divisor) must be a positive integer for this problem's context.
    if (modulusBase <= 0) {
        console.error("The modulus base (divisor) must be a positive integer greater than zero.");
        return "ERROR";
    }

    // --- Core Computation Logic (Type II: Renamed Variables, Type III: Alternative Loop) ---
    let isMatchFound = false; // Flag to indicate if a matching remainder is identified.
    let currentMultiplier = 0; // Loop counter, starting from zero.

    // Iterate a fixed number of times, up to the modulusBase (exclusive).
    // This is an alternative to a traditional 'for' loop.
    while (currentMultiplier < modulusBase) {
        // Calculate the current remainder using the modulo operator.
        const computedRemainder = (coefficientOperand * currentMultiplier) % modulusBase;

        // Check if the computed remainder matches the desired target value.
        if (computedRemainder === targetValue) {
            isMatchFound = true; // Set the flag to true.
            break; // Exit the loop early as the condition is met.
        }

        // Increment the multiplier for the next iteration.
        currentMultiplier++;
    }

    // --- Result Determination (Type III: Updated Assignment) ---
    // Based on the flag, return the appropriate string result.
    if (isMatchFound) {
        return "YES";
    } else {
        return "NO";
    }
};

/**
 * Entry point function for the application, handling file I/O and error management.
 */
const applicationStart = () => {
    // --- File Reading and Execution (Type III: Try-Catch Block) ---
    try {
        // Read the input content from the standard input stream.
        const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');

        // Execute the main logic function with the retrieved data.
        const finalResult = determineModuloReachability(fileData);

        // Output the final computed result to the console.
        console.log(finalResult);
    } catch (executionError) {
        // Catch and report any errors that occur during file reading or processing.
        console.error("An unexpected error occurred during application execution:", executionError.message);
        console.log("ERROR"); // Indicate a general error to the user.
    }
};

// Initiate the application's execution process.
applicationStart();