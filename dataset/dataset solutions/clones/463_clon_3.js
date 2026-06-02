const fileSystemModule = require('fs');

/**
 * Reads all available content from the standard input (stdin) synchronously.
 * This function mimics the original behavior of determining input size via fstatSync
 * and then reading that exact amount.
 * @returns {string} The entire content read from stdin as a UTF-8 string.
 * @throws {Error} If fstatSync fails, preserving original error behavior.
 */
function readAllStdinContent() {
    const fileDescriptor = process.stdin.fd;

    let inputDataLength;
    try {
        // Determine the size of the input stream. This is crucial for fstatSync.
        // For pipes/sockets, size might be 0 initially, requiring a different approach,
        // but the original code relies on this, so we must preserve it.
        inputDataLength = fileSystemModule.fstatSync(fileDescriptor).size;
    } catch (error) {
        // If fstatSync fails (e.g., non-seekable stream on some OS),
        // the original code would also throw, so we re-throw.
        throw error;
    }

    // If the determined length is 0, there's no data to read.
    if (inputDataLength === 0) {
        return '';
    }

    // Allocate a buffer of the determined size. Using Buffer.alloc for safety.
    const dataBuffer = Buffer.alloc(inputDataLength);
    // Read data from stdin into the buffer.
    const actualBytesRead = fileSystemModule.readSync(fileDescriptor, dataBuffer, 0, inputDataLength, 0);

    // Convert the buffer content to a UTF-8 string, considering only the bytes actually read.
    return dataBuffer.toString('utf8', 0, actualBytesRead);
}

// Read the raw input content and split it into individual lines.
const rawInputContent = readAllStdinContent();
const inputLines = rawInputContent.split('\n');

// Define the explicit mapping for octal digits.
// This array corresponds to the original `k` array: [0, 1, 2, 3, 5, 7, 8, 9]
// The index represents the octal digit (0-7), and the value is its mapped output.
const octalDigitMapping = [0, 1, 2, 3, 5, 7, 8, 9];

/**
 * Retrieves the mapped value for a single octal digit character.
 * @param {string} digitChar - A single character representing an octal digit (e.g., '0', '7').
 * @param {number[]} mappingArray - The array containing the mapping values.
 * @returns {number|undefined} The mapped numeric value, or undefined if the index is out of bounds.
 */
function retrieveMappedValue(digitChar, mappingArray) {
    const numericDigit = parseInt(digitChar, 10);
    // For valid octal digits (0-7), this will always be within the bounds
    // of the `octalDigitMapping` array, which has 8 elements (indices 0-7).
    return mappingArray[numericDigit];
}

// Iterate over each line of the processed input.
inputLines.forEach(function (currentLine) {
    // Convert the current line string to a number.
    // `Number()` is more explicit than `l - 0`.
    const parsedNumericValue = Number(currentLine);

    // Apply the original guard condition: only process if the numeric value is not zero
    // and is a valid number (not NaN).
    // `Number("")` is 0, `Number("abc")` is NaN. The original `l - 0 &&` would
    // correctly prevent processing for these cases, which this `if` statement preserves.
    if (parsedNumericValue !== 0 && !isNaN(parsedNumericValue)) {
        // Convert the numeric value to its octal string representation.
        const octalRepresentation = parsedNumericValue.toString(8);
        // Split the octal string into an array of individual digit characters.
        const individualOctalDigits = octalRepresentation.split('');

        // Map each individual octal digit character to its corresponding value
        // using the `retrieveMappedValue` helper function and the `octalDigitMapping`.
        const finalMappedSequence = individualOctalDigits.map(function (digitChar) {
            return retrieveMappedValue(digitChar, octalDigitMapping);
        });

        // Join the mapped values back into a single string and print to console.
        console.log(finalMappedSequence.join(''));
    }
});
