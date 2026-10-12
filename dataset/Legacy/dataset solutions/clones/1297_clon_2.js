var entryData = ''; // Storage for all incoming data from standard input.
var inputSource = process.stdin; // Reference to the standard input stream.

inputSource.resume(); // Ensure the input stream is flowing.
inputSource.setEncoding( 'utf-8' ); // Set the character encoding for the input.

// Event handler for when data chunks are received.
inputSource.on( 'data', function( dataSegment ) {
  entryData += dataSegment; // Append the new data chunk to the accumulated string.
});

// Event handler for when the input stream finishes.
inputSource.on( 'end', function() {
  // Split the entire input string into an array of lines.
  var parsedLines = entryData.split( "\n" );

  // Parse the first line to extract row and column dimensions.
  var rowColInfo = parsedLines[0].split( " " ).map( Number );
  var numRows = rowColInfo[0]; // The number of rows (though not directly used in loop bounds).
  var numCols = rowColInfo[1]; // The number of columns for data.

  // Initialize an array to hold the sum for each column, plus one for the total row sums.
  var columnTotals = Array( numCols + 1 );
  for( var idx = 0; idx < numCols + 1; idx++ ) {
    columnTotals[idx] = 0; // Set initial values to zero.
  }

  var resultLines = []; // Array to store the formatted output lines.
  var totalLines = parsedLines.length; // Total count of input lines.

  // Iterate through each data line, starting from the second line (index 1).
  for( var lineIndex = 1; lineIndex < totalLines; lineIndex++ ) {
    // Convert the current line into an array of numbers.
    var currentNumbers = parsedLines[lineIndex].split( ' ' ).map( Number );
    var rowSum = 0; // Accumulator for the sum of numbers in the current row.

    // Process each number in the current row.
    for( var colIdx = 0; colIdx < numCols; colIdx++ ) {
      rowSum += currentNumbers[colIdx]; // Add to the current row's sum.
      columnTotals[colIdx] += currentNumbers[colIdx]; // Add to the respective column's total.
    }

    columnTotals[numCols] += rowSum; // Add the current row's sum to the grand total column.
    currentNumbers.push( rowSum ); // Append the calculated row sum to the current row's numbers.
    resultLines.push( currentNumbers.join( " " ) ); // Add the formatted row to the output array.
  }

  // After processing all data rows, append the final column totals line.
  resultLines.push( columnTotals.join( " " ) );

  // Print all collected result lines, separated by newlines, to standard output.
  console.log( resultLines.join( "\n" ) );
});
