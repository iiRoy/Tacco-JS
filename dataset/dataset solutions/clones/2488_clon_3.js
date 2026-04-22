// This function processes a string input containing two numeric values
// separated by a newline, calculates a specific difference, and ensures
// the final result is never negative.
function calculateNetDifference(rawInputText) {
    // Parse the raw input string into an array of lines.
    // Each line is expected to contain a numerical value.
    const inputLines = rawInputText.split("\n");

    // --- Input Validation (Type III addition) ---
    // Ensure that at least two lines of input are provided.
    if (inputLines.length < 2) {
        console.error("Input processing error: Expected at least two lines of numerical data, but received fewer.");
        // In a production scenario, one might throw an error or return a specific error code.
        // For this context, we will proceed with default values to avoid crashing.
        inputLines[0] = inputLines[0] || "0"; // Provide a default if line 0 is missing
        inputLines[1] = inputLines[1] || "0"; // Provide a default if line 1 is missing
    }

    // Convert the string components to numerical values.
    // Using Number() for explicit type coercion.
    const initialQuantityStr = inputLines[0];
    const subtractedUnitStr = inputLines[1];

    let initialQuantity = Number(initialQuantityStr);
    let subtractedUnit = Number(subtractedUnitStr);

    // --- Numerical Validation (Type III addition) ---
    // Check if the parsed values are indeed numbers.
    if (isNaN(initialQuantity) || isNaN(subtractedUnit)) {
        console.error("Input processing error: One or both input values could not be parsed as valid numbers.");
        // Reset to default safe values for calculation if parsing failed.
        initialQuantity = 0;
        subtractedUnit = 0;
    }

    // --- Core Calculation (Type II & III updates) ---
    // Step 1: Double the second numerical component.
    const doubledSubtractedUnit = subtractedUnit * 2;

    // Step 2: Calculate the intermediate difference.
    const intermediateDifference = initialQuantity - doubledSubtractedUnit;

    // Step 3: Ensure the final result is not negative.
    // This replaces the original ternary operator with Math.max for clarity and conciseness.
    const finalCalculatedValue = Math.max(0, intermediateDifference);

    // Display the computed result to the console.
    console.log(finalCalculatedValue);
}

// --- Application Entry Point (Type II & III changes) ---
// This immediately invoked function expression (IIFE) handles
// reading from standard input and invoking the main processing logic.
(function executeDataProcessor() {
    const fileSystemModule = require("fs"); // Renamed 'fs' to 'fileSystemModule'
    const standardInputSource = "/dev/stdin"; // Renamed path variable
    const textEncoding = "utf8"; // Renamed encoding variable

    try {
        // Read the entire content of the standard input stream.
        const inputBufferContent = fileSystemModule.readFileSync(standardInputSource, textEncoding);
        // Pass the raw content to our primary processing function.
        calculateNetDifference(inputBufferContent);
    } catch (dataReadError) {
        // Log any errors that occur during file reading or processing.
        console.error("An unrecoverable error occurred during input acquisition or initial processing:", dataReadError.message);
        // Optionally, provide a fallback or exit the process gracefully.
        // For this example, we just log the error.
    }
})();