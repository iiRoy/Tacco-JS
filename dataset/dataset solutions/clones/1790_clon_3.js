'use strict'; // Enforcing strict mode for cleaner code practices

/**
 * Analyzes movement data for two entities over a specified time to determine
 * if the first entity can overtake or catch up to the second.
 *
 * @param {string} rawInputContent - A multi-line string containing initial positions,
 *                                   speeds, and the maximum allowed time.
 *                                   Expected format:
 *                                   "P1_POS P1_SPEED\nP2_POS P2_SPEED\nMAX_TIME"
 */
function processRaceOutcome(rawInputContent) {
  // Define standard messages for the final determination.
  const OUTCOME_POSITIVE = 'YES';
  const OUTCOME_NEGATIVE = 'NO';

  /**
   * Parses a single line of space-separated numeric strings into an array of numbers.
   * @param {string} lineString - The string line to parse.
   * @returns {number[]} An array of numbers.
   */
  const extractNumericValues = (lineString) => lineString.split(' ').map(strVal => Number(strVal));

  // Pre-process the raw input: trim whitespace and split into an array of lines.
  const contentLines = rawInputContent.trim().split(/\r?\n/);

  // Implement a basic validation check for the number of input lines.
  if (contentLines.length < 3) {
    console.error("Input Error: Expected at least three lines of data (Player 1, Player 2, Time).");
    console.info(OUTCOME_NEGATIVE); // Default to negative outcome on malformed input.
    return;
  }

  // Deconstruct and parse the initial positions and speeds for both players.
  // Player 1's data (chaser)
  const [playerOneInitialPosition, playerOneMovementSpeed] = extractNumericValues(contentLines[0]);
  // Player 2's data (target)
  const [playerTwoInitialPosition, playerTwoMovementSpeed] = extractNumericValues(contentLines[1]);

  // Parse the maximum duration available for the chase.
  const maximumAllowedDuration = Number(contentLines[2]);

  // Initialize the final verdict.
  let finalVerdict = OUTCOME_NEGATIVE;

  // Calculate the initial spatial separation between Player 1 and Player 2.
  // A positive value means Player 2 is ahead of Player 1.
  const initialRelativeDistance = playerTwoInitialPosition - playerOneInitialPosition;

  // --- Core Logic for Determining Catch-Up ---

  // Scenario 1: Player 1 is already at or ahead of Player 2.
  // In this case, Player 1 has effectively "caught up" or passed Player 2.
  if (initialRelativeDistance <= 0) {
    finalVerdict = OUTCOME_POSITIVE;
  } else {
    // Scenario 2: Player 2 is initially ahead of Player 1.
    // We need to check if Player 1 can close the gap.

    // Calculate the speed difference: how much faster Player 1 is than Player 2.
    // A positive value indicates Player 1 is gaining on Player 2.
    const effectiveClosingSpeed = playerOneMovementSpeed - playerTwoMovementSpeed;

    // Sub-scenario 2a: Player 1 is not gaining ground (or losing ground) on Player 2.
    // If Player 1 is slower or moves at the same speed as Player 2,
    // and Player 2 is already ahead, a catch-up is impossible.
    if (effectiveClosingSpeed <= 0) {
      finalVerdict = OUTCOME_NEGATIVE; // Explicitly set, though it's the initial value.
    } else {
      // Sub-scenario 2b: Player 1 is actively gaining on Player 2.
      // Calculate the total distance Player 1 can close within the allowed time.
      const totalDistanceClosedInTime = effectiveClosingSpeed * maximumAllowedDuration;

      // Compare the distance Player 1 can close with the initial separation.
      // If Player 1 closes more distance than the initial gap, then catch-up is successful.
      if (totalDistanceClosedInTime > initialRelativeDistance) {
        finalVerdict = OUTCOME_POSITIVE;
      }
    }
  }

  // Output the determined outcome to the console.
  console.info(finalVerdict);
}

// This section handles the execution environment, specifically for Node.js
// reading input from standard input.
// Note: 'node:fs' is the modern, explicit way to import Node.js built-in modules.
processRaceOutcome(require("node:fs").readFileSync("/dev/stdin", "utf8"));