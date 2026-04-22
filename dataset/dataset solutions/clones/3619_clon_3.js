// This function is designed to process an input string,
// extract two space-separated integers from its first line,
// compute the remainder of their division, and display the outcome.
function calculateModulo(inputStringData) {
    // --- Phase 1: Input Acquisition and Initial Validation ---

    // A preliminary check to ensure the provided input is indeed a string.
    // If not, it's an invalid input type, and we log an error then exit.
    if (typeof inputStringData !== 'string') {
        console.error("Execution Aborted: Expected input data to be a string.");
        return;
    }

    // Divide the entire input content into an array of individual lines.
    // We are primarily concerned with processing the very first line.
    const inputContentLines = inputStringData.split('\n');

    // Verify that there is at least one significant line of input.
    // An empty array or a first line that's just whitespace is considered invalid.
    if (inputContentLines.length === 0 || inputContentLines[0].trim() === '') {
        console.error("Execution Aborted: No meaningful input line detected for processing.");
        return;
    }

    // Retrieve the first line, remove leading/trailing whitespace,
    // then split it by spaces to isolate potential numeric fragments.
    // The `filter(Boolean)` step is crucial to discard any empty strings
    // that might arise from multiple consecutive spaces (e.g., "5  2").
    const numericTokenCandidates = inputContentLines[0].trim().split(' ').filter(Boolean);

    // --- Phase 2: Numeric Parsing and Robustness Checks ---

    // Confirm that we successfully extracted exactly two tokens, as expected for the operation.
    if (numericTokenCandidates.length < 2) {
        console.error("Execution Aborted: Insufficient numeric tokens found. Expected two numbers.");
        return;
    }

    // Attempt to convert the first token into an integer, explicitly using base 10.
    const firstParsedValue = parseInt(numericTokenCandidates[0], 10);
    // Attempt to convert the second token into an integer, also using base 10.
    const secondParsedValue = parseInt(numericTokenCandidates[1], 10);

    // Validate the results of the parsing operations.
    // If either conversion failed (resulting in NaN - Not a Number),
    // it indicates malformed input, and we report an error.
    if (isNaN(firstParsedValue) || isNaN(secondParsedValue)) {
        console.error("Execution Aborted: Failed to convert input tokens into valid integers.");
        return;
    }

    // Assign the validated and parsed numbers to more descriptive variables
    // to improve readability for the subsequent calculation.
    const dividendValue = firstParsedValue;
    const divisorValue = secondParsedValue;

    // --- Phase 3: Core Logic Execution and Result Presentation ---

    // Implement a critical guard clause: division by zero is undefined
    // and will cause an error in modulo operations. We prevent this.
    if (divisorValue === 0) {
        console.error("Execution Aborted: Modulo operation cannot proceed with a divisor of zero.");
        return;
    }

    // Execute the primary computational step: the modulo operation.
    const finalRemainderResult = dividendValue % divisorValue;

    // Present the computed result to the user in a clear, verbose statement.
    console.log(`Calculation Result: The remainder when ${dividendValue} is divided by ${divisorValue} is ${finalRemainderResult}.`);
}

// --- Global Execution Context: Input Reading and Function Invocation ---

// Acquire a reference to Node.js's built-in File System module.
const fsModule = require('fs');

// Define the conventional path for reading standard input in POSIX environments.
const standardInputFilePath = '/dev/stdin';

// Encapsulate the file reading operation within a try-catch block
// to gracefully handle potential I/O errors (e.g., file not found, permissions).
try {
    // Synchronously read the entire content of the standard input file.
    // Specify 'utf8' encoding to ensure the content is interpreted as a string.
    const rawInputBuffer = fsModule.readFileSync(standardInputFilePath, 'utf8');

    // Invoke our primary processing function with the raw input data.
    calculateModulo(rawInputBuffer);
} catch (ioError) {
    // If an error occurs during file reading, log a comprehensive error message.
    console.error(`Fatal Input Error: Could not read from standard input. Details: ${ioError.message}`);
}