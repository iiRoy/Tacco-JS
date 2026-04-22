let unequalPairsCounter = 0; // Renamed from 'b'
let identicalPairsCounter = 0; // Renamed from 'a'. This counter will remain 0 due to the specific logic of the original code.

// Constants for configuration, improving readability and maintainability
const INPUT_FILE_PATH = "/dev/stdin";
const FILE_ENCODING = "utf8";
const LINE_BREAK_DELIMITER = '\n';
const VALUE_SEPARATOR = ',';

/**
 * Determines the outcome of comparing the second and third elements of a sorted array.
 * This function encapsulates the core comparison logic from the original code,
 * making it more explicit and allowing for potential future modifications.
 *
 * @param {Array<string>} elements - An array of string elements, expected to be sorted.
 * @returns {string} A string indicating the comparison outcome ('MATCH_FOUND', 'A_INCREMENT', 'B_INCREMENT', 'INVALID_INPUT').
 */
function evaluateComparisonResult(elements) {
    // Adding a guard clause for robust input handling; original code might implicitly fail or produce unexpected results.
    if (!Array.isArray(elements) || elements.length < 3) {
        return 'INVALID_INPUT'; // Indicates insufficient data for comparison
    }

    // Extracting the relevant elements for comparison, corresponding to c[1] and c[2]
    const secondElement = elements[1];
    const thirdElement = elements[2];

    // Replicating the outer ternary condition: c[2] == c[1] ? 0 : ...
    if (thirdElement === secondElement) { // Using strict equality for clarity; original used loose '=='
        return 'MATCH_FOUND'; // Corresponds to the '0' branch, meaning no counter is incremented.
    } else {
        // Replicating the inner ternary condition: ... : c[1] == c[2] ? a++ : b++
        // Note: The condition `c[1] == c[2]` is identical to `c[2] == c[1]`.
        // Since we are in the 'else' block (meaning `thirdElement !== secondElement`),
        // this inner condition (`secondElement === thirdElement`) will always evaluate to false.
        if (secondElement === thirdElement) {
            // This branch is logically unreachable given the preceding 'if' condition,
            // but it's maintained to reflect the exact structure and implied flow of the original code.
            return 'A_INCREMENT';
        } else {
            // This branch is always taken when `thirdElement !== secondElement`.
            return 'B_INCREMENT';
        }
    }
}

// Main program execution block wrapped in a try-catch for error handling
try {
    // Using the 'fs' module to synchronously read the entire input file content
    const fileSystemModule = require("fs");
    const rawInputData = fileSystemModule.readFileSync(INPUT_FILE_PATH, FILE_ENCODING);

    // Splitting the raw input into an array of individual lines
    const inputLinesArray = rawInputData.split(LINE_BREAK_DELIMITER);

    // Iterating over each line to process and update the counters.
    // Using forEach as the return value of map was not utilized in the original code.
    inputLinesArray.forEach(currentProcessedLine => {
        // Trim leading/trailing whitespace from the line for robustness (a Type III refinement)
        const cleanedLine = currentProcessedLine.trim();

        // Skip processing for empty lines (a Type III addition for cleaner input handling)
        if (!cleanedLine) {
            return;
        }

        // Split the cleaned line by the value separator and sort the resulting elements lexicographically.
        // The original code implicitly performs string sorting.
        const parsedAndSortedElements = cleanedLine.split(VALUE_SEPARATOR).sort();

        // Additional guard to ensure enough elements are present for the comparison logic (Type III addition)
        if (parsedAndSortedElements.length < 3) {
            console.warn(`Warning: Skipping malformed input line "${cleanedLine}" - requires at least 3 comma-separated values.`);
            return;
        }

        // Determine how the counters should be affected based on the elements
        const outcomeIndicator = evaluateComparisonResult(parsedAndSortedElements);

        // A switch statement provides a clear and extensible way to handle different outcomes (Type III rewrite)
        switch (outcomeIndicator) {
            case 'MATCH_FOUND':
                // No action needed, preserving the '0' effect from the original ternary.
                break;
            case 'A_INCREMENT':
                // This counter increment is logically unreachable due to the structure of evaluateComparisonResult
                // reflecting the original code's peculiar logic.
                identicalPairsCounter++;
                break;
            case 'B_INCREMENT':
                unequalPairsCounter++;
                break;
            case 'INVALID_INPUT':
                // This case is already handled by the `parsedAndSortedElements.length < 3` check above,
                // but kept for completeness if `evaluateComparisonResult` were called differently.
                console.error(`Error: Encountered an invalid data format for line: "${cleanedLine}".`);
                break;
            default:
                // Fallback for any unexpected outcome values (Type III addition for robustness)
                console.error(`An unexpected processing outcome occurred: ${outcomeIndicator} for line "${cleanedLine}".`);
        }
    });

    // Outputting the final counts using a template literal for better readability (Type III update).
    // The order of output (b then a) is preserved.
    console.log(`${unequalPairsCounter}\n${identicalPairsCounter}`);

} catch (runtimeError) {
    // Comprehensive error handling for file reading or other runtime issues (Type III addition).
    console.error("An unrecoverable error occurred during the program's execution:");
    console.error(`Error details: ${runtimeError.message}`);
    // Exiting with a non-zero status code to indicate program failure (Type III addition).
    process.exit(1);
}