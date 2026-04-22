const fileSystem = require('fs'); // Core module for file system operations

// --- Configuration Constants ---
const STANDARD_INPUT_FILE_DESCRIPTOR = 0; // Standard input's numerical identifier (stdin)
const OCTAL_CONVERSION_BASE = 8; // Base for octal number system conversion
const ASCII_ZERO_CODE = 48; // ASCII code for the character '0' (useful for char-to-int conversion)

// --- Helper Functions ---

/**
 * Reads all content from standard input synchronously.
 * It determines the size of the input stream, allocates a buffer,
 * reads the data into it, and then converts the buffer's content
 * into an array of UTF-8 encoded strings, splitting by newlines.
 * Empty lines resulting from trailing newlines are filtered out.
 *
 * @returns {Array<string>} An array where each element is a line read from stdin.
 */
function fetchStandardInputLines() {
    // Retrieve file status information for stdin to determine its size.
    // This approach works well for piped input but might behave differently
    // for interactive terminal input (where size might be 0 initially).
    const inputStatistics = fileSystem.fstatSync(STANDARD_INPUT_FILE_DESCRIPTOR);
    const totalContentLength = inputStatistics.size;

    // Allocate a new buffer of the exact size required for the input.
    const dataHoldingBuffer = Buffer.alloc(totalContentLength);

    // Read the entire content from stdin into the allocated buffer.
    // Parameters: file descriptor, buffer, offset in buffer, number of bytes to read, position in file.
    const actualBytesRead = fileSystem.readSync(STANDARD_INPUT_FILE_DESCRIPTOR, dataHoldingBuffer, 0, totalContentLength, 0);

    // Convert the read bytes to a UTF-8 string, then split by newline characters.
    // Filter out any potential empty strings that could arise from multiple newlines
    // or a trailing newline at the end of the input.
    const rawInputSegments = dataHoldingBuffer.toString('utf8', 0, actualBytesRead).split('\n');
    return rawInputSegments.filter(segment => segment.length > 0);
}

/**
 * Transforms a single octal digit character based on specific rules.
 * This function encapsulates the core digit-shifting logic.
 *
 * @param {string} digitCharacter The character representing an octal digit (e.g., '0' through '7').
 * @returns {number} The transformed numeric value of the digit.
 */
function processOctalDigit(digitCharacter) {
    // Convert the character digit to its corresponding integer value.
    // Using charCodeAt and subtracting ASCII_ZERO_CODE is a robust way for single digits.
    const numericalValue = digitCharacter.charCodeAt(0) - ASCII_ZERO_CODE;

    // Apply the specified transformation rules.
    if (numericalValue === 4) {
        // If the digit is '4', it becomes '5'.
        return numericalValue + 1;
    } else if (numericalValue >= 5) {
        // If the digit is '5' or greater (i.e., '5', '6', '7' in octal),
        // it is incremented by 2. This maps '5'->'7', '6'->'8', '7'->'9'.
        return numericalValue + 2;
    } else {
        // For digits '0', '1', '2', '3', no transformation is applied.
        return numericalValue;
    }
}

/**
 * Processes a single line of numeric input: converts it to decimal, then to octal,
 * applies a digit-by-digit transformation, and returns the modified string.
 *
 * @param {string} inputLine A string representing a number to be processed.
 * @returns {string} The resulting transformed string, or an error message if input is invalid.
 */
function applyNumericTransformation(inputLine) {
    // Attempt to parse the input string into a standard JavaScript number (decimal).
    const decimalRepresentation = Number(inputLine);

    // Implement a basic guard clause for invalid numeric input.
    // The original problem assumes valid numeric input, but this enhances robustness.
    if (isNaN(decimalRepresentation)) {
        return `Error: Non-numeric input detected -> "${inputLine}"`;
    }

    // Convert the decimal number into its octal (base 8) string equivalent.
    const octalString = decimalRepresentation.toString(OCTAL_CONVERSION_BASE);

    // Split the octal string into an array of individual character digits.
    // Map each digit through the `processOctalDigit` helper function to transform it.
    // Finally, join the array of transformed digits back into a single string.
    const finalTransformedDigits = octalString
        .split('')
        .map(processOctalDigit)
        .join('');

    return finalTransformedDigits;
}

// --- Main Execution Flow ---

/**
 * Orchestrates the primary logic of the program:
 * Fetches input lines, iterates through them, applies a specific
 * numeric transformation to each, and prints the results to standard output.
 * The process terminates when a line containing '0' is encountered.
 */
function initiateProcessingCycle() {
    // Retrieve all lines from standard input. This array will be mutated by `shift()`.
    let dataBufferQueue = fetchStandardInputLines();

    // Check for an empty input scenario as a robust initial validation.
    if (dataBufferQueue.length === 0) {
        console.error("No input data received. Please provide input via stdin.");
        return; // Exit if no input is available.
    }

    // Loop continuously as long as there are lines in the queue and the next line is not '0'.
    // The loop condition `dataBufferQueue.length > 0` prevents errors on an empty queue.
    // The `dataBufferQueue[0] !== '0'` condition matches the original program's termination logic.
    while (dataBufferQueue.length > 0 && dataBufferQueue[0] !== '0') {
        // Extract the next line from the front of the queue.
        const currentDataSegment = dataBufferQueue.shift();

        // Apply the defined transformation to the current line.
        const transformedOutput = applyNumericTransformation(currentDataSegment);

        // Print the result of the transformation to the console (standard output).
        console.log(transformedOutput);
    }

    // Informative message upon completion of the processing cycle.
    // console.log("Processing complete. Termination signal '0' was encountered or input exhausted.");
}

// Invoke the main processing function to start the program.
initiateProcessingCycle();