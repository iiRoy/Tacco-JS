let receivedInput = ''; // Variable to accumulate all data read from standard input.
const inputSource = process.stdin; // Reference to the standard input stream object.

// Configure the input stream to resume reading and set its encoding.
inputSource.resume(); // Ensures the stream starts emitting data.
inputSource.setEncoding('utf-8'); // Specifies that incoming data chunks should be treated as UTF-8 strings.

// Attach an event listener for 'data' events.
// This function is called whenever a chunk of data is available from stdin.
inputSource.on('data', function(dataChunk) {
  receivedInput += dataChunk; // Append the current data chunk to the accumulated input string.
});

// Attach an event listener for the 'end' event.
// This function is called once the entire input stream has been received.
inputSource.on('end', function() {
  // Split the complete input string into an array of lines, using the newline character as a delimiter.
  const linesOfData = receivedInput.split('\n');

  // The first line of input contains the dimensions (rows and columns).
  // Split it by space and convert the parts to numbers.
  const dimensions = linesOfData[0].split(' ').map(Number);
  const numRows = dimensions[0]; // The number of rows (not directly used for iteration in this specific algorithm).
  const numCols = dimensions[1]; // The number of columns for the actual data.

  // Initialize an array to store the sum of each column.
  // It includes an extra element at the end to store the grand total of all numbers.
  const columnSums = Array(numCols + 1);
  for (let colIdx = 0; colIdx <= numCols; ++colIdx) {
    columnSums[colIdx] = 0; // Set initial sum for each column (and the grand total) to zero.
  }

  // An array to hold the processed output lines before they are printed.
  const resultLines = [];

  // Iterate through the data lines, starting from the second line (index 1),
  // as the first line contains only dimensions.
  for (let currentLineIdx = 1; currentLineIdx < linesOfData.length; ++currentLineIdx) {
    // Parse the numbers for the current row.
    const currentNumbers = linesOfData[currentLineIdx].split(' ').map(Number);
    let rowTotal = 0; // Initialize a variable to calculate the sum for the current row.

    // Iterate through the numbers in the current row (up to numCols).
    for (let colIterator = 0; colIterator < numCols; ++colIterator) {
      rowTotal += currentNumbers[colIterator]; // Add the current number to the row's total.
      columnSums[colIterator] += currentNumbers[colIterator]; // Add the current number to its respective column's total.
    }

    // After processing all numbers in the row, add the row's total to the grand total.
    // The grand total is stored in the last element of the columnSums array.
    columnSums[numCols] += rowTotal;
    // Append the calculated row total to the end of the current row's numbers.
    currentNumbers.push(rowTotal);

    // Convert the modified row (including its total) back into a space-separated string
    // and add it to the array of result lines.
    resultLines.push(currentNumbers.join(' '));
  }

  // After all data rows have been processed, convert the column sums (including grand total)
  // into a space-separated string and add it as the final line to the result.
  resultLines.push(columnSums.join(' '));

  // Print all collected result lines, joined by newline characters, to standard output.
  console.log(resultLines.join('\n'));
});
