"use strict";

// This script computes a specific path sequence between two points (start and target)
// and outputs the sequence of movements (R, U, L, D).
// It constructs a complex path that visits the target, returns to the start,
// and then performs two more excursions around the start/target region.

/**
 * Parses a string of space-separated coordinate values into an array of integers.
 * Includes basic validation for input format.
 * @param {string} coordinateLine - The input string containing coordinates, e.g., "10 20 30 40".
 * @param {string} delimiter - The character used to separate coordinate values.
 * @returns {number[]} An array of parsed integer coordinates.
 * @throws {Error} If the input is invalid or parsing fails.
 */
const extractNumericalPositions = (coordinateLine, delimiter) => {
    // Validate that the input is a non-empty string.
    if (typeof coordinateLine !== 'string' || !coordinateLine.trim()) {
        throw new Error("Input coordinate line must be a non-empty string.");
    }

    // Split the string by the specified delimiter and map to integers.
    const parsedValues = coordinateLine.split(delimiter).map(val => {
        const num = parseInt(val.trim(), 10);
        // Validate that each segment successfully converted to a number.
        if (isNaN(num)) {
            throw new Error(`Invalid coordinate value encountered: "${val.trim()}" is not a valid number.`);
        }
        return num;
    });

    return parsedValues;
};

/**
 * Main function to process input coordinates and generate the movement path.
 * @param {string} rawInputData - The raw input string, typically from stdin.
 */
const calculateMovementPath = (rawInputData) => {
    // Pre-process the raw input: remove leading/trailing whitespace and split into lines.
    const processedLines = rawInputData.trim().split("\n");

    // Early exit if no valid input lines are provided.
    if (processedLines.length === 0 || !processedLines[0].trim()) {
        console.error("Error: No coordinate input line found.");
        return;
    }

    // Define the separator for individual coordinate values within the line.
    const coordValueSeparator = " ";

    let initialX, initialY, finalX, finalY;
    try {
        // Use the helper function to parse the first line of input.
        const allCoords = extractNumericalPositions(processedLines[0], coordValueSeparator);

        // Ensure exactly four coordinate values are present.
        if (allCoords.length !== 4) {
            throw new Error(`Expected 4 coordinate values (start_x, start_y, target_x, target_y), but received ${allCoords.length}.`);
        }

        // Destructure the parsed coordinates for better readability.
        [initialX, initialY, finalX, finalY] = allCoords;
    } catch (parsingError) {
        console.error(`Input parsing failed: ${parsingError.message}`);
        return; // Terminate execution if input is invalid.
    }

    // Calculate the horizontal and vertical displacements required.
    const displacementX = finalX - initialX;
    const displacementY = finalY - initialY;

    // Initialize an array to accumulate all individual movement commands.
    const movementCommands = [];

    // --- Path Segment 1: Move from (initialX, initialY) to (finalX, finalY) ---
    // This segment moves Right then Up.
    // Using String.prototype.repeat for a concise way to generate sequences.
    if (displacementX > 0) {
        movementCommands.push("R".repeat(displacementX));
    }
    if (displacementY > 0) {
        movementCommands.push("U".repeat(displacementY));
    }

    // --- Path Segment 2: Move from (finalX, finalY) back to (initialX, initialY) ---
    // This segment moves Left then Down.
    if (displacementX > 0) {
        movementCommands.push("L".repeat(displacementX));
    }
    if (displacementY > 0) {
        movementCommands.push("D".repeat(displacementY));
    }

    // --- Path Segment 3: Excursion starting from (initialX, initialY) ---
    // The sequence is: Left 1, Up (displacementY + 1), Right (displacementX + 1), Down 1.
    movementCommands.push("L");
    movementCommands.push("U".repeat(displacementY + 1));
    movementCommands.push("R".repeat(displacementX + 1));
    movementCommands.push("D");

    // --- Path Segment 4: Excursion starting from (finalX, finalY) (after previous segments) ---
    // The sequence is: Down (displacementY + 1), Left (displacementX + 1), Up 1.
    movementCommands.push("D".repeat(displacementY + 1));
    movementCommands.push("L".repeat(displacementX + 1));
    movementCommands.push("U");

    // Concatenate all movement commands into a single string and output it.
    console.log(movementCommands.join(""));
};

// Entry point: Read input from standard input and execute the path calculation.
try {
    const fileSystemModule = require('fs');
    const inputContentFromFile = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    calculateMovementPath(inputContentFromFile);
} catch (executionError) {
    console.error(`Application error: ${executionError.message}`);
    // Optionally, exit with a non-zero code to signal an error to the environment.
    // process.exit(1);
}