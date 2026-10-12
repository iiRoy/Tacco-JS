let strInput = ''; // A string to accumulate all input data
const inputStream = process.stdin; // Reference to the standard input stream

// Begin reading from the standard input
inputStream.resume();

// Specify the character encoding for the input stream
inputStream.setEncoding('utf-8');

// Attach an event listener for incoming data chunks
inputStream.on('data', function(dataChunk) {
  // Append each received chunk to our input string
  strInput += dataChunk;
});

// Attach an event listener for when the input stream ends
inputStream.on('end', function() {
  // Split the complete input string into an array of lines
  const parsedLines = strInput.split('\n');
  const lineCount = parsedLines.length; // Determine the total number of lines

  // Parse the first line to get the row and column dimensions
  const rowColConfig = parsedLines[0].split(' ').map(Number);
  const numRows = rowColConfig[0]; // The number of rows (not directly used in calculation logic)
  const numCols = rowColConfig[1]; // The number of columns

  // Initialize an array to hold the sums for each column, plus an extra element for the total sum of all rows
  const columnSums = Array(numCols + 1);
  for (let idx = 0; idx < numCols + 1; idx++) {
    columnSums[idx] = 0; // Set initial sum for each column to zero
  }

  // An array to store the formatted output lines
  const resultLines = [];

  // Iterate through the data lines, starting from the second line (index 1)
  // The first line contains configuration, not data.
  for (let lineIdx = 1; lineIdx < lineCount; lineIdx++) {
    // Convert the current line's string of numbers into an array of actual numbers
    const currentNumbers = parsedLines[lineIdx].split(' ').map(Number);
    let rowSum = 0; // Initialize the sum for the current row

    // Process each number in the current row
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      rowSum += currentNumbers[colIdx]; // Add to the current row's sum
      columnSums[colIdx] += currentNumbers[colIdx]; // Add to the corresponding column's sum
    }

    // Add the current row's sum to the last element of the columnSums array (which accumulates all row sums)
    columnSums[numCols] += rowSum;

    // Append the calculated row sum to the end of the current row's numbers
    currentNumbers.push(rowSum);

    // Convert the modified row (with its sum) back into a space-separated string and add to our results
    resultLines.push(currentNumbers.join(' '));
  }

  // After processing all data rows, add the final row of column sums (including the grand total) to the results
  resultLines.push(columnSums.join(' '));

  // Output all collected result lines, joined by newline characters, to the console
  console.log(resultLines.join('\n'));
});
