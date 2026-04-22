/*
 * This module computes the total number of ways to form the subsequence "ABC"
 * from a given input string, where '?' characters can represent 'A', 'B', or 'C'.
 * It employs a dynamic programming approach with memoization to efficiently calculate
 * the result modulo a large prime number, preventing integer overflow for large inputs.
 * The solution iterates through the string and possible matching states in reverse
 * to build up the final count from base cases.
 */

// --- Global Configuration and Constants ---
const PRIME_MODULO_VALUE = (10 ** 9) + 7; // A large prime number used for modulo arithmetic.
const TARGET_PATTERN_STRING = "ABC"; // The specific three-character subsequence we are counting.
const MAX_MATCHING_STAGE = TARGET_PATTERN_STRING.length; // Represents the state after matching 'C' (index 3).

// --- State Variables for Input Processing ---
let rawInputLine = ''; // Temporarily stores the raw string received from standard input.
let charArrayForProcessing = []; // The input string converted into an array of individual characters.

// --- Input/Output Interface Setup ---
const standardInputProcessor = require('readline'); // Node.js module for reading input line by line.

// Creates an interface instance to handle input from stdin and output to stdout.
const consoleInputInterface = standardInputProcessor.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// --- Helper Functions ---

/**
 * Outputs the final computed numeric result to the console.
 * @param {number} computedValue The integer result to display.
 */
function emitFinalResult(computedValue) {
    console.log(computedValue);
}

/**
 * Determines the multiplier for cases where a character does NOT advance the matching stage.
 * If the character is '?', it can be any of 3 letters, so 3 ways to NOT match the target.
 * Otherwise, it's a specific letter, so 1 way to NOT match the target.
 * @param {string} currentCharacter The character from the input string at the current index.
 * @returns {number} The multiplier (1 or 3).
 */
function getNonMatchMultiplier(currentCharacter) {
    return currentCharacter === '?' ? 3 : 1;
}

// --- Event Listeners for Input Stream ---

// This listener captures each line as it's provided via standard input.
consoleInputInterface.on('line', (receivedData) => {
    // Store the most recently received line. In this problem, we expect only one.
    rawInputLine = receivedData;
});

// This listener is triggered once the entire input stream has ended.
// The main dynamic programming logic is executed here.
consoleInputInterface.on('close', () => {
    // --- Input Validation and Pre-processing ---
    // A basic guard clause to handle potential non-string or null input.
    if (rawInputLine === null || typeof rawInputLine !== 'string') {
        emitFinalResult(0); // Output 0 for invalid input or an empty string.
        return; // Exit if input is invalid.
    }

    charArrayForProcessing = rawInputLine.split(''); // Convert the string into a character array.
    const stringLength = charArrayForProcessing.length; // Cache the length for efficiency.

    // --- Dynamic Programming Table Initialization ---
    // The memoizationTable `dp[idx][stage]` stores the number of ways to complete
    // `TARGET_PATTERN_STRING` from `stage` onwards, using characters from `charArrayForProcessing[idx]` onwards.
    // Dimensions: (stringLength + 1) rows for indices, (MAX_MATCHING_STAGE + 1) columns for states.
    const memoizationTable = Array.from({ length: stringLength + 1 }, () =>
        new Array(MAX_MATCHING_STAGE + 1).fill(0)
    );

    // --- DP Calculation Loop (Bottom-Up Approach) ---
    // Iterate backwards through the input string indices.
    for (let currentIdx = stringLength; currentIdx >= 0; --currentIdx) {
        // Iterate backwards through the matching stages (0 for 'A', 1 for 'B', 2 for 'C', 3 for matched).
        for (let currentStage = MAX_MATCHING_STAGE; currentStage >= 0; --currentStage) {
            // Base Case: If we have reached the end of the string.
            if (currentIdx === stringLength) {
                // If the current stage indicates that the entire pattern has been matched,
                // there's 1 way to achieve this (by doing nothing further). Otherwise, 0 ways.
                memoizationTable[currentIdx][currentStage] = (currentStage === MAX_MATCHING_STAGE ? 1 : 0);
            } else {
                // Recursive Step: Consider the current character from the input string.
                const currentCharacter = charArrayForProcessing[currentIdx];
                const expectedCharacterForStage = TARGET_PATTERN_STRING[currentStage];

                // Calculate ways where the current character does NOT advance the match stage.
                // This value is taken from the next string index at the same match stage.
                // It's multiplied by 3 if currentCharacter is '?' (as '?' can be one of three
                // non-matching characters), or 1 if it's a specific character.
                let waysWithoutAdvancement = memoizationTable[currentIdx + 1][currentStage];
                waysWithoutAdvancement = (waysWithoutAdvancement * getNonMatchMultiplier(currentCharacter)) % PRIME_MODULO_VALUE;

                // Calculate ways where the current character DOES advance the match stage.
                // This is only possible if we haven't completed the pattern yet (stage < 3)
                // AND the current character matches the expected character for this stage, or is a '?'.
                if (currentStage < MAX_MATCHING_STAGE &&
                    (currentCharacter === '?' || currentCharacter === expectedCharacterForStage)) {
                    // Add the ways from the next string index, having advanced to the next stage.
                    // Ensure modulo operation is applied to prevent overflow.
                    waysWithoutAdvancement = (waysWithoutAdvancement + memoizationTable[currentIdx + 1][currentStage + 1]) % PRIME_MODULO_VALUE;
                }

                // Store the combined total ways for the current state.
                memoizationTable[currentIdx][currentStage] = waysWithoutAdvancement;
            }
        }
    }

    // --- Final Result Extraction ---
    // The solution is found at `memoizationTable[0][0]`, which represents the number of ways
    // to complete the pattern from stage 0 (finding 'A') starting at index 0 of the string.
    emitFinalResult(memoizationTable[0][0]);
});