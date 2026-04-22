// This module provides functionality to frame textual input with a border.
// It processes raw multi-line string data to create a visual frame around its content.
function FrameProcessor(rawInputData) {
  // Define a constant for the border character, enhancing readability and maintainability.
  const BORDER_CHARACTER = '#';

  // Helper function to output a line to the console, centralizing logging operations.
  // This can be easily swapped for a different logging mechanism if needed.
  const emitFramedLine = (textToDisplay) => {
    console.log(textToDisplay);
  };

  try {
    // --- Input Validation and Initial Processing ---

    // Guard clause: Check if the provided input data is valid (a non-empty string).
    if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
      emitFramedLine("Error: The provided input data is either empty or not a valid string.");
      return; // Exit the function early if input is invalid.
    }

    // Split the entire input into individual lines.
    // Using a regular expression to handle both Windows (\r\n) and Unix (\n) newlines for robustness.
    const sourceLinesArray = rawInputData.split(/\r?\n/);

    // Guard clause: Ensure there are actual content lines after splitting.
    if (sourceLinesArray.length === 0) {
      emitFramedLine("Error: No content lines detected in the input data after splitting.");
      return;
    }

    // Extract the dimensions (height and width) from the very first line of input.
    // This line is expected to contain two space-separated numbers.
    const dimensionTokens = sourceLinesArray[0].split(' ');

    // Guard clause: Verify that enough dimension specifications were provided.
    if (dimensionTokens.length < 2) {
      emitFramedLine("Error: Incomplete dimension specification in the first line. Expected format: 'HEIGHT WIDTH'.");
      return;
    }

    // Parse integer values for desired container height and width.
    // Explicitly using radix 10 for parseInt to prevent unexpected behavior.
    const containerHeight = parseInt(dimensionTokens[0], 10);
    const containerWidth = parseInt(dimensionTokens[1], 10);

    // Validate parsed dimensions: ensure they are valid, positive numbers.
    if (isNaN(containerHeight) || containerHeight <= 0 || isNaN(containerWidth) || containerWidth <= 0) {
      emitFramedLine("Error: Invalid or non-positive height or width values provided. Please use positive integers.");
      return;
    }

    // --- Frame Construction ---

    // Calculate the total width of the horizontal border, which includes the content width
    // plus two characters for the left and right border symbols.
    const effectiveFrameWidth = containerWidth + 2;

    // Generate the repeating horizontal border string efficiently using String.prototype.repeat().
    const horizontalDivider = BORDER_CHARACTER.repeat(effectiveFrameWidth);

    // An array to buffer all lines before outputting them.
    // This allows for collecting all output and potentially modifying it before final display.
    const bufferedOutput = [];

    // Add the top border segment to our output buffer.
    bufferedOutput.push(horizontalDivider);

    // Iterate through the content lines, starting from the second line of the input data
    // (index 1, as index 0 contained dimensions).
    // The loop runs for the specified `containerHeight`, or until all available source lines
    // have been processed, whichever limit is reached first.
    const contentStartLineIndex = 1;
    const actualContentLineCount = Math.min(containerHeight, sourceLinesArray.length - contentStartLineIndex);

    for (let currentLineIndex = 0; currentLineIndex < actualContentLineCount; currentLineIndex++) {
      // Retrieve the original content for the current line.
      const originalLineContent = sourceLinesArray[contentStartLineIndex + currentLineIndex];
      
      // Ensure the content line is treated as a string (handling potential undefined/null)
      // and padded to the desired width with spaces if it's shorter.
      const formattedContent = (originalLineContent || '').padEnd(containerWidth, ' ');
      
      // Construct the framed content line using template literals and add it to the buffer.
      bufferedOutput.push(`${BORDER_CHARACTER}${formattedContent}${BORDER_CHARACTER}`);
    }

    // Add the bottom border segment to our buffer.
    bufferedOutput.push(horizontalDivider);

    // --- Final Output ---

    // Output all buffered lines sequentially using the helper function.
    bufferedOutput.forEach(line => emitFramedLine(line));

  } catch (processingError) {
    // Catch any unexpected errors that might occur during the text framing logic.
    emitFramedLine(`An unforeseen issue occurred during text framing: ${processingError.message}`);
  }
}

// --- Application Entry Point ---

// Obtain a reference to the Node.js file system module.
const fileSystemUtility = require("fs");

// Define the standard input path and the desired encoding for reading data.
const standardInputFile = "/dev/stdin";
const fileEncoding = "utf8";

// Read the raw input from standard input (typically used in competitive programming environments)
// and pass it to our main text processing function.
FrameProcessor(fileSystemUtility.readFileSync(standardInputFile, fileEncoding));