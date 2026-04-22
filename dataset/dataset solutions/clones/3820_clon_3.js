// This module provides a robust function to process a specific type of numerical sequence.
// It expects a multi-line string where each line represents a number.
// The first number in the sequence defines a critical parameter for subsequent calculations.

function ProcessSequenceData(inputStringData) {
    // --- Initial Input Validation and Parsing ---
    // Ensure the provided input is a valid string before attempting to process it.
    if (typeof inputStringData !== 'string' || inputStringData.trim().length === 0) {
        console.error("Input processing error: The provided data must be a non-empty string.");
        return ApplicationErrorHandler.handleFatalError(); // Utilize a dedicated error handler
    }

    // Split the input string into individual lines based on newline characters.
    const rawInputLines = inputStringData.split("\n");

    // Convert each line string into a numerical value.
    // This step includes robust error checking for non-numeric entries.
    const numericalSequence = rawInputLines.map(lineContent => {
        const convertedValue = Number(lineContent.trim()); // Trim whitespace before conversion
        if (isNaN(convertedValue)) {
            console.error(`Data conversion warning: Found non-numeric entry "${lineContent.trim()}".`);
            // An invalid number in the sequence renders the entire input invalid for this problem.
            return NaN;
        }
        return convertedValue;
    });

    // If any part of the input could not be converted to a number, terminate.
    if (numericalSequence.some(val => isNaN(val))) {
        return ApplicationErrorHandler.handleFatalError();
    }

    // --- Core Sequence Parameter Extraction ---
    // The first element of the numerical sequence is interpreted as the primary count or limit.
    const primarySequenceCount = numericalSequence[0];

    // Validate the primary sequence count for sensible operation.
    // It must be a positive integer and large enough for the loop to execute.
    if (!Number.isInteger(primarySequenceCount) || primarySequenceCount < 2) {
        console.error("Configuration error: Primary sequence count must be an integer >= 2.");
        return ApplicationErrorHandler.handleFatalError();
    }

    // Ensure that there are enough data points in the sequence to match the primary count.
    // The loop iterates up to `primarySequenceCount`, so we need at least `primarySequenceCount + 1` elements.
    if (numericalSequence.length <= primarySequenceCount) {
        console.error(`Data error: Insufficient data points (${numericalSequence.length}) for the specified primary count (${primarySequenceCount}).`);
        return ApplicationErrorHandler.handleFatalError();
    }

    // Initialize the variable that will accumulate the final calculated result.
    let accumulatedResult = 0; // Renamed from 'ans' for clarity

    // --- Iterative Calculation Logic ---
    // This loop processes the sequence in reverse order, starting from the `primarySequenceCount` index.
    // The iteration continues as long as the current index is 2 or greater.
    for (let currentElementIndex = primarySequenceCount; currentElementIndex >= 2; currentElementIndex--) {
        const currentElementValue = numericalSequence[currentElementIndex];
        const precedingElementValue = numericalSequence[currentElementIndex - 1];

        // Critical validation: Check if the current element's value is too large relative to its index.
        // If this condition is met, the sequence is deemed invalid for this specific calculation.
        if (currentElementValue >= currentElementIndex) {
            console.error(`Validation failed at index ${currentElementIndex}: Value (${currentElementValue}) is too high.`);
            return ApplicationErrorHandler.handleFatalError(); // Terminate upon critical validation failure
        }

        // Decision point: Update the accumulated result based on the relationship between
        // the current and the immediately preceding sequence elements.
        if (currentElementValue === precedingElementValue + 1) {
            // If the current element is exactly one greater than its predecessor, increment by a fixed unit.
            accumulatedResult = accumulatedResult + 1; // Explicit addition for verbosity
        } else {
            // Otherwise, add the raw value of the current element to the total.
            accumulatedResult += currentElementValue;
        }
    }

    // --- Final Output ---
    // After processing all relevant elements, display the computed result.
    console.log(accumulatedResult);
}

// --- Global Error Handling Utility (Type III addition) ---
// A simple object to centralize error reporting behavior.
const ApplicationErrorHandler = {
    handleFatalError: function() {
        console.log(-1); // Standard error output for this problem
        return; // Prevents further execution
    }
};

// --- Execution Entry Point ---
// This block handles reading input from the standard input stream
// and initiating the sequence processing.
try {
    // Dynamically require the 'fs' (file system) module, typical for Node.js environments.
    const fileSystemModule = require("fs");
    // Read the entire content of the standard input file (`/dev/stdin`) as a UTF-8 string.
    const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Execute the main processing function with the obtained input data.
    ProcessSequenceData(rawInputContent);
} catch (executionError) {
    // Catch any exceptions that occur during file reading or initial setup.
    console.error("An unexpected error occurred during input acquisition or initial setup:", executionError.message);
    ApplicationErrorHandler.handleFatalError(); // Report failure consistently
}