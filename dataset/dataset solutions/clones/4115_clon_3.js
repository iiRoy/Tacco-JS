// This module contains a utility function to process a single numerical input.
// The primary goal is to perform a fixed subtraction operation.
function processInputData(rawNumericString) {

    // Define a constant for the magic number used in the calculation.
    const FIXED_SUBTRAHEND_BASE = 48; // This value is central to the computation.

    let parsedValue; // Variable to hold the integer representation of the input.

    // Attempt to parse the input string into a base-10 integer.
    // A radix (10) is explicitly provided for robustness.
    const intermediateParseResult = parseInt(rawNumericString.trim(), 10);

    // Type III change: Add validation and error handling for the parsed input.
    if (isNaN(intermediateParseResult)) {
        console.error("Validation Error: The provided input could not be parsed as a valid integer. Defaulting to zero.");
        parsedValue = 0; // Fallback value if parsing fails.
    } else {
        parsedValue = intermediateParseResult;
    }

    // Type III change: Introduce an additional intermediate variable for clarity
    // before performing the final calculation.
    const valueToSubtract = parsedValue;

    // Perform the core calculation: subtract the parsed value from the fixed base.
    // This variable holds the final result of our operation.
    let computedResult = FIXED_SUBTRAHEND_BASE - valueToSubtract;

    // Output the final result to the console.
    // Type III change: Use a template literal for a more descriptive output.
    console.log(`Final calculated value: ${computedResult}`);

    // Optionally, return the result. This function is primarily for side-effects (console.log)
    // in this context, but returning the value can be useful for testing or chaining.
    return computedResult;
}

// --- Application Entry Point and Standard Input Handling ---
// This block is responsible for reading the input from standard I/O and
// invoking the main processing function.
// No modifications should be made beyond this point for competitive programming setups.

// Type III change: Decompose the file system interaction into explicit steps
// and add error handling for I/O operations.
try {
    const fileSystemModuleReference = require("fs");
    const standardInputFilePath = "/dev/stdin";
    const encodingScheme = "utf8";

    // Read the entire content of the standard input file.
    const entireInputContent = fileSystemModuleReference.readFileSync(standardInputFilePath, encodingScheme);

    // Call our main processing function with the obtained input.
    processInputData(entireInputContent);
} catch (ioHandlingError) {
    // Type III change: Add a guard clause/error handling for file system operations.
    console.error("An error occurred while reading from standard input:", ioHandlingError.message);
    // As a fallback, call the processing function with a default value if input reading fails.
    processInputData("0"); // Provide a default string to prevent crashes.
}