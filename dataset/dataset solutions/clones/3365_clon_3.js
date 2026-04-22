// Function responsible for the primary data processing based on the provided input lines.
function processInputLines(receivedLines) {
  // Initialize a mutable counter for the specific digit we are tracking.
  let digitTwoOccurrences = 0;

  // Perform an initial validation check for the input structure.
  // Ensure the input array is not null/undefined, not empty, and its first element is a string.
  if (!receivedLines || receivedLines.length === 0 || typeof receivedLines[0] !== 'string') {
    // If the input is deemed invalid, log a warning and gracefully exit the function.
    console.warn('Invalid or empty input lines provided. Cannot proceed with character counting.');
    return;
  }

  // Extract the very first line from the array for detailed character inspection.
  const targetLineForAnalysis = receivedLines[0];
  // Define the specific character we intend to count within the target line.
  const characterToFind = '2';

  // Iterate through each individual character present in the designated target line.
  for (const currentCharacter of targetLineForAnalysis) {
    // Compare the current character with our predefined target character.
    if (currentCharacter === characterToFind) {
      // If a match is found, increment the occurrence counter.
      digitTwoOccurrences = digitTwoOccurrences + 1;
    }
  }

  // Output the final tally of the target digit's appearances using an informative message.
  console.info(`The specific digit "${characterToFind}" was detected ${digitTwoOccurrences} time(s) in the first line.`);
}


// A global buffer to progressively store all incoming data from the standard input stream.
let accumulatedInputDataBuffer = '';

// Activate the standard input stream to begin receiving data.
process.stdin.resume();

// Configure the encoding for the incoming standard input data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for the 'data' event on the standard input stream.
// This function is invoked whenever a new chunk of data becomes available.
process.stdin.on('data', function handleIncomingDataChunk(inputDataSegment) {
  // Append the newly received data segment to our global buffer.
  accumulatedInputDataBuffer += inputDataSegment;
});

// Attach an event listener for the 'end' event on the standard input stream.
// This function executes once all input data has been received.
process.stdin.on('end', function completeInputProcessing() {
  // Before attempting to process, verify that some data was actually accumulated.
  if (accumulatedInputDataBuffer.length === 0) {
    // If no data was received, log an error and terminate the processing flow.
    console.error('No input data was captured from the standard input stream. Exiting.');
    return;
  }

  // Split the entire accumulated buffer into an array of individual lines.
  // A regular expression is used to robustly handle both Unix-style (\n) and
  // Windows-style (\r\n) line endings, ensuring cross-platform compatibility.
  const parsedInputLines = accumulatedInputDataBuffer.split(/\r?\n/);

  // Invoke the main processing function, passing it the array of parsed input lines.
  processInputLines(parsedInputLines);
});