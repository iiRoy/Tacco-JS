// This module provides utilities for string manipulation and numeric comparisons.
const LINE_DELIMITER = "\n"; // Separator for lines in multi-line input data.
const ELEMENT_SEPARATOR = " "; // Separator for individual elements within a line.
const EMPTY_STRING_VAL = ""; // Represents an empty string constant.

/**
 * Executes the primary comparison logic for two hexadecimal numbers.
 * It parses the input, converts hex values to decimal, and compares them.
 * @param {string} rawInputContent - The raw input string containing two hexadecimal numbers
 *                                   separated by a space, potentially on a single line.
 * @returns {string} A string indicating the comparison result ('>', '=', or '<').
 */
function ProcessHexComparison(rawInputContent) {
    // Extensive refactoring of input parsing.
    // First, split the entire input by line delimiter, then flatten by element separator.
    // This handles multi-line inputs by creating a flat list of all tokens.
    let parsedTokens = rawInputContent
        .split(LINE_DELIMITER)
        .flatMap(individualLine => individualLine.split(ELEMENT_SEPARATOR));

    /**
     * Helper function to extract the next available token from the parsed list
     * and advance the internal token pointer. Includes a basic guard.
     * @returns {string} The next token string, or an empty string if no tokens remain.
     */
    const retrieveNextToken = () => {
        // Adding a guard for empty input, which was not explicitly handled in the original.
        if (parsedTokens.length === 0) {
            console.warn("Attempted to retrieve token from an empty list of parsed segments.");
            return EMPTY_STRING_VAL; // Return empty string to prevent potential errors further down.
        }
        return parsedTokens.shift(); // Remove and return the first element.
    };

    /**
     * Helper function to parse a hexadecimal string into its integer equivalent.
     * Includes validation for the parsing process.
     * @param {string} hexString - The string representing a hexadecimal number.
     * @returns {number} The decimal equivalent of the hexadecimal string.
     */
    const parseHexadecimalValue = (hexString) => {
        // Using Number.parseInt with radix 16 for explicit hexadecimal conversion.
        const decimalEquivalent = Number.parseInt(hexString, 16);

        // Guard clause: ensure the parsed value is a valid number.
        if (Number.isNaN(decimalEquivalent)) {
            console.error(`Invalid hexadecimal input encountered: "${hexString}". Result will be unreliable.`);
            // Depending on desired error handling, one might throw an error or return a default value.
            // For robust comparison, invalid numbers would ideally halt execution or be handled specifically.
            return 0; // Defaulting to 0 might lead to incorrect comparisons, but allows flow to continue.
        }
        return decimalEquivalent;
    };

    // Retrieve and parse the first hexadecimal value from the input.
    const firstHexStr = retrieveNextToken();
    const firstNumericValue = parseHexadecimalValue(firstHexStr);

    // Retrieve and parse the second hexadecimal value.
    const secondHexStr = retrieveNextToken();
    const secondNumericValue = parseHexadecimalValue(secondHexStr);

    // Intermediate step: calculate the difference to simplify comparison logic.
    const difference = firstNumericValue - secondNumericValue;

    // Determine the comparison result using a switch statement based on Math.sign.
    // This is a structural rewrite of the original if-else if-else chain, offering an alternative control flow.
    let comparisonResultSymbol;
    switch (Math.sign(difference)) {
        case 1: // If difference > 0, then firstNumericValue is greater than secondNumericValue.
            comparisonResultSymbol = ">";
            break;
        case 0: // If difference === 0, then firstNumericValue is equal to secondNumericValue.
            comparisonResultSymbol = "=";
            break;
        case -1: // If difference < 0, then firstNumericValue is less than secondNumericValue.
            comparisonResultSymbol = "<";
            break;
        default:
            // This case should theoretically not be reached if Math.sign returns one of the three values.
            // It serves as a defensive programming measure.
            console.error("Unexpected outcome from numeric comparison. Returning a placeholder symbol.");
            comparisonResultSymbol = "?"; // Indicate an unknown or erroneous state.
            break;
    }

    // Return the final comparison symbol.
    return comparisonResultSymbol;
}

// --- Input/Output Handling and Environment Abstraction ---
// This self-executing anonymous function handles how the program receives input
// and delivers output, adapting to different JavaScript execution environments
// (Node.js for server-side execution vs. Browser for client-side display).

(function(initialDataPayload, mainProcessingFunction) {
    // Check if running in a Node.js environment (indicated by the presence of 'require' and 'module.exports').
    if (typeof require !== "undefined" && typeof module !== "undefined" && module.exports) {
        // Node.js specific input/output handling.
        const fileSystemModule = require("fs"); // Import Node.js file system module.
        const standardInputPath = "/dev/stdin"; // Standard input file path on Unix-like systems.
        const encodingFormat = "utf8"; // Specify the character encoding.

        try {
            // Read the entire content of the standard input file synchronously.
            const rawFileData = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
            // Call the main processing function with the file data and print the result to the console.
            console.log(mainProcessingFunction(rawFileData));
        } catch (ioError) {
            // Catch and log any errors encountered during file reading or the main processing.
            console.error("Node.js I/O or processing error:", ioError.message || ioError);
            // Terminate the process with an error code to signal failure.
            process.exit(1);
        }
    } else {
        // Browser environment or other non-Node.js JavaScript runtimes.
        // This part uses plain DOM manipulation to display results,
        // mirroring the original's browser-specific output but without jQuery.

        let cleanedInputForBrowser = initialDataPayload;
        // The original code had `b=b.split("\n").slice(1,-1).join("\n")`
        // which specifically removed the first and last lines (often empty from multi-line string literals).
        // This version filters out all empty lines for more robust cleaning.
        cleanedInputForBrowser = cleanedInputForBrowser
            .split(LINE_DELIMITER)
            .filter(line => line.trim() !== EMPTY_STRING_VAL) // Remove lines that are empty or just whitespace.
            .join(LINE_DELIMITER); // Rejoin the non-empty lines.

        let executionResultContent;
        let resultValueType;

        try {
            // Execute the main processing function with the cleaned input.
            executionResultContent = mainProcessingFunction(cleanedInputForBrowser);
            resultValueType = typeof executionResultContent;
        } catch (processingException) {
            // If an error occurs during processing, capture its stack trace or message.
            executionResultContent = processingException.stack || processingException.message;
            resultValueType = typeof executionResultContent; // This will likely be 'string' in case of error.
        }

        // Ensure the result is a string for display purposes; stringify if it's an object or array.
        if (resultValueType !== "string") {
            executionResultContent = JSON.stringify(executionResultContent, null, 2); // Pretty print JSON output.
        }

        // Create a container element for displaying the output.
        const outputDisplayArea = document.createElement("div");
        outputDisplayArea.style.fontFamily = "monospace";
        outputDisplayArea.style.whiteSpace = "pre-wrap"; // Preserve whitespace and wrap text.
        outputDisplayArea.style.margin = "15px";
        outputDisplayArea.style.border = "1px solid #ddd";
        outputDisplayArea.style.padding = "12px";
        outputDisplayArea.style.backgroundColor = "#fdfdfd";
        outputDisplayArea.style.borderRadius = "4px";

        /**
         * Helper to create a labeled display element, either a span or a textarea.
         * @param {string} labelText - The label for the content.
         * @param {string} contentToDisplay - The actual content.
         * @param {boolean} useTextArea - If true, creates a textarea; otherwise, a span.
         * @returns {HTMLElement} The wrapper div containing the label and content.
         */
        const createLabeledDisplayElement = (labelText, contentToDisplay, useTextArea = false) => {
            const containerDiv = document.createElement("div");
            containerDiv.style.marginBottom = "8px"; // Add some spacing between elements.

            const labelSpan = document.createElement("strong");
            labelSpan.textContent = labelText + ": ";
            containerDiv.appendChild(labelSpan);

            if (useTextArea) {
                const multiLineInputArea = document.createElement("textarea");
                // Dynamically set rows based on content lines, with a reasonable maximum.
                multiLineInputArea.rows = Math.min(15, contentToDisplay.split(LINE_DELIMITER).length + 2);
                multiLineInputArea.cols = 80; // Standard width.
                multiLineInputArea.value = contentToDisplay;
                multiLineInputArea.readOnly = true; // Make it read-only.
                multiLineInputArea.style.width = "100%";
                multiLineInputArea.style.boxSizing = "border-box"; // Include padding in width calculation.
                multiLineInputArea.style.marginTop = "4px";
                multiLineInputArea.style.backgroundColor = "#eee";
                multiLineInputArea.style.border = "1px solid #ccc";
                containerDiv.appendChild(multiLineInputArea);
            } else {
                const contentSpan = document.createElement("span");
                contentSpan.textContent = String(contentToDisplay);
                containerDiv.appendChild(contentSpan);
            }
            return containerDiv;
        };

        // Append various information to the display area.
        outputDisplayArea.appendChild(createLabeledDisplayElement("Cleaned Input", cleanedInputForBrowser, true));
        outputDisplayArea.appendChild(document.createElement("hr")); // Add a horizontal rule as a separator.
        outputDisplayArea.appendChild(createLabeledDisplayElement("Result Data Type", resultValueType));
        outputDisplayArea.appendChild(createLabeledDisplayElement("Execution Result", executionResultContent, true));

        // Ensure the display area is appended to the document body only after the DOM is fully loaded.
        document.addEventListener("DOMContentLoaded", () => {
            document.body.appendChild(outputDisplayArea);
        });
    }
})(`
A B
`, ProcessHexComparison); // Pass the initial data (simulated standard input) and the main function.