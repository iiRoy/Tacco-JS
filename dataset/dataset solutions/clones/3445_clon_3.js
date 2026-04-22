const fileSystemModule = require('node:fs'); // Explicitly import the Node.js file system module

let incomingTextualData = ''; // Variable to hold the raw content read from the input stream

try {
    // Attempt to read the entire content from the standard input file descriptor
    // The '/dev/stdin' path is a common Unix-like convention for standard input
    incomingTextualData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (readOperationError) {
    // In case of any error during file reading (e.g., permissions, file not found although /dev/stdin should always exist)
    process.stderr.write(`An error occurred while attempting to read input data: ${readOperationError.message}\n`);
    process.exit(1); // Terminate the process with a non-zero exit code to indicate an error
}

// Pre-check: Ensure there's actual data to process after trimming whitespace
if (incomingTextualData.trim().length === 0) {
    process.stdout.write("No discernible input was provided. Exiting gracefully without calculation.\n");
    process.exit(0); // Exit successfully if no meaningful input
}

// Split the input string into an array of potential numeric components.
// Using a regex `/\s+/` handles multiple spaces between numbers and leading/trailing spaces.
// `filter(segment => segment.length > 0)` removes any empty strings that might result from splitting.
const numericComponentStrings = incomingTextualData.split(/\s+/).filter(segment => segment.length > 0);

// Validate that we have at least two components for our calculation
if (numericComponentStrings.length < 2) {
    process.stderr.write("Insufficient numeric values found in the input. Expected at least two.\n");
    process.exit(1); // Indicate an error due to malformed input
}

// Define a constant for the division factor, making the intent clearer
const RECIPROCAL_OF_TWO = 0.5; // Represents 1/2 or division by 2

/**
 * Performs a specific arithmetic operation on two string representations of numbers.
 * The operation is: (first number) + (second number / 2).
 * @param {string} primaryOperandText - The string representation of the first number.
 * @param {string} secondaryOperandText - The string representation of the second number.
 * @returns {number} The computed numerical result.
 * @throws {Error} If either input string cannot be parsed into a valid number.
 */
function executeArithmeticCombination(primaryOperandText, secondaryOperandText) {
    // Convert the string components to floating-point numbers.
    // parseFloat is generally preferred over Number() for potentially non-integer inputs.
    const firstNumericalValue = parseFloat(primaryOperandText);
    const secondNumericalValue = parseFloat(secondaryOperandText);

    // Validate that both parsing operations were successful
    if (isNaN(firstNumericalValue) || isNaN(secondNumericalValue)) {
        // Log an error to standard error and terminate if parsing fails
        process.stderr.write(`Error: One or more input values could not be parsed as numbers. Received: '${primaryOperandText}', '${secondaryOperandText}'\n`);
        process.exit(1);
    }

    // Perform the calculation in distinct steps for clarity
    const valueForDirectAddition = firstNumericalValue;
    const valueToDivide = secondNumericalValue;

    // Calculate half of the second value using the defined constant
    const halvedValue = valueToDivide * RECIPROCAL_OF_TWO;

    // Sum the two processed values
    const finalComputedResult = valueForDirectAddition + halvedValue;

    return finalComputedResult;
}

// Invoke the calculation function with the first two extracted components
const overallCalculationOutcome = executeArithmeticCombination(
    numericComponentStrings[0],
    numericComponentStrings[1]
);

// Output the final result to the standard output stream, followed by a newline.
// Using a template literal for clear string formatting.
process.stdout.write(`The computed arithmetic sum is: ${overallCalculationOutcome}\n`);

// Program has completed its execution successfully.
// An explicit `process.exit(0)` is not strictly necessary here as the program would naturally exit,
// but it can be added for clarity in more complex scripts.
// process.exit(0);