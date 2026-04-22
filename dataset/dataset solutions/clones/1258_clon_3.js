// Initialize the standard input stream to resume data flow
process.stdin.resume();

// Configure the standard input stream to interpret incoming data as UTF-8 text
process.stdin.setEncoding('utf-8');

// Attach an event listener to handle 'data' events from standard input
// This function will be called whenever new data chunks are received
process.stdin.on('data', function (receivedDataChunk) {
    // --- Input Parsing and Validation ---

    // Clean up the received data: trim leading/trailing whitespace and split by
    // any sequence of one or more whitespace characters to get individual tokens.
    const dimensionTokens = receivedDataChunk.trim().split(/\s+/);

    // Validate the number of tokens received. We expect at least two for dimensions.
    if (dimensionTokens.length < 2) {
        // If not enough tokens, log an error (optional, for debugging) and skip this chunk.
        // console.error("Warning: Insufficient dimension values received. Expected two numbers.");
        return;
    }

    // Attempt to parse the first token as the row count (height)
    // and the second token as the column count (width).
    // Use radix 10 for explicit decimal parsing.
    const rowCount = parseInt(dimensionTokens[0], 10);
    const colCount = parseInt(dimensionTokens[1], 10);

    // Further validation: Check if parsed values are actual numbers and non-negative.
    // If parsing failed (NaN) or values are negative, log an error and skip.
    if (isNaN(rowCount) || isNaN(colCount) || rowCount < 0 || colCount < 0) {
        // console.error("Warning: Invalid numeric dimensions. Please provide non-negative integers.");
        return;
    }

    // --- Program Termination Condition ---

    // The original code implies an exit when both dimensions are zero.
    // We implement this explicitly using process.exit().
    if (rowCount === 0 && colCount === 0) {
        process.exit(0); // Terminate the process successfully.
    }

    // --- Rectangle Drawing Logic ---

    // Define the character to be used for drawing the rectangle.
    const drawSymbol = '#';
    // Initialize a string buffer to collect all lines of the output for this rectangle.
    let outputCollector = '';

    // Outer loop: iterates through each row of the rectangle.
    for (let currentHeightIndex = 0; currentHeightIndex < rowCount; currentHeightIndex++) {
        // Initialize an empty string to build the current row.
        let rowLineBuilder = '';
        // Inner loop: iterates through each column to fill the current row.
        for (let currentWidthIndex = 0; currentWidthIndex < colCount; currentWidthIndex++) {
            rowLineBuilder += drawSymbol; // Append the drawing symbol for each column.
        }
        // After building the row, append it to the main output buffer, followed by a newline.
        outputCollector += rowLineBuilder + '\n';
    }

    // As per the original behavior, append an additional newline after the entire rectangle block.
    outputCollector += '\n';

    // --- Output Generation ---

    // Write the complete accumulated output string to the standard output stream.
    process.stdout.write(outputCollector);
});