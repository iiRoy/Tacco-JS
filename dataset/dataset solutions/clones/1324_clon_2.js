// This file processes incoming textual stream data to count occurrences of a specific word.

let receivedDataCollection = ''; /* This variable holds all the accumulated
                                   data chunks received from the standard input. */

// Initialize the standard input stream to begin receiving data.
process.stdin.resume();

// Configure the encoding for the input stream, ensuring proper character interpretation.
process.stdin.setEncoding('utf-8');

// Attach an event listener for the 'data' event.
// This event fires whenever new data becomes available from the input stream.
process.stdin.on(
  'data',
  function (dataSegment) { // 'dataSegment' represents a portion of the incoming data.
    // Append each new data segment to the overall collection.
    receivedDataCollection += dataSegment;
  }
);
 
// Attach an event listener for the 'end' event.
// This event is triggered when the input stream has finished sending all its data.
process.stdin.on('end', function () {
  // Once all data is received, split the entire collection into individual lines
  // based on the newline character.
  receivedDataCollection = receivedDataCollection.split("\n");

  // Extract the first line of the input, which is expected to contain the word to be searched.
  // Convert this word to lowercase to enable case-insensitive matching throughout the text.
  const searchTargetWord = receivedDataCollection[0].toLowerCase();

  // Initialize a counter to keep track of how many times the target word appears.
  let matchOccurrenceCount = 0;

  // Start processing from the second line of the input (index 1),
  // as the first line was used to determine the search target word.
  let lineIterator = 1;

  // Begin an indefinite loop to iterate through the lines of the input.
  // The loop will continue until a specific termination condition is met.
  while (true) {
    // Split the current line (identified by 'lineIterator') into an array of individual
    // word fragments, using a space character as the delimiter.
    let lineWordFragments = receivedDataCollection[lineIterator].split(" ");

    // Check if the first word fragment of the current line matches the predefined
    // termination marker. This signals the end of the text to be processed.
    if (lineWordFragments[0] === "TERMINATION_MARKER") {
      break; // If the marker is found, exit the processing loop.
    }

    // Iterate through each word fragment within the current line.
    for (let fragmentIterator = 0; fragmentIterator < lineWordFragments.length; fragmentIterator++) {
      // Compare the `searchTargetWord` (which is already lowercase) with the current
      // word fragment from the line, also converted to lowercase for consistent comparison.
      if (searchTargetWord === lineWordFragments[fragmentIterator].toLowerCase()) {
        matchOccurrenceCount++; // If a match is found, increment the occurrence counter.
      }
    }
    // Move to the next line in the input collection for subsequent processing.
    lineIterator++;
  }
  // After all lines have been processed and the termination marker encountered,
  // output the final count of target word occurrences to the console.
  console.log(matchOccurrenceCount);
});