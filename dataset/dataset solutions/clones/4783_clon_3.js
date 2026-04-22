"use strict";

// This module is designed to compute and output a specific movement path
// based on target coordinates provided in an input string.
// It simulates a sequence of directional commands (Right, Up, Left, Down)
// to navigate a conceptual 2D grid.

/**
 * Orchestrates the processing of raw input data to generate a complex movement sequence.
 * The function parses the necessary coordinate information and constructs a series of
 * directional commands, which are then printed to standard output.
 *
 * @param {string} incomingDataPayload - The raw string data received, typically from a file or stdin.
 */
const orchestratePathGeneration = (incomingDataPayload) => {
    // Define character constants for directional movements to improve readability and maintainability.
    const MOVE_COMMAND_RIGHT = 'R';
    const MOVE_COMMAND_UP = 'U';
    const MOVE_COMMAND_LEFT = 'L';
    const MOVE_COMMAND_DOWN = 'D';

    // --- Data Preprocessing and Validation Phase ---
    // Perform initial checks on the input payload to ensure it's a valid string.
    if (typeof incomingDataPayload !== 'string' || incomingDataPayload.length === 0) {
        console.error("PathGenError: Received an invalid or empty input string for path generation.");
        return; // Terminate execution if input is fundamentally flawed.
    }

    // Standardize input by trimming whitespace and splitting into individual lines.
    const processedInputLines = incomingDataPayload.trim().split('\n');

    // Ensure there's at least one line of data to parse.
    if (processedInputLines.length === 0) {
        console.error("PathGenError: No discernible input lines found after trimming.");
        return;
    }

    // Extract the first line, which is expected to contain the coordinate data.
    const rawCoordinateValues = processedInputLines[0].split(' ');

    // Validate that enough coordinate components are present.
    // The algorithm specifically relies on the 3rd and 4th numerical values.
    const MIN_COORDINATE_PARTS = 4;
    if (rawCoordinateValues.length < MIN_COORDINATE_PARTS) {
        console.error(`PathGenError: Insufficient coordinate values. Expected at least ${MIN_COORDINATE_PARTS}, but received ${rawCoordinateValues.length}.`);
        return;
    }

    // Parse the crucial target offset values.
    // Note: The initial X and Y coordinates (indices 0 and 1) are present in the input
    // but are intentionally disregarded by this specific pathfinding algorithm.
    const horizontalTargetOffset = parseInt(rawCoordinateValues[2], 10);
    const verticalTargetOffset = parseInt(rawCoordinateValues[3], 10);

    // Verify that the parsed values are indeed numbers.
    if (isNaN(horizontalTargetOffset) || isNaN(verticalTargetOffset)) {
        console.error("PathGenError: Failed to convert target offset values to valid numbers.");
        return;
    }

    // --- Utility Function for Move Sequence Generation ---
    /**
     * Creates an array containing a specified number of identical movement commands.
     * Guards against negative counts by clamping to zero.
     * @param {string} directionChar - The character representing the movement direction (e.g., 'R', 'U').
     * @param {number} count - The number of times the direction should be repeated.
     * @returns {string[]} An array of movement command characters.
     */
    const constructMoveSequence = (directionChar, count) => {
        // Ensure the count is non-negative to prevent errors with Array constructor.
        const effectiveCount = Math.max(0, count);
        return Array(effectiveCount).fill(directionChar);
    };

    // --- Path Construction Logic ---
    // Instead of direct array pushes within loops, we build discrete segments of the path
    // and then concatenate them, providing a more modular structure.
    let pathComponentChunks = [];

    // First Leg: Move Right to reach the horizontal target.
    pathComponentChunks.push(constructMoveSequence(MOVE_COMMAND_RIGHT, horizontalTargetOffset));

    // Second Leg: Move Up to reach the vertical target.
    pathComponentChunks.push(constructMoveSequence(MOVE_COMMAND_UP, verticalTargetOffset));

    // Third Leg: Move Left, retracing the horizontal path.
    pathComponentChunks.push(constructMoveSequence(MOVE_COMMAND_LEFT, horizontalTargetOffset));

    // Fourth Leg: Move Down, retracing the vertical path.
    pathComponentChunks.push(constructMoveSequence(MOVE_COMMAND_DOWN, verticalTargetOffset));

    // Fifth Leg: An additional single step to the Left.
    pathComponentChunks.push([MOVE_COMMAND_LEFT]);

    // Sixth Leg: Move Up, exceeding the vertical target by one unit.
    pathComponentChunks.push(constructMoveSequence(MOVE_COMMAND_UP, verticalTargetOffset + 1));

    // Seventh Leg: Move Right, exceeding the horizontal target by one unit.
    pathComponentChunks.push(constructMoveSequence(MOVE_COMMAND_RIGHT, horizontalTargetOffset + 1));

    // Eighth Leg: A single step Down.
    pathComponentChunks.push([MOVE_COMMAND_DOWN]);

    // Ninth Leg: Move Down, exceeding the vertical target by one unit from current position.
    pathComponentChunks.push(constructMoveSequence(MOVE_COMMAND_DOWN, verticalTargetOffset + 1));

    // Tenth Leg: Move Left, exceeding the horizontal target by one unit from current position.
    pathComponentChunks.push(constructMoveSequence(MOVE_COMMAND_LEFT, horizontalTargetOffset + 1));

    // Eleventh Leg: A final single step Up.
    pathComponentChunks.push([MOVE_COMMAND_UP]);

    // Consolidate all the individual path segments into a single, contiguous array of commands.
    const finalCompiledPath = pathComponentChunks.flat();

    // Output the resulting sequence of commands as a single string.
    console.log(finalCompiledPath.join(''));
};

// --- Execution Entry Point (Self-Invoking Function) ---
// This block handles the environment-specific input reading and delegates to the main logic.
(() => {
    try {
        // Attempt to read the entire content of standard input as a UTF-8 string.
        // This is a common pattern in competitive programming for JavaScript on Linux-like systems.
        const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        orchestratePathGeneration(standardInputContent);
    } catch (executionError) {
        // Catch and report any errors that occur during file reading or initial processing.
        console.error(`RuntimeError: An issue was encountered during program execution: ${executionError.message}`);
        // Optionally, for debugging, one might provide a fallback or mock input here:
        // orchestratePathGeneration("0 0 3 4");
    }
})();