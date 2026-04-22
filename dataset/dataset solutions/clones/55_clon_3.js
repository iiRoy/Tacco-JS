const fileSysUtil = require('fs');

/**
 * Acquires all lines from standard input.
 * This function encapsulates the entire process of reading from stdin,
 * handling potential errors, and splitting the content into individual lines.
 * @returns {string[]} An array of strings, each representing a line from stdin.
 *                     Returns an empty array if no input or an error occurs.
 */
function acquireStandardInputLines() {
    const STD_IN_FILE_DESCRIPTOR = process.stdin.fd;
    const TEXT_ENCODING_FORMAT = 'utf8';

    try {
        // Retrieve file statistics for the standard input descriptor
        const fileStatistics = fileSysUtil.fstatSync(STD_IN_FILE_DESCRIPTOR);
        const totalInputSizeInBytes = fileStatistics.size;

        // Early exit if there's no data to read
        if (totalInputSizeInBytes === 0) {
            return [];
        }

        // Create a buffer of the exact size to hold the incoming data
        const inputDataBuffer = Buffer.alloc(totalInputSizeInBytes);

        // Read the raw bytes from standard input into the allocated buffer
        const actualBytesRead = fileSysUtil.readSync(
            STD_IN_FILE_DESCRIPTOR,
            inputDataBuffer,
            0, // Offset in the buffer where writing starts
            totalInputSizeInBytes, // Maximum number of bytes to read
            0 // Position in the file from which to start reading
        );

        // Convert the buffer content to a string, trim leading/trailing whitespace,
        // and then split into an array of lines based on newline characters.
        const rawInputContent = inputDataBuffer.toString(TEXT_ENCODING_FORMAT, 0, actualBytesRead).trim();

        // If after trimming, the content is empty, return an empty array
        if (rawInputContent.length === 0) {
            return [];
        }

        return rawInputContent.split('\n');
    } catch (processingError) {
        // Log any errors encountered during input acquisition
        console.error("Fatal Error during standard input acquisition:", processingError.message);
        // Return an empty array to ensure the program can proceed without crashing,
        // albeit with no input data.
        return [];
    }
}

/**
 * Emits a given value to standard output, followed by a newline character.
 * This helper function centralizes all output operations.
 * @param {*} valueToOutput - The data to be printed to the console.
 */
function emitResult(valueToOutput) {
    process.stdout.write(String(valueToOutput) + '\n');
}

/**
 * Processes a sequence of numeric inputs, simulating a stack (LIFO) behavior.
 * Non-zero numeric values are pushed onto the stack.
 * A zero or non-numeric value triggers a pop operation from the stack,
 * and the popped value is then emitted.
 * @param {string[]} inputLineSequence - An array of strings, where each string
 *                                       is expected to represent a number.
 */
function processInputSequence(inputLineSequence) {
    // Initialize an empty array to serve as our numeric stack.
    // This structure follows a Last-In, First-Out (LIFO) principle.
    const numericOperationsStack = [];

    // Iterate through each line provided in the input sequence.
    for (let currentLineIndex = 0; currentLineIndex < inputLineSequence.length; ++currentLineIndex) {
        const lineText = inputLineSequence[currentLineIndex];

        // Attempt to convert the current line's text into a number.
        // Number("") and Number(" ") both result in 0.
        // Number("abc") results in NaN.
        // Number("123") results in 123.
        // Both 0 and NaN are falsy values in JavaScript.
        const interpretedNumericValue = Number(lineText);

        // If the interpreted numeric value is truthy (i.e., a non-zero number),
        // push it onto our stack.
        if (interpretedNumericValue) {
            numericOperationsStack.push(interpretedNumericValue);
        } else {
            // If the value is falsy (0 or NaN), we attempt to pop from the stack.
            // First, check if the stack actually contains any elements to prevent errors.
            if (numericOperationsStack.length > 0) {
                // Pop the topmost element from the stack.
                const retrievedValue = numericOperationsStack.pop();
                // Emit the retrieved value to standard output.
                emitResult(retrievedValue);
            } else {
                // If the stack is empty and a pop operation is requested,
                // the original behavior was to log 'undefined'. We maintain this
                // by emitting 'undefined'.
                emitResult(undefined);
                // An alternative, more explicit error handling could be:
                // console.warn("Warning: Attempted to pop from an empty stack. No value to retrieve.");
            }
        }
    }
}

// --- Application Entry Point ---

// First, acquire all lines from standard input.
const allInputLines = acquireStandardInputLines();

// Then, initiate the core processing logic with the collected input.
processInputSequence(allInputLines);