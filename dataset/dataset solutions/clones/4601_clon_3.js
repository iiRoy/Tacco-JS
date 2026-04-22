// This module is designed to analyze modular arithmetic sequences to determine
// if a specific target value can be generated as a remainder.
// It reads three integer parameters from standard input and performs computations.

/**
 * Executes the primary logic for a modular congruence problem.
 * It parses the input string, validates the numerical parameters,
 * computes a set of unique remainders, and then checks for the target value.
 *
 * @param {string} rawInputData The complete string content read from the input source.
 * @returns {void} The function prints 'YES' or 'NO' directly to the console.
 */
function determineModularReachability(rawInputData) {
    // --- Phase 1: Input Acquisition and Initial Validation ---
    // A guard clause to handle cases where the input is null, undefined, or not a string.
    if (typeof rawInputData !== 'string' || rawInputData.length === 0) {
        console.error("Input processing failed: Provided data is invalid or empty.");
        // In a real application, we might throw an error or return a specific status.
        return;
    }

    // Extract the very first line of the input data, remove leading/trailing whitespace,
    // and then split it by spaces to get individual string components.
    const parameterStrings = rawInputData.trim().split('\n')[0].split(' ');

    // Verify that exactly three numerical parameters were provided.
    const expectedParameterCount = 3;
    if (parameterStrings.length !== expectedParameterCount) {
        console.error(`Input processing failed: Expected ${expectedParameterCount} parameters but found ${parameterStrings.length}.`);
        return;
    }

    // --- Phase 2: Numerical Parsing and Semantic Validation ---
    // Parse the string components into base-10 integers.
    // Renaming A, B, C to more descriptive variables for clarity.
    const primaryFactor = parseInt(parameterStrings[0], 10);   // Corresponds to 'A' in the original problem.
    const modulusValue = parseInt(parameterStrings[1], 10);    // Corresponds to 'B'.
    const desiredRemainder = parseInt(parameterStrings[2], 10); // Corresponds to 'C'.

    // Validate that all parsed values are indeed numbers (not NaN).
    if (isNaN(primaryFactor) || isNaN(modulusValue) || isNaN(desiredRemainder)) {
        console.error("Input processing failed: One or more parameters could not be converted to valid integers.");
        return;
    }

    // Ensure the modulus value is positive. A non-positive modulus is undefined or problematic in this context.
    if (modulusValue <= 0) {
        console.log("NO"); // A target remainder cannot be achieved with a non-positive modulus.
        return;
    }

    // Validate that the desired remainder is within the valid range [0, modulusValue - 1].
    // If it's outside this range, it can never be a result of the modulo operation.
    if (desiredRemainder < 0 || desiredRemainder >= modulusValue) {
        console.log("NO");
        return;
    }

    // --- Phase 3: Remainder Generation and Collection ---
    // Initialize a Set data structure to store all unique remainders encountered.
    // Sets are ideal for this because they automatically handle uniqueness.
    let uniqueComputedRemainders = new Set();

    // Iterate to generate remainders. The cycle of (primaryFactor * iteration) % modulusValue
    // will repeat within `modulusValue` iterations at most.
    // Changing the loop limit from `A * B` to `modulusValue` for efficiency and correctness.
    const iterationUpperBoundary = modulusValue; // 'B' iterations are sufficient.

    for (let currentIteration = 0; currentIteration < iterationUpperBoundary; currentIteration++) {
        // Calculate the current remainder.
        const calculatedModResult = (primaryFactor * currentIteration) % modulusValue;
        uniqueComputedRemainders.add(calculatedModResult);

        // Optimization: If the set already contains all possible remainders (from 0 to modulusValue-1),
        // we can break early as no new unique remainders will be found.
        if (uniqueComputedRemainders.size === modulusValue) {
            break;
        }
    }

    // --- Phase 4: Final Decision and Output ---
    let finalVerdictMessage;
    // Check if the desired remainder exists within the set of generated unique remainders.
    if (uniqueComputedRemainders.has(desiredRemainder)) {
        finalVerdictMessage = 'YES';
    } else {
        finalVerdictMessage = 'NO';
    }

    // Print the final result to standard output.
    console.log(finalVerdictMessage);
}

// --- Script Entry Point: Reading Input File ---
// This block handles the I/O operations and error management for file reading.
try {
    // Utilize the built-in Node.js 'fs' module for file system operations.
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin"; // Standard input file path on Unix-like systems.

    // Synchronously read the entire content of the standard input file.
    // The content is decoded as a UTF-8 string.
    const fileContentBuffer = fileSystemModule.readFileSync(standardInputPath, "utf8");

    // Invoke the main logic function with the raw content from the file.
    determineModularReachability(fileContentBuffer);

} catch (ioError) {
    // Capture and report any errors that occur during file reading or initial setup.
    console.error("An unhandled error occurred during script execution or file I/O:", ioError.message);
    // Exit the process with an error code to signal failure.
    process.exit(1);
}