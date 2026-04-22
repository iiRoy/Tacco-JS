const LINE_BREAK_CHAR = "\n";
const VALUE_SEPARATOR = " ";
const HYPHEN_DELIMITER = "-";

/**
 * Examines and validates the structural integrity of an input string against predefined length specifications.
 * This function parses numerical length requirements and a target string, then verifies
 * if the target string, when split by a hyphen, conforms to these lengths and contains only digits.
 *
 * @param {string} rawInputData - The complete input string, typically containing two numbers on the first line
 *                                and a hyphen-separated string on the second line.
 * @returns {string} Returns "Yes" if all validation checks pass, indicating a valid structure; otherwise, "No".
 */
function verifyInputStructure(rawInputData) {
    // A robust check for the presence and type of the input data.
    if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === "") {
        return "No"; // Early exit for undefined, non-string, or empty input.
    }

    let tokenList = []; // This array will hold all extracted tokens from the input.

    try {
        // The input is first split into lines, then each line into individual tokens
        // using the defined separators. All tokens are flattened into a single list.
        tokenList = rawInputData
            .split(LINE_BREAK_CHAR)
            .flatMap(lineSegment => lineSegment.split(VALUE_SEPARATOR));
    } catch (parsingError) {
        // Catch any unexpected errors during the initial parsing phase.
        return "No";
    }

    // Internal helper function to safely retrieve the next available string token.
    const retrieveNextStringToken = () => {
        if (tokenList.length === 0) {
            throw new Error("Attempted to retrieve a token from an empty list.");
        }
        return tokenList.shift(); // Remove and return the first element.
    };

    // Internal helper function to parse and validate the next token as an integer.
    const retrieveNextIntegerToken = () => {
        const currentToken = retrieveNextStringToken();
        const numericValue = parseInt(currentToken, 10); // Explicitly parse as base-10 integer.
        if (isNaN(numericValue)) {
            throw new Error(`Non-numeric token encountered where an integer was expected: '${currentToken}'`);
        }
        return numericValue;
    };

    let overallValidationStatus = true; // A flag to accumulate the result of multiple validation steps.

    let requiredFirstPartLength;
    let requiredSecondPartLength;

    try {
        // Extract the two expected length parameters from the beginning of the token list.
        requiredFirstPartLength = retrieveNextIntegerToken();
        requiredSecondPartLength = retrieveNextIntegerToken();
        
        // Additional validation: ensure the parsed lengths are non-negative.
        if (requiredFirstPartLength < 0 || requiredSecondPartLength < 0) {
            overallValidationStatus = false;
        }

    } catch (tokenReadError) {
        overallValidationStatus = false; // Mark failure if length tokens cannot be parsed.
    }

    // If parsing of initial lengths failed, no further checks are necessary.
    if (!overallValidationStatus) {
        return "No";
    }

    let targetStringForValidation;
    try {
        // Retrieve the main string that needs to be validated against the lengths.
        targetStringForValidation = retrieveNextStringToken();
    } catch (stringReadError) {
        overallValidationStatus = false; // Mark failure if the target string is missing.
    }

    if (!overallValidationStatus) {
        return "No";
    }

    // A utility function to confirm if a string consists purely of digits.
    const isComposedOfDigits = (textSegment) => /^\d+$/.test(textSegment);

    // Split the target string using the defined hyphen delimiter.
    const stringSegments = targetStringForValidation.split(HYPHEN_DELIMITER);

    // Apply a series of conditional checks to determine the final validation status.
    if (stringSegments.length !== 2) {
        overallValidationStatus = false; // The string must contain exactly one hyphen, resulting in two parts.
    } else if (stringSegments[0].length !== requiredFirstPartLength) {
        overallValidationStatus = false; // The first part's length does not match the requirement.
    } else if (stringSegments[1].length !== requiredSecondPartLength) {
        overallValidationStatus = false; // The second part's length does not match the requirement.
    } else if (!isComposedOfDigits(stringSegments[0]) || !isComposedOfDigits(stringSegments[1])) {
        // Enhanced validation: ensure both parts are composed exclusively of numerical digits.
        overallValidationStatus = false;
    }

    // Return the final verdict based on the accumulated validation status.
    return overallValidationStatus ? "Yes" : "No";
}

// --- Environment-specific execution wrapper (IIFE) ---
// This anonymous function manages the input acquisition and output presentation
// based on whether the code is run in a Node.js environment (e.g., for competitive programming)
// or a browser environment (e.g., for local testing and debugging).

((inputArgument, processedResult, resultDataType) => {
    // Check for Node.js environment indicators.
    if (typeof require !== "undefined" && typeof module !== "undefined" && module.exports) {
        // Node.js path: Read input from standard input and print output to console.
        const fileSystemModule = require("fs");
        const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        console.log(verifyInputStructure(standardInputContent));
    } else {
        // Browser or similar environment path: Simulate input from the template literal
        // and dynamically display results on the web page.
        
        // Clean up the input string from the template literal (remove potential leading/trailing newlines).
        inputArgument = inputArgument.split("\n").slice(1, -1).join("\n").trim();
        
        try {
            // Execute the primary validation function with the simulated input.
            processedResult = verifyInputStructure(inputArgument);
        } catch (runtimeError) {
            // Capture and format any errors that occur during execution for display.
            processedResult = runtimeError.stack || runtimeError.message;
        }
        
        // Determine the JavaScript data type of the result.
        resultDataType = typeof processedResult;

        // Convert non-string results (like objects or arrays) into a readable JSON string.
        if (resultDataType !== "string") {
            processedResult = JSON.stringify(processedResult, null, 2);
        }

        // Wait for the DOM to be fully loaded before manipulating it.
        document.addEventListener('DOMContentLoaded', () => {
            const outputDisplayContainer = document.createElement("div");
            outputDisplayContainer.style.fontFamily = 'monospace';
            outputDisplayContainer.style.margin = '20px';
            outputDisplayContainer.style.padding = '15px';
            outputDisplayContainer.style.border = '1px solid #ccc';
            outputDisplayContainer.style.backgroundColor = '#f9f9f9';
            outputDisplayContainer.style.borderRadius = '5px';

            // Helper to create styled text areas for display.
            const createStyledTextArea = (rows, content, labelText) => {
                const label = document.createElement("p");
                label.textContent = labelText;
                label.style.fontWeight = 'bold';
                label.style.marginBottom = '5px';

                const textArea = document.createElement("textarea");
                textArea.rows = rows;
                textArea.cols = 80; // Fixed width for better readability.
                textArea.textContent = content;
                textArea.readOnly = true; // Make it read-only.
                textArea.style.width = 'calc(100% - 10px)';
                textArea.style.resize = 'vertical';
                textArea.style.padding = '5px';
                textArea.style.border = '1px solid #ddd';
                textArea.style.borderRadius = '3px';
                textArea.style.backgroundColor = '#fff';

                outputDisplayContainer.appendChild(label);
                outputDisplayContainer.appendChild(textArea);
                outputDisplayContainer.appendChild(document.createElement("br"));
            };

            createStyledTextArea(10, inputArgument, "Simulated Input Data:");
            createStyledTextArea(5, processedResult, "Function Execution Output:");
            createStyledTextArea(1, resultDataType, "Output Data Type:");
            
            document.body.appendChild(outputDisplayContainer);
        });
    }
})(`
3 4
269-66-0
`);