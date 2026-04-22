// --- Comprehensive Type III Clone of a JavaScript snippet for sequential numerical processing ---

// SECTION 1: Configuration and Utility Definitions
// Define constants for external module access, input sources, and parsing conventions.
const FILE_SYSTEM_MODULE = require("fs"); // Obtains the Node.js file system module.
const STANDARD_INPUT_PATH = "/dev/stdin"; // Specifies the standard input file path for reading.
const TEXT_ENCODING_STANDARD = "utf8"; // Sets the character encoding for file operations.
const WHITESPACE_DELIMITER_PATTERN = /\s+/; // Regular expression to split input by one or more whitespace characters.

/**
 * Utility function to convert raw string data into an array of numbers.
 * This includes filtering out any empty string segments that might arise from multiple delimiters.
 * @param {string} rawStringContent - The unprocessed string read from the input source.
 * @returns {number[]} An array containing the parsed numerical values.
 */
function extractAndParseNumbers(rawStringContent) {
    // Split the input string by whitespace, filter out any empty entries, and then convert each segment to a number.
    const processedNumbers = rawStringContent
        .split(WHITESPACE_DELIMITER_PATTERN)
        .filter(segment => segment.trim().length > 0) // Ensures only non-empty strings are processed
        .map(numericString => Number(numericString)); // Explicitly casts string to number

    return processedNumbers;
}

/**
 * Core calculation function that applies a specific mathematical formula to a pair of numbers.
 * The formula is: `firstVal * sqrt(4 * secondVal^2 + firstVal^2) + firstVal^2`.
 * This is optimized using `Math.hypot` for `sqrt(X^2 + Y^2)`.
 * @param {number} firstVal - The first numerical component (corresponds to 'a' in the formula).
 * @param {number} secondVal - The second numerical component (corresponds to 'b' in the formula).
 * @returns {number} The computed result of the expression. Returns `NaN` if inputs are invalid.
 */
function performPairedValueCalculation(firstVal, secondVal) {
    // Input validation: Ensure both values are valid numbers before proceeding.
    if (typeof firstVal !== 'number' || typeof secondVal !== 'number' || isNaN(firstVal) || isNaN(secondVal)) {
        console.error("Error: Non-numeric input detected for calculation. Returning NaN.");
        return NaN; // Indicate an invalid calculation result.
    }

    // Intermediate step: Calculate the square of the first value.
    const squaredFirstValue = Math.pow(firstVal, 2); // Represents a^2

    // Intermediate step: Double the second value for the hypotenuse calculation.
    const doubledSecondValue = 2 * secondVal; // Represents 2b

    // Use Math.hypot(x, y) which calculates sqrt(x^2 + y^2).
    // Here, x = doubledSecondValue (2b) and y = firstVal (a).
    const squareRootTerm = Math.hypot(doubledSecondValue, firstVal); // Represents sqrt((2b)^2 + a^2)

    // Final computation: (firstVal * squareRootTerm) + squaredFirstValue
    const finalCalculatedOutput = (firstVal * squareRootTerm) + squaredFirstValue;

    return finalCalculatedOutput;
}


// SECTION 2: Main Program Execution Flow
try {
    // Step 1: Read the entire content from the standard input file.
    // This operation is performed synchronously to ensure all input is available before processing.
    const rawInputBuffer = FILE_SYSTEM_MODULE.readFileSync(STANDARD_INPUT_PATH, TEXT_ENCODING_STANDARD);

    // Step 2: Process the raw string content into a usable array of numbers.
    const numericDataSequence = extractAndParseNumbers(rawInputBuffer);

    // Guard Clause: Check if any valid numerical data was successfully parsed.
    if (!Array.isArray(numericDataSequence) || numericDataSequence.length === 0) {
        console.warn("Processing halted: No valid numerical input was detected. Please provide data.");
        process.exit(0); // Exit cleanly if no input is found.
    }

    // Initialize an index to iterate through the numerical data, stepping by two for pairs.
    let currentPairStartIndex = 0;

    // Loop through the data sequence, processing numbers in pairs.
    // The loop continues indefinitely until an explicit break condition is met.
    while (true) {
        // Retrieve the two numbers forming the current pair.
        const primaryOperand = numericDataSequence[currentPairStartIndex];
        const secondaryOperand = numericDataSequence[currentPairStartIndex + 1];

        // Advanced Loop Termination and Validation Guard:
        // The loop terminates if:
        // 1. Either operand is `undefined` (indicating end of input or an incomplete pair).
        // 2. Either operand is `0` (mimicking the original `a*b != 0` condition for termination).
        // This ensures graceful handling of input boundaries and specified termination criteria.
        if (primaryOperand === undefined || secondaryOperand === undefined ||
            primaryOperand === 0 || secondaryOperand === 0) {
            break; // Exit the processing loop.
        }

        // Perform the complex mathematical operation on the current pair.
        const computedResultForPair = performPairedValueCalculation(primaryOperand, secondaryOperand);

        // Output the result of the calculation to the console.
        // Only log if the result is a valid number, preventing 'NaN' output from invalid calculations.
        if (!isNaN(computedResultForPair)) {
            console.log(computedResultForPair);
        } else {
            console.error(`Skipping output for pair starting at index ${currentPairStartIndex} due to invalid calculation.`);
        }


        // Advance the index to the beginning of the next pair (increment by 2).
        currentPairStartIndex += 2;
    }

} catch (operationalError) {
    // Comprehensive error handling for any issues encountered during file I/O or script execution.
    console.error("\nAn unrecoverable error occurred during the program's execution:");
    console.error(`Error Type: ${operationalError.name}`);
    console.error(`Error Message: ${operationalError.message}`);
    // Provide additional context for debugging if available.
    if (operationalError.stack) {
        console.error("Stack Trace:");
        console.error(operationalError.stack);
    }
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// --- End of Type III Clone ---