function processInputData() {
  // Iterate through each line of the processed input.
  for (let lineIndex = 0; lineIndex < rawData.length; lineIndex++) {
    let joiCount = 0; // Initialize counter for "JOI" occurrences.
    let ioiCount = 0; // Initialize counter for "IOI" occurrences.

    const currentLine = rawData[lineIndex]; // Get the current string line.

    // Loop through the current line to find 3-character sequences.
    // The loop runs up to length - 2 to ensure a 3-character substring can be extracted.
    for (let charIndex = 0; charIndex < currentLine.length - 2; charIndex++) {
      // Extract a substring of 3 characters starting from the current position.
      const threeCharSeq = currentLine.substring(charIndex, charIndex + 3);

      // Check if the extracted sequence matches "JOI".
      if (threeCharSeq === "JOI") {
        joiCount++; // Increment the "JOI" counter.
      }
      // Otherwise, check if it matches "IOI".
      else if (threeCharSeq === "IOI") {
        ioiCount++; // Increment the "IOI" counter.
      }
    }

    // Output the total count of "JOI" for the current line.
    console.log(joiCount);
    // Output the total count of "IOI" for the current line.
    console.log(ioiCount);
  }
}

// Declare a global variable to accumulate raw input data.
let rawData = '';

// Set up standard input processing.
process.stdin.resume(); // Ensure the standard input stream stays open.
process.stdin.setEncoding('utf8'); // Specify UTF-8 encoding for incoming data.

// Event listener for when data chunks are received from standard input.
process.stdin.on('data', function(dataSegment) {
  rawData += dataSegment; // Append the received data chunk to the rawData string.
});

// Event listener for when the standard input stream ends.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of strings, using newline as a delimiter.
  rawData = rawData.split('\n');
  // Call the main processing function once all input has been received.
  processInputData();
});
