/**
 * This script processes tabular numeric data received via standard input.
 * It calculates row sums and column totals, then outputs the modified table.
 *
 * Type III Clone: Structural and semantic variations applied.
 */

// Buffer to accumulate incoming data chunks from the standard input stream.
let rawDataBuffer = '';

// Obtain a reference to the standard input stream.
const inputStream = process.stdin;

// Ensure the input stream is active and ready to emit data.
// This call explicitly switches the stream into flowing mode.
inputStream.resume();

// Configure the input stream to decode incoming bytes as UTF-8 characters.
inputStream.setEncoding('utf-8');

// Event listener for incoming data fragments.
// Each fragment is appended to our raw data buffer.
inputStream.on('data', (dataFragment) => {
  // Basic validation: ensure the fragment is a string.
  if (typeof dataFragment === 'string' && dataFragment.length > 0) {
    rawDataBuffer += dataFragment;
  }
});

// Event listener for the end of the input stream.
// This is where the primary data processing logic resides.
inputStream.on('end', () => {
  // Guard clause: If no data was received, exit early.
  if (!rawDataBuffer || rawDataBuffer.trim().length === 0) {
    console.error("Error: No input data received.");
    return;
  }

  // Split the raw buffer into individual lines.
  const inputLines = rawDataBuffer.split('\n');

  // Another guard: Ensure there's at least one line for dimensions.
  if (inputLines.length === 0) {
    console.error("Error: Input data is empty after splitting by newline.");
    return;
  }

  // Helper function to safely parse a number from a string.
  const tryParseNumber = (strValue) => {
    const parsed = Number(strValue);
    if (isNaN(parsed)) {
      // Log a warning for invalid number, but return 0 or throw an error based on desired robustness.
      // For this clone, we'll treat invalid numbers as 0 for sum calculations.
      // In a real app, this might throw or handle more gracefully.
      console.warn(`Warning: Could not parse "${strValue}" as a number. Using 0.`);
      return 0;
    }
    return parsed;
  };

  // Process the first line to extract matrix dimensions (rows and columns).
  // Split by space and map to numbers.
  const dimensionStrings = inputLines[0].split(' ');

  // Validate the dimension line structure.
  if (dimensionStrings.length < 2) {
    console.error("Error: Dimension line malformed. Expected 'R C'.");
    return;
  }

  const numRows = tryParseNumber(dimensionStrings[0]);
  const numCols = tryParseNumber(dimensionStrings[1]);

  // Further validation on dimensions.
  if (numRows <= 0 || numCols <= 0) {
    console.error(`Error: Invalid matrix dimensions: Rows=${numRows}, Cols=${numCols}. Must be positive.`);
    return;
  }

  // Initialize an array to store the aggregate totals for each column.
  // The last element will store the sum of all row sums (grand total of data).
  // Using Array.from for a cleaner initialization than a loop.
  const columnAggregateTotals = Array.from({ length: numCols + 1 }, () => 0);

  // An array to collect all the processed output lines, including the final totals.
  const processedOutputLines = [];

  // Iterate over the data lines, starting from the second line (index 1),
  // as the first line contains only dimensions.
  // We use a traditional for loop to maintain direct index control.
  for (let currentLineIndex = 1; currentLineIndex < inputLines.length; currentLineIndex++) {
    const currentLine = inputLines[currentLineIndex];

    // Skip empty lines or lines that are just whitespace.
    if (!currentLine || currentLine.trim().length === 0) {
      continue;
    }

    // Parse the numbers for the current row.
    const currentRowValues = currentLine.split(' ').map(tryParseNumber);

    // Validate that the row has the expected number of columns.
    if (currentRowValues.length !== numCols) {
        console.warn(`Warning: Row ${currentLineIndex} has ${currentRowValues.length} elements, expected ${numCols}. Skipping or truncating.`);
        // For robustness, we can truncate or pad the row. Here, we'll process up to min(actual, expected).
    }

    let currentRowSum = 0;
    const effectiveCols = Math.min(currentRowValues.length, numCols);

    // Calculate the sum for the current row and update column totals.
    for (let colIndex = 0; colIndex < effectiveCols; colIndex++) {
      const cellValue = currentRowValues[colIndex];
      currentRowSum += cellValue;
      columnAggregateTotals[colIndex] += cellValue;
    }
    
    // Add the current row's sum to the last element of the column totals array.
    columnAggregateTotals[numCols] += currentRowSum;

    // Create a new array for the current row's output, including its sum.
    // Using spread syntax for immutability and clarity.
    const currentRowOutput = [...currentRowValues.slice(0, effectiveCols), currentRowSum];
    
    // Convert the processed row (with its sum) into a space-separated string.
    processedOutputLines.push(currentRowOutput.join(' '));
  }

  // After processing all data rows, append the column aggregate totals line.
  processedOutputLines.push(columnAggregateTotals.join(' '));

  // Final guard: Ensure there's something to print.
  if (processedOutputLines.length === 0) {
    console.error("Error: No output lines generated. Check input data and processing logic.");
    return;
  }

  // Output the complete processed table to the console, with each line separated by a newline.
  console.log(processedOutputLines.join('\n'));
});