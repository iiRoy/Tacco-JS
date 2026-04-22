// Import the necessary file system module to handle input/output operations.
const fileSystemModule = require('fs');

// Define the standard input stream path, common in Unix-like environments for competitive programming.
const stdinSourcePath = '/dev/stdin';

/**
 * A utility function designed to safely parse a string into an integer.
 * It includes validation to ensure the parsed value is a legitimate, finite number.
 * In case of parsing failure or invalid input, it reports an error and terminates execution.
 *
 * @param {string} textSegment - The string segment expected to contain a numeric value.
 * @param {number} lineIndexForError - The 1-based index of the line from which the segment originated, used for error reporting.
 * @returns {number} The successfully parsed integer value.
 */
const obtainValidatedInteger = (textSegment, lineIndexForError) => {
    // Attempt to convert the cleaned (whitespace-trimmed) string into an integer using base 10.
    const extractedNumber = parseInt(textSegment.trim(), 10);

    // Crucial validation step: Check if the parsing operation resulted in a valid number.
    // `isNaN` checks if it's "Not-a-Number", and `!Number.isFinite` checks for Infinity/-Infinity.
    if (isNaN(extractedNumber) || !Number.isFinite(extractedNumber)) {
        // If validation fails, output a detailed error message to the standard error stream.
        console.error(
            `Processing Error: Numeric input expected but invalid data encountered on line ${lineIndexForError}. ` +
            `The problematic string was: '${textSegment.trim()}'. Program will now exit.`
        );
        // Terminate the process with a non-zero exit code to indicate an error.
        process.exit(1);
    }
    // Return the successfully parsed and validated integer.
    return extractedNumber;
};

// --- Primary Logic Execution Start ---

// 1. Read the entire content from the standard input file synchronously.
//    The content is interpreted as UTF-8 encoded text and then broken down
//    into an array of strings, with each element representing a line from the input.
const allInputLines = fileSystemModule.readFileSync(stdinSourcePath, 'utf8').split('\n');

// 2. Implement a preliminary check: Ensure that the input contains a sufficient number of lines.
//    For this specific calculation, we anticipate at least two distinct lines of numeric data.
const minimumExpectedLines = 2;
if (allInputLines.length < minimumExpectedLines) {
    // If fewer lines are received than expected, log an error and exit.
    console.error(
        `Critical Input Deficiency: The program requires at least ${minimumExpectedLines} lines of input, ` +
        `but only ${allInputLines.length} lines were provided. Exiting due to insufficient data.`
    );
    process.exit(1);
}

// 3. Extract and validate the first numeric value from the input.
//    This number will be the base for a power operation.
const firstLineContent = allInputLines[0];
const baseOperand = obtainValidatedInteger(firstLineContent, 1); // Refers to the first line (index 0)

// 4. Extract and validate the second numeric value from the input.
//    This number will be used as a subtrahend in the final calculation.
const secondLineContent = allInputLines[1];
const subtrahendOperand = obtainValidatedInteger(secondLineContent, 2); // Refers to the second line (index 1)

// 5. Perform the central mathematical computation.
//    First, calculate the square of the base operand using the Math.pow function.
//    Then, subtract the subtrahend operand from this squared value to get the final outcome.
const squaredBaseValue = Math.pow(baseOperand, 2); // Explicitly calculate square
const finalComputationalResult = squaredBaseValue - subtrahendOperand;

// 6. Output the final computed result to the console.
//    The output includes a descriptive label to clarify what the displayed number represents.
console.log(`The calculated net value is: ${finalComputationalResult}`);

// --- End of Program ---