'use strict';

// --- Constants for Game Logic and Messages ---
const PLAYER_ONE_WINS_MARKER = true;
const PLAYER_TWO_WINS_MARKER = false;
// Using a string literal for 'undetermined' to match the original code's truthiness behavior for 'tbd'.
// `Boolean('undetermined')` is true, similar to `Boolean('tbd')`.
const OUTCOME_UNDETERMINED = 'undetermined'; 
const FIRST_PLAYER_WINS_MESSAGE = 'First';
const SECOND_PLAYER_WINS_MESSAGE = 'Second';

/**
 * Utility function to parse raw string input into an array of integers.
 * Handles trimming whitespace and splitting by any whitespace sequence.
 * Includes a basic check for empty input, suitable for competitive programming contexts.
 *
 * @param {string} rawInputString - The raw string content read from the input source.
 * @returns {number[]} An array containing the parsed integer values.
 */
function parseNumericalInput(rawInputString) {
    // A robust check for non-empty or non-whitespace-only input.
    if (!rawInputString || rawInputString.trim().length === 0) {
        console.error("Error: Input string is empty or contains only whitespace. Cannot parse.");
        return [];
    }
    // Trim leading/trailing whitespace, split the string by one or more whitespace characters,
    // then convert each resulting substring to an integer.
    return rawInputString.trim().split(/\s+/).map(valueStr => parseInt(valueStr, 10));
}

/**
 * Core function to determine the outcome of a game using a dynamic programming approach.
 * This particular DP implementation has some unique characteristics in its state transitions,
 * especially regarding the handling of 'undetermined' states and specific optimizations.
 *
 * The game involves a pile, and players remove items. The goal is to determine if the first
 * player to move can win. The DP array `outcomeMemo` stores whether a player can win from
 * a given pile size.
 *
 * @param {number} numberOfStepOptions - The total count of distinct moves a player can make (N).
 * @param {number} gameTargetValue - The initial size of the pile or target value (K).
 * @param {number[]} availableStepSizes - An array of allowed removal amounts (A).
 * @returns {string} A message indicating whether the first or second player wins.
 */
function computeGameOutcome(numberOfStepOptions, gameTargetValue, availableStepSizes) {
    // Initialize the dynamic programming table.
    // `outcomeMemo[i]` stores the outcome for a state `i`.
    // The array is sized `gameTargetValue + 2` to accommodate indices from 0 up to `gameTargetValue + 1`.
    // All states are initially set to `OUTCOME_UNDETERMINED`.
    const outcomeMemo = new Array(gameTargetValue + 2).fill(OUTCOME_UNDETERMINED);

    // Establish a peculiar base case or an initial state for backward propagation.
    // `gameTargetValue + 1` is explicitly marked as a winning state.
    // This state acts as an anchor for the backward DP calculation.
    outcomeMemo[gameTargetValue + 1] = PLAYER_ONE_WINS_MARKER;

    // Iterate backwards through possible pile sizes, from `gameTargetValue + 1` down to `0`.
    // `currentPileState` represents the state being evaluated in the current iteration.
    for (let currentPileState = gameTargetValue + 1; currentPileState >= 0; currentPileState--) {

        // --- Branch 1: Processing for states that are currently marked as WINNING or UNDETERMINED ---
        // (Due to JS truthiness, `outcomeMemo[currentPileState]` is true if it's `PLAYER_ONE_WINS_MARKER` or `OUTCOME_UNDETERMINED`)
        if (outcomeMemo[currentPileState]) {

            // A highly specific optimization or game rule:
            // If the current state `currentPileState` is winning (or undetermined, but evaluated as true),
            // AND the immediately preceding state `currentPileState - 1` is also a winning state,
            // then we decrement `currentPileState` and skip the rest of the current iteration.
            // This means the inner loop for marking `previousPileState` as losing is bypassed for `currentPileState`,
            // and the loop immediately moves to process `currentPileState - 1`.
            if (currentPileState > 0 && outcomeMemo[currentPileState - 1] === PLAYER_ONE_WINS_MARKER) {
                currentPileState--; // Adjust loop counter to process the previous state next.
                continue;           // Skip the rest of the current iteration for `currentPileState`.
            }

            // If the above condition didn't trigger, proceed with marking previous states as losing.
            // This loop iterates from `1` up to the value of the *first* allowed step size (`availableStepSizes[0]`).
            // This is an unusual aspect; typically, all `availableStepSizes` would be considered here.
            // It suggests `availableStepSizes[0]` might be the smallest move (e.g., 1), or has special significance.
            // If `availableStepSizes[0]` is not positive or `availableStepSizes` is empty, this loop might not run or cause errors.
            for (let backwardOffset = 1; backwardOffset <= availableStepSizes[0]; backwardOffset++) {
                const previousPileState = currentPileState - backwardOffset;

                // Ensure the calculated previous state is valid (non-negative).
                if (previousPileState >= 0) {
                    // If the outcome for `previousPileState` is currently `OUTCOME_UNDETERMINED`,
                    // mark it as a `PLAYER_TWO_WINS_MARKER` (losing state).
                    // This implies that if a path exists from `previousPileState` to `currentPileState` (which is winning/undetermined),
                    // and `previousPileState` is not yet decided, it's considered a losing state for the player.
                    if (outcomeMemo[previousPileState] === OUTCOME_UNDETERMINED) {
                        outcomeMemo[previousPileState] = PLAYER_TWO_WINS_MARKER;
                    }
                }
            }
        }

        // --- Branch 2: Processing for states that are currently marked as LOSING ---
        // (Due to JS truthiness, `!outcomeMemo[currentPileState]` is true ONLY if `outcomeMemo[currentPileState]` is `PLAYER_TWO_WINS_MARKER`.)
        // This means this block executes exclusively if `currentPileState` is a definite losing state.
        if (!outcomeMemo[currentPileState]) {
            // If `currentPileState` is a losing state for the current player,
            // then any `previousPileState` from which a player can move to `currentPileState`
            // becomes a winning state for the player who made the move from `previousPileState`.
            // This is a standard game theory DP propagation: if you can move to a losing state, you win.
            for (let stepIdx = 0; stepIdx < numberOfStepOptions; stepIdx++) {
                const stepAmount = availableStepSizes[stepIdx];
                const previousPileState = currentPileState - stepAmount;

                // Validate the `previousPileState` to ensure it's a valid pile size.
                if (previousPileState >= 0) {
                    // Mark `previousPileState` as a winning state for the player who moves from it.
                    outcomeMemo[previousPileState] = PLAYER_ONE_WINS_MARKER;
                }
            }
        }
    }

    // The final result is derived from `outcomeMemo[0]`.
    // This implies that the game's winning condition is tied to the state '0'
    // after the backward propagation, rather than `gameTargetValue` (K) directly.
    // If `outcomeMemo[0]` is `PLAYER_ONE_WINS_MARKER`, the first player wins.
    return outcomeMemo[0] === PLAYER_ONE_WINS_MARKER ? FIRST_PLAYER_WINS_MESSAGE : SECOND_PLAYER_WINS_MESSAGE;
}

// --- Main Application Entry Point (IIFE for encapsulation) ---
(function mainApplication() {
    // Node.js specific: Read input from standard input using the 'fs' module.
    // This setup is common in competitive programming environments.
    const fileSystemModule = require('fs');
    const standardInputFilePath = '/dev/stdin';

    let rawInputData;
    try {
        rawInputData = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
    } catch (readError) {
        // Fallback for local testing or when `/dev/stdin` is not available.
        console.error(`Failed to read from ${standardInputFilePath}: ${readError.message}`);
        console.warn("Using fallback example input for demonstration purposes.");
        // Example input: N=2, K=3, A=[1,2]
        rawInputData = '2 3\n1 2';
    }

    // Parse the raw input string into an array of numbers.
    const parsedNumericalValues = parseNumericalInput(rawInputData);

    // Basic validation of the parsed input array's length.
    // We expect at least N, K, and one element for A.
    if (parsedNumericalValues.length < 3) {
        console.error("Input parsing error: Not enough numerical values found (expected N, K, and A elements).");
        process.exit(1); // Exit with an error code.
    }

    // Extract game parameters from the parsed array.
    // `shift()` modifies the array, so `availableStepSizes` will correctly contain the remaining elements.
    const totalMoveOptions = parsedNumericalValues.shift(); // Corresponds to N
    const gameMaxPileSize = parsedNumericalValues.shift();   // Corresponds to K
    const actualAvailableStepSizes = parsedNumericalValues;  // Corresponds to array A

    // Additional validation for the 'A' array, especially since `availableStepSizes[0]` is used.
    if (totalMoveOptions > 0 && actualAvailableStepSizes.length === 0) {
        console.error("Input error: `numberOfStepOptions` (N) is positive, but no `availableStepSizes` (A) were provided.");
        process.exit(1);
    }
    if (actualAvailableStepSizes.length > 0 && actualAvailableStepSizes[0] <= 0) {
        console.warn("Warning: The smallest step size (`availableStepSizes[0]`) is non-positive. This might lead to unexpected game behavior.");
    }

    // Execute the core game logic and retrieve the result message.
    const finalGameResult = computeGameOutcome(totalMoveOptions, gameMaxPileSize, actualAvailableStepSizes);

    // Output the final message to standard output.
    console.log(finalGameResult);

})(); // End of the Immediately Invoked Function Expression.