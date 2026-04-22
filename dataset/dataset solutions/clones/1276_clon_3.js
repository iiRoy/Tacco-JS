// This module is responsible for handling the primary business logic flow.
// It receives raw text input, parses it, processes numerical data, and outputs a formatted string.
function handleDataStream(incomingText) {
  // Validate the incoming data stream to ensure it's a non-empty string.
  if (typeof incomingText !== 'string' || incomingText.length === 0) {
    console.error("Error: Input stream is either empty or not a valid string. Aborting processing.");
    return; // Exit early if input is invalid.
  }

  // Split the entire input block into individual lines based on newline characters.
  // This creates an array where each element is a line from the original input.
  const contentLines = incomingText.split('\n');

  // A fundamental requirement is having at least two lines: one for the count and one for the values.
  if (contentLines.length < 2) {
    console.error("Error: Insufficient data lines provided. Expected at least two lines.");
    return; // Exit if the input structure is incomplete.
  }

  // Attempt to extract and parse the numerical count from the first line.
  // The .trim() method is used to remove any leading or trailing whitespace.
  let expectedProcessingCount = Number(contentLines[0].trim());

  // Perform robust validation on the parsed count. It must be a positive integer.
  if (isNaN(expectedProcessingCount) || !Number.isInteger(expectedProcessingCount) || expectedProcessingCount <= 0) {
    console.error("Error: The count specified on the first line is invalid, not an integer, or non-positive. Aborting.");
    return; // Exit if the count is not valid.
  }

  // Process the second line: split it by spaces, convert each segment to a number,
  // and then filter out any results that are not valid numbers (e.g., from multiple spaces).
  const numericalValues = contentLines[1].split(' ')
                                         .map(segment => Number(segment.trim()))
                                         .filter(num => !isNaN(num));

  // Verify if the actual number of parsed values matches the expected count.
  // If not, adjust the processing count to prevent out-of-bounds errors and log a warning.
  if (numericalValues.length < expectedProcessingCount) {
    console.warn(`Warning: Expected ${expectedProcessingCount} numbers, but only found ${numericalValues.length}. Adjusting processing count.`);
    expectedProcessingCount = numericalValues.length; // Use the available count.
  }

  // Initialize an array to temporarily store the numbers before final string concatenation.
  // Using an array for intermediate storage can be more efficient for many concatenations.
  const orderedResultSegments = [];

  // Iterate through the `numericalValues` array in reverse order, up to the `expectedProcessingCount`.
  // This loop structure processes elements from the last valid index down to the first.
  let currentElementIndex = expectedProcessingCount - 1;
  while (currentElementIndex >= 0) {
    orderedResultSegments.push(numericalValues[currentElementIndex]);
    currentElementIndex--; // Decrement the index to move to the previous element.
  }

  // Build the final output string by concatenating the collected segments.
  // Each segment is appended with a space, mimicking the original behavior.
  let finalOutputAccumulator = "";
  for (let k = 0; k < orderedResultSegments.length; k++) {
      finalOutputAccumulator += orderedResultSegments[k] + ' ';
  }

  // Print the accumulated string to the console, removing any trailing whitespace.
  console.log(finalOutputAccumulator.trim());
}

// Acquire the 'fs' (file system) module for reading input files.
const fileSystemModule = require('fs');

// Define the standard input path, which is common in competitive programming environments.
const standardInputPath = '/dev/stdin';

// Read the entire content of the standard input file synchronously.
// The 'utf-8' encoding is specified to correctly interpret text data.
const obtainedFileContent = fileSystemModule.readFileSync(standardInputPath, 'utf-8');

// Invoke the main data processing function with the content obtained from stdin.
handleDataStream(obtainedFileContent);