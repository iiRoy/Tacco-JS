/**
 * Module responsible for processing numerical comparisons and calculations.
 */

/**
 * Executes the primary logic to process input data, perform comparisons,
 * and calculate a final numerical outcome.
 *
 * @param {string} rawInputString - The raw string input, expected to contain two space-separated numbers.
 */
const performCalculationLogic = (rawInputString) => {

    // Initialize a variable to store the computed result. Using 'let' for block scoping and potential reassignment.
    let computedResult = 0;

    // Step 1: Pre-process the input string.
    // Trim any leading or trailing whitespace, then split the string into individual tokens based on space.
    const inputTokens = rawInputString.trim().split(" ");

    // Step 2: Convert string tokens to robust numerical values.
    // Explicitly using the Number() constructor for reliable type conversion from string to number.
    const firstNumericValue = Number(inputTokens[0]);
    const secondNumericValue = Number(inputTokens[1]);

    // --- Type III: Add a check for non-numeric input after conversion ---
    // If conversion results in NaN (Not-a-Number), it indicates that the input contained non-numeric characters.
    // The original code would implicitly propagate NaN in calculations. We'll add a warning but still proceed
    // to maintain functional similarity even for invalid inputs (i.e., the output might be NaN).
    if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
        console.warn("Warning: One or both input values are not valid numbers. The calculated result might be NaN.");
    }

    // --- Type III: Introduce helper constants for clarity and potential reusability ---
    // These constants represent fixed numerical values used in the calculation formulas.
    const primaryMultiplier = 2; // Represents the factor of two in various calculations.
    const decrementValue = 1;    // Represents the value to subtract in specific cases.

    // Step 3: Apply conditional logic based on the numerical comparison of the two values.
    // The comparison determines which specific formula will be used to compute the final result.
    if (firstNumericValue > secondNumericValue) {
        // Case: The first numerical value is strictly greater than the second.
        // --- Type III: Rewrite calculation slightly for variety and explicit steps ---
        computedResult = (firstNumericValue * primaryMultiplier) - decrementValue;
    } else if (secondNumericValue > firstNumericValue) {
        // Case: The second numerical value is strictly greater than the first.
        // --- Type III: Rewrite calculation slightly for variety and explicit steps ---
        computedResult = (secondNumericValue * primaryMultiplier) - decrementValue;
    } else { // This 'else' block implicitly covers the case where firstNumericValue === secondNumericValue
        // Case: Both numerical values are found to be equal.
        // --- Type III: Rewrite calculation using addition instead of multiplication for structural change ---
        computedResult = firstNumericValue + firstNumericValue; // This is functionally equivalent to firstNumericValue * primaryMultiplier
    }

    // Step 4: Display the final calculated outcome to the standard output.
    console.log(computedResult);
};

// --- Type III: Encapsulate input reading into a separate utility function ---
/**
 * Utility function to retrieve raw input content from the standard input stream.
 * This approach is commonly used in environments like competitive programming.
 *
 * @returns {string} The complete content read from /dev/stdin, decoded as a UTF-8 string.
 */
const getStandardInputContent = () => {
    // The 'fs' module (file system) is required to read from '/dev/stdin'.
    // 'readFileSync' is used for synchronous reading, and 'utf8' specifies the character encoding.
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

// Main execution block:
// First, retrieve the raw input string, then pass it to the primary processing function.
performCalculationLogic(getStandardInputContent());

// End of the module's execution flow.