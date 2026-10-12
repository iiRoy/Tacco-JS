const LINE_SEPARATOR = "\n";
const VALUE_SEPARATOR = " ";

let accumulatedInput = '';
const standardInputStream = process.stdin;

standardInputStream.resume();
standardInputStream.setEncoding('utf-8');

standardInputStream.on('data', (inputChunk) => {
  accumulatedInput += inputChunk;
});

standardInputStream.on('end', () => {
  // Helper function to parse a string line into an array of numbers
  const extractNumbersFromLine = (lineString) => lineString.split(VALUE_SEPARATOR).map(Number);

  // Helper function to format an array of numbers into a string line
  const formatNumbersIntoLine = (numberArray) => numberArray.join(VALUE_SEPARATOR);

  const allProcessedLines = accumulatedInput.split(LINE_SEPARATOR);
  const totalProcessedLineCount = allProcessedLines.length;

  // Parse the first line to get matrix dimensions
  const matrixDimensions = extractNumbersFromLine(allProcessedLines[0]);
  const matrixRows = matrixDimensions[0]; // This variable is read but not used further, preserving original behavior
  const matrixColumns = matrixDimensions[1];

  // Initialize an array to store column sums, including an extra element for the total sum of all rows
  const aggregatedColumnSums = new Array(matrixColumns + 1).fill(0);
  const finalOutputLines = [];

  // Iterate through the data lines, starting from the second line (index 1)
  for (let currentDataLineIndex = 1; currentDataLineIndex < totalProcessedLineCount; currentDataLineIndex++) {
    const numbersInCurrentRow = extractNumbersFromLine(allProcessedLines[currentDataLineIndex]);
    let currentCalculatedRowSum = 0;

    // Process each number in the current row
    for (let currentColumnPosition = 0; currentColumnPosition < matrixColumns; currentColumnPosition++) {
      const cellValue = numbersInCurrentRow[currentColumnPosition];
      currentCalculatedRowSum += cellValue;
      aggregatedColumnSums[currentColumnPosition] += cellValue; // Add to respective column total
    }

    // Add the current row's sum to the last element of aggregatedColumnSums (total of all row sums)
    aggregatedColumnSums[matrixColumns] += currentCalculatedRowSum;

    // Append the row sum to the current row's numbers and format for output
    numbersInCurrentRow.push(currentCalculatedRowSum);
    finalOutputLines.push(formatNumbersIntoLine(numbersInCurrentRow));
  }

  // Add the final row of aggregated column sums to the output
  finalOutputLines.push(formatNumbersIntoLine(aggregatedColumnSums));

  // Print all collected output lines, separated by the line separator
  console.log(finalOutputLines.join(LINE_SEPARATOR));
});
