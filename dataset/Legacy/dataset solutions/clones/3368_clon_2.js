process.stdin.resume(); // Ensures the standard input stream remains open.
process.stdin.setEncoding('utf8'); // Configures the input stream to use UTF-8 character encoding.

// A global variable to accumulate all incoming data chunks from standard input.
let globalInputBuffer = '';

// Attaches an event listener for 'data' events on the standard input stream.
// Each time a data chunk is received, it's appended to our buffer.
process.stdin.on('data', function(dataPortion) {
    globalInputBuffer += dataPortion; // Concatenate the new data segment.
});

// Attaches an event listener for the 'end' event on the standard input stream.
// This signifies that all input has been received.
process.stdin.on('end', function() {
    // Once input concludes, split the accumulated buffer by newline characters
    // (handling both Windows and Unix line endings) and pass the resulting
    // array of lines to our primary processing function.
    processIncomingData(globalInputBuffer.split(/\r?\n/));
});

/**
 * The core function that processes the received input lines.
 * It counts occurrences of the digit '2' within the entire input.
 * @param {Array<string>} incomingLines - An array of strings, where each string is a line from the input.
 */
function processIncomingData(incomingLines) {
  // Convert the array of lines into a single concatenated string.
  // This implicitly joins array elements with commas if they are not explicitly joined.
  let concatenatedString = incomingLines + "";

  // Use a regular expression to find all non-overlapping occurrences of the digit '2'
  // within the concatenated string. The 'g' flag ensures all matches are found.
  let digitOccurrences = concatenatedString.match(/2/g);

  // If no matches are found, the 'match' method returns null.
  // In this case, we want to treat it as an empty array to correctly report a count of zero.
  if (digitOccurrences === null) {
      digitOccurrences = [];
  }

  // Output the total number of times the digit '2' was found in the input.
  console.log(digitOccurrences.length);
}
