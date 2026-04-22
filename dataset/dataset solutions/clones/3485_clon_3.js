/**
 * Processes a sequence of raw text lines to perform a conditional operation.
 * It expects at least three lines of input, where the second and third lines
 * are interpreted as numeric values. The first line is intentionally ignored.
 *
 * The core logic checks if the second numeric value matches a specific trigger.
 * If it does, a predefined greeting is outputted. Otherwise, the sum of the
 * two numeric values is calculated and displayed.
 *
 * @param {string[]} lineSegments - An array of strings, where each string
 *                                  represents a distinct line from the input source.
 */
const executeConditionalOperation = (lineSegments) => {
    // Type III: Implement a guard clause to ensure the input array
    // contains a sufficient number of elements for processing.
    if (!lineSegments || lineSegments.length < 3) {
        console.warn("Operation aborted: Insufficient input segments provided. Expected at least 3 lines for processing.");
        return; // Exit the function gracefully if input is inadequate.
    }

    // Type III: Define a constant for the specific numeric value that
    // triggers an alternative output message. This improves readability.
    const SPECIAL_CONDITION_TRIGGER_VALUE = 1;

    // Type II & III: Rename variables for clarity and explicitly convert
    // string segments to numbers using the Number() constructor.
    // The original code's first input element (X) is unused and therefore
    // completely omitted here as a Type III deletion.
    const primaryNumericInput = Number(lineSegments[1]); // Corresponds to original 'A'
    const secondaryNumericInput = Number(lineSegments[2]); // Corresponds to original 'B'

    // Type III: Add robust validation to check if the parsed inputs
    // are indeed valid numbers. If not, log an error and stop execution.
    if (isNaN(primaryNumericInput) || isNaN(secondaryNumericInput)) {
        console.error("Data processing error: One or both key numeric inputs extracted from the lines are invalid.");
        return;
    }

    // Type III: Introduce a helper function to encapsulate the core conditional logic.
    // This improves modularity and makes the main function cleaner.
    /**
     * Determines the output string based on two numeric values and a trigger.
     * @param {number} valueOne - The primary numeric value to check against the trigger.
     * @param {number} valueTwo - The secondary numeric value, used for summation if no trigger.
     * @param {number} triggerVal - The specific value that triggers the special message.
     * @returns {string} The resulting message or sum.
     */
    const produceConditionalResult = (valueOne, valueTwo, triggerVal) => {
        // Type II: Reformat whitespace and add comments for clarity within the helper.
        if (valueOne === triggerVal) {
            return "Hello World"; // Special greeting for the specific condition.
        } else {
            // Type III: Explicitly convert the sum to a string to ensure
            // consistent return type with the "Hello World" message.
            return String(valueOne + valueTwo);
        }
    };

    // Type III: Use an intermediate variable to store the result from the
    // helper function before logging, making the flow more explicit.
    const finalOutputContent = produceConditionalResult(
        primaryNumericInput,
        secondaryNumericInput,
        SPECIAL_CONDITION_TRIGGER_VALUE
    );

    // Type II: Output the final determined content to the console.
    console.log(finalOutputContent);
};

// Type II & III: Enhance the input reading mechanism with a try-catch block
// for error handling, and use more descriptive variable names.
try {
    const fileSystemModule = require('fs');
    const standardInputFilePath = '/dev/stdin';

    // Type III: Use an intermediate variable to hold the raw content read
    // from the standard input stream, ensuring UTF-8 encoding.
    const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

    // Type III: Chain multiple string manipulation methods to process the
    // raw input: trim leading/trailing whitespace and then split into an
    // array of lines based on newline characters.
    const processedInputLines = rawInputContent
        .trim() // Removes any extraneous whitespace from the beginning/end of the input.
        .split('\n'); // Breaks the single string into an array of strings, one per line.

    // Invoke the primary function to execute the conditional operation
    // with the prepared array of input lines.
    executeConditionalOperation(processedInputLines);
} catch (inputAcquisitionError) {
    // Type III: Provide a more comprehensive error message for issues
    // encountered during file reading or initial input setup.
    console.error("An unrecoverable error occurred during input acquisition or initial setup:", inputAcquisitionError.message);
    // Optionally, for debugging purposes, the stack trace could be logged here.
    // console.error(inputAcquisitionError.stack);
}