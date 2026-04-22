/*
 * This module processes a string input containing numerical data to calculate a cumulative product.
 * It's designed to handle large numbers using BigInt and includes specific overflow checks.
 *
 * The input is expected to be a multi-line string:
 * - The first line should contain an integer representing the expected count of numbers.
 * - The second line should contain space-separated integers for the actual numbers.
 *
 * Constraints:
 * - If any number in the input list is zero, the result is 0.
 * - If the cumulative product exceeds a predefined maximum value (10^18), the result is -1.
 * - All numbers are treated as BigInts to prevent standard numeric overflow.
 */
const computeProductResult = (rawInputPayload) => {
    // Define a constant for the maximum allowed product value.
    // This value represents 10^18, a common competitive programming limit.
    const MAX_ALLOWED_PRODUCT_THRESHOLD = 1000000000000000000n; // 10 to the power of 18

    // --- Input Validation and Initial Parsing ---

    // Guard clause: Check if the input payload is valid before proceeding.
    // An empty or non-string input would lead to errors.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        console.log("Error: Invalid or empty input payload provided.");
        return; // Exit early due to invalid input
    }

    // Prepare the input string by trimming whitespace and splitting into individual lines.
    const processedLines = rawInputPayload.trim().split("\n");

    // Ensure we have at least two lines of input as expected.
    if (processedLines.length < 2) {
        console.log("Error: Insufficient input lines. Expected at least two lines.");
        return;
    }

    // Parse the expected count of numbers from the first line.
    // Using Number() first then BigInt for safety or just parseInt if it's small.
    // For competitive programming, parseInt is typical for the count.
    const expectedCount = parseInt(processedLines[0].trim(), 10);

    // Validate if expectedCount is a valid non-negative integer.
    if (isNaN(expectedCount) || expectedCount < 0) {
        console.log("Error: Invalid number count specified in the first line.");
        return;
    }

    // Parse the actual numeric values from the second line.
    // Each string item is converted to a BigInt.
    const bigIntNumbers = processedLines[1].trim().split(" ").map(str => {
        try {
            return BigInt(str);
        } catch (e) {
            console.log(`Error: Invalid number format encountered: ${str}`);
            // If parsing fails for any number, we can output an error and exit,
            // or filter it out, depending on desired robustness.
            // For this problem, let's exit.
            process.exit(1); // Exit with an error code
        }
    });

    // --- Core Logic: Product Calculation and Checks ---

    // Validate that the number of parsed values matches the expected count.
    if (bigIntNumbers.length !== expectedCount) {
        // This is an added validation fragment.
        console.log(`Warning: Mismatch between expected count (${expectedCount}) and actual numbers parsed (${bigIntNumbers.length}). Proceeding with parsed numbers.`);
        // Depending on requirements, this could be an error and exit.
    }

    // First check: If the array of numbers contains a zero, the product will always be zero.
    // This is an optimization to avoid unnecessary multiplication.
    // Rewritten from `includes(0n)` to use `some` for stylistic variation.
    const containsZero = bigIntNumbers.some(num => num === 0n);
    if (containsZero) {
        console.log(0);
        return; // Early exit
    }

    // Initialize the accumulator for the product. Start with 1n (BigInt one).
    let finalProductValue = 1n;
    let intermediateProductHolder; // Added an intermediate variable for clarity in loop

    // Iterate through each number in the parsed array to calculate the cumulative product.
    for (const numberComponent of bigIntNumbers) {
        // Calculate the potential product before assigning it.
        intermediateProductHolder = finalProductValue * numberComponent;

        // Overflow check: If the intermediate product exceeds the maximum allowed threshold,
        // then output -1 and terminate as per problem requirements.
        // This check ensures we don't return an incorrect large number.
        if (intermediateProductHolder > MAX_ALLOWED_PRODUCT_THRESHOLD) {
            console.log(-1);
            return; // Early exit due to overflow
        }

        // Update the cumulative product with the valid intermediate product.
        finalProductValue = intermediateProductHolder;
    }

    // If all calculations are successful and no overflow occurred,
    // output the final product value as a string.
    console.log(finalProductValue.toString());
};

// --- Execution Entry Point ---
// This part handles reading from standard input and invoking the main processing function.
// It uses Node.js 'fs' module to synchronously read the entire input file.
// The '/dev/stdin' path is standard for reading from stdin in many Unix-like environments.
try {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
    computeProductResult(rawData);
} catch (error) {
    // Catch potential errors during file reading or initial processing.
    console.error(`An error occurred during input processing: ${error.message}`);
    process.exit(1); // Exit with an error code
}