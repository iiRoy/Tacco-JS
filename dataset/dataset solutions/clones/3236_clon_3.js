// Expertly crafted module for complex numerical processing.
// This script reads a sequence of space-separated numerical values,
// performs a specific set of arithmetic operations, and then outputs
// a pair of derived results. It includes robust input handling.

/**
 * Processes a raw input string containing space-separated numbers.
 * It extracts, validates, and transforms these numbers to produce a
 * calculated sum and a minimum value, which are then printed.
 *
 * @param {string} rawInputString - The raw string of numerical data,
 *                                  expected to contain at least three
 *                                  space-separated integers.
 * @returns {string} The formatted output string, or an error message if input is invalid.
 */
function ProcessInputData(rawInputString) {
    // Stage 1: Initial Input Validation
    // Checks for null, undefined, non-string, or empty input after trimming.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Input processing error: Provided data is null, not a string, or empty. Returning default.");
        return "0 0"; // Return a default, safe output for invalid input.
    }

    // Stage 2: Tokenization and Numeric Conversion
    // Splits the string into parts and attempts to convert each part to an integer.
    // Handles potential non-numeric tokens by defaulting them to 0.
    const processedNumericValues = rawInputString.split(/\s+/).map(tokenPart => {
        const parsedValue = parseInt(tokenPart.trim(), 10);
        return isNaN(parsedValue) ? 0 : parsedValue; // Ensure all tokens are valid numbers.
    });

    // Stage 3: Structural Validation and Data Extraction
    // Ensures enough numerical components are available for the subsequent calculations.
    // If not, it pads the array with zeros to prevent index out-of-bounds errors.
    if (processedNumericValues.length < 3) {
        console.warn("Warning: Insufficient numeric components detected. Expected at least 3, padding with zeros.");
        while (processedNumericValues.length < 3) {
            processedNumericValues.push(0);
        }
    }

    // Assigning components to clearly named variables for readability and maintainability.
    const initialComponent = processedNumericValues[0];
    const secondComponent = processedNumericValues[1];
    const thirdComponent = processedNumericValues[2];

    // Stage 4: Core Calculation Logic
    // Computes an intermediate value by summing the second and third components.
    const sumOfSecondaryComponents = secondComponent + thirdComponent;

    // Derives the primary calculated value by subtracting the first component from the sum.
    let derivedResultValue = sumOfSecondaryComponents - initialComponent;

    // Ensures the derived result value is non-negative.
    // This acts as a floor, preventing negative outcomes for this specific calculation.
    derivedResultValue = Math.max(0, derivedResultValue);

    // Stage 5: Secondary Calculation
    // Determines the smaller of the second and third input components.
    const minimalRelevantComponent = Math.min(secondComponent, thirdComponent);

    // Stage 6: Output Formatting and Display
    // Constructs the final output string using a modern template literal.
    const finalOutputRepresentation = `${minimalRelevantComponent} ${derivedResultValue}`;

    // Prints the final, formatted string to the console (standard output).
    console.log(finalOutputRepresentation);

    // Optionally returns the output string for testing or further processing.
    return finalOutputRepresentation;
}

/**
 * Utility function to asynchronously read all data from standard input.
 * It handles potential file system errors during the read operation.
 *
 * @returns {string} The trimmed string content read from standard input,
 *                   or an empty string if an error occurs.
 */
function retrieveStandardInputContent() {
    try {
        // Lazily require 'fs' module to avoid global import overhead if not used.
        const fileSystemModule = require("fs");
        // Read the entire file buffer from /dev/stdin.
        const inputBuffer = fileSystemModule.readFileSync("/dev/stdin");
        // Convert the buffer to a UTF-8 string and remove leading/trailing whitespace.
        const cleanedInput = inputBuffer.toString("utf8").trim();
        return cleanedInput;
    } catch (readError) {
        // Log an error message if reading from stdin fails (e.g., file not found, permissions).
        console.error("Input acquisition error: Could not read from standard input.", readError.message);
        return ""; // Return an empty string to indicate failure.
    }
}

// Orchestration: Execute the data processing pipeline.
// First, retrieve the raw input from the system's standard input stream.
const rawSystemInput = retrieveStandardInputContent();

// Then, pass this raw input to the primary processing function.
ProcessInputData(rawSystemInput);