const inputSource = process.stdin;
const outputSink = process.stdout;

// Configure the input stream to handle UTF-8 data
inputSource.setEncoding("utf8");

// A buffer to accumulate all incoming data chunks
let collectedInputContent = "";

// Constant for the newline character, used for consistency
const NEWLINE_DELIMITER = '\n';

// Regular expression to find two integer numbers separated by space,
// allowing for optional leading/trailing whitespace on the line.
// The `\d+` ensures at least one digit.
const PAIR_PARSING_PATTERN = /^\s*(\d+)\s+(\d+)\s*$/;

/**
 * Processes a single line of input, attempting to parse two numbers
 * and print their sum.
 * @param {string} inputLine - The line of text to process.
 * @returns {boolean} - True if the line was successfully processed, false otherwise.
 */
function handleSingleLineAddition(inputLine) {
    // Attempt to match the pattern against the current line
    const numericMatch = PAIR_PARSING_PATTERN.exec(inputLine);

    if (numericMatch && numericMatch.length === 3) {
        try {
            // Extract the string representations of the numbers
            const firstNumString = numericMatch[1];
            const secondNumString = numericMatch[2];

            // Convert string to number using unary plus operator for conciseness
            const numA = +firstNumString;
            const numB = +secondNumString;

            // Basic validation to ensure parsed values are indeed numbers
            if (Number.isNaN(numA) || Number.isNaN(numB)) {
                // Log a warning for malformed numbers but continue processing
                console.warn(`Warning: Could not parse valid numbers from parts "${firstNumString}" and "${secondNumString}" in line: "${inputLine}"`);
                return false;
            }

            // Calculate the sum
            const calculatedSum = numA + numB;

            // Output the result, ensuring it's a string followed by a newline
            outputSink.write(`${calculatedSum}${NEWLINE_DELIMITER}`);
            return true; // Successfully processed
        } catch (processingError) {
            // Catch any unexpected errors during number conversion or calculation
            console.error(`Error during sum calculation for line "${inputLine}": ${processingError.message}`);
            return false;
        }
    } else {
        // If the line does not match the expected pattern, log a debug message
        // This line is optional and could be removed in a production environment
        // console.debug(`Skipping line as it does not match pattern: "${inputLine}"`);
        return false; // Line did not match or was not valid
    }
}

/**
 * Main function to orchestrate the processing of all accumulated input data.
 * This function is called once the entire input stream has ended.
 */
async function processAllInputData() {
    // Split the entire collected content into individual lines.
    // Filter out any empty strings that might result from trailing newlines.
    const individualInputLines = collectedInputContent.split(NEWLINE_DELIMITER).filter(line => line.trim() !== '');

    // Early exit if no valid lines were found
    if (!individualInputLines.length) {
        console.info("No valid input lines were provided for processing.");
        return;
    }

    let successfullyProcessedLines = 0;

    // Iterate over each line using a for...of loop for modern syntax
    for (const currentLine of individualInputLines) {
        if (handleSingleLineAddition(currentLine)) {
            successfullyProcessedLines++;
        }
    }

    // Output a summary of the processing
    console.log(`\n--- Processing Complete ---`);
    console.log(`Total lines received: ${individualInputLines.length}`);
    console.log(`Lines successfully processed: ${successfullyProcessedLines}`);
    console.log(`---------------------------\n`);
}

// Attach an event listener for when data chunks are received
inputSource.on("data", (dataChunk) => {
    collectedInputContent += dataChunk;
});

// Attach an event listener for when the input stream ends
inputSource.on("end", () => {
    // Once all data has been received, initiate the processing pipeline
    processAllInputData();
});

// Optional: Add an error handler for the input stream
inputSource.on("error", (err) => {
    console.error(`An error occurred on the input stream: ${err.message}`);
    process.exit(1); // Exit with an error code
});

// Note: process.stdin.resume() is often implicitly handled by attaching 'data' listeners
// but can be explicitly called if needed to ensure the stream starts flowing.
// For this clone, it has been removed as a deletion example.