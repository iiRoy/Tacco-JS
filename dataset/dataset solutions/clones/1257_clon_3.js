const filesystemModule = require('fs'); // Alias the 'fs' module for file system operations.

const inputSourceLocation = '/dev/stdin'; // Define the standardized input file path.

/**
 * Processes raw textual data to generate and display ASCII geometric patterns.
 * Each line within the input data is interpreted as a specification for a rectangle,
 * requiring two space-separated integers for its height and width, respectively.
 *
 * The pattern generation sequence will gracefully terminate upon encountering a line
 * where both the height and width are explicitly specified as zero.
 * Lines that are malformed, contain non-numeric values, or specify negative dimensions
 * will be detected, logged with a warning, and then skipped, allowing the process
 * to continue with subsequent valid pattern definitions.
 *
 * @param {string} incomingTextData - The complete raw string content obtained from the input source.
 */
const visualizeRectangularStructures = (incomingTextData) => {
    // Perform an initial validation check on the type of the provided input data.
    // The function expects a non-null string to proceed with pattern visualization.
    if (typeof incomingTextData !== 'string' || incomingTextData === null) {
        console.error("Critical Error: The input data provided for pattern visualization must be a valid string.");
        return; // Terminate execution if the input data is fundamentally invalid.
    }

    // Split the entire block of incoming text data into an array of individual lines.
    // The `.filter(Boolean)` method is used here to automatically remove any empty strings
    // that might result from trailing newlines or consecutive newline characters in the input.
    const dataRows = incomingTextData.split('\n').filter(Boolean);

    // If, after splitting and filtering, no meaningful data rows remain,
    // issue a warning to the user and exit the function, as there's nothing to process.
    if (dataRows.length === 0) {
        console.warn("Warning: No discernible pattern definitions were identified in the provided input data.");
        return;
    }

    // Begin iterating through each validated data row to extract dimensions and render the patterns.
    for (let currentLineIndex = 0; currentLineIndex < dataRows.length; ++currentLineIndex) {
        const activeLineContent = dataRows[currentLineIndex]; // Obtain the content of the current line.

        // Attempt to parse the dimensions from the current line's content.
        // `.trim()` removes leading/trailing whitespace, and `split(/\s+/)` uses a regex
        // to split by one or more whitespace characters, ensuring robust parsing.
        const dimensionTokens = activeLineContent.trim().split(/\s+/);

        // Validate that exactly two numeric tokens (for height and width) were successfully extracted.
        // If not, log a warning and skip to the next line of input.
        if (dimensionTokens.length !== 2) {
            console.warn(`Skipping malformed line [${currentLineIndex + 1}]: "${activeLineContent}". Expected two numeric dimensions, found ${dimensionTokens.length}.`);
            continue; // Proceed to the next iteration of the loop.
        }

        // Convert the extracted string tokens into integer values.
        // `parseInt()` with radix 10 is used for explicit base-10 conversion.
        const structureHeight = parseInt(dimensionTokens[0], 10);
        const structureWidth = parseInt(dimensionTokens[1], 10);

        // Validate that both parsed values are indeed valid numbers (not NaN).
        // If either dimension is not a number, log a warning and skip this line.
        if (isNaN(structureHeight) || isNaN(structureWidth)) {
            console.warn(`Skipping line [${currentLineIndex + 1}]: "${activeLineContent}". Non-numeric dimension values were detected.`);
            continue; // Move on to the next line.
        }

        // Implement the termination condition: if both dimensions are zero,
        // log an informational message and immediately exit the function.
        // No further patterns will be generated.
        if (structureHeight === 0 && structureWidth === 0) {
            console.info("Info: Termination signal (0 0) received. Halting further pattern generation processes.");
            return; // Exit the visualization function.
        }

        // Introduce a guard clause to handle and skip lines specifying negative dimensions.
        // This is an enhancement to the original functionality, ensuring valid pattern sizes.
        if (structureHeight < 0 || structureWidth < 0) {
            console.warn(`Skipping line [${currentLineIndex + 1}]: H=${structureHeight}, W=${structureWidth}. Negative dimension values are not permitted.`);
            continue; // Skip to the next pattern definition.
        }

        // Construct a single row of the pattern using the '#' character repeated `structureWidth` times.
        const rowPatternSegment = '#'.repeat(structureWidth);
        // Append a newline character to the end of the constructed row, preparing it for repetition.
        const completeRowString = rowPatternSegment + '\n';
        // Repeat the `completeRowString` `structureHeight` times to form the entire rectangular pattern.
        const finalRenderedPattern = completeRowString.repeat(structureHeight);

        // Output the fully constructed ASCII pattern to the standard console output.
        console.log(finalRenderedPattern);
    }
};

// This is the primary execution block for the script.
// It attempts to read the input data and then initiates the pattern visualization.
try {
    // Read the entire content of the specified input source file synchronously.
    // The data is expected to be UTF-8 encoded.
    const rawContentBuffer = filesystemModule.readFileSync(inputSourceLocation, 'UTF-8');

    // Invoke the pattern visualization function, passing the raw content buffer as its input.
    visualizeRectangularStructures(rawContentBuffer);

} catch (dataReadError) {
    // In case of any error during the file reading operation (e.g., file not found, permissions issue),
    // log a critical error message detailing the issue and then terminate the process.
    console.error(`Fatal Error: Unable to read data from the specified input source "${inputSourceLocation}". Details: ${dataReadError.message}`);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}