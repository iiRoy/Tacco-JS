// Enable strict mode for better error handling and cleaner code practices.
'use strict';

/**
 * Utility function to securely fetch all content from the standard input stream.
 * This acts as a dedicated input acquisition module for the application.
 * @returns {string} The complete string content read from the standard input.
 */
function acquireStandardInputContentBlock() {
    // Leveraging the built-in Node.js 'fs' (file system) module for synchronous file reading.
    // '/dev/stdin' is the conventional path for standard input on Unix-like systems.
    // 'utf8' encoding is specified to ensure proper interpretation of text data.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
}

/**
 * Parses a raw multi-line string to extract the very first integer token.
 * This function is designed to locate the first space-separated numerical value
 * present on the initial line of the provided string.
 * @param {string} entireSourceString - The comprehensive string data to be parsed.
 * @returns {number | null} The successfully parsed integer, or `null` if the parsing operation fails at any step.
 */
const isolatePrimaryNumericToken = (entireSourceString) => {
    // Implement robust input validation: check for string type and non-empty content.
    if (typeof entireSourceString !== 'string' || entireSourceString.trim() === '') {
        console.error("Invalid or empty source string provided for numeric token isolation.");
        return null; // Indicate a failure due to inadequate input.
    }

    // Divide the entire input string into an array of individual lines.
    const initialLineArray = entireSourceString.split('\n');

    // Verify that at least one meaningful line exists for processing.
    if (initialLineArray.length === 0 || initialLineArray[0].trim() === '') {
        console.error("The first line of input is missing or empty, cannot isolate numeric token.");
        return null;
    }

    // Extract the first line and then segment it by spaces to get potential tokens.
    // We are interested only in the very first segment.
    const candidateTokenString = initialLineArray[0].split(' ')[0];

    // Convert the extracted string candidate into a numeric value.
    // Using the global `Number()` function provides a straightforward conversion.
    const processedNumericValue = Number(candidateTokenString);

    // Final validation: ensure the conversion yielded a valid, finite number.
    if (Number.isNaN(processedNumericValue) || !Number.isFinite(processedNumericValue)) {
        console.error(`Failed to convert '${candidateTokenString}' into a valid finite number.`);
        return null;
    }

    // Return the successfully identified and converted integer.
    return processedNumericValue;
};


/**
 * Executes the primary business logic: taking an input number, dividing it by three,
 * and then truncating the result to its integer component. This function orchestrates
 * the data flow from input acquisition to final output.
 * @param {string} fullInputPayload - The complete string data obtained from the input source.
 */
const performDivisionalCalculation = (fullInputPayload) => {
    // A preliminary check to handle scenarios where the input payload is empty or purely whitespace.
    if (!fullInputPayload || fullInputPayload.trim().length === 0) {
        console.warn("Input payload was detected as empty or containing only whitespace. No calculation will be performed.");
        return; // Gracefully exit without further processing.
    }

    // Utilize our dedicated helper to extract the primary numeric value from the payload.
    const keyOperandValue = isolatePrimaryNumericToken(fullInputPayload);

    // A critical guard check: if `isolatePrimaryNumericToken` failed, we must abort.
    if (keyOperandValue === null) {
        console.error("Execution halted: Unable to obtain a valid numeric operand from the provided input.");
        return;
    }

    // Introduce an intermediate variable to store the floating-point result of the division.
    const initialDivisionOutcome = keyOperandValue / 3;

    // Apply the truncation operation to the division outcome. `Math.trunc()` is used
    // as an alternative to `Math.floor()` that behaves identically for positive numbers.
    const finalIntegerResult = Math.trunc(initialDivisionOutcome);

    // Construct a detailed summary object containing all relevant calculation steps.
    // This allows for easier debugging and potential future feature extensions.
    const computationMetrics = {
        originalInputNumber: keyOperandValue,
        fixedDivisor: 3,
        unroundedResult: initialDivisionOutcome,
        quantizedFinalResult: finalIntegerResult
    };

    // Output the final, quantized integer result to the console.
    // Accessing the result via the structured metrics object.
    console.log(computationMetrics.quantizedFinalResult);
};

// Application's entry point:
// 1. First, acquire all necessary input data from the standard input.
// 2. Then, pass this collected data to the core calculation function for processing.
performDivisionalCalculation(acquireStandardInputContentBlock());