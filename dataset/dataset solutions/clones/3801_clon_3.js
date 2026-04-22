"use strict";

// Define constants for clarity and easier modification
const EAST_DIR_CHAR = "E";
const WEST_DIR_CHAR = "W";

/**
 * Processes input data to find the minimum number of rotations required.
 *
 * This function simulates rotating a line of people (facing East or West)
 * to minimize the number of people who need to turn around.
 * The goal is to find a pivot point such that all people to its left
 * eventually face East, and all people to its right eventually face West.
 *
 * @param {string} rawInputData - The raw input string, typically from stdin.
 *                                  Expected format: "N M\nEWWEW..."
 */
const processInputData = (rawInputData) => {
    // Basic input validation: ensure data is provided
    if (!rawInputData || rawInputData.length === 0) {
        console.error("No input data provided.");
        return; // Exit early if no data
    }

    // Parse the input string into usable components
    const lines = rawInputData.trim().split('\n');

    // Extract the grid size from the first line.
    // Assuming the first number on the first line represents the sequence length.
    const gridSize = Number(lines[0].split(' ')[0]);

    // Extract the sequence of directions from the second line.
    // Convert the string into an array of characters for easier iteration.
    const directionSequence = Array.from(lines[1]);

    // Validate if the sequence length matches the declared grid size.
    // This is an added guard clause for robust input handling.
    if (directionSequence.length !== gridSize) {
        console.error("Error: Direction sequence length does not match declared grid size.");
        return;
    }

    // Calculate the total number of 'E' characters in the entire sequence.
    // This is an initial scan to get overall statistics.
    let totalEastCount = 0;
    for (const char of directionSequence) {
        if (char === EAST_DIR_CHAR) {
            totalEastCount++;
        }
    }

    // Initialize counters for 'W' and 'E' characters observed *to the left* of the current pivot.
    let westCountSoFar = 0; // Number of 'W's encountered that need to turn 'E'.
    let eastCountSoFar = 0; // Number of 'E's encountered that are already 'E'.

    // Initialize the minimum rotations required to a very high value.
    // Using MAX_SAFE_INTEGER ensures any valid cost will be smaller.
    let minimumRequiredRotations = Number.MAX_SAFE_INTEGER;

    // Iterate through each possible pivot position in the sequence.
    // The `currentPositionIndex` represents the hypothetical dividing line.
    for (let currentPositionIndex = 0; currentPositionIndex < gridSize; ++currentPositionIndex) {
        // Calculate the number of 'E' people *to the right* of the current pivot
        // who would need to turn 'W'.
        // `totalEastCount - eastCountSoFar` gives 'E's remaining including the current one.
        // If the current person is an 'E', they don't need to move if they are the pivot,
        // so we decrement `eastToTurnRight`.
        let eastToTurnRight = totalEastCount - eastCountSoFar;
        if (directionSequence[currentPositionIndex] === EAST_DIR_CHAR) {
            eastToTurnRight--;
        }

        // The cost for the current pivot position is the sum of:
        // 1. 'W's to the left that need to turn 'E' (`westCountSoFar`).
        // 2. 'E's to the right that need to turn 'W' (`eastToTurnRight`).
        const currentPivotCost = westCountSoFar + eastToTurnRight;

        // Update the overall minimum if the current pivot's cost is lower.
        if (currentPivotCost < minimumRequiredRotations) {
            minimumRequiredRotations = currentPivotCost;
        }

        // Update the 'so far' counters for the next iteration based on the current character.
        if (directionSequence[currentPositionIndex] === WEST_DIR_CHAR) {
            westCountSoFar++;
        } else { // The character must be EAST_DIR_CHAR
            eastCountSoFar++;
        }
    }

    // Output the final minimum rotations found to standard output.
    console.log(minimumRequiredRotations);
};

// Entry point for execution, reading from standard input.
// This assumes the script is run in an environment where 'fs' module is available
// and '/dev/stdin' is the source of input (e.g., competitive programming platforms).
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));