'use strict';

// This module encapsulates the game logic to determine the winner based on a dynamic programming approach.
// The game involves taking steps (moves) from a set of available options, aiming for a target goal.
// The core logic is a backward DP, where states are determined from higher indices down to zero.
function analyzeGameProgression(gameInputString) {

    /**
     * Parses the raw input string into structured game parameters.
     * The input format is expected to be: "N K A1 A2 ... AN"
     * where N is the count of available moves, K is the target goal,
     * and A1...AN are the individual move sizes.
     * @param {string} rawData - The raw input string from stdin.
     * @returns {{totalMoveOptions: number, targetGoal: number, allowedSteps: number[]}} - Parsed game data.
     */
    const parseGameConfiguration = (rawData) => {
        // Normalize whitespace, split into tokens, and convert each token to a number.
        const numericTokens = rawData.trim().split(/\s+/).map(Number);

        // Extract the total number of distinct move options (N).
        const moveOptionQuantity = numericTokens.shift();

        // Extract the primary target value or game limit (K).
        const gameEndTarget = numericTokens.shift();

        // The remaining tokens constitute the array of allowed steps (A).
        const possibleMoves = numericTokens;

        return {
            totalMoveOptions: moveOptionQuantity,
            targetGoal: gameEndTarget,
            allowedSteps: possibleMoves
        };
    };

    // Parse the input string to get the game's configuration.
    const { totalMoveOptions, targetGoal, allowedSteps } = parseGameConfiguration(gameInputString);

    // --- Input Validation and Edge Cases ---
    // If there are no allowed steps, no player can ever make a move,
    // so the second player (who never gets a turn) is effectively the "winner" by default.
    if (!allowedSteps || allowedSteps.length === 0 || targetGoal < 0) {
        console.log('Second');
        return;
    }

    // A crucial value derived from the first element of the allowedSteps array.
    // In this specific game variant, allowedSteps[0] plays a special role as a limit in one of the loops.
    const firstAvailableMove = allowedSteps[0];

    // Initialize a dynamic programming array to store the winning/losing status for each game state.
    // The array is sized `targetGoal + 2` to allow for indexing up to `targetGoal + 1`.
    // `null` signifies an undetermined state, `true` for a winning state, `false` for a losing state.
    const gamePositionOutcomes = new Array(targetGoal + 2).fill(null);

    // --- Base Case Initialization ---
    // The state immediately beyond the target goal is considered a winning state for the current player.
    // This is a common pattern in games where reaching or exceeding a target signifies a win.
    gamePositionOutcomes[targetGoal + 1] = true;

    // --- Dynamic Programming Iteration (Backward DP) ---
    // Iterate downwards from `targetGoal + 1` to `firstAvailableMove`.
    // Each `currentPosition` represents a specific game state (e.g., number of items remaining or collected).
    for (let currentPosition = targetGoal + 1; currentPosition >= firstAvailableMove; currentPosition--) {

        // A control flag for a specific propagation rule.
        // This flag determines if a "forced loss" rule should be applied.
        let enableLossPropagation = true;

        // --- Special Rule Application ---
        // If the `currentPosition` is a winning state, AND the state immediately preceding it
        // (`currentPosition - 1`) is also a winning state, then the "forced loss" propagation is skipped.
        // This is a unique characteristic of this game's logic.
        if (gamePositionOutcomes[currentPosition] === true && gamePositionOutcomes[currentPosition - 1] === true) {
            enableLossPropagation = false;
        }

        // --- Winning State Logic ---
        // If the `currentPosition` is a winning state AND the `enableLossPropagation` flag is true.
        // This block attempts to mark certain preceding states as losing states.
        if (gamePositionOutcomes[currentPosition] === true && enableLossPropagation) {
            // For each step from 1 up to `firstAvailableMove`.
            // This is distinct from the general `allowedSteps` array.
            for (let stepToPrevious = 1; stepToPrevious <= firstAvailableMove; stepToPrevious++) {
                const previousGamePosition = currentPosition - stepToPrevious;

                // If the `previousGamePosition` is valid (non-negative) and its outcome is currently undetermined.
                if (previousGamePosition >= 0 && gamePositionOutcomes[previousGamePosition] === null) {
                    // Mark `previousGamePosition` as a losing state.
                    // This implies that if a player moves from `previousGamePosition` to `currentPosition` (a win),
                    // and this is the only way, then `previousGamePosition` was a losing state for them.
                    gamePositionOutcomes[previousGamePosition] = false;
                }
            }
        }

        // --- Losing/Undetermined State Logic ---
        // If the `currentPosition` is NOT a winning state (i.e., it's a losing state or still undetermined).
        // This block attempts to mark certain preceding states as winning states.
        if (gamePositionOutcomes[currentPosition] !== true) {
            // Iterate through all `allowedSteps` (all possible move options).
            for (let moveIdx = 0; moveIdx < totalMoveOptions; moveIdx++) {
                const moveSize = allowedSteps[moveIdx];
                const previousGamePosition = currentPosition - moveSize;

                // If the `previousGamePosition` is valid (non-negative).
                if (previousGamePosition >= 0) {
                    // Mark `previousGamePosition` as a winning state.
                    // This implies that if a player can move from `previousGamePosition` to `currentPosition` (a loss),
                    // then `previousGamePosition` was a winning state because they can force the opponent into a loss.
                    gamePositionOutcomes[previousGamePosition] = true;
                }
            }
        }
    }

    // --- Final Outcome Determination ---
    // The winner is determined by the outcome of state 0.
    // In many game theory problems, state 0 represents the initial state or a final state that dictates the winner.
    if (gamePositionOutcomes[0] === true) {
        console.log('First'); // The first player can win from state 0.
    } else {
        console.log('Second'); // The second player wins (or the first player loses) from state 0.
    }
}

// The entire game analysis process is initiated by reading input from standard input.
// The `require('fs').readFileSync` method is used for synchronous file reading,
// which is common in competitive programming environments for `/dev/stdin`.
analyzeGameProgression(require('fs').readFileSync('/dev/stdin', 'utf8'));