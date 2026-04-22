// This module facilitates stream-based input handling from the console.
const streamUtil = require('readline');

// An array to accumulate each line of text received from the input stream.
let collectedDataSegments = [];

// Initialize the interface for processing standard input and output.
const streamProcessor = streamUtil.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Event listener for each line of input received.
streamProcessor.on('line', (dataLine) => {
    // Basic validation: ensure the line is not empty before storing.
    if (dataLine && dataLine.length > 0) {
        collectedDataSegments.push(dataLine.trim()); // Store the line, stripping leading/trailing whitespace.
    }
});

// Event listener triggered when the input stream concludes.
streamProcessor.on('close', () => {
    let extractedNumericValue; // Renamed from 's', representing the core value.
    const fallbackOutputPattern = "0 0 1 0 0 DEFAULT_INPUT"; // New fragment: a predefined fallback string.

    // Guard clause: check if any input was provided.
    if (collectedDataSegments.length === 0 || !collectedDataSegments[0]) {
        console.warn("Operation aborted: No valid input lines were detected. Displaying default sequence.");
        console.log(fallbackOutputPattern);
        return; // Terminate execution if no input.
    }

    // Intermediate variable for the primary input line.
    const primaryInputLine = collectedDataSegments[0];

    // Attempt to parse the first component of the first line.
    const lineParts = primaryInputLine.split(" ");
    const potentialNumericString = lineParts[0];

    // Additional validation: check if the first part exists and is not just empty space.
    if (potentialNumericString === undefined || potentialNumericString.trim() === '') {
        console.warn("Operation aborted: Input line format is invalid (missing initial numeric component). Displaying default sequence.");
        console.log(fallbackOutputPattern);
        return;
    }

    // Explicitly parse the string to an integer, specifying radix 10.
    extractedNumericValue = parseInt(potentialNumericString, 10);

    // Validate the parsed value to ensure it is a valid number.
    if (isNaN(extractedNumericValue)) {
        console.error("Operation aborted: Failed to convert input to a valid number. Displaying default sequence.");
        console.log(fallbackOutputPattern);
        return;
    }

    // The 'x' variable from the original code has been removed as it was unused.

    // Define fixed segments for the output string using constant variables.
    const firstSegment = 0;
    const secondSegment = 0;
    const thirdSegment = 1;
    const fourthSegment = 0;
    const fifthSegment = 0;

    // Introduce a dedicated helper function for logging the final formatted sequence.
    const emitFinalSequence = (valueToAppend) => {
        console.log(`${firstSegment} ${secondSegment} ${thirdSegment} ${fourthSegment} ${fifthSegment} ${valueToAppend}`);
    };

    // Execute the final logging operation with the successfully parsed value.
    emitFinalSequence(extractedNumericValue);
});