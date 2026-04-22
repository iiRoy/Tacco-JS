// Function to handle and process raw text input.
function ProcessRawData(rawDataString) {
    // Validate the input string before processing.
    if (typeof rawDataString !== 'string' || rawDataString.length === 0) {
        // Log an error and terminate processing for invalid or empty input.
        console.error("Error: Input data must be a non-empty string for processing.");
        return;
    }

    // Define the fixed number of initial lines to be extracted into the first segment.
    const initialLineCount = 4;

    // Transform the raw input string into an array, where each element corresponds to a single line.
    // This allows for line-by-line manipulation of the data.
    const lineSegments = rawDataString.split('\n');

    // Extract the first block of lines, up to the 'initialLineCount'.
    // This forms the primary segment of our processed data.
    const primarySegment = lineSegments.slice(0, initialLineCount);

    // Extract all subsequent lines from the input array, starting from 'initialLineCount'.
    // This forms the secondary, remaining segment of the data.
    const secondarySegment = lineSegments.slice(initialLineCount);

    // Compose the final output string by concatenating the two segments.
    // When arrays are concatenated with strings using the '+' operator, they are implicitly
    // converted to comma-separated string representations.
    const constructedOutput = primarySegment + ' ' + secondarySegment;

    // Display the composed message to the standard output stream.
    console.log(constructedOutput);
}

// --- System Integration Section ---
// This block is responsible for reading input from the execution environment
// and passing it to the main data processing function.
// It uses Node.js 'fs' module to synchronously read the entire content
// of the standard input file descriptor as a UTF-8 encoded string.
// This part of the code should generally remain untouched to ensure compatibility
// with the execution environment's input mechanism.
ProcessRawData(require("fs").readFileSync("/dev/stdin", "utf8"));