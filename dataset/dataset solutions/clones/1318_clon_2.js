let streamBuffer = ''; // Store all incoming data.
const sourceStream = process.stdin; // Obtain the standard input stream.

sourceStream.resume(); // Activate the input stream to begin receiving data.
sourceStream.setEncoding('utf8'); // Configure the encoding for the data stream.

sourceStream.on('data', (dataChunk) => { // When data arrives,
  streamBuffer += dataChunk; // Append it to our accumulating buffer.
});

sourceStream.on('end', () => { // Once the input stream concludes,
  const lines = streamBuffer.split('\n'); // Break down the buffered text into individual lines.
  const firstLineDuplicated = lines[0] + lines[0]; // Create a new string by repeating the first line.
  const patternToFind = lines[1]; // Extract the pattern from the second line.

  // Check for the presence of the pattern within the duplicated string.
  if (firstLineDuplicated.indexOf(patternToFind) === -1) {
    console.log('No'); // If the pattern is not found, output 'No'.
  } else {
    console.log('Yes'); // Otherwise, if it is found, output 'Yes'.
  }
});