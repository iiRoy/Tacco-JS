var receivedData = ""; // Variable to accumulate all incoming data chunks.

// Begin listening for standard input.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf-8');

// Attach an event listener for 'data' events.
// Each time a chunk of data is received, append it to the 'receivedData' string.
process.stdin.on('data', function processInputData(dataSegment) {
  receivedData += dataSegment;
});

// Attach an event listener for the 'end' event.
// This function executes once all input has been received.
process.stdin.on('end', function finalizeProcessing() {
  // Split the entire received data into an array of lines.
  let allInputLines = receivedData.split("\n");

  // The first line contains the target word to search for.
  // Convert it to lowercase for case-insensitive comparison.
  const targetWord = allInputLines[0].toLowerCase();

  // Initialize a counter for the occurrences of the target word.
  let occurrenceCount = 0;

  // Start processing from the second line (index 1) of the input.
  let lineIndex = 1;

  // Loop indefinitely until an "END_OF_TEXT" marker is encountered.
  while (true) {
    // Split the current line into an array of individual words using space as a delimiter.
    let lineWords = allInputLines[lineIndex].split(" ");

    // Check if the first word of the current line is the termination marker.
    if (lineWords[0] === "END_OF_TEXT") {
      break; // Exit the loop if the end marker is found.
    }

    // Iterate through each word in the current line.
    for (let wordIndex = 0; wordIndex < lineWords.length; wordIndex++) {
      // Compare the target word with the current word from the line,
      // ensuring both are in lowercase for a case-insensitive match.
      if (targetWord === lineWords[wordIndex].toLowerCase()) {
        occurrenceCount++; // Increment the counter if a match is found.
      }
    }
    // Move to the next line for processing.
    lineIndex++;
  }

  // Output the final count of the target word occurrences to the console.
  console.log(occurrenceCount);
});
