let collectedInputString = ''; // A buffer for all incoming character streams.

const standardInputFlow = process.stdin; // Reference to the standard input stream object.

standardInputFlow.resume(); // Begin the input stream processing, allowing data to flow.

standardInputFlow.setEncoding('utf-8'); // Define the character encoding for the stream data.

// Event listener for when new data chunks arrive from the input stream.
standardInputFlow.on('data', function(dataSegment) {
    collectedInputString += dataSegment; // Accumulate the received data segments into the buffer.
});

// Event listener for when the input stream has finished transmitting all its data.
standardInputFlow.on('end', function() {
    // Break down the entire accumulated input into an array of individual textual lines.
    const textualLines = collectedInputString.split('\n');

    // Process the very first line to extract the matrix dimensions (rows and columns).
    const dimensionsArray = textualLines[0].split(' ').map(Number);
    const matrixRows = dimensionsArray[0]; // Store the number of rows for the data matrix.
    const matrixColumns = dimensionsArray[1]; // Store the number of columns for the data matrix.

    // Initialize an array to store the cumulative sums for each column, plus an additional slot for the grand total.
    const columnTotalTracker = Array(matrixColumns + 1);
    // Populate the column total array with initial zero values before calculations begin.
    for (let currentColumnIndex = 0; currentColumnIndex <= matrixColumns; currentColumnIndex++) {
        columnTotalTracker[currentColumnIndex] = 0;
    }

    // Prepare an array to hold the final formatted output strings for each row and the final summary.
    const formattedResultRows = [];

    // Iterate through each subsequent line of the input, representing a data row in the matrix.
    for (let currentRowIdx = 1; currentRowIdx < textualLines.length; currentRowIdx++) {
        // Convert the current line's string elements into an array of numeric values.
        const rowNumericElements = textualLines[currentRowIdx].split(' ').map(Number);
        let currentSummation = 0; // Variable to hold the summation of values in the current row.

        // Loop through each element within the current numeric row to calculate sums.
        for (let elementPos = 0; elementPos < matrixColumns; elementPos++) {
            currentSummation += rowNumericElements[elementPos]; // Add the element's value to the current row's summation.
            columnTotalTracker[elementPos] += rowNumericElements[elementPos]; // Accumulate the element's value into its corresponding column total.
        }
        // Add the current row's total summation to the final slot of the column total tracker (grand total).
        columnTotalTracker[matrixColumns] += currentSummation;
        // Append the calculated row summation as a new element to the end of the current row's numeric elements.
        rowNumericElements.push(currentSummation);
        // Convert the modified row (now including its sum) back to a space-separated string and store it.
        formattedResultRows.push(rowNumericElements.join(' '));
    }
    // Append the final column totals array (converted to a space-separated string) to the result array.
    formattedResultRows.push(columnTotalTracker.join(' '));

    // Output all collected result rows, with each row separated by a newline character.
    console.log(formattedResultRows.join('\n'));
});