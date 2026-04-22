processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Calculates the sum of all individual digits of a given positive integer.
 * This helper function converts the number to a string for easier digit extraction.
 * @param {number} numericValue The number whose digits are to be summed.
 * @returns {number} The total sum of its digits.
 */
function determineDigitSum(numericValue) {
    // Ensure we're working with a positive integer
    if (numericValue < 0 || !Number.isInteger(numericValue)) {
        console.error("Warning: determineDigitSum received non-positive or non-integer value.");
        return 0; // Return 0 for invalid input, or throw an error.
    }

    const valueAsString = String(numericValue); // Convert the number into its string representation.
    let cumulativeDigitSum = 0; // Initialize a variable to hold the running total.

    // Iterate over each character in the string.
    for (let currentPos = 0; currentPos < valueAsString.length; currentPos++) {
        // Parse each character back to an integer and add it to the sum.
        cumulativeDigitSum += parseInt(valueAsString[currentPos], 10);
    }

    return cumulativeDigitSum; // Return the final sum.
}

/**
 * Main function to process the input string, determine if a number is
 * divisible by the sum of its digits, and output 'Yes' or 'No'.
 * @param {string} rawInputText The raw string input, expected to be a number.
 */
function processInputData(rawInputText) {
    // Trim whitespace and convert the input string to an integer.
    const originalNumber = Number(rawInputText.trim());

    // --- Input Validation and Guard Clauses ---
    // Check for invalid number (NaN), negative numbers, or non-integer values.
    if (isNaN(originalNumber) || originalNumber <= 0 || !Number.isInteger(originalNumber)) {
        console.error("Error: Provided input is not a valid positive integer.");
        console.log("No"); // Default to 'No' for invalid input as per typical competitive programming behavior.
        return; // Exit the function early.
    }

    // --- Core Logic Execution ---
    // Calculate the sum of digits using the dedicated helper function.
    const sumOfAllDigits = determineDigitSum(originalNumber);

    // Initialize a variable to store the final output string.
    let finalVerdict = 'No';

    // Check for divisibility. Also, ensure sumOfAllDigits is not zero
    // to prevent division by zero errors, though for positive integers,
    // the sum of digits will always be positive.
    if (sumOfAllDigits > 0 && (originalNumber % sumOfAllDigits === 0)) {
        finalVerdict = 'Yes'; // If divisible, set the verdict to 'Yes'.
    }

    // Output the determined verdict to the console.
    console.log(finalVerdict);
}