(function processInputElements() {
  // Define constants for robust file system interaction
  const FILE_SYSTEM_MODULE = require('fs');
  const STDIN_FILE_PATH = '/dev/stdin';
  const TEXT_ENCODING_STANDARD = 'utf8';

  // Utility function to safely read content from a specified file path
  function obtainFileContent(sourcePath, encodingType) {
    try {
      return FILE_SYSTEM_MODULE.readFileSync(sourcePath, encodingType);
    } catch (readingError) {
      // Log an error if file reading fails
      console.error("Error encountered while accessing input stream:", readingError.message);
      return ''; // Return an empty string to prevent further processing issues
    }
  }

  // Retrieve the complete raw input from standard input
  const entireInputString = obtainFileContent(STDIN_FILE_PATH, TEXT_ENCODING_STANDARD);

  // Implement a guard clause for empty input
  if (!entireInputString) {
    console.log("No data detected in the input stream. Terminating analysis.");
    return;
  }

  // Split the raw input into individual lines, removing any leading/trailing whitespace
  const inputLineSegments = entireInputString.trim().split('\n');

  // Verify that there are at least two lines of input:
  // (1) the 'count' line (which we will discard as it's not strictly necessary for this logic)
  // (2) the actual data line
  if (inputLineSegments.length < 2) {
    console.log("Insufficient input lines provided. Expected a line for element count and a line for data.");
    return;
  }

  // Remove the first line from the segments array.
  // This line typically contains the count of elements, but it's not utilized in the core processing logic,
  // making its explicit removal a Type III structural change (deletion of a non-essential step).
  inputLineSegments.shift();

  // The actual numeric data is now in the first element of the remaining segments
  const numericDataLine = inputLineSegments[0];

  // Split the numeric data string by spaces to get individual string tokens
  const rawNumericTokens = numericDataLine.split(' ');

  // Convert these string tokens into an array of numbers.
  // Using a traditional loop with explicit parsing for a Type III rewrite of 'map(Number)'.
  const processedNumericValues = [];
  for (let tokenIndex = 0; tokenIndex < rawNumericTokens.length; tokenIndex++) {
    const parsedNumericValue = parseInt(rawNumericTokens[tokenIndex], 10); // Specify radix for safety
    // Only push valid numbers into the array, skipping any non-numeric tokens
    if (!isNaN(parsedNumericValue)) {
      processedNumericValues.push(parsedNumericValue);
    }
  }

  // Guard against scenarios where no valid numbers were parsed
  if (processedNumericValues.length === 0) {
    console.log("No valid numeric data found for processing. Exiting.");
    return;
  }

  // Iterate through the array of numeric values to describe each element as a node in a binary heap structure.
  // A standard 'for' loop is used here as a Type III structural change from the original 'forEach'.
  for (let currentElementIndex = 0; currentElementIndex < processedNumericValues.length; currentElementIndex++) {
    const currentElementKey = processedNumericValues[currentElementIndex];

    // Start building the output string for the current node
    let descriptiveOutputLine = `node ${currentElementIndex}: key = ${currentElementKey}, `;

    // Calculate and append parent information if it exists
    const parentElementIndex = Math.floor((currentElementIndex - 1) / 2);
    if (currentElementIndex > 0) { // Only nodes with index > 0 can have a parent in a 0-indexed array
      const parentElementKey = processedNumericValues[parentElementIndex];
      descriptiveOutputLine += `parent key = ${parentElementKey}, `;
    }

    // Calculate and append left child information if it exists
    const leftChildElementIndex = 2 * currentElementIndex + 1;
    if (leftChildElementIndex < processedNumericValues.length) {
      const leftChildElementKey = processedNumericValues[leftChildElementIndex];
      descriptiveOutputLine += `left key = ${leftChildElementKey}, `;
    }

    // Calculate and append right child information if it exists
    const rightChildElementIndex = 2 * currentElementIndex + 2;
    if (rightChildElementIndex < processedNumericValues.length) {
      const rightChildElementKey = processedNumericValues[rightChildElementIndex];
      descriptiveOutputLine += `right key = ${rightChildElementKey}, `;
    }

    // Output the constructed line for the current node
    console.log(descriptiveOutputLine);
  }

})();