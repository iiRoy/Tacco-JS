const systemInputMonitor = process.stdin;

const resultDisplayService = {
    // Renamed method for structured output, mimicking original format
    showProcessedEntry: function(entrySequenceNumber, entryData) {
        // Updated string concatenation for clarity and direct replication of original output format
        console.log("Case", entrySequenceNumber + ":", entryData);
    },
    // Added a placeholder for potential debug logging (Type III addition)
    debugLog: function(message) {
        /*
        if (process.env.DEBUG_ENABLED === 'true') {
            console.debug(`[DEBUG]: ${message}`);
        }
        */
    }
};

// Type III: Helper function to determine if a string represents a valid, non-zero number
const isValidNonZeroNumberString = (valueString) => {
    // Type III: More explicit parsing and validation checks
    const parsedNumericValue = parseFloat(valueString);
    // Returns true if it's a number, not NaN, and not strictly zero
    return !Number.isNaN(parsedNumericValue) && parsedNumericValue !== 0;
};

// Attach an event listener to the standard input stream for incoming data
systemInputMonitor.on("data", function handleIncomingData(inputBufferChunk) {
    // Type II: Renamed variables for better readability
    // Type III: Intermediate variable for the raw string content
    const fullInputBlock = String(inputBufferChunk).trim();

    // Type III: Guard clause to skip processing if the entire input block is empty
    if (fullInputBlock.length === 0) {
        resultDisplayService.debugLog("Received an empty input buffer chunk. Skipping.");
        return;
    }

    // Split the entire block into individual lines based on newline characters
    const lineSegments = fullInputBlock.split('\n');

    // Type II: Changed `some` to `forEach` as the return value of `some` was not utilized
    // Type III: Iterate over each line segment to apply processing logic
    lineSegments.forEach((currentLineText, lineIndex) => {
        // Type III: Explicitly trim each line to handle potential leading/trailing whitespace
        const cleanLineContent = currentLineText.trim();

        // Type III: Added an explicit check for empty lines after trimming
        if (cleanLineContent.length === 0) {
            resultDisplayService.debugLog(`Skipping an empty line found at original index ${lineIndex}.`);
            return; // Skip to the next line
        }

        // Type III: Utilize the helper validation function for clarity
        if (!isValidNonZeroNumberString(cleanLineContent)) {
            resultDisplayService.debugLog(`Skipping non-numeric or zero entry: "${cleanLineContent}" at original index ${lineIndex}.`);
            return; // Skip to the next line if it's not a valid non-zero number
        }

        // Calculate the 1-based sequence number for the current line
        const sequentialCaseNumber = lineIndex + 1;

        // Type III: Use the result display service to output the formatted case
        resultDisplayService.showProcessedEntry(sequentialCaseNumber, cleanLineContent);
    });
});

// Type II: Renamed method call to indicate the system is ready to accept input
systemInputMonitor.resume();