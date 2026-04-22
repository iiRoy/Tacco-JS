const fileSystemModule = require('fs');

// Define the standard input path, typically /dev/stdin on Unix-like systems.
// This constant makes the input source explicit and easily modifiable.
const standardInputPath = '/dev/stdin';

/**
 * Computes the cubic value of a given number.
 * This helper function encapsulates the core mathematical operation.
 * @param {number} baseValue The numerical input to be cubed.
 * @returns {number} The result of cubing the input number.
 */
function deriveCubicValue(baseValue) {
    // We use Math.pow for clarity and to explicitly state the exponent.
    const powerExponent = 3;
    return Math.pow(baseValue, powerExponent);
}

/**
 * Processes a raw string input to extract a number from its first line,
 * computes its cube, and outputs the result. It includes multiple validation steps.
 * @param {string} incomingTextData The complete raw text content from the input source.
 */
function handleInputAndCalculateCube(incomingTextData) {
    // --- Input Validation Phase 1: Basic data type and content check ---
    if (typeof incomingTextData !== 'string' || incomingTextData.trim().length === 0) {
        console.error('ERROR: Received input data is not a valid non-empty string.');
        // Terminate execution or provide a default error message.
        return;
    }

    // Split the input string into an array of lines.
    const contentLinesArray = incomingTextData.split('\n');

    // --- Input Validation Phase 2: Check for presence of at least one line ---
    if (contentLinesArray.length === 0 || contentLinesArray[0].trim().length === 0) {
        console.error('ERROR: No meaningful numeric line found in the provided input.');
        return;
    }

    // Extract the first line and trim any leading/trailing whitespace.
    const candidateNumberString = contentLinesArray[0].trim();

    // --- Input Validation Phase 3: Attempt explicit conversion and validate result ---
    // Using Number() for explicit type conversion.
    const processedNumericBase = Number(candidateNumberString);

    if (!Number.isFinite(processedNumericBase)) {
        console.error(`ERROR: '${candidateNumberString}' is not a valid finite number for calculation.`);
        return;
    }

    // --- Core Calculation Phase ---
    // Utilize the helper function to compute the cubic value.
    const finalCubicOutcome = deriveCubicValue(processedNumericBase);

    // --- Output Phase ---
    // Ensure the output is explicitly a string before logging.
    console.log(String(finalCubicOutcome));
}

// --- Main Execution Block ---
// This block handles reading from standard input and invoking the primary processing function.
let retrievedInputContent = '';
try {
    // Attempt to synchronously read the entire content of the standard input file.
    retrievedInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
} catch (readingError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error and terminate the process with an error code.
    console.error(`Failed to retrieve data from ${standardInputPath}: ${readingError.message}`);
    process.exit(1); // Indicate an unsuccessful execution.
}

// Once input is successfully retrieved, pass it to the main processing function.
handleInputAndCalculateCube(retrievedInputContent);