var receivedData = ''; // Initialize an empty string to accumulate input
var inputSource = process.stdin; // Get the standard input stream

// Resume the input stream to start receiving data
inputSource.resume();

// Set the encoding for the input stream to UTF-8
inputSource.setEncoding('utf-8');

// Event listener for 'data' chunks received from stdin
inputSource.on('data', function(dataSegment) {
  receivedData += dataSegment; // Append each data chunk to the accumulated string
});

// Event listener for 'end' of input stream
inputSource.on('end', function() {
  // Split the accumulated data into individual lines
  var processedLines = receivedData.split("\n");

  // Parse the first line to get row and column counts
  var rowColInfo = processedLines[0].split(" ").map(Number);
  var numRows = rowColInfo[0]; // Extract the number of rows (though not directly used later)
  var numCols = rowColInfo[1]; // Extract the number of columns

  // Initialize an array to store column totals, including a spot for the grand total
  var columnTotals = Array(numCols + 1);
  for (var idx = 0; idx < numCols + 1; idx++) {
    columnTotals[idx] = 0; // Set all initial totals to zero
  }

  var resultLines = []; // Array to store the formatted output lines

  // Iterate through the data lines, starting from the second line (index 1)
  for (var lineIndex = 1; lineIndex < processedLines.length; lineIndex++) {
    // Parse the current line into an array of numbers
    var currentNumbers = processedLines[lineIndex].split(' ').map(Number);
    var rowSum = 0; // Initialize sum for the current row

    // Loop through the numbers in the current row to calculate row sum and update column totals
    for (var colIdx = 0; colIdx < numCols; colIdx++) {
      rowSum += currentNumbers[colIdx]; // Add current number to row sum
      columnTotals[colIdx] += currentNumbers[colIdx]; // Add current number to its respective column total
    }

    columnTotals[numCols] += rowSum; // Add the current row's sum to the grand total column
    currentNumbers.push(rowSum); // Append the row sum to the end of the current row's numbers
    resultLines.push(currentNumbers.join(" ")); // Add the formatted row (with its sum) to the output array
  }

  // After processing all data rows, add the formatted column totals line to the output
  resultLines.push(columnTotals.join(" "));

  // Print all collected output lines, joined by newlines, to the console
  console.log(resultLines.join("\n"));
});
