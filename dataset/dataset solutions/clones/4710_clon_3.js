/**
 * Executes a card game logic to determine a winner based on two numerical inputs.
 * The number 1 is treated as a special "Ace" value (14).
 * @param {string} inputStringData - The raw input string, expected to contain two space-separated numbers on the first line.
 */
function evaluateGameRound(inputStringData) {

  // This helper function adjusts the value of '1' to '14' (Ace high)
  const adjustForAceValue = (rawCardNumber) => {
    const ACE_HIGH_INCREMENT = 13; // Defines the value added to an Ace
    if (rawCardNumber === 1) {
      return rawCardNumber + ACE_HIGH_INCREMENT;
    }
    return rawCardNumber;
  };

  // Step 1: Process the raw input to isolate the numeric data
  let allInputLines = inputStringData.split('\n');
  let relevantInputLine = allInputLines[0]; // Focus only on the first line

  // Guard clause: Validate the presence of content in the primary input line
  if (!relevantInputLine || relevantInputLine.trim().length === 0) {
    console.error("Input processing error: First line of input data is empty or missing.");
    return; // Terminate execution due to invalid input structure
  }

  // Step 2: Extract individual number strings from the processed line
  let numericTokens = relevantInputLine.split(' ');

  // Guard clause: Ensure exactly two numeric tokens are provided
  if (numericTokens.length !== 2) {
    console.error(`Input processing error: Expected two numeric values, but found ${numericTokens.length}.`);
    return; // Terminate execution due to incorrect input quantity
  }

  // Step 3: Convert string tokens into integer values
  // Using parseInt with a radix for explicit base-10 conversion
  let initialValuePlayerA = parseInt(numericTokens[0], 10);
  let initialValuePlayerB = parseInt(numericTokens[1], 10);

  // Validation: Check if the parsing resulted in actual numbers
  if (isNaN(initialValuePlayerA) || isNaN(initialValuePlayerB)) {
    console.error("Input processing error: One or both provided values are not valid numbers.");
    return; // Terminate execution due to non-numeric input
  }

  // Step 4: Apply the game-specific value adjustment for 'Ace' cards
  let playerOneAdjustedScore = adjustForAceValue(initialValuePlayerA);
  let playerTwoAdjustedScore = adjustForAceValue(initialValuePlayerB);

  // Variable to hold the final outcome message
  let gameResultDescriptor = '';

  // Step 5: Determine the winner based on adjusted scores using an if-else if-else chain
  if (playerOneAdjustedScore > playerTwoAdjustedScore) {
    gameResultDescriptor = 'Alice'; // Player A has a higher score
  } else if (playerOneAdjustedScore < playerTwoAdjustedScore) {
    gameResultDescriptor = 'Bob';   // Player B has a higher score
  } else {
    gameResultDescriptor = 'Draw';  // Both players have identical scores
  }

  // Step 6: Output the determined game result
  console.log(gameResultDescriptor);
}

// Function to manage input acquisition from the standard input stream
const initiateGameSession = () => {
  try {
    // Read all data from standard input, assuming UTF-8 encoding
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Pass the acquired content to the core game logic function
    evaluateGameRound(standardInputContent);
  } catch (ioError) {
    // Handle potential errors during file system operations (e.g., file not found, permission issues)
    console.error("Input reading failure: Could not retrieve data from /dev/stdin.", ioError.message);
  }
};

// Begin the game by initiating the session and processing input
initiateGameSession();