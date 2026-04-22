const systemIO = require('fs');

// Determine the byte size of the standard input stream.
// This approach is synchronous, mirroring the original's behavior.
let streamDataSize = systemIO.fstatSync(process.stdin.fd).size;

// Early exit or specialized handling for empty input is a potential enhancement,
// but for clone purposes, we proceed, allowing subsequent checks to handle it.
if (streamDataSize === 0) {
    // console.warn("Warning: Standard input stream is empty.");
    // An alternative would be to set rawInputLines to an empty array here.
}

// Allocate a memory buffer to store the incoming data from the standard input.
// Using Buffer.alloc is the modern and safer way to create buffers.
const dataBuffer = Buffer.alloc(streamDataSize);

// Synchronously read the data from standard input into the allocated buffer.
// '0' for the buffer offset and file position are standard for reading from the beginning.
let actualBytesRead = systemIO.readSync(process.stdin.fd, dataBuffer, 0, streamDataSize, 0);

// Convert the portion of the buffer containing actual data into a UTF-8 string,
// then split the string into an array of lines based on newline characters.
const rawInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Initiate the primary application logic.
processInputAndDetermineIdentifier();

/**
 * Executes the main processing flow:
 * - Parses initial configuration from the first line.
 * - Iterates through subsequent data records.
 * - Applies a comparison logic to select a final identifier.
 * - Prints the determined identifier to standard output.
 */
function processInputAndDetermineIdentifier() {
  // A local reference to the entire collection of input lines.
  const allContentLines = rawInputLines;

  // --- Input Validation and Parsing of Initial Parameters ---
  // Ensure that there is at least one line of input to parse.
  if (allContentLines.length === 0 || !allContentLines[0]) {
    console.log("Error: No valid input lines provided for processing.");
    return; // Terminate execution if no input.
  }

  // Split the very first line to extract the two main configuration numbers.
  // This line is expected to contain 'N' and 'Q' separated by a space.
  const initialConfigurationTokens = allContentLines[0].split(' ');

  // Validate the structure of the first line's parameters.
  if (initialConfigurationTokens.length < 2) {
    console.log("Error: First line is malformed; expected two space-separated numbers.");
    return; // Terminate if initial parameters are incomplete.
  }

  // Explicitly parse the string tokens into integers using Number.parseInt.
  // The radix '10' is specified for robust decimal conversion.
  const totalRecordsToExamine = Number.parseInt(initialConfigurationTokens[0], 10); // Represents 'N'
  const comparisonLimitValue = Number.parseInt(initialConfigurationTokens[1], 10); // Represents 'Q'

  // Initialize the result string with a default value.
  // This variable will hold the final identifier chosen by the logic.
  let finalSelectedLabel = 'unassigned_campus_area'; // A new default identifier.

  // --- Iterative Processing of Data Records ---
  // Loop through the data records, starting from the second line (index 1)
  // up to the number of records indicated by 'totalRecordsToExamine'.
  for (let recordIterationIndex = 1; recordIterationIndex <= totalRecordsToExamine; recordIterationIndex++) {
    // Ensure the current line being accessed actually exists in the input array.
    if (!allContentLines[recordIterationIndex]) {
        // If a line is missing, it means there are fewer records than declared.
        // We'll break here, assuming no more relevant data is available.
        // A warning message could also be logged here.
        break;
    }

    // Split the current data record line into its individual components.
    // Each record line is expected to have a number and a string.
    const currentRecordComponents = allContentLines[recordIterationIndex].split(' ');

    // Validate the structure of the current record components.
    if (currentRecordComponents.length < 2) {
        // If a record is malformed, we can choose to skip it and continue,
        // or break if malformed data invalidates further processing.
        // For this clone, we'll skip to the next iteration.
        continue;
    }

    // Parse the numeric part of the current record for comparison.
    const currentRecordNumericValue = Number.parseInt(currentRecordComponents[0], 10);

    // --- Core Comparison Logic ---
    // If the 'comparisonLimitValue' is less than or equal to the current record's numeric value,
    // then this record's label is selected.
    if (comparisonLimitValue <= currentRecordNumericValue) {
      // Update the final selected label with the string part of the current record.
      finalSelectedLabel = currentRecordComponents[1];
      // Once a matching record is found, we exit the loop early.
      break;
    }
  }

  // --- Output Result ---
  // Print the final determined identifier to the standard output.
  console.log(finalSelectedLabel);
}