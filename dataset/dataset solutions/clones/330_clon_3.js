// Define global game constants for better readability and maintainability.
const GameParameters = {
  OUTS_PER_PERIOD: 3, // Represents the number of outs before a period ends
  SCORING_THRESHOLD: 4, // The base position a runner must reach to score to be removed from active runners
  SINGLE_RUN_VALUE: 1, // Points awarded for a single run
  BATTER_RUN_VALUE: 1, // Points awarded for the batter running home (e.g., in a homerun)
  INPUT_FILE_PATH: "/dev/stdin" // Standard input file path for game commands
};

// Enum-like object for action outcomes to provide clear return values.
const PlayOutcome = {
  PERIOD_CHANGE: 'period_change_signal',
  CONTINUE_GAME: 'continue_game_signal',
  INVALID_ACTION: 'invalid_action_signal'
};

/**
 * Represents the state and logic for a single match simulation.
 * @param {number|string} initialPeriods - The number of periods (innings) the match will last.
 */
const MatchState = function(initialPeriods) {
  // Input validation for the number of periods.
  let parsedPeriods = typeof initialPeriods === 'string' ? parseInt(initialPeriods, 10) : initialPeriods;
  if (isNaN(parsedPeriods) || parsedPeriods <= 0) {
      // Fallback to a default or throw an error for invalid input.
      console.error("Invalid initial periods provided. Match will default to 3 periods.");
      parsedPeriods = 3;
  }

  this.totalPeriods = parsedPeriods; // Total periods (innings) in the match
  this.currentOuts = 0; // Current number of outs accumulated across all periods
  // The maximum number of outs allowed for the entire match, which determines its conclusion.
  this.maximumOutsAllowed = this.totalPeriods * GameParameters.OUTS_PER_PERIOD;
  this.baseOccupants = []; // Array representing runners on bases (0=first base, 1=second, 2=third, 3=home plate)
  this.currentPoints = 0; // Accumulated points for the current team/round
  // The 'isChanged' flag from the original code was unused, so it has been removed.
};

/**
 * Checks if the entire match has concluded based on the total outs accumulated.
 * @returns {boolean} True if the match is over, false otherwise.
 */
MatchState.prototype.isMatchOver = function() {
  // The match concludes when the accumulated outs reach or exceed the maximum allowed.
  return this.currentOuts >= this.maximumOutsAllowed;
};

/**
 * Displays the points scored in the current period and resets the state for the next period.
 */
MatchState.prototype.summarizePeriod = function() {
  console.log(this.currentPoints); // Output the total points scored in the last completed period
  this.currentPoints = 0; // Reset points counter for the upcoming period
  this.baseOccupants = []; // Clear all runners from bases for the new period
};

/**
 * Processes a player's action command and updates the match state accordingly.
 * @param {string} playerCommand - The action taken by the player (e.g., 'HIT', 'HOMERUN', 'OUT').
 * @returns {string} An outcome signal from PlayOutcome indicating if a period change occurred.
 */
MatchState.prototype.processPlayerAction = function(playerCommand) {
  // Input validation for the command to ensure it's a valid string.
  if (typeof playerCommand !== 'string' || playerCommand.trim() === '') {
      return PlayOutcome.INVALID_ACTION;
  }

  let currentPlayResult = PlayOutcome.CONTINUE_GAME; // Default outcome for most actions

  // Use a switch statement for clear handling of different game commands.
  switch(playerCommand.toUpperCase().trim()) { // Normalize command to uppercase and trim whitespace
    case 'HIT':
      // A new batter gets on base at position 0 (representing the starting point for a runner).
      this.baseOccupants.push(0);

      // All runners currently on base, including the new batter, advance one base.
      // We create a new array for the updated positions.
      this.baseOccupants = this.baseOccupants.map(currentPosition => currentPosition + 1);

      // Check if the runner who was furthest along (now at the front of the array) has scored.
      // The original logic specifically checked and removed only the first runner if they reached home.
      if (this.baseOccupants.length > 0 && this.baseOccupants[0] >= GameParameters.SCORING_THRESHOLD) {
        this.currentPoints += GameParameters.SINGLE_RUN_VALUE; // Add one point for the scored runner
        this.baseOccupants.shift(); // Remove the scored runner from the bases
      }
      break;

    case 'HOMERUN':
      // Calculate total points: all runners currently on bases plus the batter who hit the homerun.
      const runnersCurrentlyOnBases = this.baseOccupants.length;
      this.currentPoints += runnersCurrentlyOnBases * GameParameters.SINGLE_RUN_VALUE; // Points from existing runners
      this.currentPoints += GameParameters.BATTER_RUN_VALUE; // Point for the batter hitting the homerun
      this.baseOccupants = []; // All bases are cleared after a homerun.
      break;

    case 'OUT':
      // Increment the count of outs.
      this.currentOuts++;
      // Check if the current period has concluded (e.g., 3 outs reached).
      if (this.currentOuts % GameParameters.OUTS_PER_PERIOD === 0) {
        currentPlayResult = PlayOutcome.PERIOD_CHANGE; // Signal that a period has ended
      }
      break;

    default:
      // Handle unrecognized commands. For a Type III clone, we can return a specific signal.
      currentPlayResult = PlayOutcome.INVALID_ACTION;
      break;
  }
  return currentPlayResult;
};

// --- Main Program Execution Block ---

/**
 * Helper function to read and preprocess input data from a specified file path.
 * @param {string} filePath - The path to the input file (e.g., /dev/stdin).
 * @returns {string[]} An array of commands, or an empty array if an error occurs or input is empty.
 */
const retrieveInputData = (filePath) => {
  try {
    // Read the entire file content, convert to UTF-8, remove leading/trailing whitespace, and split by new lines.
    const fileContent = require("fs").readFileSync(filePath, "utf8");
    const cleanedContent = fileContent.trim();
    // Guard clause: handle empty input file.
    if (!cleanedContent) {
        return []; // Return empty array if input is just whitespace or empty
    }
    return cleanedContent.split('\n');
  } catch (error) {
    // Log an error and terminate the process if input cannot be read.
    console.error(`Error reading input file at ${filePath}:`, error.message);
    process.exit(1); // Exit with a non-zero status code indicating an error
  }
};

// Retrieve all game commands from the standard input.
let gameCommands = retrieveInputData(GameParameters.INPUT_FILE_PATH);

// Guard clause: ensure there's enough input to start the match.
if (gameCommands.length === 0) {
    console.error("No game commands provided. Cannot start match. Exiting.");
    process.exit(1);
}

// The first line of input specifies the number of periods for the match.
const numPeriodsForMatch = gameCommands.shift(); // Remove and get the first element
const currentMatch = new MatchState(numPeriodsForMatch); // Create a new game instance

// Main game loop. Continues as long as the match has not officially concluded.
while (!currentMatch.isMatchOver()) {
  // Guard clause: handle running out of commands prematurely before the match ends.
  if (gameCommands.length === 0) {
      // If no more commands are available, the game cannot continue.
      // We can either force an end or log a warning and break.
      // For this clone, we will break the loop gracefully.
      break;
  }

  // Get the next action command from the input stream.
  const nextActionCommand = gameCommands.shift();

  // Process the command and check its outcome.
  const actionResult = currentMatch.processPlayerAction(nextActionCommand);

  // If the action resulted in a period change (e.g., 3 outs reached).
  if (actionResult === PlayOutcome.PERIOD_CHANGE) {
    currentMatch.summarizePeriod(); // Report points and reset state for the next period

    // After summarizing, it's crucial to check if the *entire match* has now concluded.
    // This ensures the loop terminates correctly if the last period ends the match.
    if (currentMatch.isMatchOver()) {
        break; // If the match is over, exit the main game loop.
    }
  }
  // No explicit 'next' action needed; the loop implicitly continues for PlayOutcome.CONTINUE_GAME.
  // PlayOutcome.INVALID_ACTION would also implicitly continue, but could be handled with a log if desired.
}