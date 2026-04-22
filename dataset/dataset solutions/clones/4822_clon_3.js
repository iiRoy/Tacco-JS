/**
 * This module provides a robust utility for processing structured multi-line textual input.
 * It expects the first line of the input to specify dimensions (height and width),
 * followed by a number of data lines corresponding to the specified height.
 * The processed data lines are then displayed with a custom format.
 */
function processStructuredTextData(sourceContentString) {
    // --- Input Validation and Pre-processing ---

    // Ensure the input string is not null, undefined, or empty after trimming.
    if (!sourceContentString || typeof sourceContentString !== 'string' || sourceContentString.trim().length === 0) {
        console.error("System Error: The provided input source content is invalid or empty. Processing halted.");
        return; // Terminate execution gracefully.
    }

    // Split the entire input content into an array of individual lines.
    const allContentLines = sourceContentString.split('\n');

    // Verify that there's at least one line (for dimensions).
    if (allContentLines.length === 0) {
        console.error("System Error: No lines found in the input content. Expected at least a dimension line.");
        return;
    }

    // --- Dimension Parsing ---

    const firstContentLine = allContentLines[0];
    const dimensionTokens = firstContentLine.split(' ');

    // Validate the format of the dimension line.
    if (dimensionTokens.length < 2) {
        console.error("Input Format Error: The first line (dimensions) is malformed. Expected 'ROW_COUNT COL_COUNT'.");
        return;
    }

    const declaredRowCountString = dimensionTokens[0];
    const declaredColCountString = dimensionTokens[1]; // The column count is read but not actively used in this version.

    const actualRowCount = parseInt(declaredRowCountString, 10);

    // Validate the parsed row count to ensure it's a positive integer.
    if (isNaN(actualRowCount) || actualRowCount <= 0) {
        console.error(`Input Data Error: Invalid row count '${declaredRowCountString}'. It must be a positive numeric value.`);
        return;
    }

    // --- Data Extraction ---

    // The data lines begin immediately after the dimension line.
    const dataLinesStartIndex = 1;

    // Use slice to get only the relevant data lines and filter out any empty lines
    // that might result from extra newlines in the input, ensuring clean data.
    const extractedDataItems = allContentLines
        .slice(dataLinesStartIndex, dataLinesStartIndex + actualRowCount)
        .filter(line => line.trim().length > 0); // Only keep non-empty lines.

    // Provide a warning if the number of extracted data items doesn't match the declared row count.
    if (extractedDataItems.length < actualRowCount) {
        console.warn(`Data Mismatch Warning: Expected ${actualRowCount} data lines, but only found ${extractedDataItems.length} valid lines.`);
    }

    // --- Output Formatting and Display ---

    /**
     * A private helper function to standardize the output of each data item.
     * It applies a transformation and adds a prefix.
     * @param {string} itemContent - The raw string content of the data item.
     * @param {number} itemLogicalIndex - The zero-based index of the item in the collection.
     */
    const emitFormattedDataLine = (itemContent, itemLogicalIndex) => {
        // Apply a simple transformation (e.g., converting to uppercase).
        const processedContent = itemContent.trim().toUpperCase();
        const displayLabel = `[Entry #${itemLogicalIndex + 1}]: `;
        console.log(displayLabel + processedContent);
    };

    // Iterate through the collected and filtered data items and display them.
    if (extractedDataItems.length > 0) {
        console.log("\n--- Initiating Data Display ---");
        extractedDataItems.forEach((dataValue, index) => {
            // Introduce a temporary variable for the current item for clarity.
            const currentItem = dataValue;
            emitFormattedDataLine(currentItem, index);
        });
        console.log(`--- Completed Display of ${extractedDataItems.length} Data Items ---\n`);
    } else {
        console.log("\n--- No valid data items were found or processed for display. ---\n");
    }
}

// --- Application Entry Point ---

// This block handles reading input from standard input and invoking the main processing function.
try {
    const systemInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processStructuredTextData(systemInputContent);
} catch (fileReadError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`Critical Runtime Error: Failed to read input from '/dev/stdin'. Details: ${fileReadError.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}