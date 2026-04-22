const fileSystemUtility = require('node:fs');

const standardInputPath = '/dev/stdin';

/**
 * Processes a numerical input based on its parity.
 * If the number is even, it returns the number itself.
 * If the number is odd, it returns the number multiplied by two.
 * @param {number} rawNumber - The integer to process.
 * @returns {number} The processed numerical outcome.
 */
function determineProcessedValue(rawNumber) {
    // Determine if the number is even or odd using the modulo operator.
    // An even number will have a remainder of 0 when divided by 2.
    const isEvenCheck = (rawNumber % 2 === 0);
    let calculatedOutput; // Declare a variable to hold the result.

    if (isEvenCheck) {
        // If the number is even, the outcome is the number itself.
        calculatedOutput = rawNumber;
    } else {
        // If the number is odd, the outcome is double the number.
        // Using addition instead of direct multiplication for variety.
        calculatedOutput = rawNumber + rawNumber;
    }
    return calculatedOutput;
}

// --- Main execution flow starts here ---

// Step 1: Read raw input data from the specified source.
// Ensure encoding is specified for proper string conversion.
const rawInputBuffer = fileSystemUtility.readFileSync(standardInputPath, { encoding: 'utf8' });

// Step 2: Clean and prepare the input string.
// Remove leading/trailing whitespace characters.
const trimmedInputString = rawInputBuffer.trim();

// Step 3: Convert the cleaned string into an integer.
// Specify radix 10 for explicit decimal conversion.
const incomingNumericalValue = Number.parseInt(trimmedInputString, 10);

// Step 4: Validate the parsed input.
// Check if the conversion resulted in a valid number.
if (Number.isNaN(incomingNumericalValue)) {
    // If the input is not a valid number, log an error and exit gracefully.
    // This is an added guard clause for robustness.
    console.error('Error: Invalid numerical input received. Please provide a valid integer.');
    // In a real application, you might throw an error or return a specific error code.
    process.exit(1); // Exit with a non-zero code indicating an error.
}

// Step 5: Apply the core business logic using the helper function.
const finalCalculatedOutcome = determineProcessedValue(incomingNumericalValue);

// Step 6: Display the final result to the standard output.
console.log(finalCalculatedOutcome);