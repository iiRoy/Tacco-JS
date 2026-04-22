// This script manages standard input to process textual data.
// It accumulates all incoming data, then splits it into individual lines
// for subsequent application logic, which involves reading dimensions
// and then echoing specific input lines multiple times.

// Ensure the standard input stream remains open and actively listening for data.
process.stdin.resume();

// Configure the encoding for the incoming data stream to handle various characters.
process.stdin.setEncoding('utf8');

// A buffer to temporarily store all raw data chunks received from stdin.
let accumulatedInputBuffer = '';

// An array to store the input lines after the raw buffer has been processed.
let parsedInputLines = [];

// An index to keep track of the current line being read from 'parsedInputLines'.
let currentLinePointer = 0;

// Attach an event listener to the 'data' event of stdin.
// Each time a chunk of data is received, append it to our buffer.
process.stdin.on('data', function (incomingDataChunk) {
    accumulatedInputBuffer += incomingDataChunk;
});

/**
 * Executes the final steps of input processing, including splitting the
 * raw buffer into lines and initiating the main application routine.
 * This function is designed to be called once input collection is complete.
 */
const finalizeAndExecute = () => {
    // Check if any data was actually received before attempting to process.
    if (accumulatedInputBuffer.length > 0) {
        // Split the accumulated buffer by newline characters.
        // Filter out any empty strings that might result from trailing newlines
        // or multiple consecutive newlines, ensuring only meaningful lines are kept.
        parsedInputLines = accumulatedInputBuffer.split('\n').filter(segment => segment.trim().length > 0);
    } else {
        // Log an error if no input was provided, as the application expects data.
        console.error("Critical: No input data was received from standard input.");
        // Depending on requirements, one might call process.exit(1) here for mandatory input.
        // For this clone, we'll proceed, allowing the main logic to handle potential nulls.
    }

    // Invoke the primary logic function of the application.
    primaryApplicationLogic();
};

// Attach an event listener for the 'end' event on stdin, indicating no more data will come.
process.stdin.on('end', () => {
    finalizeAndExecute();
});

// Attach an event listener for the 'SIGINT' signal (typically Ctrl+C).
// This allows for graceful shutdown, processing any buffered input before exiting.
process.on('SIGINT', () => {
    console.log('\nApplication received termination signal (SIGINT). Finalizing processing...');
    finalizeAndExecute();
    process.exit(0); // Exit cleanly after processing.
});

/**
 * Retrieves the next available input line from the pre-processed array.
 * Increments an internal pointer to ensure sequential access.
 * @returns {string | null} The next line of input, or null if no more lines are available.
 */
function retrieveNextInputLine() {
    // Verify that the current pointer is within the bounds of the lines array.
    if (currentLinePointer < parsedInputLines.length) {
        // Return the line at the current pointer and then advance the pointer.
        return parsedInputLines[currentLinePointer++];
    }
    // If no more lines, indicate exhaustion of input.
    return null;
}

////////////////////////////////////////////////////////////////////////////////
// Main Application Processing Logic Below This Boundary
////////////////////////////////////////////////////////////////////////////////

/**
 * Parses a string containing space-separated integer dimensions (e.g., "5 10").
 * Includes robust error checking for format and numerical validity.
 * @param {string | null} dimensionString - The input string to parse.
 * @returns {{rows: number, cols: number} | null} An object with 'rows' and 'cols', or null if parsing fails.
 */
function parseGridDimensions(dimensionString) {
    if (dimensionString === null || dimensionString.trim().length === 0) {
        console.error("Error: Dimension string is empty or null, cannot parse grid size.");
        return null;
    }

    // Split the string by one or more whitespace characters for flexibility.
    const parts = dimensionString.trim().split(/\s+/);

    // Ensure at least two parts (for height and width) are present.
    if (parts.length < 2) {
        console.error(`Error: Insufficient dimension values provided. Expected 2, got ${parts.length}.`);
        return null;
    }

    // Parse the first two parts as integers, specifying radix 10 for safety.
    const rowCount = parseInt(parts[0], 10);
    const colCount = parseInt(parts[1], 10);

    // Validate that both parsed values are actual numbers.
    if (isNaN(rowCount) || isNaN(colCount)) {
        console.error(`Error: Invalid numeric dimensions detected. Parsed H: ${parts[0]}, W: ${parts[1]}.`);
        return null;
    }

    // Return the successfully parsed dimensions.
    return { rows: rowCount, cols: colCount };
}

/**
 * Outputs a given string content to the console a specified number of times.
 * Includes basic validation for the content and repetition count.
 * @param {string | null} contentToRepeat - The string content to be printed.
 * @param {number} timesToRepeat - The number of times to print the content.
 */
function repeatConsoleOutput(contentToRepeat, timesToRepeat) {
    // Guard against invalid or empty content.
    if (typeof contentToRepeat !== 'string' || contentToRepeat === null || contentToRepeat.length === 0) {
        // console.warn("Warning: Attempted to output invalid or empty content. Skipping this item.");
        return; // Silently skip invalid content to avoid errors.
    }

    // Ensure the repetition count is a non-negative integer.
    const effectiveRepeatCount = Math.max(0, Math.floor(timesToRepeat));

    // Loop to print the content.
    for (let currentRepetition = 0; currentRepetition < effectiveRepeatCount; currentRepetition++) {
        console.log(contentToRepeat);
    }
}

/**
 * The main entry point for the application's core logic.
 * This function orchestrates reading grid dimensions, collecting grid data,
 * and then producing the required output.
 */
function primaryApplicationLogic() {
    // First, attempt to read the line containing grid dimensions (Height and Width).
    const dimensionInputLine = retrieveNextInputLine();
    const gridDimensions = parseGridDimensions(dimensionInputLine);

    // Critical guard: If dimensions could not be parsed, the application cannot proceed.
    if (gridDimensions === null) {
        console.error("Application terminated: Unable to establish grid dimensions from input.");
        return; // Exit early.
    }

    // Destructure the parsed dimensions for easier access and clarity.
    const { rows: gridHeight, cols: gridWidth } = gridDimensions;

    // Optional validation: Warn if dimensions are non-positive, which might indicate
    // an empty grid or an error in input, but still allow processing.
    if (gridHeight <= 0 || gridWidth <= 0) {
        console.warn(`Note: Provided grid dimensions are non-positive (H: ${gridHeight}, W: ${gridWidth}). This may result in no grid data being processed.`);
    }

    // An array to store all the subsequent rows of the grid content.
    const gridContentStorage = [];

    // Loop to read and store each row of the grid, based on the determined height.
    for (let rowIterator = 0; rowIterator < gridHeight; ++rowIterator) {
        const currentGridRowData = retrieveNextInputLine();

        // Check if we unexpectedly ran out of input lines before reading all expected rows.
        if (currentGridRowData !== null) {
            gridContentStorage.push(currentGridRowData);
        } else {
            console.error(`Error: Expected ${gridHeight} grid rows but only found ${rowIterator} before end of input.`);
            break; // Stop reading further if input is exhausted prematurely.
        }
    }

    // Define how many times each stored row should be printed.
    const outputRepetitionFactor = 2;

    // Loop through the collected grid content and output each line the specified number of times.
    for (let outputIterator = 0; outputIterator < gridContentStorage.length; ++outputIterator) {
        const lineToDisplay = gridContentStorage[outputIterator];
        repeatConsoleOutput(lineToDisplay, outputRepetitionFactor);
    }
}