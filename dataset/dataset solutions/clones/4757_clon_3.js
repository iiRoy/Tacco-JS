'use strict'; // Ensure strict mode for better code quality.

/**
 * Manages the processing of a directional sequence to ascertain the maximum
 * displacement from an initial neutral state.
 *
 * The input string is expected to begin with a single digit representing
 * the number of directional commands that follow (starting from the third character).
 * Commands are 'I' for increment and 'D' (or anything else) for decrement.
 *
 * @param {string} rawInputString The complete input string, including the length indicator.
 * @returns {void} Outputs the maximum achieved value to the console.
 */
function analyzeDirectionalPath(rawInputString) {
    // Define constants for directional changes to improve readability and maintainability.
    const INCREMENT_COMMAND_CHAR = 'I';
    const INCREMENT_VALUE = 1;
    const DECREMENT_VALUE = -1;
    const START_OFFSET_FOR_COMMANDS = 2; // Commands begin after the first two characters (length and unused).

    // --- Input Processing and Validation ---

    // Guard clause: Handle cases where the input string might be empty or null.
    if (!rawInputString || rawInputString.length === 0) {
        console.error("Error: Input string is empty or invalid.");
        return; // Exit early if no valid input.
    }

    // Convert the input string into an array of characters for easier access.
    // Using Array.from for diversity from original split.
    const charArray = Array.from(rawInputString);

    // Extract the numerical count of directional operations from the first character.
    // Explicitly parse to integer to avoid string-based comparison issues.
    const numberOfOperations = parseInt(charArray[0], 10);

    // Further validation: Check if the parsed number is valid and if the input
    // contains enough characters for the declared number of operations.
    // Minimum length: 1 (for count) + 1 (for unused char) + numberOfOperations (for commands)
    if (isNaN(numberOfOperations) || numberOfOperations < 0) {
        console.error(`Error: Invalid operation count character: '${charArray[0]}'. Must be a non-negative digit.`);
        return;
    }
    if (charArray.length < (numberOfOperations + START_OFFSET_FOR_COMMANDS)) {
        console.error(`Error: Insufficient input length for ${numberOfOperations} operations. Expected at least ${numberOfOperations + START_OFFSET_FOR_COMMANDS} characters, got ${charArray.length}.`);
        return;
    }

    // --- Core Logic Initialization ---

    // Initialize the current tracking value. This represents the displacement from the origin.
    let currentDisplacement = 0;

    // Maintain a record of all displacement values encountered during the process.
    // Starting with the initial neutral state (0).
    const displacementLog = [0];

    // --- Iterative Processing of Commands ---

    // Helper function to update displacement based on command and log the new state.
    // This encapsulates the core state update logic.
    const applyOperationAndLog = (operationCharacter) => {
        if (operationCharacter === INCREMENT_COMMAND_CHAR) {
            currentDisplacement += INCREMENT_VALUE;
        } else { // Assume any other character implies a decrement (e.g., 'D').
            currentDisplacement += DECREMENT_VALUE;
        }
        displacementLog.push(currentDisplacement);
    };

    // Loop through the command characters.
    // Commands are expected to start at an offset defined by START_OFFSET_FOR_COMMANDS.
    // The loop iterates 'numberOfOperations' times.
    for (let opIdx = 0; opIdx < numberOfOperations; opIdx++) {
        const commandChar = charArray[opIdx + START_OFFSET_FOR_COMMANDS]; // Retrieve the current command character.
        applyOperationAndLog(commandChar); // Apply the operation and log the result.
    }

    // --- Result Calculation and Output ---

    // Find the maximum displacement achieved from the recorded history.
    // Using reduce as an alternative to Math.max(...array) for diversity and robustness
    // with potentially very large arrays (though not an issue here).
    const peakDisplacement = displacementLog.reduce((maxVal, currentVal) => {
        return Math.max(maxVal, currentVal);
    }, -Infinity); // Initialize with negative infinity to correctly handle all positive/zero values.

    // Output the calculated peak displacement.
    console.log(peakDisplacement);
}

// --- Program Entry Point ---

// Read the entire content of standard input as a UTF-8 string.
// This is typically used in competitive programming environments where
// input is provided via standard input.
const inputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Execute the main analysis function with the obtained input.
analyzeDirectionalPath(inputData);