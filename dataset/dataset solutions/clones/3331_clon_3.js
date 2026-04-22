/**
 * Analyzes a game of strategy where players take turns removing items from a pile.
 * The objective is to determine if the first player to move has a winning strategy.
 * This function uses dynamic programming to evaluate game states.
 *
 * @param {string} gameConfigurationString - The input string providing game parameters.
 *   The first line specifies the number of distinct move types and the total items in the pile.
 *   The second line lists the sizes of items that can be removed in a single turn.
 *   Example: "3 10\n1 2 3" (3 move types, 10 total items, can remove 1, 2, or 3 items).
 * @returns {string} Returns "First" if the first player wins, or "Second" if the second player wins.
 */
function GameSolver(gameConfigurationString) {
  // Robustly split the input string into individual lines and trim whitespace.
  const configurationLines = gameConfigurationString.trim().split('\n');

  // Validate that essential configuration lines are present.
  if (configurationLines.length < 2) {
    console.error("Error: Insufficient game configuration provided. Expected at least two lines.");
    return "Error: Invalid Input"; // Indicate failure due to malformed input.
  }

  // Parse the first line for the number of available move options and the target item count.
  const gameParameters = configurationLines[0].split(/\s+/).map(Number);
  const numberOfDistinctMoves = gameParameters[0];
  const finalItemCountTarget = gameParameters[1];

  // Parse the second line for the specific sizes of items that can be removed.
  const itemRemovalSizes = configurationLines[1].split(/\s+/).map(Number);

  // Perform basic input validation for game parameters.
  if (finalItemCountTarget < 0 || !Number.isInteger(finalItemCountTarget)) {
    console.error("Error: The total item count must be a non-negative integer.");
    return "Error: Invalid Target";
  }
  if (itemRemovalSizes.some(size => size <= 0 || !Number.isInteger(size))) {
    console.error("Error: All item removal sizes must be positive integers.");
    return "Error: Invalid Move Sizes";
  }
  if (itemRemovalSizes.length === 0) {
    console.error("Error: At least one item removal size must be provided.");
    return "Error: No Moves";
  }

  // Optionally warn if the declared number of moves doesn't match the actual list length.
  if (numberOfDistinctMoves !== itemRemovalSizes.length) {
    console.warn(`Warning: Declared number of distinct moves (${numberOfDistinctMoves}) does not match the actual list length (${itemRemovalSizes.length}). Proceeding with the actual list length.`);
  }

  // Sort the item removal sizes to easily identify the smallest possible move.
  // This helps in setting up the base cases for the dynamic programming table.
  itemRemovalSizes.sort((a, b) => a - b);
  const minimumRemovalSize = itemRemovalSizes[0];

  // Initialize a DP table to store the outcome for each possible item count from 0 to finalItemCountTarget.
  // `gameStatusTable[i]` will store "First" if the current player wins when `i` items remain,
  // or "Second" if the current player loses. `null` indicates an uncomputed state.
  const gameStatusTable = Array(finalItemCountTarget + 1).fill(null);

  // Establish base cases: If the number of items remaining is less than the smallest possible move,
  // the current player cannot make any move and thus loses.
  for (let currentItems = 0; currentItems < minimumRemovalSize; currentItems++) {
    gameStatusTable[currentItems] = "Second";
  }

  // Populate the DP table for all item counts from the smallest move up to the target.
  for (let currentItems = minimumRemovalSize; currentItems <= finalItemCountTarget; currentItems++) {
    let canLeadToOpponentLoss = false; // A flag to track if a winning move exists for the current player.

    // Iterate through all available item removal sizes.
    for (const removalStep of itemRemovalSizes) {
      const previousItemsCount = currentItems - removalStep;

      // Check if this move is valid (does not result in negative items)
      // and if it leads to a state where the *opponent* (who plays next) loses.
      if (previousItemsCount >= 0 && gameStatusTable[previousItemsCount] === "Second") {
        canLeadToOpponentLoss = true; // Found a move that forces the opponent to lose, so current player wins.
        break; // No need to check other moves, one winning move is sufficient.
      }
    }

    // Assign the game outcome for the current number of items.
    if (canLeadToOpponentLoss) {
      gameStatusTable[currentItems] = "First"; // Current player wins from this state.
    } else {
      gameStatusTable[currentItems] = "Second"; // Current player loses from this state (all moves lead to opponent winning).
    }
  }

  // The final result is the outcome for the total number of items specified.
  const ultimateGameOutcome = gameStatusTable[finalItemCountTarget];

  // Output the determined winner to standard output, as is common in competitive programming.
  console.log(ultimateGameOutcome);

  // Return the result for potential external usage or testing.
  return ultimateGameOutcome;
}

// Standard entry point for execution in a Node.js environment,
// typically reading input from `/dev/stdin`.
const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
GameSolver(standardInputContent);