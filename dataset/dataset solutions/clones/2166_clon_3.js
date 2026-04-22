'use strict';

/**
 * Processes a given raw input string to perform a conditional decrement operation.
 * This function handles parsing multi-line string input, extracting specific
 * string and numeric values, and then adjusting one of the numeric values
 * based on a string comparison.
 *
 * @param {string} rawInputPayload - The raw string input, typically from a file or stdin.
 */
function executeProcessing(rawInputPayload) {
    // --- Input Validation and Pre-processing ---
    // Ensure the input payload is a non-empty string.
    if (!rawInputPayload || typeof rawInputPayload !== 'string') {
        // In a real application, this might throw an error or log a warning.
        // For this context, we'll just log and return.
        console.error("Error: Invalid or empty input payload provided.");
        return;
    }

    // Normalize and split the input into individual lines.
    // Using a regex for robust newline handling (\r\n for Windows, \n for Unix).
    const processedLines = rawInputPayload.trim().split(/\r?\n/);

    // Validate the number of lines. We expect at least 3 lines for this specific logic.
    const EXPECTED_LINE_COUNT = 3;
    if (processedLines.length < EXPECTED_LINE_COUNT) {
        console.error(`Error: Expected at least ${EXPECTED_LINE_COUNT} lines, but received ${processedLines.length}.`);
        return;
    }

    // --- Extracting Identifiers from the First Line ---
    const firstDataLine = processedLines[0]; // Retrieve the first line.
    const stringIdentifiers = firstDataLine.split(' '); // Split by space to get individual identifiers.

    // Assign the primary identifier. The second identifier from this line is not used in the core logic.
    const mainIdentifier = stringIdentifiers[0];
    // const secondaryIdentifier = stringIdentifiers[1]; // This variable is explicitly unused.

    // --- Parsing Numeric Values from the Second Line ---
    const secondDataLine = processedLines[1]; // Retrieve the second line.
    const numericStringTokens = secondDataLine.split(' '); // Split by space to get string representations of numbers.

    // Convert string tokens to actual numbers. Using Number() for explicit type conversion.
    const initialNumericValues = numericStringTokens.map(token => {
        const numVal = Number(token);
        // Basic validation: If conversion results in NaN, default to 0 or handle as an error.
        if (isNaN(numVal)) {
            console.warn(`Warning: Could not parse '${token}' into a valid number. Defaulting to 0.`);
            return 0; // Fallback for invalid numeric input.
        }
        return numVal;
    });

    // Initialize our primary and secondary counters with the parsed values.
    let primaryCount = initialNumericValues[0];
    let secondaryCount = initialNumericValues[1];

    // --- Extracting the Target Identifier from the Third Line ---
    const thirdDataLine = processedLines[2]; // Retrieve the third line.
    const comparisonTarget = thirdDataLine; // This line contains a single string for comparison.

    // --- Conditional Logic for Decrementing ---
    // Introduce a helper boolean flag for improved readability of the condition.
    const isTargetMatchingPrimary = (comparisonTarget === mainIdentifier);

    // Define a small, reusable helper function to perform the decrement operation.
    const performDecrement = (currentValue) => {
        // Optionally add validation here, e.g., ensure currentValue is a number.
        if (typeof currentValue !== 'number' || isNaN(currentValue)) {
            console.error("Error: Attempted to decrement a non-numeric value.");
            return currentValue; // Return original value if invalid.
        }
        return currentValue - 1;
    };

    // Apply the decrement based on the comparison result to the respective counter.
    if (isTargetMatchingPrimary) {
        primaryCount = performDecrement(primaryCount); // Decrement the first counter.
    } else {
        secondaryCount = performDecrement(secondaryCount); // Decrement the second counter.
    }

    // --- Outputting the Final State ---
    // Concatenate the final counter values into a single string for output, separated by a space.
    const finalOutputString = primaryCount + ' ' + secondaryCount;
    console.log(finalOutputString);
}

// --- Execution Entry Point ---
// This standard boilerplate reads the entire content of stdin (standard input)
// as a UTF-8 string and passes it to our processing function.
executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));