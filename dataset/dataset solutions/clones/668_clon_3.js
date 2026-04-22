const inputProcessor = require('readline');
const { stdin: inputSource, stdout: outputChannel } = require('process');

// Establish a dedicated interface for handling input and output streams.
const userInteractionInterface = inputProcessor.createInterface({
    input: inputSource,
    output: outputChannel,
    crlfDelay: Infinity // Accommodate various line ending conventions
});

// A temporary storage structure to hold all incoming lines before core processing begins.
const bufferedInputLines = [];
let currentLinePointer = 0; // An index to track the current position within the buffered input.

// Register an event listener to populate the buffer as lines are received.
userInteractionInterface.on('line', (lineData) => {
    bufferedInputLines.push(lineData);
});

// Register an event listener to initiate the primary data processing routine
// once the input stream is closed (e.g., EOF is reached).
userInteractionInterface.on('close', () => {
    initiateDataProcessing();
});

/**
 * Safely retrieves the subsequent line from the pre-buffered input.
 * This abstraction helps maintain a synchronous-like flow for the core logic.
 * @returns {string | undefined} The next available line of input, or 'undefined' if the buffer is exhausted.
 */
function extractNextInputChunk() {
    if (currentLinePointer < bufferedInputLines.length) {
        return bufferedInputLines[currentLinePointer++];
    }
    // If no more data is available, signal the end of input.
    return undefined;
}

/**
 * Orchestrates the primary numerical aggregation logic.
 * This function is the core of the application, processing input in blocks.
 */
function initiateDataProcessing() {
    let processingActive = true; // A control flag for the main processing loop.
    let blockSequenceIndex = 0; // Keeps count of the blocks processed, starting from zero.

    // The main processing loop continues as long as the 'processingActive' flag is true.
    while (processingActive) {
        let currentBlockAggregate = 0; // Accumulator for the sum within the current processing block.
        let rawLineData = extractNextInputChunk(); // Obtain the first line for the current block.

        // --- Input Validation and Termination Checks ---
        // Guard against unexpected end of input or empty lines, especially for the control value.
        if (rawLineData === undefined || rawLineData.trim() === '') {
            if (rawLineData === undefined) { // Truly no more input
                if (blockSequenceIndex === 0) {
                     // If no input was provided at all, log an error.
                    console.error("Error: No initial input data was supplied.");
                }
                processingActive = false; // Signal to terminate the main loop.
                break; // Exit the current iteration.
            }
            // If it's an empty line, and not EOF, we might skip or warn. For this logic,
            // an empty line here would likely cause NaN, handled below.
        }

        // Attempt to convert the raw string input into an integer.
        let parsedControlValue = Number.parseInt(rawLineData, 10);

        // Validate that the parsing was successful.
        if (Number.isNaN(parsedControlValue)) {
            console.error(`Warning: Unrecognized numerical format for control value: "${rawLineData}". Terminating processing.`);
            processingActive = false; // Malformed control value is a critical error.
            break;
        }

        // Check for the designated termination signal (a zero value).
        if (parsedControlValue === 0) {
            processingActive = false; // Set the flag to false to gracefully exit the main loop.
            break;
        }

        // --- Inner Loop Preparation ---
        // Determine the number of sub-iterations required for this block.
        // Math.floor ensures integer division, consistent with Java's behavior.
        const subIterationCount = Math.floor(parsedControlValue / 4);

        // --- Inner Loop for Value Aggregation ---
        for (let innerCycleIndex = 0; innerCycleIndex < subIterationCount; innerCycleIndex++) {
            let rawDataChunk = extractNextInputChunk(); // Fetch the next data chunk for aggregation.

            // Guard against insufficient input for the inner loop.
            if (rawDataChunk === undefined || rawDataChunk.trim() === '') {
                console.error("Error: Insufficient input data for inner processing cycle. Halting.");
                processingActive = false; // Critical error, terminate all processing.
                break; // Exit the inner loop immediately.
            }

            let componentValue = Number.parseInt(rawDataChunk, 10); // Parse the component value.

            // Validate the parsed component value.
            if (Number.isNaN(componentValue)) {
                console.error(`Warning: Invalid number encountered for aggregation: "${rawDataChunk}". Skipping this entry.`);
                continue; // Skip the current malformed entry and proceed to the next inner iteration.
            }

            // Add the valid component value to the block's running total.
            currentBlockAggregate += componentValue;
        }

        // If a critical error occurred in the inner loop (e.g., insufficient input),
        // ensure the outer loop also terminates.
        if (!processingActive) {
            break;
        }

        // --- Output Result ---
        // Display the calculated aggregate for the completed block to the standard output.
        outputChannel.write(`${currentBlockAggregate}\n`);
        blockSequenceIndex++; // Increment the block counter for the next iteration.
    }

    // The program will naturally exit once all processing is complete and the 'close' event handler finishes.
}