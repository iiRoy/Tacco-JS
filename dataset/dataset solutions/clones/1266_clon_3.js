function processGridGenerationRequests(rawInputText) {
  // This function processes a multi-line string input to generate and print
  // alternating patterns of '#' and '.' characters, forming rectangular grids.

  // Helper function to create a single patterned row string based on width and starting character.
  const composePatternString = (targetWidth, startsWithHash) => {
    let rowChars = []; // Use an array for efficient string building.
    const firstChar = startsWithHash ? '#' : '.';
    const secondChar = startsWithHash ? '.' : '#';

    for (let charIdx = 0; charIdx < targetWidth; charIdx++) {
      // Alternate characters based on index parity.
      rowChars.push(charIdx % 2 === 0 ? firstChar : secondChar);
    }
    return rowChars.join(''); // Join array elements to form the final string.
  };

  // --- Input Processing and Main Loop ---

  // Normalize input: trim overall whitespace and split into individual request lines.
  // Filter out any completely empty lines that might result from splitting.
  const allRequestLines = rawInputText.trim().split('\n').filter(line => line.trim().length > 0);

  let currentRequestIndex = 0; // Tracks the current line being processed.
  let shouldContinueProcessing = true; // Flag to control the main processing loop.
  const overallOutputBuffer = []; // Accumulates all generated grid outputs.

  // Iterate through each line of input until an exit condition is met
  // or all lines have been processed.
  while (shouldContinueProcessing && currentRequestIndex < allRequestLines.length) {
    const currentInputLine = allRequestLines[currentRequestIndex];
    currentRequestIndex++; // Advance to the next line for the subsequent iteration.

    // Split the current line by space to get dimension components.
    const dimensionComponents = currentInputLine.split(' ');

    // Attempt to parse height and width values.
    // Using parseInt for explicit integer conversion.
    const requestedHeight = parseInt(dimensionComponents[0], 10);
    const requestedWidth = parseInt(dimensionComponents[1], 10);

    // --- Validation and Exit Condition ---
    // Check for the termination signal (0 0).
    if (requestedHeight === 0 && requestedWidth === 0) {
      shouldContinueProcessing = false; // Set flag to exit the loop.
      continue; // Skip further processing for this line.
    }

    // Basic validation for parsed dimensions.
    // If dimensions are invalid or non-positive (but not 0 0 exit), skip this request.
    if (isNaN(requestedHeight) || isNaN(requestedWidth) || requestedHeight < 0 || requestedWidth < 0) {
      // In a real-world scenario, one might log an error or throw an exception.
      // For this problem, we'll just skip malformed input.
      continue;
    }

    // --- Grid Pattern Generation ---
    // Generate the two base pattern strings for the current width.
    const patternStartingWithHash = composePatternString(requestedWidth, true);  // e.g., "#.#."
    const patternStartingWithDot  = composePatternString(requestedWidth, false); // e.g., ".#.#"

    const currentGridLines = []; // Buffer to hold lines for the current grid.

    // Loop to build the grid row by row.
    for (let rowIterator = 0; rowIterator < requestedHeight; rowIterator++) {
      // Alternate between the two pattern strings based on the row index parity.
      if (rowIterator % 2 === 0) {
        currentGridLines.push(patternStartingWithHash);
      } else {
        currentGridLines.push(patternStartingWithDot);
      }
    }

    // Add the generated grid lines to the overall output buffer.
    // Each grid is followed by an empty line for separation,
    // which is a common requirement in such pattern generation problems.
    if (currentGridLines.length > 0) {
      overallOutputBuffer.push(currentGridLines.join('\n'));
      overallOutputBuffer.push(''); // Add an empty line for separation.
    } else if (requestedHeight === 0 && requestedWidth > 0) {
      // Handle case where height is 0, but width is positive.
      // The original code would print an empty block and then a newline.
      // We'll just add an empty line if no grid content was generated.
      overallOutputBuffer.push('');
    }
  }

  // --- Final Output ---
  // Join all accumulated grid outputs and empty separators, then print to console.
  // The last empty string might result in an extra newline at the very end,
  // which is consistent with the original code's behavior of `console.log()` after each block.
  console.log(overallOutputBuffer.join('\n'));
}

// --- Execution Entry Point ---
// Reads input from standard input and passes it to the processing function.
const fsModule = require("fs"); // Node.js file system module.
const stdInputContent = fsModule.readFileSync("/dev/stdin", "utf8");
processGridGenerationRequests(stdInputContent); // Call the main processing function.