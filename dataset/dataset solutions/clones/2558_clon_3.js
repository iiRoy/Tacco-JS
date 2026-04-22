const processGameData = (gameInputLines) => {
  // Guard clause: Ensure the input array is valid and not empty.
  // This prevents runtime errors if the input source is unexpectedly malformed.
  if (!Array.isArray(gameInputLines) || gameInputLines.length === 0) {
    console.error("Error: No input data provided for game simulation. Exiting.");
    return;
  }

  // Extract the primary game configuration parameters from the very first line of input.
  // These define the total number of players, a critical point threshold, and the number of game rounds.
  const [playerCountString, scoreThresholdString, roundsTotalString] = gameInputLines[0].split(" ");

  // Convert the string-based configuration values into their appropriate numeric types.
  // Using parseInt with radix 10 ensures correct parsing and avoids unexpected behavior.
  const totalPlayersInGame = parseInt(playerCountString, 10);     // Original N
  const passingScoreAllowance = parseInt(scoreThresholdString, 10); // Original K
  const totalGameRounds = parseInt(roundsTotalString, 10);       // Original Q

  // Initialize a new Map object to efficiently track how many times each player
  // has been selected throughout the game rounds. This allows for quick lookups and updates.
  // Keys will be player IDs (1-indexed), values will be their respective selection counts.
  const playerSelectionActivity = new Map();

  // Iterate through each of the game rounds to record player selections.
  // The input lines corresponding to rounds start from index 1 up to totalGameRounds.
  for (let currentRound = 1; currentRound <= totalGameRounds; currentRound++) {
    // Parse the player ID who was chosen in the current round from the input line.
    const selectedPlayerIdentifier = parseInt(gameInputLines[currentRound], 10);

    // Retrieve the current selection count for this player. If the player hasn't been
    // selected before, Map.get() will return undefined, so we default it to 0.
    const existingSelectionCount = playerSelectionActivity.get(selectedPlayerIdentifier) || 0;

    // Increment the count for the selected player and update their record in the map.
    playerSelectionActivity.set(selectedPlayerIdentifier, existingSelectionCount + 1);
  }

  // Define a utility function to determine a player's final status ("Yes" or "No").
  // This encapsulates the core logic for evaluating the game's outcome condition.
  const evaluatePlayerOutcome = (inactiveRoundCount, requiredAllowance) => {
    // The condition for a "Yes" outcome is that the number of times a player was NOT
    // selected (i.e., inactive) must be strictly less than the predefined allowance.
    // This implies players who are sufficiently active (or not too inactive) pass.
    return inactiveRoundCount < requiredAllowance ? "Yes" : "No";
  };

  // Prepare an array to collect the individual outcome strings for each player.
  // This allows for a single, consolidated output at the end.
  const playerResultStatements = [];

  // Iterate through every player, from Player 1 up to totalPlayersInGame,
  // to calculate their final standing and generate their outcome message.
  for (let currentPlayerId = 1; currentPlayerId <= totalPlayersInGame; currentPlayerId++) {
    // Fetch the total number of times the current player was selected.
    // Default to 0 if the player was never selected and thus not in the map.
    const timesPlayerWasChosen = playerSelectionActivity.get(currentPlayerId) || 0;

    // Calculate the number of rounds during which this player was *not* selected.
    // This is a key metric for determining their final status.
    const roundsPlayerWasInactive = totalGameRounds - timesPlayerWasChosen;

    // Use the helper function to determine the "Yes" or "No" outcome for the current player.
    const playerFinalStatus = evaluatePlayerOutcome(roundsPlayerWasInactive, passingScoreAllowance);

    // Add the generated status message to our collection of results.
    playerResultStatements.push(playerFinalStatus);
  }

  // Output all the collected player outcome messages, with each message on a new line.
  console.log(playerResultStatements.join('\n'));
};

// --- Execution Entry Point ---
// This block handles reading the input from the standard input stream,
// processes it, and then invokes the main game processing logic.
try {
  // Utilize Node.js's 'fs' module to synchronously read the entire content
  // of standard input ('/dev/stdin') as a UTF-8 encoded string.
  const rawDataBuffer = require('fs').readFileSync('/dev/stdin', 'UTF-8');

  // Pre-process the raw input: remove any leading/trailing whitespace
  // and then split the entire string into an array of individual lines.
  const cleanedInputLines = rawDataBuffer.trim().split("\n");

  // Initiate the game simulation by passing the prepared input lines
  // to the core processing function.
  processGameData(cleanedInputLines);
} catch (executionError) {
  // If any error occurs during file reading or the initial setup,
  // log the error message to the console and exit the process with a failure code.
  console.error("An unexpected error occurred during program execution:", executionError.message);
  process.exit(1); // Indicate an abnormal termination.
}