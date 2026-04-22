/* This module processes incoming standard input to calculate a specific numeric result. */

function computeValue(sourceElements) {
  // The core calculation: concatenate the first two string elements, then divide by two.
  // JavaScript's implicit type coercion will convert the concatenated string to a number for division.
  return (sourceElements[0] + sourceElements[1]) / 2;
}

// A buffer to accumulate all data received from standard input.
let receivedData = '';

// Begin listening for input from the standard input stream.
process.stdin.resume();
// Set the character encoding for the incoming data stream.
process.stdin.setEncoding('utf8');

// Event handler for 'data' chunks received from standard input.
process.stdin.on(
  'data',
  function (dataSegment)
  {
    /* Append the newly arrived data segment to our accumulating buffer. */
    receivedData += dataSegment;
  }
);

// Event handler for the 'end' of the standard input stream.
process.stdin.on(
  'end',
  function ()
  {
    // Once all data is received, split the entire payload by spaces.
    // This creates an array of string tokens.
    receivedData = receivedData.split(' ');

    // Invoke the primary computation function with the processed data
    // and output the final result to the console.
    console.log(computeValue(receivedData));
  }
);