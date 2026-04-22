'use strict';

// Define constants for game outcomes and undetermined states.
// Using explicit boolean values and null for clarity and type distinction.
const GAME_OUTCOME_WIN = true;
const GAME_OUTCOME_LOSS = false;
const GAME_OUTCOME_UNDETERMINED = null; // Replaces the string 'tbd' with a different data type.

// A utility function to parse raw string input into an array of numbers.
// This encapsulates the common input processing logic and adds basic validation.
function processRawGameData(rawTextContent) {
    if (typeof rawTextContent !== 'string' || rawTextContent.trim() === '') {
        // Guard clause for invalid or empty input.
        throw new Error("Input data for the game cannot be empty or invalid.");
    }
    // Trim whitespace, split by any sequence of whitespace, filter out empty strings, and convert to numbers.
    return rawTextContent.trim().split(/\s+/).filter(Boolean).map(Number);
}

// The core game simulation logic is wrapped in an immediately invoked function expression (IIFE).
// This pattern helps to isolate variables and functions, preventing global scope pollution.
(function(sourceInputData) {
    let parsedNumericValues;
    try {
        parsedNumericValues = processRawGameData(sourceInputData);
    } catch (dataError) {
        // Handle input parsing errors gracefully.
        console.error("Error during input processing:", dataError.message);
        return; // Exit if input is invalid.
    }

    // Extract game configuration parameters from the parsed data.
    // Renamed variables for better descriptive meaning.
    const numberOfAvailableMoves = parsedNumericValues.shift(); // Corresponds to N in the original code.
    const totalInitialStones = parsedNumericValues.shift();     // Corresponds to K in the original code.
    const allowedMoveSizes = parsedNumericValues;              // Corresponds to A in the original code.

    // Additional validation for game parameters.
    if (numberOfAvailableMoves <= 0 || totalInitialStones < 0 || allowedMoveSizes.length !== numberOfAvailableMoves) {
        console.error("Game setup error: Inconsistent move count or initial stone value.");
        return;
    }
    if (allowedMoveSizes.some(move => move <= 0)) {
        console.error("Game setup error: All move sizes must be positive.");
        return;
    }

    // Define the upper boundary for the DP table, based on the original K+1 logic.
    const maxGamePileSize = totalInitialStones + 1;
    // The smallest move size is used as a specific boundary in one of the loops.
    // This assumes allowedMoveSizes[0] holds a special significance (e.g., minimum move).
    const minimumAllowedStep = allowedMoveSizes[0];

    // Initialize the dynamic programming (DP) memoization table.
    // 'gameOutcomeMemo[i]' stores the result for a game starting with 'i' stones.
    // The array size is `maxGamePileSize + 1` to accommodate up to `maxGamePileSize`.
    const gameOutcomeMemo = new Array(maxGamePileSize + 1).fill(GAME_OUTCOME_UNDETERMINED);

    // Establish the base case for the DP.
    // If the pile size reaches `maxGamePileSize`, it is considered a winning state for the current player.
    gameOutcomeMemo[maxGamePileSize] = GAME_OUTCOME_WIN;

    // Iterate backward through possible stone counts, from the maximum down to the minimum step.
    // This iteration direction is crucial to replicate the original algorithm's behavior.
    for (let currentPileAmount = maxGamePileSize; currentPileAmount >= minimumAllowedStep; currentPileAmount--) {

        // Scenario 1: If the current `currentPileAmount` is already known to be a winning state.
        if (gameOutcomeMemo[currentPileAmount] === GAME_OUTCOME_WIN) {
            // This conditional block implements a unique optimization/rule from the original code:
            // If the current state `currentPileAmount` is a win, AND the state `currentPileAmount - 1` is ALSO a win,
            // then skip the propagation of losing states from `currentPileAmount`.
            // This is a direct re-interpretation of `if(dp[i]) if(dp[i-1]===true){ continue; }`.
            if (currentPileAmount > 0 && gameOutcomeMemo[currentPileAmount - 1] === GAME_OUTCOME_WIN) {
                continue; // Skip further processing for this currentPileAmount.
            }

            // Propagate 'GAME_OUTCOME_LOSS' to states that could lead to `currentPileAmount` via small, fixed steps.
            // The original logic used `j` from 1 up to `A[0]`.
            // This suggests that if `currentPileAmount` is a winning state, then states
            // `currentPileAmount - 1`, `currentPileAmount - 2`, ..., `currentPileAmount - minimumAllowedStep`
            // become losing states, but only if they were previously undetermined.
            for (let backwardStep = 1; backwardStep <= minimumAllowedStep; backwardStep++) {
                const previousPileAmount = currentPileAmount - backwardStep;

                // Ensure the calculated previous state is valid (non-negative).
                if (previousPileAmount >= 0) {
                    // Only update if the previous state's outcome is not yet determined.
                    if (gameOutcomeMemo[previousPileAmount] === GAME_OUTCOME_UNDETERMINED) {
                        gameOutcomeMemo[previousPileAmount] = GAME_OUTCOME_LOSS;
                    }
                }
            }
        }
        // Scenario 2: If the current `currentPileAmount` is already known to be a losing state.
        else if (gameOutcomeMemo[currentPileAmount] === GAME_OUTCOME_LOSS) {
            // Propagate 'GAME_OUTCOME_WIN' to all states that can transition to this losing state.
            // If `currentPileAmount` is a losing state, then any state `S` from which a player can move to
            // `currentPileAmount` must be a winning state for that player (as they can force their opponent into a loss).
            for (let moveIdx = 0; moveIdx < numberOfAvailableMoves; moveIdx++) {
                const currentMoveAmount = allowedMoveSizes[moveIdx];
                const previousPileAmount = currentPileAmount - currentMoveAmount;

                // Ensure the previous state is valid.
                if (previousPileAmount >= 0) {
                    // If a move leads to a losing state, the current state is a winning state.
                    // This update overrides any previous 'UNDETERMINED' or even 'LOSS' state for `previousPileAmount`.
                    gameOutcomeMemo[previousPileAmount] = GAME_OUTCOME_WIN;
                }
            }
        }
        // If `gameOutcomeMemo[currentPileAmount]` is `GAME_OUTCOME_UNDETERMINED`, neither branch is taken.
        // This state will be determined by propagations from other states.
    }

    // Determine the ultimate winner for the game starting with 0 stones.
    // If gameOutcomeMemo[0] is WIN, the first player wins.
    // Otherwise (LOSS or UNDETERMINED), the second player wins.
    if (gameOutcomeMemo[0] === GAME_OUTCOME_WIN) {
        console.log('The First player achieves victory!'); // Modified output message.
    } else {
        console.log('The Second player triumphs!');       // Modified output message.
    }

// Input is read from standard input in UTF-8 format.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

// A small, non-essential addition to demonstrate Type III changes.
// This variable does not affect the core logic but adds a new fragment.
const gameStrategyMetadata = {
    algorithmType: 'Dynamic Programming (Backward Iteration)',
    complexity: 'O(K * N)', // K is initial stones, N is number of move options.
    implementationNotes: 'Includes specific propagation rules for winning states.',
    author: 'CloneBot v3.0'
};