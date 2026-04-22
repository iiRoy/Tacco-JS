/**
 * This module defines a function to analyze a sequence of character identifiers
 * provided via standard input, determining the count of distinct "color" identifiers.
 * The problem context implies a specific set of four characters.
 */

/**
 * Processes raw input data to count distinct predefined character identifiers.
 * The expected input format is:
 * - Line 1: Contains an integer (which is not utilized in this specific logic flow).
 * - Line 2: Contains space-separated character identifiers (e.g., "P W G Y").
 *
 * The function determines if three or four specific identifiers are present
 * in the second line of the input and outputs a corresponding descriptive string.
 *
 * @param {string} rawInputString The complete input string read from standard input.
 */
function evaluateIdentifierSequence(rawInputString) {
  // Define the immutable set of expected "color" identifiers that we are interested in counting.
  const VALID_COLOR_IDENTIFIERS = Object.freeze(["P", "W", "G", "Y"]);

  // --- Input Preprocessing and Early Validation ---

  // Clean up any leading or trailing whitespace from the entire input string.
  const processedInput = rawInputString ? rawInputString.trim() : "";

  // Guard clause: If the input is empty after trimming, we cannot proceed.
  if (!processedInput) {
    // In a production system, this might log an error or return an error code.
    // For this problem, a default output is provided.
    console.log("Four");
    return;
  }

  // Split the cleaned input string into an array of individual lines.
  const inputLines = processedInput.split('\n');

  // Guard clause: Ensure there are at least two lines as expected by the problem structure.
  if (inputLines.length < 2) {
    console.log("Four"); // Not enough data to satisfy the problem's requirements.
    return;
  }

  // --- Data Extraction ---

  // Although the first line typically contains a numerical parameter (e.g., 'N'),
  // it is explicitly ignored by the logic for counting distinct character identifiers.
  // const initialNumericParameter = parseInt(inputLines[0].split(" ")[0], 10);

  // Extract the second line, which holds the sequence of character identifiers.
  const identifierSourceLine = inputLines[1];

  // Split the identifier line by spaces to get individual tokens.
  // The filter operation removes any empty strings that might result from multiple spaces.
  const characterTokenArray = identifierSourceLine.split(' ').filter(token => token.length > 0);

  // --- Core Logic: Counting Distinct Valid Identifiers ---

  // Utilize a Set data structure to automatically handle uniqueness of found identifiers.
  const uniqueValidIdentifiersFound = new Set();

  // Iterate over each character token obtained from the input.
  // A traditional for loop is used for explicit control and readability.
  for (let i = 0; i < characterTokenArray.length; i++) {
    const currentToken = characterTokenArray[i];

    // Check if the current token is one of the predefined valid identifiers.
    // Array.prototype.includes() is efficient enough for a small array of 4 items.
    if (VALID_COLOR_IDENTIFIERS.includes(currentToken)) {
      uniqueValidIdentifiersFound.add(currentToken); // Add to the Set; duplicates are ignored.
    }
  }

  // The size of the Set directly gives us the count of distinct valid identifiers.
  const finalDistinctCount = uniqueValidIdentifiersFound.size;

  // --- Output Determination ---

  // A switch statement provides a clear and extensible way to map the count
  // to the required string output.
  let outputMessage;
  switch (finalDistinctCount) {
    case 3:
      outputMessage = "Three";
      break;
    case 4:
      outputMessage = "Four";
      break;
    // Default case handles any other counts (0, 1, 2, or >4 if logic changed)
    // and aligns with the problem's implicit "not three" means "four" structure.
    default:
      outputMessage = "Four";
      break;
  }

  // Print the determined output message to standard output.
  console.log(outputMessage);
}

// --- Application Entry Point ---

// Node.js specific code to read the entire content of standard input synchronously.
// The 'utf8' encoding ensures correct interpretation of characters.
const programInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the main processing function with the obtained input data.
evaluateIdentifierSequence(programInputData);