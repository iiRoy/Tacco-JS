// Activate the standard input stream, ensuring it remains open for data.
process.stdin.resume();

// Configure the encoding for the standard input stream to UTF-8,
// allowing it to correctly interpret text data.
process.stdin.setEncoding('utf8');

/**
 * Core processing function for each individual line of input.
 * It extracts two numerical values, computes their sum,
 * and then outputs the character length of the sum's string representation.
 *
 * @param {string} incomingLineData - A single string line received from standard input.
 * @returns {void}
 */
const processNumericLineAndLogLength = (incomingLineData) => {
    // Perform an initial check to ensure the line is not empty or composed solely of whitespace.
    // If it's empty, there's nothing to process, so we exit early.
    if (!incomingLineData || incomingLineData.trim().length === 0) {
        return;
    }

    // Split the cleaned line by one or more whitespace characters to get potential number strings.
    // Using a regex `/\s+/` makes it robust against multiple spaces between numbers.
    const separatedValueStrings = incomingLineData.trim().split(/\s+/);

    // Validate that we have at least two parts to convert into numbers.
    // If not, this line is considered malformed for our purpose, and we skip it.
    if (separatedValueStrings.length < 2) {
        // In a real application, one might log this skipped line or handle the error.
        // console.warn(`Skipping line due to insufficient numeric parts: "${incomingLineData}"`);
        return;
    }

    // Convert the first two string parts into numerical values.
    // The unary plus operator (`+`) is used here as a concise way to convert strings to numbers.
    const valueA = +separatedValueStrings[0];
    const valueB = +separatedValueStrings[1];

    // Crucial validation: Check if the conversions resulted in actual finite numbers.
    // `isNaN` checks for "Not a Number", `!isFinite` checks for Infinity/-Infinity.
    if (Number.isNaN(valueA) || !Number.isFinite(valueA) ||
        Number.isNaN(valueB) || !Number.isFinite(valueB)) {
        // If either conversion failed, we cannot proceed with the sum, so we skip.
        // console.error(`Invalid numerical input detected in line: "${incomingLineData}"`);
        return;
    }

    // Calculate the total of the two validated numerical inputs.
    const totalSumValue = valueA + valueB;

    // Convert the calculated sum back into its string form.
    const sumStringRepresentation = String(totalSumValue);

    // Determine the character count of the sum's string.
    const finalLength = sumStringRepresentation.length;

    // Output the resulting character count to the console.
    console.log(finalLength);
};

// Attach an event listener to the standard input stream.
// This listener will be triggered whenever new data chunks become available.
process.stdin.on('data', (receivedDataChunk) => {
    // Convert the raw data chunk (which might be a Buffer) into a complete string.
    const completeInputBlock = String(receivedDataChunk);

    // Split the entire input block into an array of individual lines.
    // Then, filter out any empty strings that might result from splitting (e.g., from trailing newlines).
    // The filter ensures that only lines with actual content are processed.
    const activeInputLines = completeInputBlock
                                .split('\n')
                                .filter(lineItem => lineItem.trim().length > 0);

    // Iterate over each valid line detected in the current input block.
    // For every such line, invoke our dedicated processing function.
    for (const currentLineEntry of activeInputLines) {
        processNumericLineAndLogLength(currentLineEntry);
    }
});