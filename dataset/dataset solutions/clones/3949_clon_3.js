// This module handles the primary logic for generating a visual pattern based on input parameters.

/**
 * Processes the raw text input to generate a complex character grid.
 * @param {string} incomingText The raw string input, typically from stdin or a textarea.
 */
function ProcessInputData(incomingText) {
  // Define constants for grid dimensions and characters.
  const GRID_SIDE_LENGTH = 100;
  const HALF_SIDE_LENGTH = GRID_SIDE_LENGTH / 2;
  const CHAR_DOT = '.';
  const CHAR_HASH = '#';
  const LINE_SEPARATOR = '\n';
  const ELEMENT_SEPARATOR = ' ';

  // --- Input Parsing and Validation ---
  if (!incomingText || typeof incomingText !== 'string' || incomingText.trim() === '') {
    console.error('Error: Received empty or invalid input text.');
    return; // Exit if input is bad
  }

  const lines = incomingText.split(LINE_SEPARATOR);
  if (lines.length === 0) {
    console.error('Error: Input text contains no lines.');
    return;
  }

  const firstLineTokens = lines[0].split(ELEMENT_SEPARATOR);
  if (firstLineTokens.length < 2) {
    console.error('Error: First line does not contain enough parameters.');
    return;
  }

  // Use Number() for parsing, which handles whitespace better than parseInt for this context.
  const userValueA = Number(firstLineTokens[0]);
  const userValueB = Number(firstLineTokens[1]);

  // Basic validation for parsed numbers.
  // The problem typically implies positive integers, but this adds robustness.
  if (isNaN(userValueA) || isNaN(userValueB) || userValueA < 1 || userValueB < 1) {
    console.error('Error: Invalid numerical parameters received. Must be positive integers.');
    return;
  }

  // --- Grid Initialization ---
  // A 2D array representing our display surface.
  // Using Array.from for a slightly different initialization style compared to `new Array()`.
  let displaySurface = Array.from({ length: GRID_SIDE_LENGTH }, (_, rowIndex) => {
    // Initialize the top half with dots and the bottom half with hashes.
    const initialCharacter = (rowIndex < HALF_SIDE_LENGTH) ? CHAR_DOT : CHAR_HASH;
    return Array(GRID_SIDE_LENGTH).fill(initialCharacter);
  });

  // --- Modifying the Grid based on userValueB (placing hashes in the dot region) ---
  // The original logic for `Math.round(i/50)*2` is effectively `Math.floor(i/50)*2` for non-negative `i`.
  // Using Math.floor makes the intent clearer.
  const numHashesToPlace = userValueB - 1; // Number of additional hash marks to place.
  for (let placementIndex = 0; placementIndex < numHashesToPlace; ++placementIndex) {
    // Calculate target row and column for the current hash placement.
    const targetRow = Math.floor(placementIndex / HALF_SIDE_LENGTH) * 2;
    const targetCol = (placementIndex % HALF_SIDE_LENGTH) * 2;

    // Safety check: ensure we don't attempt to write outside the designated top-half region.
    // (rows 0-49 for dots, columns 0-99). The pattern ensures this for typical constraints.
    if (targetRow < HALF_SIDE_LENGTH && targetCol < GRID_SIDE_LENGTH) {
      displaySurface[targetRow][targetCol] = CHAR_HASH;
    } else {
      // This warning indicates an edge case where userValueB might be too large,
      // exceeding the available distinct placement spots in the pattern.
      console.warn(`Warning: Attempted to place hash outside expected region for B at index ${placementIndex}.`);
    }
  }

  // --- Modifying the Grid based on userValueA (placing dots in the hash region) ---
  const numDotsToPlace = userValueA - 1; // Number of additional dot marks to place.
  for (let placementIndex = 0; placementIndex < numDotsToPlace; ++placementIndex) {
    // Rows are calculated from the bottom up, using an offset from the last row.
    const baseRowOffset = Math.floor(placementIndex / HALF_SIDE_LENGTH) * 2;
    const targetRow = (GRID_SIDE_LENGTH - 1) - baseRowOffset;
    const targetCol = (placementIndex % HALF_SIDE_LENGTH) * 2;

    // Safety check: ensure we don't attempt to write outside the designated bottom-half region.
    // (rows 50-99 for hashes, columns 0-99).
    if (targetRow >= HALF_SIDE_LENGTH && targetCol < GRID_SIDE_LENGTH) {
      displaySurface[targetRow][targetCol] = CHAR_DOT;
    } else {
      // Similar warning for userValueA exceeding pattern capacity.
      console.warn(`Warning: Attempted to place dot outside expected region for A at index ${placementIndex}.`);
    }
  }

  // --- Final Output Generation ---
  // Convert the 2D array of characters into an array of strings, then join them with newlines.
  const finalRenderedOutput = displaySurface.map(rowArray => rowArray.join(''));
  const completeOutputString = finalRenderedOutput.join(LINE_SEPARATOR);

  // Display the generated pattern to standard output.
  console.log(completeOutputString);
}

// --- Debugging utility for browser environments ---
/**
 * Initiates the pattern generation process using input from a DOM element.
 * This function is intended for interactive browser-based testing,
 * typically triggered by a button click.
 */
function initiateBrowserDebug() {
  // Attempt to retrieve the input element from the document.
  const browserInputArea = document.getElementById("input");
  if (browserInputArea && typeof browserInputArea.value === 'string') {
    ProcessInputData(browserInputArea.value);
  } else {
    console.error("Browser debug failed: Could not find element with ID 'input' or it has no value.");
  }
}

// --- Entry point for Node.js environment (e.g., competitive programming platforms) ---
// This self-invoking anonymous function handles reading from standard input
// and executing the main processing logic when run in a Node.js environment.
(function executeNodeMain() {
  // Check for Node.js specific globals to determine the environment.
  // The `process.env.NODE_ENV !== 'test'` condition is a common practice
  // to prevent automatic execution during testing frameworks.
  if (typeof require !== 'undefined' && typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin"; // Standard path for competitive programming platforms.

    try {
      const nodeInputData = fileSystemModule.readFileSync(standardInputPath, "utf8");
      ProcessInputData(nodeInputData);
    } catch (error) {
      console.error(`Failed to read from stdin: ${error.message}`);
      // Optionally, exit the process with an error code.
      // process.exit(1);
    }
  } else {
    // If not in a Node.js environment, this block is typically ignored.
    // In a browser, `initiateBrowserDebug()` would be called by a user action.
    // console.log("Not running in a standard Node.js environment. Skipping direct stdin read.");
  }
})();