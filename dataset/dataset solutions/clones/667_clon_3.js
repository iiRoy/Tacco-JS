const inputLineBuffer = [];
let bufferReadIndex = 0; // Tracks the current position in the input buffer

// Initialize the readline interface for standard input/output
const terminalInputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Event listener for each line of input received
terminalInputReader.on('line', (receivedLineData) => {
    // Store every incoming line into our buffer
    inputLineBuffer.push(receivedLineData);
});

// Event listener for when the input stream closes (e.g., EOF or Ctrl+D)
terminalInputReader.on('close', () => {
    // Once all input is buffered, commence the main processing routine
    executeDataBlockProcessing();
});

/**
 * Retrieves the next available line from the buffered input.
 * @returns {string|null} The next line as a string, or null if the buffer is exhausted.
 */
function retrieveNextInputEntry() {
    if (bufferReadIndex >= inputLineBuffer.length) {
        // Indicate that there's no more input to read
        return null;
    }
    // Return the current line and advance the index for the next read
    return inputLineBuffer[bufferReadIndex++];
}

/**
 * Core function to process data blocks based on buffered input.
 * This function mimics the original Java program's logic.
 */
function executeDataBlockProcessing() {
    const QUARTER_DIVISOR = 4; // A constant for the division factor
    let totalProcessedIterations = 0; // A counter for the number of main loops executed

    // Infinite loop, which will be explicitly broken out of
    while (true) {
        totalProcessedIterations++; // Increment the iteration counter
        let currentBlockAggregate = 0; // Accumulator for sums within the current data block

        // Attempt to read the primary control value for the current block
        let primaryControlLine = retrieveNextInputEntry();

        // If no more input is available, terminate the process
        if (primaryControlLine === null) {
            // console.warn("End of input stream detected or buffer exhausted."); // Optional diagnostic
            break;
        }

        // Parse the primary control value from the string
        let mainControlValue = parseInt(primaryControlLine, 10);

        // Validate if parsing was successful; handle non-numeric input gracefully
        if (isNaN(mainControlValue)) {
            // Treat invalid numbers as zero, effectively breaking the loop if this is the first line
            mainControlValue = 0;
        }

        // Check for the termination condition (value of 0)
        if (mainControlValue === 0) {
            // console.log(`Processing terminated after ${totalProcessedIterations - 1} successful blocks.`); // Optional log
            break; // Exit the main processing loop
        }

        // Calculate the number of sub-values to read using a bitwise right shift for integer division
        // This is equivalent to Math.floor(mainControlValue / QUARTER_DIVISOR)
        const numberOfSubEntries = mainControlValue >> 2;

        // Guard against negative iteration counts, which might occur with negative mainControlValue
        if (numberOfSubEntries < 0) {
            // If negative, no sub-entries will be processed; the loop simply won't run.
            // This is an explicit check for clarity, the loop condition handles it implicitly.
            // console.warn(`Negative sub-entry count (${numberOfSubEntries}) encountered. Skipping inner accumulation.`);
        }

        // Loop to read and sum the subsequent sub-values
        for (let subEntryCounter = 0; subEntryCounter < numberOfSubEntries; ++subEntryCounter) {
            let secondaryValueLine = retrieveNextInputEntry();

            // Critical check: ensure enough input lines are available for expected sub-entries
            if (secondaryValueLine === null) {
                // If input runs out prematurely, print the sum accumulated so far for the current block
                // and then exit the entire processing routine.
                console.log(currentBlockAggregate);
                return; // Exit the function immediately
            }

            let parsedSubValue = parseInt(secondaryValueLine, 10);

            // Handle potential non-numeric input for sub-values
            if (isNaN(parsedSubValue)) {
                // Treat non-numeric sub-values as zero to continue processing
                parsedSubValue = 0;
            }

            // Add the parsed sub-value to the current block's aggregate sum
            currentBlockAggregate += parsedSubValue;
        }

        // Output the final sum for the current data block
        console.log(currentBlockAggregate);
    }
}