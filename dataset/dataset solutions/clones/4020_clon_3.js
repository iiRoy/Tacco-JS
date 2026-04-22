/**
 * Computes the sum of the digits of a given non-negative integer.
 * This version explicitly converts the number to a string and iterates
 * through its characters to sum their numerical values.
 *
 * @param {number} inputNumber The number whose digits are to be summed.
 * @returns {number} The sum of the digits. Returns 0 for invalid or negative inputs.
 */
const calculateSumOfDigits = (inputNumber) => {
    // Explicitly convert the input to a number to handle various input types reliably.
    const numericalValue = Number(inputNumber);

    // Guard clause for non-numeric or negative inputs.
    // The problem context implies positive integers, so we handle others gracefully.
    if (isNaN(numericalValue) || numericalValue < 0) {
        console.warn(`Warning: Invalid input '${inputNumber}' provided to calculateSumOfDigits. Returning 0.`);
        return 0; // A sum of 0 is a reasonable default for invalid numbers.
    }

    // Convert the validated number to its string representation.
    // This allows easy access to individual digits as characters.
    const numberAsStringRepresentation = String(numericalValue);
    let runningDigitSum = 0; // Initialize an accumulator for the total sum of digits.

    // Iterate over each character in the string representation of the number.
    for (const charDigit of numberAsStringRepresentation) {
        // Convert the character digit back to an integer.
        // Using parseInt with radix 10 for explicit and safe conversion.
        const digitAsInteger = parseInt(charDigit, 10);

        // Ensure the character was indeed a digit before adding it.
        // This adds robustness against potential non-digit characters in the string.
        if (!isNaN(digitAsInteger)) {
            runningDigitSum += digitAsInteger;
        }
    }

    return runningDigitSum; // Return the final calculated sum.
};

/**
 * Main processing function that reads a numerical limit,
 * then iterates from that limit (minus one) down to zero,
 * calculating the sum of digits for each number and finding the maximum sum encountered.
 * The final maximum sum is then outputted to the console.
 *
 * @param {string} rawInputContent The raw string content read from an input source,
 *                                 expected to be a string representation of an integer.
 */
function processInputAndDetermineMaxDigitSum(rawInputContent) {
    // Ensure the input is treated as a string, trim any leading/trailing whitespace,
    // and parse it into an integer. Providing a default '0' if rawInputContent is falsy.
    const cleanedAndTrimmedInput = String(rawInputContent || '0').trim();
    const parsedNumericalUpperLimit = parseInt(cleanedAndTrimmedInput, 10);

    // Guard clause to validate the parsed input.
    // If it's not a number or is negative, an error is logged and the function exits.
    if (isNaN(parsedNumericalUpperLimit) || parsedNumericalUpperLimit < 0) {
        console.error(`Error: Invalid or non-positive numerical limit provided: '${rawInputContent}'. Cannot proceed.`);
        return; // Exit the function gracefully.
    }

    // Initialize a variable to keep track of the highest sum of digits found so far.
    let currentMaximumDigitSum = 0;

    // The original loop `for(i=input;i--;)` effectively iterates from `input-1` down to `0`.
    // We explicitly set the starting value and use a standard for loop for clarity and safety.
    const iterationStartingPoint = parsedNumericalUpperLimit - 1;

    // Iterate downwards from the calculated starting point to zero, inclusive.
    for (let currentNumberInSequence = iterationStartingPoint; currentNumberInSequence >= 0; currentNumberInSequence--) {
        // Calculate the sum of digits for the current number using our helper function.
        const sumOfDigitsForCurrent = calculateSumOfDigits(currentNumberInSequence);

        // Update the overall maximum sum if the current number's digit sum is greater.
        // Using Math.max provides a concise way to achieve this.
        currentMaximumDigitSum = Math.max(currentMaximumDigitSum, sumOfDigitsForCurrent);
    }

    // Output the final determined maximum sum of digits to the standard output.
    console.log(currentMaximumDigitSum);
}

// --- Program Entry Point and Input Handling ---

// Import the 'fs' (file system) module, which is standard in Node.js environments.
const nodeFileSystemModule = require("fs");

// Define the path for reading standard input in a typical Unix-like environment.
const standardInputFilePath = "/dev/stdin";

try {
    // Attempt to read the entire content of the standard input file synchronously.
    // 'utf8' encoding ensures the content is read as a string.
    const fileContentBuffer = nodeFileSystemModule.readFileSync(standardInputFilePath, "utf8");

    // Once the content is successfully read, pass it to our main processing function.
    processInputAndDetermineMaxDigitSum(fileContentBuffer);
} catch (inputReadingError) {
    // Catch and handle any errors that might occur during the file reading process.
    // This could include file not found, permission errors, etc.
    console.error(`An error occurred while attempting to read input from '${standardInputFilePath}':`, inputReadingError.message);
    // In case of a critical error, it's good practice to exit the process with a non-zero status code.
    process.exit(1);
}