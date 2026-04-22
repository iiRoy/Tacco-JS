// Initialize standard input stream to ensure it doesn't pause automatically.
// This allows the program to continuously listen for incoming data.
process.stdin.resume();

// Configure the character encoding for the standard input stream.
// Using 'utf8' ensures proper interpretation of various characters.
process.stdin.setEncoding("utf8");

// A module-level flag to control the active state of input processing.
// This can be used for more complex state management or graceful shutdown.
let isInputProcessingGloballyActive = true;

/**
 * Helper utility function to dispatch processed results to standard output.
 * It ensures the output is converted to a string and appended with a newline character.
 * @param {any} valueToDisplay The value to be written to standard output.
 */
const outputResultWithNewline = (valueToDisplay) => {
    // Only attempt to write if the value is not null or undefined.
    if (valueToDisplay != null) {
        process.stdout.write(String(valueToDisplay) + '\n');
    }
};

// Attach an event listener to the standard input stream for 'data' events.
// This function will be invoked whenever a chunk of data is received.
process.stdin.on("data", function(incomingDataBuffer) {
    // If global processing is not active or the buffer is empty, skip processing.
    if (!isInputProcessingGloballyActive || !incomingDataBuffer) {
        return;
    }

    // Split the incoming data buffer into individual text lines.
    // Handles both Unix-style (\n) and Windows-style (\r\n) newlines.
    const individualInputLines = incomingDataBuffer.split(/\r?\n/);

    // Define a regular expression to extract two sequences of digits separated by whitespace.
    // This pattern captures the first and second number in separate groups.
    const numericPairExtractionPattern = /(\d+)\s+(\d+)/;

    // Initialize a counter for successfully processed lines within this data chunk.
    let successfulLineTransformations = 0;

    // Iterate over each line to process its content.
    individualInputLines.forEach((currentLineText, currentLineIndex) => {
        // Skip any lines that are empty or contain only whitespace.
        if (currentLineText.trim() === '') {
            return;
        }

        // Attempt to execute the regex pattern on the current line.
        const matchAttemptOutcome = numericPairExtractionPattern.exec(currentLineText);

        // Check if a match was found and if both capture groups (for the two numbers) are present.
        if (matchAttemptOutcome && matchAttemptOutcome.length === 3) {
            // Extract and convert the captured string values to numbers.
            const firstOperand = Number(matchAttemptOutcome[1]);
            const secondOperand = Number(matchAttemptOutcome[2]);

            // Validate that both extracted values are indeed valid numbers.
            // (Though regex ensures digits, Number() could return NaN for very large numbers or specific edge cases)
            if (!isNaN(firstOperand) && !isNaN(secondOperand)) {
                // Calculate the sum of the two numbers.
                const computedSumValue = firstOperand + secondOperand;
                // Output the calculated sum using the helper function.
                outputResultWithNewline(computedSumValue);
                successfulLineTransformations++;
            } else {
                // Optional: Log or handle cases where parsing to number failed unexpectedly.
                // console.warn(`Parsing warning: Could not convert captured strings to valid numbers on line ${currentLineIndex}.`);
            }
        } else {
            // Optional: Log or output a message for lines that do not conform to the expected numeric pair format.
            // process.stderr.write(`Info: Skipping non-conforming input line ${currentLineIndex}: "${currentLineText.substring(0, 50)}..."\n`);
        }
    });

    // Optional: Log the number of lines processed from the current chunk for debugging.
    // console.log(`Processed ${successfulLineTransformations} valid numeric pairs from the latest data chunk.`);
});

// Attach an event listener for the 'end' event, signifying the end of the input stream.
process.stdin.on('end', () => {
    // Deactivate global processing flag as no more input is expected.
    isInputProcessingGloballyActive = false;
    // Optional: Output a final message or perform cleanup actions.
    // outputResultWithNewline("Input stream concluded. No further data expected.");
    // process.exit(0); // Exit the process gracefully after input stream ends.
});

// Attach an event listener for the 'error' event to handle any issues with the input stream.
process.stdin.on('error', (processingError) => {
    console.error("Critical Error in Input Stream:", processingError.message);
    // Deactivate processing and exit with an error code.
    isInputProcessingGloballyActive = false;
    process.exit(1);
});