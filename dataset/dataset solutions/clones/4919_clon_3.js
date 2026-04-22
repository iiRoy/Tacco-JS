// This module simulates a simplified game based on input character sequence.
// The primary goal is to calculate a cumulative score based on strategic choices.
function GameSimulator(gameDataString) {

  // --- Input Validation and Preparation ---
  // Ensure the input is a valid string, stripping leading/trailing whitespace.
  const trimmedInput = gameDataString ? String(gameDataString).trim() : '';

  // If the input is empty after trimming, there's nothing to simulate.
  if (trimmedInput.length === 0) {
    console.error("Simulation aborted: No valid game data provided.");
    return; // Exit the function gracefully.
  }

  // Convert the cleaned input string into an array of individual character actions.
  // Each character represents an action taken by the 'opponent' in a round.
  const opponentRoundActions = Array.from(trimmedInput);
  const totalGameTurns = opponentRoundActions.length;

  // --- Core Game Logic Helper Function ---
  /**
   * Determines the score awarded for a single turn based on agent's action
   * versus the opponent's action.
   * @param {string} agentAction - The action ('g' or 'p') chosen by our agent.
   * @param {string} foeAction - The action ('g' or 'p') taken by the opponent.
   * @returns {number} The score for this turn (0 for tie, -1 for loss, 1 for win).
   */
  const evaluateTurnOutcome = (agentAction, foeAction) => {
    // Using a mapping for a more declarative scoring system.
    // Keys are concatenated strings of "agentAction-foeAction".
    const scoringRules = {
      'g-g': 0,  // Agent chooses 'g', opponent chooses 'g' -> Tie
      'g-p': -1, // Agent chooses 'g', opponent chooses 'p' -> Agent loses
      'p-g': 1,  // Agent chooses 'p', opponent chooses 'g' -> Agent wins
      'p-p': 0   // Agent chooses 'p', opponent chooses 'p' -> Tie
    };

    const outcomeKey = `${agentAction}-${foeAction}`;
    // Return the score from the rules, defaulting to 0 for unexpected combinations.
    // This adds a layer of robustness.
    return scoringRules[outcomeKey] !== undefined ? scoringRules[outcomeKey] : 0;
  };

  // --- Game State Variables Initialization ---
  let finalScoreAccumulator = 0; // Accumulates points over all turns.
  let agentGoodieCount = 0;      // Tracks how many times the agent chose 'g'.
  let agentPoohCount = 0;        // Tracks how many times the agent chose 'p'.

  // --- Main Game Loop: Process Each Turn ---
  // Iterate through each character (opponent's action) in the sequence.
  for (let currentTurnIndex = 0; currentTurnIndex < totalGameTurns; currentTurnIndex++) {
    const currentFoeAction = opponentRoundActions[currentTurnIndex]; // Opponent's move for this turn.
    let agentStrategicMove;                                        // Our agent's determined move.

    // --- Validate Opponent's Action (Added Robustness) ---
    // Ensure the opponent's action is one of the expected types.
    const isValidFoeAction = currentFoeAction === 'g' || currentFoeAction === 'p';
    if (!isValidFoeAction) {
        console.warn(`Invalid opponent action '${currentFoeAction}' at turn ${currentTurnIndex}. Skipping scoring for this turn.`);
        continue; // Skip scoring for this invalid turn, but continue game.
    }

    // --- Agent's Decision-Making Logic ---
    // The agent's strategy is dynamic, attempting to balance its 'g' and 'p' choices.
    // In the very first turn, the agent always starts with 'g'.
    const isFirstTurn = currentTurnIndex === 0;
    if (isFirstTurn) {
      agentStrategicMove = 'g';
      agentGoodieCount++; // Record agent's 'g' choice.
    } else {
      // For subsequent turns, the agent checks its past choices.
      // If 'g' choices outnumber 'p' choices, the agent attempts to play 'p'.
      const hasMoreGoodies = agentGoodieCount > agentPoohCount;
      if (hasMoreGoodies) {
        agentStrategicMove = 'p';
        agentPoohCount++; // Record agent's 'p' choice.
      } else {
        // Otherwise (if 'p' choices are equal or more than 'g' choices), the agent plays 'g'.
        agentStrategicMove = 'g';
        agentGoodieCount++; // Record agent's 'g' choice.
      }
    }

    // --- Score Calculation for Current Turn ---
    // Calculate the points awarded for the current turn based on both actions.
    const turnPoints = evaluateTurnOutcome(agentStrategicMove, currentFoeAction);
    finalScoreAccumulator += turnPoints; // Add to the total score.
  }

  // --- Final Output ---
  // Display the total cumulative score achieved by the agent.
  console.log(finalScoreAccumulator);
}

// --- Program Execution Entry Point ---
// Reads input from standard input (/dev/stdin) and passes it to the simulator.
// Uses Node.js 'fs' module to read file synchronously.
GameSimulator(require("fs").readFileSync("/dev/stdin", "utf8"));