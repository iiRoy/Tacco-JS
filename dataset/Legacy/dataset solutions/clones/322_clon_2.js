let receivedData = '';

// Begin processing standard input stream
process.stdin.resume();

// Set the character encoding for the input
process.stdin.setEncoding('utf8');

// Attach a listener for incoming data segments
process.stdin.on('data', function(dataSegment) {
  receivedData += dataSegment; // Append the current data segment to our buffer
});

// Attach a listener for the end of the input stream
process.stdin.on('end', function() {
  // Perform a string replacement operation on the collected data
  console.log(receivedData.replace('Hoshino', 'Hoshina'));
});
