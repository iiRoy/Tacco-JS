'use strict';

// Function to process and duplicate textual content from a source
function handleTextualInputDuplication(initialDataSource) {
  // Define a constant for the standard line break character
  const newLineChar = '\n';
  // Define how many times each relevant line should be replicated
  const replicationCount = 2;

  // --- Input Validation and Pre-processing (Type III Additions) ---
  // Ensure the provided data source is valid and non-empty
  if (!initialDataSource || typeof initialDataSource !== 'string' || initialDataSource.trim().length === 0) {
    // If the input is empty or invalid, output an empty line and terminate
    console.log('');
    return;
  }

  // Step 1: Clean and segment the raw input into individual lines
  const trimmedContent = initialDataSource.trim(); // Intermediate step
  const segmentedLines = trimmedContent.split(newLineChar); // Renamed variable

  // --- Core Content Extraction (Type III Update/Rewrite) ---
  // The original program discards the very first line of input.
  // We'll extract the "actionable" lines from the segmented array.
  let actionableContentSegments = [];
  // Check if there are enough lines to discard the first one
  if (segmentedLines.length > 1) {
    // Use slice to get all lines starting from the second one (index 1)
    actionableContentSegments = segmentedLines.slice(1);
  } else {
    // If there's only one line or no lines after trimming/splitting,
    // and the first line is supposed to be discarded, the result is empty.
    console.log('');
    return;
  }

  // --- Duplication Logic (Type III Update/Rewrite & Additions) ---
  // Prepare a buffer to store the duplicated lines
  let duplicatedOutputBuffer = [];

  // Add a guard clause for empty actionable content
  if (actionableContentSegments.length === 0) {
    console.log(''); // Nothing to duplicate if no actionable content
    return;
  }

  // Iterate over each segment intended for duplication
  for (const currentSegment of actionableContentSegments) {
    // Replicate the current segment 'replicationCount' times
    for (let k = 0; k < replicationCount; k++) { // Using a different loop variable 'k'
      duplicatedOutputBuffer.push(currentSegment);
    }
  }

  // --- Final Output Generation (Type II Rename & Type III Update) ---
  // Join the buffered segments back into a single string with newlines
  const finalRenderedOutput = duplicatedOutputBuffer.join(newLineChar);

  // Print the complete, processed string to standard output
  console.log(finalRenderedOutput);
}

// --- Program Entry Point and Error Handling (Type III Additions) ---
try {
  // Use intermediate constants and variables for file system operations
  const fileSystemUtility = require('fs');
  const standardInputFilePath = '/dev/stdin';
  const characterEncoding = 'utf8';

  // Read the entire content from standard input synchronously
  const rawInputPayload = fileSystemUtility.readFileSync(standardInputFilePath, characterEncoding);

  // Invoke the main processing function with the obtained payload
  handleTextualInputDuplication(rawInputPayload);
} catch (executionError) {
  // Provide more detailed error feedback in case of failure
  console.error(`An unexpected issue occurred during execution: ${executionError.message}`);
  // Exit with an error code to indicate abnormal termination
  process.exit(1);
}