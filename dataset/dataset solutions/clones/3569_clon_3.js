function processInputData(rawDataString) {
    // This section is responsible for parsing and validating the initial numeric parameters.
    // The incoming data string is expected to contain two integers, separated by whitespace.
    const parameterStrings = rawDataString.trim().split(/\s+/);

    // Implement a guard clause for input format integrity.
    if (parameterStrings.length !== 2) {
        console.error("Input data malformed. Expected two space-separated numbers.");
        return; // Terminate execution if input is not as expected.
    }

    // Convert the string representations into actual integer values.
    let upperLimit = parseInt(parameterStrings[0], 10);
    let moduloValue = parseInt(parameterStrings[1], 10);

    // Perform validation on the parsed numerical values.
    // Ensure both N and K are positive integers.
    if (isNaN(upperLimit) || isNaN(moduloValue) || upperLimit < 1 || moduloValue < 1) {
        console.error("Invalid numerical parameters. Both N and K must be positive integers.");
        return; // Halt if parameters are not valid.
    }

    let finalTripletCount = 0; // Initialize a counter for qualifying triplets (a, b, c).

    // Define a utility function to handle the modulo behavior specific to the original logic.
    // When a number % k is 0, the original code uses k instead of 0 for the starting values.
    const calculateCorrectedRemainder = (numericValue, modulus) => {
        let remainderResult = numericValue % modulus;
        return remainderResult === 0 ? modulus : remainderResult;
    };

    // Outer loop: Controls the first element of the triplet, 'outerIterator'.
    // Iterates from 1 up to 'upperLimit' (inclusive).
    let outerIterator = 1;
    while (outerIterator <= upperLimit) {
        // Determine the initial value for 'middleIterator'.
        // It's based on 'outerIterator's corrected remainder.
        let initialMiddleVal = calculateCorrectedRemainder(outerIterator, moduloValue);
        let middleIterator = initialMiddleVal;

        // Middle loop: Controls the second element of the triplet, 'middleIterator'.
        // Increments by 'moduloValue' in each step.
        while (middleIterator <= upperLimit) {
            // Determine the initial value for 'innerIterator'.
            // Similar to 'middleIterator', it's based on 'outerIterator's corrected remainder.
            let initialInnerVal = calculateCorrectedRemainder(outerIterator, moduloValue);
            let innerIterator = initialInnerVal;

            // Inner loop: Controls the third element of the triplet, 'innerIterator'.
            // Increments by 'moduloValue' in each step.
            while (innerIterator <= upperLimit) {
                // Calculate the sums of pairs for the divisibility checks.
                const sum_outer_middle = outerIterator + middleIterator;
                const sum_outer_inner = outerIterator + innerIterator;
                const sum_inner_middle = innerIterator + middleIterator;

                // Evaluate each modulo condition separately for clarity.
                const isConditionOneMet = (sum_outer_middle % moduloValue) === 0;
                const isConditionTwoMet = (sum_outer_inner % moduloValue) === 0;
                const isConditionThreeMet = (sum_inner_middle % moduloValue) === 0;

                // If all three conditions are simultaneously satisfied,
                // then this triplet is valid, and we increment our total count.
                if (isConditionOneMet && isConditionTwoMet && isConditionThreeMet) {
                    finalTripletCount += 1; // Use explicit addition for increment.
                }
                innerIterator += moduloValue; // Advance 'innerIterator'.
            }
            middleIterator += moduloValue; // Advance 'middleIterator'.
        }
        outerIterator++; // Advance 'outerIterator' to the next value.
    }

    // Output the final accumulated count using a dedicated display function.
    reportCalculatedResult(finalTripletCount);
}

// A simple utility function to present the final result.
function reportCalculatedResult(resultValue) {
    console.log(resultValue);
}

// --- Environmental Setup and Execution Trigger ---
// This section handles reading input from the environment and initiating the primary processing.
// It's designed to be robust against common file I/O issues.
const fileSystemModule = require('fs'); // Obtain the Node.js file system module.
const standardInputFilePath = '/dev/stdin'; // Define the standard input path for Unix-like systems.

try {
    // Attempt to synchronously read the entire content of the standard input file.
    const inputContentBuffer = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
    // Pass the raw string content to the main processing function.
    processInputData(inputContentBuffer);
} catch (ioError) {
    // If any error occurs during file reading (e.g., file not found, permissions),
    // log the error message to the console.
    console.error(`Failed to retrieve input from ${standardInputFilePath}:`, ioError.message);
    // Optionally, implement further error handling like exiting the process.
    // process.exit(1);
}