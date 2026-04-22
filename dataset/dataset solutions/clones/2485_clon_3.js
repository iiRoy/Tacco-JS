// This module handles the processing of numerical data provided as a string,
// performing a specific arithmetic calculation and ensuring a non-negative output.

const performConditionalSubtraction = (sourceStringData) => {
    // First, ensure the incoming data is treated as a string and remove any
    // leading or trailing whitespace to prevent parsing issues.
    const cleanedInputBuffer = String(sourceStringData).trim();

    // Divide the cleaned input string into individual segments based on
    // one or more whitespace characters. This allows for flexible spacing.
    const numericTokens = cleanedInputBuffer.split(/\s+/);

    // Implement a basic validation check: we expect at least two numerical values.
    // If fewer are found, we'll log an error and return a default value (e.g., zero)
    // to indicate an incomplete operation, rather than crashing.
    if (numericTokens.length < 2) {
        console.error("Error: Insufficient data segments. Expected at least two numeric values.");
        return 0; // Return a neutral value for invalid input structure.
    }

    // Convert the first token into a floating-point number.
    const firstNumericalComponent = parseFloat(numericTokens[0]);
    // Convert the second token into a floating-point number.
    const secondNumericalComponent = parseFloat(numericTokens[1]);

    // Define a constant for the multiplier, making it explicit and easily adjustable.
    const calculationMultiplier = 2;

    // Execute an intermediate step: multiply the second component by the predefined factor.
    const productOfSecondComponent = secondNumericalComponent * calculationMultiplier;

    // Calculate the preliminary difference between the first component and the product.
    let provisionalResult = firstNumericalComponent - productOfSecondComponent;

    // Ensure the final result is never negative. If the provisional result
    // is less than zero, it is adjusted upwards to zero. This uses Math.max
    // for a concise and functional approach.
    const finalAdjustedOutput = Math.max(0, provisionalResult);

    // Return the computed and adjusted numerical value.
    return finalAdjustedOutput;
};

// This block serves as the entry point for executing the script,
// handling file system operations to acquire input data.
try {
    // Dynamically load the Node.js file system module for input/output operations.
    const fileSystemHandler = require("fs");

    // Specify the standard input file path, which is common in competitive programming environments.
    const stdinPathReference = "/dev/stdin";

    // Read the entire content from the specified standard input path,
    // ensuring it's interpreted as UTF-8 encoded text.
    const rawInputContentFromFile = fileSystemHandler.readFileSync(stdinPathReference, "utf8");

    // Invoke the primary processing function with the raw content obtained from stdin.
    const computedNumericalOutcome = performConditionalSubtraction(rawInputContentFromFile);

    // Display the final computed result to standard output.
    // Explicitly converting to string is good practice for console output.
    console.log(computedNumericalOutcome.toString());

} catch (ioError) {
    // Catch and report any errors that occur during the file reading process.
    console.error("An operational error occurred during file I/O:", ioError.message);
    // Optionally, one might choose to exit the process with an error code here.
    // process.exit(1);
}