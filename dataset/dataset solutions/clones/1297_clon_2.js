/* This script processes tabular numerical data from standard input.
 * It calculates row sums and column sums, then outputs the modified table. */

// A buffer to collect all incoming data chunks from the input stream.
var collectedInputContent = '';

// Obtain the standard input stream for reading.
var dataSource = process.stdin;

// Ensure the input stream is active and ready to deliver data.
dataSource.beginReading();

// Configure the stream to interpret incoming bytes as UTF-8 characters.
dataSource.configureEncoding( 'utf-8' );

// Attach an event handler to process each segment of data as it arrives.
dataSource.attachEventHandler( 'data', function( inputSegment ) {
  collectedInputContent += inputSegment; // Append the new segment to our buffer.
});

// Set up a listener for when the entire input stream has been consumed.
dataSource.attachEventHandler( 'end', function() {
  // Split the complete input string into individual lines based on newline characters.
  var incomingLines = collectedInputContent.split( "\n" );

  // Parse the first line to extract matrix dimensions (rows and columns).
  // The 'map(Number)' converts string parts to actual numbers.
  var dimensionsData = incomingLines[0].split( " " ).map( Number );

  // Extract the number of rows (though not explicitly used in calculations, it's parsed).
  var rowCountValue = dimensionsData[0];

  // Extract the number of columns, which is crucial for iteration and array sizing.
  var columnCountValue = dimensionsData[1];

  // Initialize an array to store the sum for each column, plus a grand total at the end.
  // The size is (number of columns) + 1 for the total.
  var aggregateColumnTotals = Array( columnCountValue + 1 );

  // Fill the aggregate totals array with zeros to start.
  for( var colInitIndex = 0; colInitIndex < columnCountValue + 1; colInitIndex++ ) {
    aggregateColumnTotals[colInitIndex] = 0;
  }

  // An array to accumulate all the modified output lines.
  var processedOutputLines = [];

  // Determine the total number of input lines for loop control.
  var totalInputLines = incomingLines.length;

  // Iterate through each data line, starting from the second line (index 1),
  // as the first line contains dimensions.
  for( var currentLineIdentifier = 1; currentLineIdentifier < totalInputLines; currentLineIdentifier++ ) {
    // Parse the numbers from the current line.
    var valuesInRow = incomingLines[currentLineIdentifier].split( ' ' ).map( Number );

    // Initialize a variable to store the sum of numbers in the current row.
    var currentRowSum = 0;

    // Loop through each number in the current row (up to the column count).
    for( var currentColumnIdentifier = 0; currentColumnIdentifier < columnCountValue; currentColumnIdentifier++ ) {
      currentRowSum += valuesInRow[currentColumnIdentifier]; // Add to the current row's sum.
      aggregateColumnTotals[currentColumnIdentifier] += valuesInRow[currentColumnIdentifier]; // Add to the respective column's total.
    }

    // Add the sum of the current row to the grand total column sum.
    aggregateColumnTotals[columnCountValue] += currentRowSum;

    // Append the calculated row sum to the end of the current row's values.
    valuesInRow.push( currentRowSum );

    // Convert the modified row (with its sum) back into a space-separated string
    // and add it to our collection of output lines.
    processedOutputLines.push( valuesInRow.join( " " ) );
  }

  // After processing all data rows, convert the final column totals array
  // into a space-separated string and add it as the last line of output.
  processedOutputLines.push( aggregateColumnTotals.join( " " ) );

  // Print all collected output lines, separated by newline characters, to standard output.
  console.log( processedOutputLines.join( "\n" ) );
});