let accumulatedInputBuffer = ''; // Buffer to collect incoming data chunks from standard input.
const inputStreamHandler = process.stdin; // Reference to the standard input stream object.

// Prepare the input stream for reading.
inputStreamHandler.resume();

// Define the character encoding for the incoming data to ensure correct interpretation.
inputStreamHandler.setEncoding('utf-8');

// Attach an event listener for 'data' events. Each time a chunk of data arrives,
// it's appended to our buffer.
inputStreamHandler.on('data', (dataSegment) => {
  accumulatedInputBuffer += dataSegment; // Concatenate the new data chunk.
});

// Attach an event listener for the 'end' event, which signifies that no more data
// will be received from the input stream. This is where the main processing logic begins.
inputStreamHandler.on('end', () => {
  const newlineDelimiter = '\n'; // Constant for separating lines.
  const valueDelimiter = ' '; // Constant for separating numerical values within a line.

  // --- Input Validation and Initial Parsing ---
  const preprocessedContent = accumulatedInputBuffer.trim(); // Remove leading/trailing whitespace.

  if (!preprocessedContent) {
    console.error("Error: Input stream concluded without providing any data.");
    process.exit(1); // Exit with a non-zero status code to indicate an error.
  }

  // Split the entire input into an array of individual lines.
  const allParsedLines = preprocessedContent.split(newlineDelimiter);

  if (allParsedLines.length === 0) {
    console.error("Error: After processing, no valid lines were found in the input.");
    process.exit(1);
  }

  // Helper function to convert a string line into an array of numbers.
  const parseLineToNumericArray = (lineText) => {
    return lineText.split(valueDelimiter).map(Number);
  };

  // --- Matrix Dimension Extraction ---
  const matrixDimensionsLine = parseLineToNumericArray(allParsedLines[0]);

  if (matrixDimensionsLine.length < 2 || isNaN(matrixDimensionsLine[0]) || isNaN(matrixDimensionsLine[1])) {
    console.error("Error: The first line must specify matrix dimensions (rows and columns) as two numbers.");
    process.exit(1);
  }

  // Use array destructuring to extract the row and column counts.
  const [expectedMatrixRows, expectedMatrixColumns] = matrixDimensionsLine;

  // Additional validation for sensible matrix dimensions.
  if (expectedMatrixRows <= 0 || expectedMatrixColumns <= 0) {
    console.warn("Warning: Specified matrix dimensions are non-positive. Results might be empty or unexpected.");
  }

  // Initialize an array to store the running totals for each column.
  // The last element will store the grand total of all numbers.
  let cumulativeColumnSums = new Array(expectedMatrixColumns + 1).fill(0);

  // An array to collect all the modified output rows, including the final column totals row.
  const finalOutputRows = [];

  // --- Processing Each Data Row of the Matrix ---
  // Iterate through the input lines, starting from the second line (index 1),
  // as the first line contains dimensions.
  for (let lineIndex = 1; lineIndex < allParsedLines.length; ++lineIndex) {
    const currentRawLine = allParsedLines[lineIndex];
    const currentNumericDataRow = parseLineToNumericArray(currentRawLine);

    // Validate if the current row has the expected number of columns.
    if (currentNumericDataRow.length !== expectedMatrixColumns) {
      console.warn(`Warning: Data row ${lineIndex} contains ${currentNumericDataRow.length} elements, but ${expectedMatrixColumns} were expected. Processing up to expected columns.`);
      // Continue processing, but only consider elements up to expectedMatrixColumns.
    }

    let currentCalculatedRowSum = 0; // Accumulator for the sum of elements in the current row.

    // Iterate through each element in the current row.
    for (let colElementIndex = 0; colElementIndex < expectedMatrixColumns; ++colElementIndex) {
      const cellValue = currentNumericDataRow[colElementIndex];

      // Ensure the cell value is a valid number before adding it to sums.
      if (typeof cellValue === 'number' && !isNaN(cellValue)) {
        currentCalculatedRowSum += cellValue; // Add to this row's sum.
        cumulativeColumnSums[colElementIndex] += cellValue; // Add to the respective column's total.
      } else {
        console.warn(`Warning: Non-numeric data encountered at row ${lineIndex}, column ${colElementIndex}. Treating as zero.`);
        // Optionally, one could skip this cell or handle it differently.
      }
    }

    // After processing all elements in the current row, update the grand total.
    // The grand total is stored in the last position of the cumulativeColumnSums array.
    cumulativeColumnSums[expectedMatrixColumns] += currentCalculatedRowSum;

    // Append the calculated row sum to the end of the current row's numeric data.
    currentNumericDataRow.push(currentCalculatedRowSum);

    // Convert the modified row (with its sum) back into a space-separated string
    // and add it to our collection of output rows.
    finalOutputRows.push(currentNumericDataRow.join(valueDelimiter));
  }

  // --- Final Output Construction ---
  // Add the row containing all column totals (and the grand total) to the output.
  finalOutputRows.push(cumulativeColumnSums.join(valueDelimiter));

  // Print all collected rows, joined by newline characters, to standard output.
  console.log(finalOutputRows.join(newlineDelimiter));
});

// Optional: Add an error handler for the input stream itself, in case of I/O issues.
inputStreamHandler.on('error', (streamError) => {
  console.error("An unrecoverable error occurred during input stream operation:", streamError.message);
  process.exit(1);
});