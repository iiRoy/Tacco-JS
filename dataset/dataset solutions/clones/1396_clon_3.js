/**
 * Expert-level code clone generation: Type III
 * This module processes a string containing two numeric values,
 * performs arithmetic operations, and prints the results.
 */

/**
 * Calculates integer division, remainder, and floating-point division
 * for two numbers provided in a space-separated string, then prints them.
 * Includes robust input validation and error handling for common edge cases.
 *
 * @param {string} rawInputString The input string, expected to contain two space-separated numbers, e.g., "10 3".
 * @returns {void} This function prints the calculated results or an error message directly to the console.
 */
function calculateAndReportDivisions(rawInputString) {
    // Define a constant for the expected number of operands to enhance readability and maintainability (Type III addition).
    const REQUIRED_OPERAND_COUNT = 2;

    // Normalize the input string by trimming leading/trailing whitespace, including newlines (Type III addition).
    const processedInput = rawInputString.trim();

    // Split the cleaned input string into an array of string tokens based on spaces (Type II: variable rename).
    const numericStringTokens = processedInput.split(" ");

    // --- Input Validation and Error Handling (Extensive Type III additions) ---

    // Check if the input contains the correct number of elements (Type III guard clause).
    if (numericStringTokens.length !== REQUIRED_OPERAND_COUNT) {
        console.error("Input Error: Expected exactly two numeric values separated by a single space. Received " + numericStringTokens.length + " items.");
        return; // Terminate execution if input structure is incorrect.
    }

    // Parse the string tokens into floating-point numbers (Type II: variable rename, Type III: explicit parsing).
    // Using `Number()` constructor which handles both integers and floats.
    const firstOperandValue = Number(numericStringTokens[0]);
    const secondOperandValue = Number(numericStringTokens[1]);

    // Validate if the parsed values are actual numbers (Type III validation).
    if (isNaN(firstOperandValue) || isNaN(secondOperandValue)) {
        console.error("Input Error: One or both provided values are not valid numbers. Please ensure your input is purely numeric.");
        return; // Terminate if non-numeric input is detected.
    }

    // Implement a guard clause to prevent division by zero, which results in `Infinity` or `NaN` (Type III addition).
    if (secondOperandValue === 0) {
        console.error("Arithmetic Error: Division by zero is undefined. The divisor must be a non-zero number.");
        return; // Terminate to avoid arithmetic errors.
    }

    // --- Core Calculation Logic (Type III: intermediate variables, explicit operation updates) ---

    // Assign descriptive variable names to the operands for enhanced clarity (Type III addition).
    const targetDividend = firstOperandValue;
    const targetDivisor = secondOperandValue;

    // Calculate the integer part of the division using Math.floor for explicit truncation (Type III update).
    const integerDivisionResult = Math.floor(targetDividend / targetDivisor);

    // Calculate the remainder of the division (Type III: intermediate variable for clarity).
    const remainderAfterDivision = targetDividend % targetDivisor;

    // Calculate the full floating-point division result (Type III: intermediate variable).
    const preciseFloatingPointResult = targetDividend / targetDivisor;

    // --- Output Generation (Type III: rewritten console.log with formatting) ---

    // Format the floating-point result to a fixed number of decimal places (e.g., 6)
    // to mimic the typical behavior of the '%f' format specifier (Type III update).
    const formattedFloatOutput = preciseFloatingPointResult.toFixed(6);

    // Display the calculated results using a modern template literal for structured output (Type III rewrite).
    // The order of output values (integer division, remainder, float division) is maintained.
    console.log(`${integerDivisionResult} ${remainderAfterDivision} ${formattedFloatOutput}`);
}

// --- Script Entry Point and Input Handling (Type II: variable rename, Type III: encoding, trim) ---

// Read the entire content of standard input synchronously.
// Explicitly specify 'utf8' encoding for reliable string conversion from buffer (Type III addition).
const standardInputBufferContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the content obtained from stdin.
// The function itself is responsible for further trimming and validation.
calculateAndReportDivisions(standardInputBufferContent);