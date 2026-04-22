// Module for file system operations, aliased for clarity.
const fileSystemModule = require('fs');

// --- Input Acquisition Phase ---

// Variable to store the total byte count of the standard input stream.
let totalBytesOfInput = 0;

try {
    // Synchronously retrieve file status information for the standard input descriptor (fd 0).
    // This allows us to determine the total size of the incoming data.
    totalBytesOfInput = fileSystemModule.fstatSync(process.stdin.fd).size;
} catch (errorDuringStatRead) {
    // In case of an error while attempting to stat the input, log the issue and terminate.
    console.error("Critical error: Could not determine standard input size.", errorDuringStatRead.message);
    process.exit(1); // Exit with a non-zero code to indicate failure.
}

// Allocate a buffer to precisely match the determined input size.
// Using Buffer.alloc() for safer memory allocation compared to `new Buffer()`.
const incomingDataBuffer = Buffer.alloc(totalBytesOfInput);

// Variable to track the actual number of bytes successfully read into the buffer.
let actualBytesReceived = 0;

try {
    // Synchronously read all available data from standard input into the allocated buffer.
    // Parameters: file descriptor, buffer, offset in buffer, number of bytes to read, file position.
    actualBytesReceived = fileSystemModule.readSync(process.stdin.fd, incomingDataBuffer, 0, totalBytesOfInput, 0);
} catch (errorDuringInputRead) {
    // Handle potential errors during the actual reading process.
    console.error("Critical error: Failed to read from standard input.", errorDuringInputRead.message);
    process.exit(1); // Terminate execution upon input reading failure.
}

// Convert the raw byte buffer into a UTF-8 string.
// Only the actually read bytes are converted, ensuring no garbage data is included.
const completeInputString = incomingDataBuffer.toString('utf8', 0, actualBytesReceived);

// Process the acquired string: remove leading/trailing whitespace and split into an array of lines.
// Each element in `parsedInputLines` represents one line from the standard input.
const parsedInputLines = completeInputString.trim().split('\n');

// --- Main Program Execution ---

// Immediately invoke the primary function responsible for processing the input data.
processInputLinesAndSumDecimals();

/**
 * Orchestrates the processing of each input line to calculate the sum of specified decimal digits.
 * This function encapsulates the core logic, iterating through `parsedInputLines` and performing
 * necessary calculations and validations for each entry.
 */
function processInputLinesAndSumDecimals() {
    // Iterate over each line obtained from the standard input.
    for (let currentLineIndex = 0; currentLineIndex < parsedInputLines.length; currentLineIndex++) {
        const lineText = parsedInputLines[currentLineIndex];

        // Skip processing if the line is empty or contains only whitespace.
        if (!lineText.trim()) {
            // console.warn(`Skipping an empty or whitespace-only line at index ${currentLineIndex}.`);
            continue;
        }

        // Divide the current line string into its constituent parts using space as the delimiter.
        const lineSegments = lineText.split(' ');

        // Define the expected minimum number of segments for valid input.
        const expectedSegmentCount = 3;

        // Validate if the line contains the required number of numerical arguments.
        if (lineSegments.length < expectedSegmentCount) {
            console.error(`Input Error: Line ${currentLineIndex + 1} ("${lineText}") has an invalid format. Expected at least ${expectedSegmentCount} parts, but found ${lineSegments.length}.`);
            continue; // Move to the next line as this one is malformed.
        }

        // Convert string segments to numbers for arithmetic operations.
        const numeratorValue = Number(lineSegments[0]);
        const denominatorValue = Number(lineSegments[1]);
        const numberOfDigitsToSum = Number(lineSegments[2]);

        // Perform comprehensive validation on the parsed numeric values.
        if (isNaN(numeratorValue) || isNaN(denominatorValue) || isNaN(numberOfDigitsToSum)) {
            console.error(`Input Error: Line ${currentLineIndex + 1} ("${lineText}") contains non-numeric values. All parts must be valid numbers.`);
            continue;
        }

        // Prevent division by zero, which would result in Infinity or NaN.
        if (denominatorValue === 0) {
            console.error(`Arithmetic Error: Line ${currentLineIndex + 1} ("${lineText}") attempts division by zero. Denominator cannot be zero.`);
            continue;
        }

        // Ensure the count of digits to sum is a non-negative integer.
        if (numberOfDigitsToSum < 0 || !Number.isInteger(numberOfDigitsToSum)) {
            console.error(`Input Error: Line ${currentLineIndex + 1} ("${lineText}") has an invalid digit count. Expected a non-negative integer for the number of digits to sum.`);
            continue;
        }

        // Execute the division operation.
        const computedDivisionResult = numeratorValue / denominatorValue;
        // Convert the numerical result back to a string to easily extract decimal digits.
        const resultAsString = String(computedDivisionResult);

        // Find the position of the decimal point within the string representation.
        const decimalPointPosition = resultAsString.indexOf('.');

        let decimalDigitsArray = []; // Initialize an array to hold individual decimal digits.

        // Check if a decimal point exists in the division result.
        if (decimalPointPosition !== -1) {
            // Extract the substring containing only the fractional part (digits after the decimal).
            const fractionalPartString = resultAsString.substring(decimalPointPosition + 1);
            // Split the fractional part string into an array of individual digit characters.
            decimalDigitsArray = fractionalPartString.split('');
        }
        // If no decimal point, decimalDigitsArray remains empty, correctly leading to a sum of 0.

        let totalSumOfDecimalDigits = 0; // Accumulator for the sum of digits.

        // Determine the actual number of digits to process.
        // It's the minimum of the requested count and the available decimal digits.
        const digitsToIterate = Math.min(numberOfDigitsToSum, decimalDigitsArray.length);

        // Loop through the extracted decimal digits, up to the specified count.
        for (let digitIterationIndex = 0; digitIterationIndex < digitsToIterate; digitIterationIndex++) {
            const currentDigitCharacter = decimalDigitsArray[digitIterationIndex];
            // Convert the character digit back to a number and add it to the running total.
            const numericalDigitValue = Number(currentDigitCharacter);
            totalSumOfDecimalDigits += numericalDigitValue;
        }
        
        // Output the final calculated sum for the current line's operation.
        console.log(totalSumOfDecimalDigits);
    }
}