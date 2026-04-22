// Variable to accumulate all incoming textual data.
var receivedTextualInput = '';

// Obtain the standard input stream object.
var inputStreamHandle = process.stdin;

// Ensure the input stream is active and ready to deliver data.
inputStreamHandle.resume();

// Set the character encoding for the incoming data stream.
inputStreamHandle.setEncoding( 'utf8' );

// Attach an event listener for when data chunks arrive.
inputStreamHandle.on( 'data', function ( dataPortion ) {
  receivedTextualInput += dataPortion; // Concatenate the received data piece.
} );

// Attach an event listener for when the input stream concludes.
inputStreamHandle.on( 'end', function () {
  // Split the entire received text into an array of individual lines.
  var arrayOfLines = receivedTextualInput.split( "\n" );

  // Determine the total number of lines received.
  var totalLineCount = arrayOfLines.length;

  // Parse the first line to extract the matrix dimensions (rows and columns).
  var matrixDimensions = arrayOfLines[0].split( " " ).map( Number );

  // Extract the number of rows (though not directly used in the main logic, it's parsed).
  var numRows = matrixDimensions[0];

  // Extract the number of columns, which is crucial for iteration.
  var numColumns = matrixDimensions[1];

  // Initialize an array to store the sums of each column, plus one extra for the grand total.
  var columnCumulativeSums = Array( numColumns + 1 );

  // Populate the column sum array with initial zero values.
  for ( var currentColumnIndex = 0; currentColumnIndex <= numColumns; ++currentColumnIndex ) {
    columnCumulativeSums[currentColumnIndex] = 0;
  }

  // An array to collect all the formatted output strings.
  var finalOutputLines = [];

  // Iterate through each data line, starting from the second line (index 1),
  // as the first line contained dimensions.
  for ( var lineIterator = 1; lineIterator < totalLineCount; ++lineIterator ) {
    // Parse the current line into an array of numerical values.
    var currentLineNumbers = arrayOfLines[lineIterator].split( ' ' ).map( Number );

    // Initialize a variable to store the sum of numbers in the current row.
    var currentRowTotal = 0;

    // Loop through the numbers in the current row to calculate its sum
    // and update the respective column sums.
    for ( var currentElementIndex = 0; currentElementIndex < numColumns; ++currentElementIndex ) {
      currentRowTotal += currentLineNumbers[currentElementIndex];
      columnCumulativeSums[currentElementIndex] += currentLineNumbers[currentElementIndex];
    }

    // Add the calculated row total to the last element of the column sums array
    // (which represents the grand total of all row sums).
    columnCumulativeSums[numColumns] += currentRowTotal;

    // Append the current row's total sum to its own array of numbers.
    currentLineNumbers.push( currentRowTotal );

    // Format the current row's numbers (including its sum) into a space-separated string
    // and add it to our collection of output lines.
    finalOutputLines.push( currentLineNumbers.join( " " ) );
  }

  // After processing all data rows, format the array of column cumulative sums
  // (including the grand total) into a space-separated string and add it
  // as the very last line to the output.
  finalOutputLines.push( columnCumulativeSums.join( " " ) );

  // Print all collected output lines, each separated by a newline character.
  console.log( finalOutputLines.join( "\n" ) );
} );