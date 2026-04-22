process.stdin.resume();
// Configure standard input stream to interpret data as UTF-8 characters.
process.stdin.setEncoding('utf8');

// Declare a variable to accumulate all incoming data chunks from standard input.
let collectedInputBuffer = '';

// Set up an event listener for incoming data on the standard input stream.
// Each time data arrives, append it to our buffer.
process.stdin.on('data', (dataChunk) => {
    collectedInputBuffer += dataChunk;
});

// Define a constant for the specific numeric value that triggers early termination.
const STOP_PROCESSING_INDICATOR = 0;

// Set up an event listener for when the standard input stream signals its end.
// This callback function will execute once all input has been received.
process.stdin.on('end', () => {
    // Split the accumulated input string into an array of individual lines.
    // Each line represents a distinct entry from the input.
    const inputLineArray = collectedInputBuffer.split('\n');

    // Initialize a counter for displaying the sequential entry number, starting from one.
    let entrySequenceNumber = 1;

    // Process each line to convert it into a numeric value.
    // Empty lines or lines containing non-numeric characters will result in NaN.
    const processedNumericValues = inputLineArray.map((rawLineSegment) => {
        // Remove leading/trailing whitespace from the line segment for cleaner parsing.
        const trimmedSegment = rawLineSegment.trim();
        // If the line is empty after trimming, it's not a valid number.
        if (trimmedSegment.length === 0) {
            return Number.NaN; // Indicate an invalid or empty input line.
        }
        // Attempt to parse the string as an integer, using base 10.
        return Number.parseInt(trimmedSegment, 10);
    });

    // Iterate through the array of parsed numeric values using a modern for-of loop.
    for (const currentNumericItem of processedNumericValues) {
        // Implement a guard clause to skip any entries that failed parsing
        // (e.g., were empty lines or contained non-numeric text).
        if (Number.isNaN(currentNumericItem)) {
            // Optionally, one could log a warning here if desired.
            // console.warn('Skipping an invalid or empty input line.');
            continue; // Move to the next item without incrementing the sequence number.
        }

        // Construct the output string for the current entry, including its sequence number.
        const formattedOutputString = `Processing Entry ${entrySequenceNumber} :: ${currentNumericItem}`;
        // Display the formatted output to the console.
        console.log(formattedOutputString);

        // Check if the current numeric value matches the defined termination indicator.
        if (currentNumericItem === STOP_PROCESSING_INDICATOR) {
            // If the termination indicator is found, immediately halt all further processing.
            // The 'return' statement exits the entire 'end' event handler function.
            // This ensures no subsequent data points are processed or logged.
            return;
        }

        // Increment the sequence number for the next valid, non-terminating entry.
        entrySequenceNumber++;
    }

    // This message will only be displayed if the entire input stream was processed
    // without encountering the STOP_PROCESSING_INDICATOR.
    // console.log("All available input was processed without an early termination signal.");
});