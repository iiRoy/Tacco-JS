/**
 * This module provides a specialized function to count numbers that adhere to a specific set of rules.
 * It iterates through combinations of allowed digits, filters them based on criteria,
 * and counts those that do not exceed a given upper limit.
 */

/**
 * Executes the primary logic for counting special numbers up to a defined threshold.
 * The function takes a raw input string, extracts an integer limit, and then
 * systematically generates and validates numeric sequences.
 *
 * @param {string} rawInputContentString The full input string, expected to contain the upper limit on its first line.
 * @returns {number} The final tally of numbers that satisfy all specified conditions.
 */
function calculateFilteredNumberCount(rawInputContentString) {
    // Step 1: Parse the upper limit from the input string.
    // We assume the first line of the input contains the numeric limit.
    const numericLimitString = rawInputContentString.split("\n")[0];
    const upperBoundaryValue = Number(numericLimitString);

    // Step 2: Implement a robust guard clause for the input limit.
    // If the parsed limit is not a valid positive number, we cannot proceed meaningfully.
    if (isNaN(upperBoundaryValue) || upperBoundaryValue <= 0) {
        // console.error("Error: The provided upper limit is invalid or non-positive. Returning 0.");
        return 0; // No valid numbers can be counted against an invalid limit.
    }

    // Step 3: Define the fundamental building blocks (digits) for our numbers.
    // These are kept as strings to simplify concatenation and character-based checks.
    const allowedDigitCharacters = ["0", "3", "5", "7"];

    // Step 4: Initialize a counter for numbers that meet all the complex criteria.
    let qualifyingSequenceAccumulator = 0;

    /**
     * Helper function to determine if a given array of digit characters forms a "special" number.
     * A "special" number must meet three conditions:
     * 1. After removing leading zeros, it must have at least 3 digits.
     * 2. After removing leading zeros, it must not contain the digit '0'.
     * 3. It must contain the digits '3', '5', and '7' (in any order, after leading zeros are removed).
     *
     * @param {string[]} candidateDigits An array of single-character strings representing digits.
     * @returns {boolean} True if the number formed by `candidateDigits` is special, false otherwise.
     */
    const evaluateSpecialNumberConditions = (candidateDigits) => {
        // Concatenate the digit characters to form the full string representation.
        const fullCandidateString = candidateDigits.join('');

        // Convert to a number and back to a string to effectively strip leading zeros.
        // E.g., "00357" becomes 357, then "357". "000" becomes 0, then "0".
        const significantNumberValue = Number(fullCandidateString);
        const significantDigitString = String(significantNumberValue);
        const individualSignificantDigits = significantDigitString.split('');

        // Condition 1: Minimum length check.
        if (individualSignificantDigits.length < 3) {
            return false;
        }

        // Condition 2: Absence of '0' among significant digits.
        if (individualSignificantDigits.includes("0")) {
            return false;
        }

        // Condition 3: Presence of '3', '5', and '7'.
        const hasThree = individualSignificantDigits.includes("3");
        const hasFive = individualSignificantDigits.includes("5");
        const hasSeven = individualSignificantDigits.includes("7");

        return hasThree && hasFive && hasSeven;
    };

    // Step 5: Generate all 9-digit combinations using the allowed digits.
    // This involves 9 nested loops, iterating through each position.
    for (const charA of allowedDigitCharacters) {
        for (const charB of allowedDigitCharacters) {
            for (const charC of allowedDigitCharacters) {
                for (const charD of allowedDigitCharacters) {
                    for (const charE of allowedDigitCharacters) {
                        for (const charF of allowedDigitCharacters) {
                            for (const charG of allowedDigitCharacters) {
                                for (const charH of allowedDigitCharacters) {
                                    for (const charI of allowedDigitCharacters) {
                                        // Assemble the current 9-digit sequence.
                                        const currentNineDigitSequence = [
                                            charA, charB, charC, charD, charE,
                                            charF, charG, charH, charI
                                        ];

                                        // Step 6: Validate the generated sequence using our helper function.
                                        if (evaluateSpecialNumberConditions(currentNineDigitSequence)) {
                                            // If the sequence is deemed special, convert it to a number for comparison.
                                            const finalNumericCandidate = Number(currentNineDigitSequence.join(''));

                                            // Step 7: Apply the upper limit check and potential early exit.
                                            // If the current number already exceeds the global limit,
                                            // any further numbers generated in this lexicographical order
                                            // will also exceed or be equal to it. So, we can terminate early.
                                            if (finalNumericCandidate > upperBoundaryValue) {
                                                return qualifyingSequenceAccumulator; // Return the count found so far.
                                            }

                                            // If the number is valid and within the limit, increment the total count.
                                            qualifyingSequenceAccumulator++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Step 8: After all combinations are processed (or an early exit occurred), return the final tally.
    return qualifyingSequenceAccumulator;
}

// --- Execution Environment Abstraction Layer ---
// This immediate function expression handles the execution context,
// differentiating between Node.js (command-line) and browser environments.
// It ensures the main logic (`calculateFilteredNumberCount`) receives appropriate input.

((mainFunctionExecutor, consoleInterface, mockBrowserInput) => {
    // Check if the 'require' function is available, which is characteristic of Node.js.
    if (typeof require !== "undefined") {
        // Node.js environment: Read input synchronously from standard input.
        const fileSystemUtil = require("fs");
        const standardInputPath = "/dev/stdin";
        const fileContent = fileSystemUtil.readFileSync(standardInputPath, "utf8");
        consoleInterface.log(mainFunctionExecutor(fileContent));
    } else {
        // Browser or other non-Node.js environment: Simulate input and display results in the DOM.
        // This section is primarily for demonstration and testing purposes outside of a Node.js runtime.

        // Prepare the simulated input by stripping leading/trailing newlines.
        let simulatedBrowserInput = mockBrowserInput.split("\n").slice(1, -1).join("\n");
        let executionResult;

        try {
            // Attempt to run the main logic with the simulated browser input.
            executionResult = mainFunctionExecutor(simulatedBrowserInput);
        } catch (errorDetails) {
            // If an error occurs during execution, capture its details.
            executionResult = errorDetails.stack || errorDetails.message;
        }

        // Determine the data type of the result for display purposes.
        let resultTypeDescriptor = typeof executionResult;

        // If the result isn't already a string, convert it to JSON for clear presentation.
        if (resultTypeDescriptor !== "string") {
            executionResult = JSON.stringify(executionResult);
        }

        // Helper to create DOM elements, mimicking a simplified jQuery-like interface.
        const createHtmlElement = (tag, attributes) => {
            const element = document.createElement(tag);
            if (attributes) {
                for (const prop in attributes) {
                    if (prop === 'text') {
                        element.textContent = attributes[prop];
                    } else {
                        element.setAttribute(prop, attributes[prop]);
                    }
                }
            }
            return element;
        };

        // Construct a form-like structure to display the input and output.
        const displayFormContainer = createHtmlElement("form");
        const displayItems = [
            [10, simulatedBrowserInput], // Textarea for the browser's mock input
            0,                           // Represents a <br> tag for spacing
            [1, resultTypeDescriptor],   // Textarea for the data type of the result
            0,                           // Another <br> tag
            [10, executionResult]        // Textarea for the actual result value
        ].map(itemData => {
            if (itemData === 0) {
                return createHtmlElement("br"); // Create a line break
            } else {
                // Create a textarea with specified rows, columns, and content.
                return createHtmlElement("textarea", {
                    rows: itemData[0],
                    cols: 40,
                    text: itemData[1]
                });
            }
        });

        // Append all created elements to the form, then append the form to the document body.
        displayItems.forEach(element => displayFormContainer.appendChild(element));
        document.body.appendChild(displayFormContainer);
    }
})(
    calculateFilteredNumberCount, // Pass the main function as the executor.
    console,                      // Pass the console object for logging.
    `
999999999
` // This string acts as the default mock input for browser environments.
);