const inputOutputHandler = require('fs'); // Renamed `fs` to `inputOutputHandler` for clarity

// Determine the total size of the standard input stream.
// Note: fs.fstatSync is used for synchronous file status retrieval.
const stdinStreamSize = inputOutputHandler.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the incoming data from standard input.
// Using Buffer.alloc() for modern Node.js buffer creation.
const inputDataBuffer = Buffer.alloc(stdinStreamSize);

// Read the entire standard input stream into the allocated buffer.
// Parameters: file descriptor, buffer, offset in buffer, length to read, position in file.
const actualBytesTransferred = inputOutputHandler.readSync(
  process.stdin.fd,
  inputDataBuffer,
  0,
  stdinStreamSize,
  0
);

// Validate that some data was actually read from stdin.
if (actualBytesTransferred === 0) {
    // If no data, exit early or handle appropriately.
    // For this clone, we'll just let the subsequent code deal with empty input,
    // but a more robust system might throw an error or log.
}

// Convert the buffer content to a UTF-8 string and split it into an array of lines.
const rawInputString = inputDataBuffer.toString('utf8', 0, actualBytesTransferred);
const parsedContentLines = rawInputString.split('\n');

// Execute the primary application logic.
processInputRecords();

/**
 * Main function to process the input lines and determine the final identifier.
 * This function encapsulates the core business logic.
 */
function processInputRecords() {
  // Validate that there is at least one line of input for configuration.
  if (!parsedContentLines || parsedContentLines.length === 0) {
    console.error("Error: No input lines provided.");
    return; // Exit if no input to process.
  }

  // The first line contains global configuration parameters, N and Q.
  const configLineSegments = parsedContentLines[0].split(' ');

  // Ensure the configuration line has the expected number of parts.
  if (configLineSegments.length < 2) {
    console.error("Error: Invalid format for configuration line. Expected N and Q.");
    return;
  }

  // Parse N (total relevant entries) and Q (query value threshold) from the first line.
  // Using Number() for explicit type conversion.
  const totalRelevantEntries = Number(configLineSegments[0]);
  const queryValueThreshold = Number(configLineSegments[1]);

  // Validate parsed numerical values.
  if (isNaN(totalRelevantEntries) || isNaN(queryValueThreshold)) {
    console.error("Error: N or Q are not valid numbers.");
    return;
  }

  // Define the initial default identifier.
  let selectedIdentifier = 'kogakubu10gokan'; // Default value as specified in the original logic.

  // Iterate through the input records starting from the second line (index 1).
  // The loop runs up to 'totalRelevantEntries' times.
  for (let recordIndex = 1; recordIndex <= totalRelevantEntries; recordIndex++) {
    // Ensure the current record index is within the bounds of the parsed content.
    if (recordIndex >= parsedContentLines.length) {
      // If we run out of lines before N entries, it's an unexpected input format.
      // We'll just stop processing further.
      break;
    }

    const currentRecordLine = parsedContentLines[recordIndex];
    const currentRecordParts = currentRecordLine.split(' ');

    // Validate the structure of the current record line.
    if (currentRecordParts.length < 2) {
      console.warn(`Warning: Skipping malformed record on line ${recordIndex + 1}.`);
      continue; // Skip to the next iteration if the line is malformed.
    }

    // Parse the numeric value from the first part of the current record.
    const currentRecordNumericValue = Number(currentRecordParts[0]);

    // Check if the query value threshold is greater than the current record's numeric value.
    if (queryValueThreshold > currentRecordNumericValue) {
      // If the condition is met, we stop searching as per the problem logic.
      break;
    }

    // Otherwise, update the selected identifier with the second part of the current record.
    selectedIdentifier = currentRecordParts[1];
  }

  // Output the final determined identifier to the console.
  console.log(selectedIdentifier);
}