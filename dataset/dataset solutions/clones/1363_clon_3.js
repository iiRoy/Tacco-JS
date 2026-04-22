// This Node.js script is designed to consume stream-based textual input,
// process each incoming line by extracting numerical values,
// and then outputting these numbers in ascending order.
// It is specifically tailored for handling space-separated numeric data.

// Declare a constant for the standard input stream to improve readability.
const standardInputSource = process.stdin;

// Ensure the Node.js event loop remains active and the process does not terminate
// prematurely while waiting for input data. This is standard practice for CLI tools.
standardInputSource.resume();

// Explicitly set the character encoding for the incoming data stream to UTF-8.
// This ensures correct interpretation of various characters.
standardInputSource.setEncoding('utf8');

/**
 * Core processing function for each segment of data received from the input stream.
 * It encapsulates the logic for parsing, validating, sorting, and formatting the output.
 * @param {string | Buffer} receivedDataChunk - The raw data chunk provided by the 'data' event.
 */
function processIncomingNumericLine(receivedDataChunk) {
    // Perform an initial type check to ensure the received data is in an expected format.
    // This adds robustness against unexpected stream behaviors.
    if (typeof receivedDataChunk !== 'string' && !Buffer.isBuffer(receivedDataChunk)) {
        console.error('Runtime Error: Encountered an unexpected data type from stdin. Skipping processing.');
        return; // Exit if data is not a string or Buffer.
    }

    // Convert the data chunk to a string representation and remove any leading/trailing whitespace.
    const rawInputString = String(receivedDataChunk);
    const sanitizedLineContent = rawInputString.trim();

    // If the line is empty after trimming, there's no actual content to process.
    // This acts as an early exit guard clause.
    if (sanitizedLineContent.length === 0) {
        // console.debug('Debug: Received and ignored an empty line from input.');
        return;
    }

    // Define the regular expression for splitting the input string.
    // This allows for one or more whitespace characters as delimiters,
    // making the split operation more forgiving of varied spacing.
    const tokenSeparationPattern = /\s+/;

    // Split the sanitized line into individual string tokens using the defined pattern.
    // The .filter(Boolean) step removes any empty strings that might result from
    // consecutive delimiters (e.g., "1  2" -> ["1", "", "2"] -> ["1", "2"]).
    const stringComponentArray = sanitizedLineContent.split(tokenSeparationPattern).filter(Boolean);

    // If, after splitting and filtering, no components remain, it implies the line
    // contained only whitespace or invalid characters not leading to tokens.
    if (stringComponentArray.length === 0) {
        // console.debug('Debug: No discernible numeric tokens found in the input line.');
        return;
    }

    // Convert each string component into a number.
    // The Number constructor handles both integers and floating-point numbers.
    const intermediateNumericArray = stringComponentArray.map(Number);

    // Filter out any values that resulted in NaN (Not a Number) during conversion.
    // This ensures that only valid numerical values participate in the sorting process.
    const validatedNumericValues = intermediateNumericArray.filter(value => !isNaN(value));

    // If after validation, no valid numbers are left, but original string tokens existed,
    // it means the input was non-numeric. Log a warning and skip.
    if (validatedNumericValues.length === 0 && stringComponentArray.length > 0) {
        console.warn(`Warning: Input line "${sanitizedLineContent}" contained no valid numbers. Skipping sorting.`);
        return;
    }

    // Sort the array of validated numeric values in ascending order.
    // The comparison function (valueA - valueB) is standard for numerical sorting.
    validatedNumericValues.sort((valueA, valueB) => {
        // Return the difference to achieve ascending numerical order.
        return valueA - valueB;
    });

    // Define the character to use when joining the sorted numbers back into a string.
    const outputConcatenationDelimiter = ' ';

    // Join the sorted numbers into a single string, using the specified delimiter.
    const finalFormattedResult = validatedNumericValues.join(outputConcatenationDelimiter);

    // Output the final sorted string to the console, prefixed for clarity.
    console.log(`Sorted Data: ${finalFormattedResult}`);
}

// Attach the primary processing function to the 'data' event of the standard input stream.
// This function will be invoked every time a chunk of data is available to be read.
standardInputSource.on('data', processIncomingNumericLine);

// Register a listener for the 'end' event, which signifies that the input stream
// has closed (e.g., EOF reached, or piping source finished).
standardInputSource.on('end', () => {
    // Optional: Log a message when the input stream concludes.
    // console.log('Information: Standard input stream has concluded.');
    // process.exit(0); // Uncomment to explicitly exit the process cleanly.
});

// Register a listener for potential 'error' events on the input stream.
// This provides basic error handling for stream-related issues.
standardInputSource.on('error', (streamError) => {
    console.error(`Critical Error: An unexpected error occurred on the input stream: ${streamError.message}`);
    // process.exit(1); // Exit with a non-zero code to indicate an error.
});

// Optional: Provide a hint to the user if running interactively.
// This line might not be visible if input is being piped directly.
// console.info("Ready to receive space-separated numeric input. Press Ctrl+D (Unix) or Ctrl+Z then Enter (Windows) to end input.");