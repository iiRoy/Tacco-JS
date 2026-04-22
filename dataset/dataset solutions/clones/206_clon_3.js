const sysFileHandler = require('fs');

const SYSTEM_INPUT_SOURCE_PATH = '/dev/stdin';
const TEXT_ENCODING_FORMAT = 'utf8';
const WHITESPACE_DELIMITER_REGEX = /\s+/;

/**
 * Converts a string of digits into the smallest possible numeric value
 * by arranging its digits in ascending order.
 * @param {string} numericStringRepresentation The input string, expected to contain only digits.
 * @returns {number} The smallest number formed by the digits, or NaN if input is invalid.
 */
function composeSmallestNumber(numericStringRepresentation) {
    // Basic validation for the input type.
    if (typeof numericStringRepresentation !== 'string' || numericStringRepresentation.length === 0) {
        return NaN;
    }
    // Split the string into individual characters, sort them ascendingly.
    const orderedDigits = numericStringRepresentation.split('').sort();
    // Join the sorted characters back into a string and convert to a number.
    return Number(orderedDigits.join(''));
}

/**
 * Converts a string of digits into the largest possible numeric value
 * by arranging its digits in descending order.
 * This helper function specifically mirrors the original code's approach
 * of sorting digits ascendingly then reversing the array to achieve descending order.
 * @param {string} numericStringRepresentation The input string, expected to contain only digits.
 * @returns {number} The largest number formed by the digits, or NaN if input is invalid.
 */
function composeLargestNumber(numericStringRepresentation) {
    // Basic validation for the input type.
    if (typeof numericStringRepresentation !== 'string' || numericStringRepresentation.length === 0) {
        return NaN;
    }
    // Split the string into characters, sort ascendingly, then reverse the order.
    const reversedOrderedDigits = numericStringRepresentation.split('').sort().reverse();
    // Join the descending characters into a string and convert to a number.
    return Number(reversedOrderedDigits.join(''));
}

/**
 * This is the primary function responsible for reading input from stdin,
 * processing each relevant numeric entry, and printing the calculated difference
 * between the largest and smallest numbers formable from its digits.
 */
function initiateProcessingSequence() {
    let completeInputBuffer;

    try {
        // Synchronously read the entire content from the designated standard input path.
        completeInputBuffer = sysFileHandler.readFileSync(SYSTEM_INPUT_SOURCE_PATH, TEXT_ENCODING_FORMAT);
    } catch (readError) {
        // If an error occurs during file reading (e.g., stdin issues), log it and terminate.
        console.error("Critical: Failed to read input from standard input.", readError.message);
        return; // Exit the function to prevent further errors.
    }

    // Parse the raw input content:
    // 1. Split the entire buffer using a regular expression that matches any whitespace sequence.
    // 2. Filter out any resulting empty strings, which can occur with multiple consecutive delimiters.
    const tokenizedInputElements = completeInputBuffer
                                    .split(WHITESPACE_DELIMITER_REGEX)
                                    .filter(element => element.trim().length > 0);

    // The original logic implicitly skipped the very first token (index 0) by starting its loop at j=1.
    // We explicitly achieve this by slicing the array to exclude the first element.
    const actionableDataElements = tokenizedInputElements.slice(1);

    // Add a guard clause: If no elements remain after initial parsing and filtering, there's nothing to do.
    if (actionableDataElements.length === 0) {
        console.log("Informational: No valid data entries were found for processing after filtering.");
        return;
    }

    // Iterate over each data element that needs to be processed.
    for (const currentDataEntry of actionableDataElements) {
        // Added validation: Ensure the current entry is composed purely of digits.
        // The original code would implicitly handle non-numeric input by producing NaN,
        // but explicit validation provides clearer behavior and error reporting (Type III addition).
        if (!/^\d+$/.test(currentDataEntry)) {
            console.warn(`Warning: Skipping non-numeric input entry "${currentDataEntry}". Only digit sequences are supported.`);
            continue; // Move to the next entry in the loop.
        }

        // Compute the largest number that can be arranged from the digits of the current entry.
        const highestNumericValue = composeLargestNumber(currentDataEntry);

        // Compute the smallest number that can be arranged from the digits of the current entry.
        const lowestNumericValue = composeSmallestNumber(currentDataEntry);

        // Calculate the difference between the highest and lowest numeric values.
        const resultingCalculation = highestNumericValue - lowestNumericValue;

        // Output the final computed difference to the standard output.
        console.log(resultingCalculation);
    }
}

// Begin the execution of the input processing and calculation sequence.
initiateProcessingSequence();