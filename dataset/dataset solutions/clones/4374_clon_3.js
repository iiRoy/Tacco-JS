'use strict'

// A utility function designed to guarantee that a numerical value is never negative.
// This serves as a functional replacement for direct calls to Math.max(0, value).
const enforceNonNegativeConstraint = (candidateValue) => {
    // Perform an explicit numeric conversion to handle potential non-numeric inputs gracefully.
    const numericForm = Number(candidateValue);

    // Introduce a warning for unexpected input types, ensuring robustness.
    if (isNaN(numericForm)) {
        console.warn("Warning: Non-numeric input encountered in 'enforceNonNegativeConstraint'. Defaulting to zero.");
        return 0; // Return a safe default if the input isn't a valid number.
    }

    // Apply the core logic: if the value is less than zero, return zero; otherwise, return the value itself.
    return numericForm < 0 ? 0 : numericForm;
};

// The primary routine responsible for processing the raw input data and computing a resultant quantity.
const computeFinalQuantity = (rawInputStreamContent) => {
    // Guard clause: Validate the integrity and presence of the input data stream.
    if (!rawInputStreamContent || typeof rawInputStreamContent !== 'string' || rawInputStreamContent.trim() === '') {
        console.error("Critical Error: The provided input data stream is either empty, null, or not a string.");
        return; // Terminate execution early due to invalid input.
    }

    // Intermediate step: Decompose the entire input stream into an array of individual lines.
    const allReceivedLines = rawInputStreamContent.split('\n');

    // Guard clause: Verify that there is at least one significant line of data to process.
    if (allReceivedLines.length === 0 || allReceivedLines[0].trim() === '') {
        console.error("Critical Error: No discernable data lines were found within the input stream.");
        return;
    }

    // Focus our processing on the very first line, which is assumed to contain our key parameters.
    const primaryInputLineSegment = allReceivedLines[0];

    // Intermediate step: Further break down the primary line into individual tokens, delimited by spaces.
    const numericParameterTokens = primaryInputLineSegment.split(' ');

    // Guard clause: Ensure that we have a minimum of two numeric parameters as expected.
    if (numericParameterTokens.length < 2) {
        console.error("Critical Error: Insufficient parameters detected on the primary input line. Expecting at least two numeric values.");
        return;
    }

    // Extract the raw string representations of the parameters for better readability.
    const initialMeasurementString = numericParameterTokens[0];
    const decrementValueString = numericParameterTokens[1];

    // Convert the string tokens into their numerical equivalents using the global Number() function.
    // This provides a robust way to parse numbers, handling various formats.
    const initialMagnitude = Number(initialMeasurementString);
    const reductionAmount = Number(decrementValueString);

    // Guard clause: Perform a crucial validation to confirm that both parsed values are indeed valid numbers.
    if (isNaN(initialMagnitude) || isNaN(reductionAmount)) {
        console.error("Critical Error: One or both of the primary parameters could not be parsed into valid numbers.");
        return;
    }

    // Calculate the preliminary difference, which might potentially be a negative value.
    const provisionalOutcome = initialMagnitude - reductionAmount;

    // Apply our custom utility function to guarantee that the final result is non-negative.
    const ultimateCalculatedValue = enforceNonNegativeConstraint(provisionalOutcome);

    // Display the final, computed value to the console.
    console.log(ultimateCalculatedValue);
};

// --- Program Execution Entry Point ---
// Encapsulate file system interactions for better organization and error handling.
const fileSystemUtility = require('fs');
const standardInputFilePath = '/dev/stdin'; // Define the standard input path explicitly.

try {
    // Synchronously read the entire content from the standard input device, expecting UTF-8 encoding.
    const obtainedDataBuffer = fileSystemUtility.readFileSync(standardInputFilePath, 'utf8');

    // Invoke our main processing function with the data acquired from standard input.
    computeFinalQuantity(obtainedDataBuffer);
} catch (inputOutputError) {
    // Provide comprehensive error reporting for any issues encountered during file reading.
    console.error(`An error occurred while attempting to read from standard input: ${inputOutputError.message}`);
}