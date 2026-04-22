// This module encapsulates the core logic for processing a structured input.
// It aims to derive a specific numerical outcome based on an array configuration.
function processInputData(rawDataString) {
    let computedOutcome = -1; // Initialize the result with a default error/not-found value.

    // --- Input Validation and Pre-processing ---
    // Guard clause to handle invalid or empty raw input data.
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        return computedOutcome; // Return default on invalid input.
    }

    // Split the raw input into individual lines, removing any leading/trailing whitespace from the whole block.
    const cleanedInputLines = rawDataString.trim().split("\n");

    // Ensure there's at least one line (the configuration line) present after splitting.
    if (cleanedInputLines.length === 0) {
        return computedOutcome; // Return default if no lines are found.
    }

    // --- Configuration Extraction ---
    // The first line contains the target size for our dynamic array.
    // Extract the first number from the first line, as other parts are irrelevant.
    const configLineParts = cleanedInputLines[0].split(' ');
    const targetArraySize = Number(configLineParts[0]);

    // Validate the extracted array size. It must be a positive integer.
    if (isNaN(targetArraySize) || targetArraySize <= 0 || !Number.isInteger(targetArraySize)) {
        return computedOutcome; // Return default if array size is invalid.
    }

    // Isolate the data entries, skipping the initial configuration line.
    const dataConfigurationEntries = cleanedInputLines.slice(1);

    // --- Dynamic Array Initialization ---
    // Create an array of the specified size, pre-filling it with a unique placeholder character.
    // This character will later be replaced or stripped based on the processing rules.
    const dynamicResultHolder = Array.from({ length: targetArraySize }, () => 'placeholderChar');

    // --- Data Population Loop ---
    // Helper function to safely parse a single line into an index-value pair.
    const extractIndexValuePair = (lineContent) => {
        const numericParts = lineContent.split(' ').map(s => Number(s));
        // Basic validation for the parsed components to ensure they are valid numbers.
        if (numericParts.length < 2 || isNaN(numericParts[0]) || isNaN(numericParts[1])) {
            return null; // Indicates a malformed or incomplete line.
        }
        return { arrayIndex: numericParts[0], assignedValue: numericParts[1] };
    };

    // Iterate over each data entry line to populate the dynamic array.
    // Using a 'for...of' loop for modern iteration over array elements.
    for (const currentEntryLine of dataConfigurationEntries) {
        // Skip any completely empty lines that might occur in the input.
        if (currentEntryLine.trim().length === 0) {
            continue;
        }

        const parsedEntry = extractIndexValuePair(currentEntryLine);

        // If the line was successfully parsed into valid numbers, proceed to update the array.
        if (parsedEntry) {
            // Convert the 1-based index from the input to a 0-based index for JavaScript arrays.
            const zeroBasedIndex = parsedEntry.arrayIndex - 1;

            // Ensure the calculated index is within the valid bounds of the array.
            if (zeroBasedIndex >= 0 && zeroBasedIndex < targetArraySize) {
                dynamicResultHolder[zeroBasedIndex] = parsedEntry.assignedValue;
            }
            // If the index is out of bounds, the entry is ignored, and its corresponding placeholder remains.
        }
    }

    // --- Final String Processing ---
    // Concatenate the array elements into a single string.
    let finalProcessedString = dynamicResultHolder.join('');

    // Remove any leading placeholder characters from the string.
    finalProcessedString = finalProcessedString.replace(/^placeholderChar+/, '');

    // Replace any remaining placeholder characters (those not at the start) with '0'.
    finalProcessedString = finalProcessedString.replace(/placeholderChar/g, '0');

    // Introduce an alias for clarity in the subsequent conditional logic.
    const candidateNumericString = finalProcessedString;

    // --- Determine Final Outcome Based on Specific Patterns ---
    // The original logic has specific output values for the string patterns '0' and '00'.
    if (candidateNumericString === '00') {
        computedOutcome = 100;
    } else if (candidateNumericString === '0') {
        computedOutcome = 10;
    } else {
        // For other cases, attempt to convert the string to an integer.
        const interpretedInteger = parseInt(candidateNumericString, 10);
        // Convert the parsed integer back to a string for a strict comparison.
        const integerAsString = interpretedInteger.toString();

        // If the processed string matches its integer conversion string, it implies
        // that there were no significant leading zeros (other than '0' itself, which is handled above)
        // or other non-numeric characters that were implicitly stripped by parseInt.
        // This condition effectively checks if the string represents its canonical integer form.
        if (candidateNumericString === integerAsString) {
            computedOutcome = interpretedInteger;
        }
        // If the strings do not match (e.g., '01' vs '1'), the 'computedOutcome' remains
        // its initial value of -1, replicating the original code's specific behavior for such inputs.
    }

    return computedOutcome;
}

// --- Program Entry Point (Immediately-Invoked Function Expression for execution) ---
// This IIFE serves as the main entry point for competitive programming environments,
// handling standard input/output operations.
(function executeMainProgram() {
    // Access the Node.js file system module to read input from standard in.
    const fileSystemModule = require("fs");
    const programInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Invoke the primary logic function with the read content.
    const finalCalculatedResult = processInputData(programInputContent);

    // Output the final computed result to standard output.
    console.log(finalCalculatedResult);
})();