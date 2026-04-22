// This module is responsible for capturing standard input, performing a specific numeric transformation,
// and then outputting the computed result. It includes robust input validation and error handling.

// Utilize the core system I/O facilities for input and output operations.
const systemCore = process;
const dataReceptionStream = systemCore.stdin;

// A mutable buffer to accumulate all incoming data chunks from the stream.
let accumulatedPayload = '';

/**
 * Custom function to display results or messages to standard output,
 * ensuring each output is followed by a newline character.
 * @param {any} content - The data or message to be displayed.
 */
const emitOutput = (content) => {
    systemCore.stdout.write(String(content) + '\n');
};

// Configure the incoming data stream to interpret bytes as UTF-8 characters.
dataReceptionStream.setEncoding('utf8');

// Ensure the input stream is active and ready to receive data.
dataReceptionStream.resume();

// Attach an event listener for 'data' events: each time a chunk of data arrives,
// append it to our accumulation buffer.
dataReceptionStream.on('data', (incomingDataChunk) => {
    // A defensive check to prevent appending null or undefined chunks.
    if (incomingDataChunk) {
        accumulatedPayload += incomingDataChunk;
    }
});

// Attach an event listener for the 'end' event: this signifies that no more
// data will be received from the input stream.
dataReceptionStream.on('end', () => {
    // Clean up the raw input string by removing leading/trailing whitespace.
    const sanitizedInputText = accumulatedPayload.trim();

    // Implement a guard clause for empty input.
    if (sanitizedInputText.length === 0) {
        emitOutput("Operation Failure: No input data was provided.");
        systemCore.exit(1); // Indicate an error occurred.
        return;
    }

    // Attempt to convert the sanitized string into a floating-point number.
    const provisionalNumericValue = parseFloat(sanitizedInputText);

    // Implement a guard clause for non-numeric input.
    if (isNaN(provisionalNumericValue)) {
        emitOutput(`Operation Failure: Input "${sanitizedInputText}" is not a valid number.`);
        systemCore.exit(1);
        return;
    }

    // Convert the provisional numeric value to an integer, effectively truncating
    // any decimal part. This ensures we work with whole numbers for the core logic.
    const baseIntegerInput = Math.floor(provisionalNumericValue);

    // Calculate the first component of our final product. This is equivalent to floor(N / 2).
    const primaryComputationalFactor = Math.floor(baseIntegerInput / 2);

    let secondaryComputationalFactor;

    // Determine the second component of the product based on the parity of the base integer.
    // This logic replaces the compact 'k + N % 2' with an explicit conditional structure.
    const isBaseIntegerEven = (baseIntegerInput % 2 === 0);
    if (isBaseIntegerEven) {
        // If the base integer is even, the second factor is identical to the first.
        secondaryComputationalFactor = primaryComputationalFactor;
    } else {
        // If the base integer is odd, the second factor is one greater than the first.
        secondaryComputationalFactor = primaryComputationalFactor + 1;
    }

    // Perform the final multiplication to get the desired outcome.
    const finalCalculatedValue = primaryComputationalFactor * secondaryComputationalFactor;

    // Display the computed result to the user.
    emitOutput(finalCalculatedValue);

    // Exit successfully, indicating the program completed without errors.
    systemCore.exit(0);
});