var fileSystemModule = require('fs');

// Determine the size of the standard input stream
var stdinContentLength = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data
var inputContentBuffer = Buffer.alloc(stdinContentLength);

// Read data from standard input into the buffer
var actualBytesReadCount = fileSystemModule.readSync(process.stdin.fd, inputContentBuffer, 0, stdinContentLength, 0);

// Convert the buffer content to a UTF-8 string and split into lines
var inputLinesArray = inputContentBuffer.toString('utf8', 0, actualBytesReadCount).split('\n');

/**
 * Transforms a single octal digit character according to specific rules.
 * - '4' becomes '5' (value + 1)
 * - Digits '5', '6', '7' become '7', '8', '9' respectively (value + 2)
 * - Other digits remain unchanged.
 * @param {string} digitChar - The character representing an octal digit.
 * @returns {number} The transformed digit value.
 */
function transformOctalDigit(digitChar) {
    const digitValue = parseInt(digitChar, 10); // Convert char to integer
    if (digitValue === 4) {
        return digitValue + 1;
    }
    if (digitValue >= 5) { // This covers 5, 6, 7 in octal
        return digitValue + 2;
    }
    return digitValue; // For 0, 1, 2, 3
}

/**
 * Main function to process input lines.
 * Reads numbers from standard input, converts them to a custom base-8-like system,
 * and prints the result. Stops when '0' is encountered as the first line.
 * Preserves original behavior, including edge cases like empty input leading to infinite NaN output.
 */
function processInputData() {
    // Continue processing lines until '0' is encountered as the first element.
    // Note: If inputLinesArray becomes empty, inputLinesArray[0] will be undefined.
    // undefined !== '0' is true, leading to further processing of undefined,
    // which results in NaN values and an infinite loop, replicating the original behavior.
    while (inputLinesArray[0] !== '0') {
        // Get the next line from the array and convert it to a number
        const currentInputLine = inputLinesArray.shift();
        const numericBase10Value = Number(currentInputLine); // Equivalent to currentInputLine - 0

        // Convert the numeric value to its octal string representation
        const octalRepresentation = numericBase10Value.toString(8);

        // Split the octal string into individual digit characters,
        // apply the custom transformation to each digit,
        // and then join the transformed digits back into a single string.
        const transformedResult = octalRepresentation
            .split('')
            .map(transformOctalDigit)
            .join('');

        // Output the final transformed string to the console
        console.log(transformedResult);
    }
}

// Execute the main processing logic
processInputData();
