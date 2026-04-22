/**
 * Expert-level Type III code clone generation.
 * This version of the script processes textual input to evaluate specific numerical conditions.
 * It's a significantly refactored and enhanced variant of an original program,
 * incorporating extensive identifier renaming, structural modifications,
 * additional validations, and explicit data handling for improved robustness.
 */

/**
 * Orchestrates the evaluation of certain numerical conditions from provided text data.
 * This routine processes a multi-line string, extracts specific numeric values,
 * and performs a compound comparison to determine a final outcome.
 * @param {string} sourceData The raw text input, expected to contain multiple lines.
 */
function ProcessInputData(sourceData) {
    // Define key indices for data access using descriptive constants.
    // This improves readability and maintainability compared to magic numbers.
    const FIRST_NUMERIC_ELEMENT_INDEX = 0; // Refers to the first line (0-indexed).
    const FIFTH_NUMERIC_ELEMENT_INDEX = 4; // Refers to the fifth line (0-indexed).
    const COMPARISON_BASIS_INDEX = 5; // Refers to the sixth line (0-indexed), used as a common reference.

    // Step 1: Initial data parsing. Split the entire input string into an array of individual lines.
    // Each element in `dataLines` now represents a distinct line from the input.
    const dataLines = sourceData.split('\n');

    // Step 2: Implement a crucial guard clause for input data integrity.
    // Check if the input contains enough lines to retrieve all necessary elements.
    // If not, it suggests malformed or incomplete input, leading to an early exit.
    if (dataLines.length <= COMPARISON_BASIS_INDEX) {
        console.warn("Alert: Input data is insufficient. Expected at least " + (COMPARISON_BASIS_INDEX + 1) + " lines for full processing.");
        console.log("Input structure invalid.");
        return; // Terminate execution gracefully due to inadequate input.
    }

    // Step 3: Extract the relevant string elements and explicitly convert them to numbers.
    // The original code might have relied on JavaScript's implicit type coercion.
    // Explicit `Number()` conversion, coupled with `.trim()` for whitespace removal,
    // ensures predictable numeric operations and handles non-numeric strings by yielding `NaN`.
    const primaryValue = Number(dataLines[FIRST_NUMERIC_ELEMENT_INDEX].trim());
    const secondaryValue = Number(dataLines[FIFTH_NUMERIC_ELEMENT_INDEX].trim());
    const thresholdValue = Number(dataLines[COMPARISON_BASIS_INDEX].trim());

    // Step 4: Add robust validation for numeric conversion.
    // If any of the essential data points fail to convert into a valid number (resulting in `NaN`),
    // it indicates a critical input format error. Log an error and exit.
    if (isNaN(primaryValue) || isNaN(secondaryValue) || isNaN(thresholdValue)) {
        console.error("Critical Error: One or more key data points could not be parsed as valid numbers.");
        console.log("Numeric data malformed.");
        return; // Abort processing if numeric data is corrupt.
    }

    // Step 5: Evaluate the individual comparison conditions.
    // Breaking down the compound logical expression into separate boolean variables
    // enhances code clarity and makes the decision-making process more transparent.
    const isPrimaryValueBelowThreshold = primaryValue < thresholdValue;
    const isSecondaryValueBelowThreshold = secondaryValue < thresholdValue;

    // Step 6: Determine the final outcome message based on the combined evaluation.
    // A helper variable `outcomeMessage` stores the result string, which is then logged.
    let outcomeMessage;

    if (isPrimaryValueBelowThreshold && isSecondaryValueBelowThreshold) {
        outcomeMessage = 'All conditions met successfully!'; // A positive, rephrased success message.
    } else {
        outcomeMessage = 'One or more conditions were not satisfied.'; // A detailed, rephrased failure message.
    }

    // Step 7: Output the final determined message to the console.
    console.log(outcomeMessage);

    // This marks the conclusion of the input data processing and conditional evaluation.
}

// The following line invokes the main processing function.
// It reads the entire content of standard input (typically from a file or pipe)
// as a UTF-8 encoded string and passes it to our `ProcessInputData` function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));