'use strict';

/**
 * Processes raw text input to generate a framed grid output.
 * This function handles parsing dimensions, constructing the grid,
 * and printing the final result to the console.
 * @param {string} rawTextContent - The entire raw input string, typically from stdin.
 */
function processInputData(rawTextContent) {

  // --- Input Validation and Preprocessing ---
  // Ensure that the input content is not empty or just whitespace.
  if (!rawTextContent || rawTextContent.trim() === '') {
    console.error("Error: No input data was provided for processing.");
    return;
  }

  // Split the raw content into individual lines, filtering out any empty lines
  // that might result from extra newlines at the beginning or end of the input.
  const contentSegments = rawTextContent.split('\n').filter(segment => segment.trim() !== '');

  // Verify that at least one line (the dimension line) is present.
  if (contentSegments.length < 1) {
    console.error("Error: Input data is malformed; missing header line with dimensions.");
    return;
  }

  // --- Dimension Parsing ---
  // The first line of the input contains the grid dimensions (height and width).
  const dimensionTokens = contentSegments[0].split(' ');

  // Validate that both height and width tokens are available.
  if (dimensionTokens.length < 2) {
    console.error("Error: Header line is malformed; expected two space-separated dimensions.");
    return;
  }

  // Parse the height and width, ensuring they are valid positive integers.
  let frameRows = parseInt(dimensionTokens[0], 10);
  let frameCols = parseInt(dimensionTokens[1], 10);

  if (isNaN(frameRows) || isNaN(frameCols) || frameRows <= 0 || frameCols <= 0) {
    console.error(`Error: Invalid dimensions provided. Expected positive integers, got H=${dimensionTokens[0]}, W=${dimensionTokens[1]}.`);
    return;
  }

  // --- Output Grid Construction ---
  // Define constants for the border character and newline for clarity.
  const borderSymbol = '#';
  const lineSeparator = '\n';

  // Helper function to generate a solid horizontal border line.
  const createHorizontalBorder = (length) => borderSymbol.repeat(length);

  // An array to collect all lines of the framed output before joining them.
  const finalOutputLines = [];

  // Add the top border line. The border width is the content width + 2 (for side borders).
  finalOutputLines.push(createHorizontalBorder(frameCols + 2));

  // Iterate through the input content lines to construct the framed data rows.
  // The loop starts from index 1 of `contentSegments` because index 0 holds dimensions.
  for (let dataLineIndex = 1; dataLineIndex <= frameRows; dataLineIndex++) {
    // Check if the corresponding data line exists in the input segments.
    if (dataLineIndex < contentSegments.length) {
      const currentDataContent = contentSegments[dataLineIndex];
      // Construct the row: left border + data content + right border.
      finalOutputLines.push(borderSymbol + currentDataContent + borderSymbol);
    } else {
      // If the input doesn't provide enough content lines as specified by `frameRows`,
      // fill the missing rows with an empty framed line (spaces).
      console.warn(`Warning: Missing content for row ${dataLineIndex}. Filling with empty line.`);
      finalOutputLines.push(borderSymbol + ' '.repeat(frameCols) + borderSymbol);
    }
  }

  // Add the bottom border line, matching the top border's width.
  finalOutputLines.push(createHorizontalBorder(frameCols + 2));

  // Join all collected lines into a single string with newlines.
  const renderedGridResult = finalOutputLines.join(lineSeparator);

  // --- Display Result ---
  console.log(renderedGridResult);
}

// --- Application Entry Point ---
// This self-invoking function handles reading the input file and
// orchestrating the grid generation process.
(function initializeApplication() {
  const fsModule = require("fs");
  const stdInputPath = "/dev/stdin";

  try {
    // Read the entire content of the standard input asynchronously.
    const fileContents = fsModule.readFileSync(stdInputPath, "utf8");

    // Pass the read content to our main processing function.
    processInputData(fileContents);

  } catch (readError) {
    // If there's an error reading the file (e.g., file not found, permissions),
    // log a detailed error message.
    console.error(`Fatal Error: Unable to read input from ${stdInputPath}. Details: ${readError.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
  }
})();