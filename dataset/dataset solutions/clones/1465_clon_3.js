function processCompetitionResults(inputRows) {
  // Constants defining the point values for different game outcomes.
  // These make the score calculation logic clearer and easier to modify.
  const POINTS_FOR_DRAW = 1;
  const POINTS_FOR_WIN = 3;

  // Initialize an array to hold the scores for the two participants.
  // Using an array allows for easier extension to more players if needed.
  let participantScores = [0, 0]; // Index 0 for Participant A, Index 1 for Participant B

  // A cursor to keep track of the current line being processed from the input.
  // This helps in sequentially reading game data.
  let lineCursor = 0;

  // Attempt to parse the first line of input, which should contain the total number of game rounds.
  // Using Number.parseInt for explicit base-10 conversion.
  const totalGameRounds = Number.parseInt(inputRows[lineCursor++], 10);

  // --- Input Validation Guard Clause ---
  // Ensure that the number of rounds is a valid, non-negative integer.
  // If not, log an error and exit the function gracefully.
  if (Number.isNaN(totalGameRounds) || totalGameRounds < 0) {
    console.error("Error: The first line must specify a valid non-negative integer for total game rounds.");
    return; // Terminate processing if input is invalid
  }

  // Iterate through each game round, from the first round up to the total number of rounds.
  for (let roundIndex = 0; roundIndex < totalGameRounds; roundIndex++) {
    // Check if there are enough lines remaining in the input for the current round.
    // This is a robust check to prevent 'undefined' errors if input is malformed.
    if (lineCursor >= inputRows.length) {
      console.warn(`Warning: Not enough input lines for all ${totalGameRounds} rounds. Processed ${roundIndex} rounds.`);
      break; // Exit loop if no more input lines are available
    }

    // Retrieve the line corresponding to the current game round.
    // Split the line by one or more whitespace characters to get the card values.
    const currentRoundCardsRaw = inputRows[lineCursor++].split(/\s+/);

    // --- Round Input Validation ---
    // Ensure that exactly two card values were provided for the current round.
    if (currentRoundCardsRaw.length !== 2) {
      console.warn(`Warning: Skipping round ${roundIndex + 1} due to malformed input. Expected two card values, got: ${currentRoundCardsRaw.join(',')}`);
      continue; // Skip to the next round if input is invalid for this round
    }

    // Convert the string card values to numbers for proper numerical comparison.
    // This explicitly handles cases where string comparison might yield unexpected results (e.g., "10" < "2").
    const cardValueA = Number(currentRoundCardsRaw[0]);
    const cardValueB = Number(currentRoundCardsRaw[1]);

    // --- Card Value Validation ---
    // Verify that both card values are indeed valid numbers.
    if (Number.isNaN(cardValueA) || Number.isNaN(cardValueB)) {
      console.warn(`Warning: Skipping round ${roundIndex + 1} due to non-numeric card values: ${currentRoundCardsRaw[0]}, ${currentRoundCardsRaw[1]}`);
      continue; // Skip to the next round if card values are not numbers
    }

    // Determine the outcome of the current round and award points accordingly.
    // This block uses a direct if-else if-else structure for clarity.
    if (cardValueA === cardValueB) {
      // If card values are equal, it's a draw, both participants get draw points.
      participantScores[0] += POINTS_FOR_DRAW;
      participantScores[1] += POINTS_FOR_DRAW;
    } else if (cardValueA > cardValueB) {
      // If Participant A's card is higher, Participant A gets win points.
      participantScores[0] += POINTS_FOR_WIN;
    } else { // cardValueA < cardValueB
      // Otherwise (Participant B's card is higher), Participant B gets win points.
      participantScores[1] += POINTS_FOR_WIN;
    }
  }

  // After all rounds have been processed, output the final scores for both participants.
  // Using a template literal for a clean, formatted output string.
  console.log(`${participantScores[0]} ${participantScores[1]}`);
}

// --- Standard Input Handling Mechanism ---
// This section is responsible for reading all incoming data from standard input.
// It uses Node.js 'process.stdin' event emitters to capture data chunks.

// An array to accumulate all received data buffers.
const dataSegments = [];

// Event listener for incoming data. Each time data is available, it's pushed to the array.
process.stdin.on('data', (incomingBuffer) => {
  dataSegments.push(incomingBuffer);
});

// Event listener for the end of the input stream.
// Once all data has been received, it's processed.
process.stdin.on('end', () => {
  try {
    // Concatenate all received data buffers into a single Buffer, then convert to a UTF-8 string.
    // Using Buffer.concat is generally more efficient for binary data than string concatenation.
    const fullInputString = Buffer.concat(dataSegments).toString('utf8');

    // Split the entire input string into an array of lines.
    // Using a regex /\r?\n/ handles both Unix-style (\n) and Windows-style (\r\n) line endings.
    const parsedInputLines = fullInputString.split(/\r?\n/);

    // Filter out any empty lines that might result from extra newlines at the end of input
    // or consecutive newlines. This ensures only meaningful lines are passed for processing.
    const cleanedInputLines = parsedInputLines.filter(line => line.trim() !== '');

    // --- Final Input Validation ---
    // Check if any actual lines of input remain after cleaning.
    if (cleanedInputLines.length === 0) {
      console.error("Error: No valid input data received.");
      return;
    }

    // Call the main processing function with the cleaned array of input lines.
    processCompetitionResults(cleanedInputLines);
  } catch (processingError) {
    // Catch any unexpected errors during input parsing or game processing.
    console.error("An unexpected error occurred during input processing:", processingError);
  }
});