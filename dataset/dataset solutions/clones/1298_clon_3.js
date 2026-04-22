let rawDataAccumulator = ''; // Buffer to accumulate all incoming raw data from standard input.
const inputStream = process.stdin; // Reference to the standard input stream object.

// Activate the input stream to begin receiving data.
inputStream.resume();
// Configure the character encoding for the input stream to correctly interpret data.
inputStream.setEncoding('utf-8');

/**
 * Utility function to parse a string containing space-separated numbers into an array of numbers.
 * @param {string} textLine - The input string line to be parsed.
 * @returns {number[]} An array of numbers parsed from the string.
 */
const parseNumericLine = (textLine) => {
    // Handle empty or whitespace-only lines by returning an empty array.
    if (!textLine || textLine.trim() === '') {
        return [];
    }
    // Split the string by spaces, filter out any empty strings resulting from multiple spaces,
    // and then convert each part to a number.
    return textLine.split(' ').filter(token => token !== '').map(Number);
};

// Event handler for when data chunks are received from the input stream.
inputStream.on('data', (inputSegment) => {
    // Append the newly received data segment to our overall data accumulator.
    rawDataAccumulator += inputSegment;
});

// Event handler for when the input stream signals that no more data will be received (end of file).
inputStream.on('end', () => {
    // Execute the core processing logic once all input data has been gathered.
    processCompleteInput(rawDataAccumulator);
});

// Optional: Add an error handler for the input stream to catch any potential issues.
inputStream.on('error', (streamError) => {
    console.error(`An error occurred on the input stream: ${streamError.message}`);
    // Depending on the application, one might choose to exit the process here.
    process.exit(1);
});

/**
 * Main function to process the entire accumulated input string.
 * This function encapsulates the core business logic of the program.
 * @param {string} fullInputData - The complete string of data received from standard input.
 */
const processCompleteInput = (fullInputData) => {
    // Split the full input data into individual lines, filtering out any blank lines.
    const individualInputLines = fullInputData.split('\n').filter(line => line.trim() !== '');

    // --- Input Validation: Check for minimal input ---
    if (individualInputLines.length === 0) {
        console.error("Error: No data lines were provided for processing.");
        return; // Exit if no meaningful input.
    }

    // Parse the first line, which is expected to contain matrix dimensions (rows and columns).
    const dimensionDescriptors = parseNumericLine(individualInputLines[0]);

    // --- Input Validation: Check for sufficient dimension data ---
    if (dimensionDescriptors.length < 2) {
        console.error("Error: First line must specify at least two dimension values (rows and columns).");
        return; // Exit if dimension data is incomplete.
    }

    const expectedNumberOfRows = dimensionDescriptors[0]; // The number of rows declared in the input.
    const requiredNumberOfColumns = dimensionDescriptors[1]; // The number of columns declared in the input.

    // Initialize an array to store the sum for each column and a grand total of all elements.
    // The last element of this array will hold the grand total.
    const columnWiseAggregates = Array.from({ length: requiredNumberOfColumns + 1 }, () => 0);

    const finalOutputLines = []; // Array to collect all formatted output strings.

    // Iterate through the input lines, starting from the second line (index 1),
    // as these contain the actual numeric data rows.
    for (let currentLineIndex = 1; currentLineIndex < individualInputLines.length; currentLineIndex++) {
        const lineContent = individualInputLines[currentLineIndex];
        const rowNumericElements = parseNumericLine(lineContent);

        // --- Optional Validation: Check if row element count matches expected columns ---
        if (rowNumericElements.length !== requiredNumberOfColumns) {
            console.warn(`Warning: Data row ${currentLineIndex} has ${rowNumericElements.length} elements, but ${requiredNumberOfColumns} columns were expected.`);
            // For robustness, we will process as many elements as available up to required columns.
        }

        let currentRowsRunningSum = 0; // Accumulator for the sum of elements in the current row.
        const formattedRowForOutput = []; // Holds elements of current row plus its sum for output.

        // Process each element in the current row.
        // Use Math.min to prevent array out-of-bounds errors if a row has fewer elements than expected.
        for (let colPosition = 0; colPosition < Math.min(requiredNumberOfColumns, rowNumericElements.length); colPosition++) {
            const elementValue = rowNumericElements[colPosition];
            currentRowsRunningSum += elementValue; // Add to the sum for this row.
            columnWiseAggregates[colPosition] += elementValue; // Add to the sum for its respective column.
            formattedRowForOutput.push(elementValue); // Store the element for final row output.
        }
        
        // Add the current row's sum to the grand total position in column-wise aggregates.
        columnWiseAggregates[requiredNumberOfColumns] += currentRowsRunningSum;
        
        // Append the calculated row sum to the elements of the current row for output.
        formattedRowForOutput.push(currentRowsRunningSum);
        
        // Convert the augmented row data into a space-separated string and add to the output collection.
        finalOutputLines.push(formattedRowForOutput.join(' '));
    }

    // --- Optional Validation: Check if number of processed data rows matches declared rows ---
    // (individualInputLines.length - 1) gives the actual number of data rows processed.
    if ((individualInputLines.length - 1) !== expectedNumberOfRows) {
        console.warn(`Warning: Processed ${individualInputLines.length - 1} data rows, but the input declared ${expectedNumberOfRows} rows.`);
    }

    // After processing all data rows, append the final column sums and the grand total to the output.
    finalOutputLines.push(columnWiseAggregates.join(' '));

    // Print all collected output lines, separated by newlines, to standard output.
    console.log(finalOutputLines.join('\n'));
};