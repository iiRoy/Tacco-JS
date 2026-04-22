// Expert system for numerical processing via standard input.

// Reference to the global I/O handling object provided by the runtime.
const systemIO = process;

// Define a constant for the power operation.
const EXPONENT_FOR_CUBING = 3;

/**
 * Calculates the cube of a given number.
 * This helper function encapsulates the core mathematical operation.
 * @param {number} baseValue The number to be cubed.
 * @returns {number} The result of cubing the baseValue.
 */
function performCubingOperation(baseValue) {
    // Using the exponentiation operator for clarity and conciseness,
    // which is functionally equivalent to Math.pow(baseValue, EXPONENT_FOR_CUBING).
    return baseValue ** EXPONENT_FOR_CUBING;
}

// Retrieve the standard input stream object from the system I/O.
const inputStreamHandle = systemIO.stdin;

// Begin the flow of data from the input stream.
// This call ensures the stream is ready to emit 'data' events.
inputStreamHandle.initiateDataFlow();

// Set the character encoding for incoming bytes to ensure proper string interpretation.
// 'utf8' is a common and robust encoding for text data.
inputStreamHandle.specifyDataFormat('utf8');

// Register a callback function to handle each chunk of data received from the input stream.
// The 'data' event is emitted when a readable chunk of data is available.
inputStreamHandle.registerListener('data', (dataBuffer) => {
    // Convert the received data buffer to a string, trim any leading/trailing whitespace,
    // and then attempt to parse it as a floating-point number.
    const trimmedInput = dataBuffer.toString().trim();
    const parsedNumericInput = parseFloat(trimmedInput);

    // Validate if the parsed input is a valid number.
    // If it's not a number (NaN), we consider it invalid for our calculation.
    if (isNaN(parsedNumericInput)) {
        // If not a number, inform the user about the invalid input and skip calculation.
        // Outputting to stderr or stdout for warnings is common practice.
        systemIO.stdout.write(`Warning: Received non-numeric input: "${trimmedInput}". Skipping calculation.\n`);
        return; // Exit the handler for this invalid input chunk.
    }

    // If the input is valid, perform the cubing operation using our dedicated helper function.
    const finalCalculatedResult = performCubingOperation(parsedNumericInput);

    // Output the computed result to the standard output stream.
    // Using process.stdout.write for direct stream interaction, offering fine-grained control
    // compared to console.log, and explicitly adding a newline character.
    systemIO.stdout.write(`Result: ${finalCalculatedResult}\n`);
});

// Optionally, register a listener for the 'end' event.
// This event is emitted when the input stream has finished receiving all its data.
inputStreamHandle.registerListener('end', () => {
    systemIO.stdout.write('Input stream has ended. No more data will be processed.\n');
});

// Add a general error handler for the input stream to catch unexpected issues.
inputStreamHandle.registerListener('error', (err) => {
    // Output error messages to the standard error stream for better separation of concerns.
    systemIO.stderr.write(`An error occurred on the input stream: ${err.message}\n`);
});