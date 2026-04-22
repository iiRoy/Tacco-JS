// This module orchestrates a sequence manipulation challenge.
// It determines a "winner" based on the final state of the sequence.

/**
 * Simulates obtaining an initial data sequence from an external source.
 * In a real application, this might involve user input (e.g., prompt()),
 * reading from a file, or fetching from an API.
 * @returns {string} The initial character sequence.
 */
function acquireInitialSequence() {
    // A default or placeholder sequence for testing purposes.
    // In a live environment, this would be dynamic.
    return "abacaba"; // Example sequence: "racecar", "level", "madam", "hello", "programming"
}

// Define participant identifiers for clarity in outcome presentation.
const PARTICIPANT_PRIMARY = "First";
const PARTICIPANT_SECONDARY = "Second";

/**
 * Attempts to locate and remove a specific character from the sequence
 * based on a neighbor-comparison rule.
 * @param {string[]} currentSequence - The mutable array of characters.
 * @param {boolean} activePlayerIndicator - A boolean representing the current player's turn state.
 * @returns {{sequence: string[], playerState: boolean, modified: boolean}} An object
 *          containing the updated sequence, new player state, and a flag indicating if a modification occurred.
 */
function processSequenceStep(currentSequence, activePlayerIndicator) {
    let operationPerformedThisCycle = false; // Tracks if any character was removed.
    let nextPlayerState = activePlayerIndicator; // Default: player state doesn't change if no move.

    // A preliminary check: operations require at least three elements (left, center, right).
    if (currentSequence.length < 3) {
        return { sequence: currentSequence, playerState: activePlayerIndicator, modified: false };
    }

    // Iterate through potential removal candidates.
    // The loop range guarantees valid indices for 'checkIndex - 1' and 'checkIndex + 1'.
    for (let checkIndex = 1; checkIndex < currentSequence.length - 1; checkIndex++) {
        const precedingChar = currentSequence[checkIndex - 1]; // Character to the left.
        const succeedingChar = currentSequence[checkIndex + 1]; // Character to the right.

        // Determine if the 'central' character meets the removal criteria.
        const isDissimilarPair = (precedingChar !== succeedingChar);

        if (isDissimilarPair) {
            // Remove the character at 'checkIndex'. Array.prototype.splice modifies in-place.
            currentSequence.splice(checkIndex, 1);
            // Toggle the player indicator, signifying a change of turn.
            nextPlayerState = !activePlayerIndicator;
            operationPerformedThisCycle = true; // Mark that a successful operation occurred.
            break; // Only one such operation is performed per processing step.
        }
    }

    return {
        sequence: currentSequence,
        playerState: nextPlayerState,
        modified: operationPerformedThisCycle
    };
}

// --- Main Execution Flow ---

// Retrieve the starting data.
let dataStream = acquireInitialSequence();

// Transform the string into a mutable character array for processing.
let characterArray = dataStream.split('');

// Initialize the game state indicator. 'true' might correspond to PARTICIPANT_SECONDARY's turn.
let currentPlayerIndicator = true;

// Maximum allowed processing cycles to prevent potential runaway execution.
const MAX_PROCESSING_CYCLES = 100000;
let cycleCounter = 0;
let lastCycleModified = true; // Ensure the do-while loop runs at least once.

// The primary processing loop. Continues as long as modifications are possible.
do {
    cycleCounter++;
    if (cycleCounter > MAX_PROCESSING_CYCLES) {
        console.error("Error: Exceeded maximum processing cycles. Terminating to prevent infinite loop.");
        break; // Force termination to avoid resource exhaustion.
    }

    // Perform a single step of sequence processing.
    const stepResult = processSequenceStep(characterArray, currentPlayerIndicator);

    // Update the character array and player indicator based on the step's outcome.
    characterArray = stepResult.sequence;
    currentPlayerIndicator = stepResult.playerState;
    lastCycleModified = stepResult.modified;

    // Additional diagnostic output (can be removed for production).
    // console.log(`Cycle ${cycleCounter}: Current sequence: ${characterArray.join('')}, Player indicator: ${currentPlayerIndicator}, Modified: ${lastCycleModified}`);

} while (lastCycleModified); // Loop continues as long as a modification was made in the last cycle.

// Determine the ultimate outcome based on the final state of the player indicator.
// If 'currentPlayerIndicator' is true, it suggests PARTICIPANT_SECONDARY wins.
// If 'currentPlayerIndicator' is false, it suggests PARTICIPANT_PRIMARY wins.
const finalWinner = currentPlayerIndicator ? PARTICIPANT_SECONDARY : PARTICIPANT_PRIMARY;

// Announce the final result of the sequence challenge.
console.log(finalWinner);