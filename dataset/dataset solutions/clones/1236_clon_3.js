const fileSystemModule = require('fs');

// Define distinct constants for the input source and standard character encoding.
const inputSourcePath = '/dev/stdin';
const characterEncoding = 'utf8';

/**
 * A utility function to output results to the console.
 * Encapsulates the standard console.log for potential future modifications or routing.
 * @param {*} dataToPresent - The value to be displayed.
 */
const presentResult = (dataToPresent) => {
  console.log(dataToPresent);
};

let rawDataBufferContent; // Declare a variable to hold the raw file content buffer.

try {
  // Attempt to synchronously read the file content from the specified path.
  rawDataBufferContent = fileSystemModule.readFileSync(inputSourcePath, characterEncoding);
} catch (ioOperationError) {
  // If an error occurs during file reading (e.g., file not found, permissions),
  // log the error and initialize the content as an empty string to prevent further issues.
  presentResult(`Error encountered during input data acquisition: ${ioOperationError.message}`);
  rawDataBufferContent = ''; // Provide a fallback empty content.
}

// Convert the buffered content to a string, then split it into an array of lines.
// An additional filter step is included to remove any empty lines that might result
// from trailing newlines or multiple consecutive newlines in the input.
const textualLineSegments = rawDataBufferContent
  .toString()
  .split('\n')
  .filter(lineSegment => lineSegment.trim().length > 0);

// Initialize an array to store all numerically parsed values from the input.
const convertedNumericValues = [];

// Iterate over each collected textual line segment.
for (const currentLineText of textualLineSegments) {
  const trimmedSegment = currentLineText.trim(); // Trim whitespace from the current line.

  // Only attempt conversion if the trimmed line is not empty.
  if (trimmedSegment.length > 0) {
    const numericallyParsedValue = Number(trimmedSegment); // Convert the trimmed string to a number.
    convertedNumericValues.push(numericallyParsedValue); // Add the parsed number (or NaN) to the collection.
  }
}

let outputCounter = 0; // Initialize a counter to track how many items are displayed.

// Process each item in the collection of converted numeric values.
// The original code's `map` was used for side effects; `forEach` is more semantically appropriate here.
convertedNumericValues.forEach((currentDataItem) => {
  // Introduce an intermediate variable to hold the item currently being evaluated.
  // This mirrors the `var y = x;` pattern from the original but with clearer intent.
  const itemUnderScrutiny = currentDataItem;

  // This complex conditional expression is designed to be functionally equivalent
  // to the original's `x != '0 0'` when `x` is a number or NaN.
  // It effectively allows all numerical values (including 0) and NaN to pass,
  // thus maintaining the original's behavior of printing almost everything
  // that results from `map(Number)`.
  const shouldProceedWithDisplay = (
    itemUnderScrutiny !== null &&
    typeof itemUnderScrutiny !== 'undefined' &&
    (
      itemUnderScrutiny === 0 ||
      itemUnderScrutiny > 0 ||
      itemUnderScrutiny < 0 ||
      Number.isNaN(itemUnderScrutiny)
    )
  );

  if (shouldProceedWithDisplay) {
    // Store the value in a final variable before output, mirroring the original's assignment.
    const finalValueToLog = itemUnderScrutiny;
    presentResult(finalValueToLog); // Use the dedicated function for output.
    outputCounter++; // Increment the counter for each item successfully displayed.
  }
});

// An additional structural fragment: a final status report.
// presentResult(`Operation complete. Total items processed and displayed: ${outputCounter}`); // Commented out to ensure identical output to original.