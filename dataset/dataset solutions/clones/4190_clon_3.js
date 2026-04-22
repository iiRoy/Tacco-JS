// This program evaluates a specific property of an integer value.
// It checks if the number is divisible by the sum of its own digits.

/**
 * Processes a raw string input to determine if the contained number
 * is a Harshad (or Niven) number.
 * @param {string} rawInputString - The raw string data, expected to contain an integer.
 */
function processNumericalData(rawInputString) {
    // Define a constant for the numerical system base.
    const DECIMAL_RADIX = 10;

    // --- Input Parsing and Validation ---
    // Attempt to convert the input string into an integer.
    const primaryNumber = parseInt(rawInputString, DECIMAL_RADIX);

    // Guard clause: Check if the parsed value is a valid number.
    if (isNaN(primaryNumber)) {
        console.error('Error: Invalid numerical input provided. Please ensure the input is an integer.');
        // For this exercise, we'll just log an error and stop execution for invalid input.
        return;
    }

    // Ensure we are working with a non-negative number for digit sum calculation,
    // as the Harshad number definition typically applies to positive integers.
    const absolutePrimaryNumber = Math.abs(primaryNumber);

    /**
     * Computes the sum of the individual digits of a given integer.
     * This function extracts digits using arithmetic operations rather than string conversion.
     * @param {number} valueToProcess - The integer whose digits are to be summed.
     * @returns {number} The sum of the digits. Returns 0 for input 0.
     */
    function computeSumOfDigits(valueToProcess) {
        // Initialize accumulator for the digit sum.
        let runningDigitSum = 0;
        let temporaryNumber = valueToProcess; // Work with a copy to preserve the original.

        // Handle the special case for zero to avoid an infinite loop or incorrect sum.
        if (temporaryNumber === 0) {
            return 0; // The sum of digits of 0 is 0.
        }

        // Loop through the digits until the number becomes zero.
        // This extracts digits from right to left using modulo and division.
        while (temporaryNumber > 0) {
            // Get the last digit using the modulo operator.
            const lastDigit = temporaryNumber % DECIMAL_RADIX;
            runningDigitSum += lastDigit;

            // Remove the last digit by performing integer division.
            temporaryNumber = Math.floor(temporaryNumber / DECIMAL_RADIX);
        }
        return runningDigitSum;
    }

    // --- Core Logic Execution ---
    // Calculate the sum of digits for the absolute primary number.
    const calculatedDigitSum = computeSumOfDigits(absolutePrimaryNumber);

    // Another guard: If the sum of digits is zero (which only happens for input 0),
    // division by zero would occur. In JavaScript, `0 % 0` results in `NaN`.
    // The original code would also yield `NaN` for `0 % 0`, leading to 'No'.
    // We explicitly handle this case to maintain consistent behavior and avoid `NaN`.
    if (calculatedDigitSum === 0) {
        console.log('No, this number is a special case and not typically considered a Harshad number.');
        return;
    }

    // Perform the divisibility check: is the primary number perfectly divisible by its digit sum?
    const isPerfectlyDivisible = (primaryNumber % calculatedDigitSum === 0);

    // --- Output Generation ---
    let finalResultMessage;

    // Use a conditional structure to formulate the appropriate output message.
    if (isPerfectlyDivisible) {
        finalResultMessage = 'Yes, the number is a Harshad number!'; // More descriptive affirmative message
    } else {
        finalResultMessage = 'No, the number is not a Harshad number.'; // More descriptive negative message
    }

    // Log the determined outcome to the console.
    console.log(finalResultMessage);
}

// --- Program Entry Point ---
// Read the input data from standard input using Node.js's filesystem module.
// This approach is common in competitive programming environments.
const standardInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the main processing function with the obtained input string.
processNumericalData(standardInputData);