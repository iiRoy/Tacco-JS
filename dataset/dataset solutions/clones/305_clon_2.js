/*
 * This script is designed to capture and process standard input.
 */

// Ensure the standard input stream is active and ready to receive data.
process.stdin.resume();

// Configure the character encoding for the incoming data stream.
process.stdin.setEncoding('utf8');

let collectedPayload = ''; // A string variable to accumulate all received data.

// Establish an event handler for 'data' events on the input stream.
process.stdin.on(
  'data',
  function (
    incomingSegment // Parameter representing a piece of the input data.
  ) {
    collectedPayload += incomingSegment; // Concatenate the new segment to the total payload.
  }
);

// Establish an event handler for the 'end' event, signifying no more input.
process.stdin.on('end', function () {
  // Parse the entire collected payload by splitting it at space characters.
  let componentValues = collectedPayload.split(' ');

  // Perform a calculation using the first two components and output the result.
  console.log(
    componentValues[0] * componentValues[1] / 3.305785
  );
});