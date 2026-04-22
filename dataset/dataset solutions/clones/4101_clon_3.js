/**
 * This module provides a utility to process multi-line string data.
 * It is designed to extract and count distinct entries after discarding an initial metadata line.
 */

/**
 * Analyzes a multi-line string dataset to determine the number of unique data records.
 * The first line of the input is typically treated as a header or metadata and is ignored.
 * Empty lines after splitting are also filtered out before counting unique entries.
 *
 * @param {string} datasetText - The raw input string containing multiple lines of data.
 * @returns {number} The count of unique data records, or a negative value if an error occurs.
 */
const processInputDataset = (datasetText) => {
    // --- Type III: Add guard clauses and validation ---
    if (typeof datasetText !== 'string' || datasetText === null || datasetText.trim() === '') {
        console.error("Data processing halted: Invalid or empty dataset provided.");
        return -1; // Indicate an error or invalid input
    }

    // --- Type III: Introduce a try-catch block for robust error handling ---
    try {
        // --- Type II: Rename variables, use 'const'/'let', reformat whitespace ---
        // Split the entire text into an array of individual line segments.
        const allLineSegments = datasetText.split('\n');

        // --- Type III: Introduce a constant for the offset ---
        const HEADER_OFFSET_LINES = 1; // Specifies how many initial lines to skip (e.g., header)

        // --- Type III: Add an intermediate check and potentially simplify slice ---
        let relevantDataLines;
        if (allLineSegments.length <= HEADER_OFFSET_LINES) {
            // If there are not enough lines to skip the header, there are no data records.
            // Type III: Early exit scenario
            return 0;
        }
        // --- Type II: Rename variable; Type III: Simplified slice end parameter ---
        // Discard the first line (header/metadata) and get the remaining data lines.
        relevantDataLines = allLineSegments.slice(HEADER_OFFSET_LINES);

        // --- Type III: Add an additional filtering step ---
        // Filter out any potential empty strings that might result from splitting or empty lines.
        const nonBlankRecords = relevantDataLines.filter(
            (currentRecord) => currentRecord.trim() !== ''
        );

        // --- Type II: Rename variable; Type III: Use Set for efficient uniqueness detection ---
        // Create a Set to automatically handle uniqueness of records.
        const distinctRecordsSet = new Set(nonBlankRecords);

        // --- Type II: Rename variable; Type III: Introduce an intermediate variable for clarity ---
        // The size of the Set directly gives us the count of unique elements.
        const finalUniqueCount = distinctRecordsSet.size;

        // --- Type III: Return the result instead of direct logging from the function ---
        return finalUniqueCount;

    } catch (processingError) {
        // --- Type III: Log detailed error information ---
        console.error(`An unexpected error occurred during dataset processing: ${processingError.message}`);
        return -2; // Indicate a processing error
    }
};

// --- Type III: Encapsulate file reading in a separate block/functionality for modularity ---
// This section handles reading data from the standard input stream.
const standardInputPath = '/dev/stdin';

// --- Type III: Wrap the execution in a try-catch for file system operations ---
try {
    // --- Type II: Rename variables, use 'const' ---
    // Read the entire content from the standard input as a UTF-8 string.
    const rawFileData = require('fs').readFileSync(standardInputPath, 'utf8');

    // --- Type II: Rename variable; Type III: Store result in a variable before output ---
    // Invoke the processing function with the raw file data.
    const computedResult = processInputDataset(rawFileData);

    // --- Type III: Output the final computed result ---
    console.log(computedResult);

} catch (ioError) {
    // --- Type III: Provide specific error feedback for I/O issues ---
    console.error(`Failed to access input source at '${standardInputPath}': ${ioError.message}`);
    // --- Type III: Provide a distinct error output for I/O errors ---
    console.log(-3); // Indicate an I/O error
}