function processInputData() {

  // Declare some local variables, though not all may be used in this version.
  var currentReadline, tempValA, tempValB;

  // Begin an infinite processing loop.
  for ( ; ; ) {
    // Attempt to parse the next line from the processed input array as an integer.
    // The base 10 is explicitly specified for clarity.
    numericInput = parseInt(processedLines.shift(), 10);

    // If the parsed number is zero, it's a termination signal.
    if ( numericInput === 0 ) {
      // Exit the infinite loop.
      break;
    }

    // Convert the numeric input to its base-8 string representation.
    // Then, split this string into an array of individual digit characters.
    // Map each character using a custom digit substitution scheme.
    // Finally, join the modified characters back into a single string.
    console.log(numericInput.toString(8).split('').map(function (octalDigitChar) {
      // The mapping string '01235789' provides the custom digit sequence.
      // The unary plus operator converts the character digit to its numeric equivalent
      // to be used as an index for the charAt method.
      return '01235789'.charAt(+octalDigitChar);
    }).join(''));
  }
}


// A global variable to accumulate incoming raw data chunks from standard input.
var rawDataBuffer = '';

// Begin listening for input from the standard input stream.
process.stdin.resume();

// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach a listener for 'data' events on standard input.
// Each time a chunk of data arrives, append it to the raw data buffer.
process.stdin.on('data', function(dataChunk) {
  rawDataBuffer += dataChunk;
});

// Attach a listener for the 'end' event on standard input.
// This event fires when no more data is expected.
process.stdin.on('end', function() {
  // Once all data has been received, split the entire buffer into an array of lines.
  // Each element in the 'processedLines' array will correspond to a line from the input.
  processedLines = rawDataBuffer.split('\n');
  // Call the main processing function to handle the prepared input.
  processInputData();
});