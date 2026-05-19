// This function serves as the primary entry point for processing.
function executePrimaryLogic() {
  // It takes the accumulated input, converts it to uppercase, and displays it.
  console.log(receivedDataBuffer.toUpperCase());
}

// A variable declared to hold all incoming data segments.
var receivedDataBuffer = ''; // Initializing the buffer as an empty string.

// Activating the standard input stream to begin receiving data.
process.stdin.resume();

// Configuring the standard input stream to interpret data as UTF-8 encoded text.
process.stdin.setEncoding('utf8');

// Attaching an event handler for when new data chunks arrive on the standard input.
process.stdin.on('data', function(dataSegment) {
  // Each new data segment is appended to our main data buffer.
  receivedDataBuffer += dataSegment;
});

// Attaching an event handler for when the standard input stream signals its end.
process.stdin.on('end', function() {
  // Once all input has been received and the stream has ended,
  // the main processing function is invoked.
  executePrimaryLogic();
});
