'use strict';

/**
 * Helper utility function to safely convert a string value into an integer.
 * It includes basic validation for robust parsing.
 * @param {string} stringValue - The string to be parsed.
 * @returns {number} The parsed integer, or 0 if parsing fails (with a warning).
 */
const parseNumericValueSafely = (stringValue) => {
    // Ensure the input is a string and not just whitespace.
    if (typeof stringValue !== 'string' || stringValue.trim() === '') {
        console.warn(`Attempted to parse an invalid or empty string: '${stringValue}'. Returning 0.`);
        return 0;
    }
    const parsedNumber = Number.parseInt(stringValue.trim(), 10);
    // Check if the parsing resulted in a Not-a-Number value.
    if (Number.isNaN(parsedNumber)) {
        console.warn(`Failed to parse '${stringValue}' into an integer. Returning 0.`);
        return 0;
    }
    return parsedNumber;
};

/**
 * Orchestrates the processing of game scenario data.
 * This function takes raw input lines, parses them, validates parameters,
 * and then computes a specific outcome based on predefined game logic.
 * @param {string[]} scenarioLines - An array of strings, where the first string
 *                                   contains space-separated numeric parameters.
 * @returns {void} Outputs the computed result to the console.
 */
const analyzeGameOutcome = (scenarioLines) => {
    // --- Input Validation: Check for basic data presence ---
    if (!scenarioLines || scenarioLines.length === 0) {
        console.error("Fatal Error: No scenario data lines were supplied for analysis.");
        return; // Halt execution if no data.
    }

    const primaryParameterLine = scenarioLines[0];

    // --- Input Validation: Check the primary parameter string ---
    if (typeof primaryParameterLine !== 'string' || primaryParameterLine.trim() === '') {
        console.error("Fatal Error: The primary parameter line is either not a string or is empty.");
        return;
    }

    // --- Data Parsing: Extract and convert numeric components ---
    // Splitting the string and then mapping to integers using our safe parser.
    const numericParameters = primaryParameterLine.split(' ').map(parseNumericValueSafely);

    // --- Input Validation: Verify the count of numeric parameters ---
    const EXPECTED_PARAMETER_COUNT = 3;
    if (numericParameters.length !== EXPECTED_PARAMETER_COUNT) {
        console.error(`Fatal Error: Expected ${EXPECTED_PARAMETER_COUNT} numeric parameters (N, A, B), but found ${numericParameters.length}.`);
        return;
    }

    // --- Variable Assignment: Assign parsed values to descriptive constants ---
    // N: Total size of the game arena or grid.
    const totalArenaSize = numericParameters[0];
    // A: Initial position of the first entity/player.
    const firstEntityPosition = numericParameters[1];
    // B: Target position or second entity/player's position.
    const secondEntityPosition = numericParameters[2];

    // --- Input Validation: Check logical constraints of the parameters ---
    // Assuming positions are 1-indexed and must be within the arena boundaries.
    if (totalArenaSize < 1 || firstEntityPosition < 1 || secondEntityPosition < 1 ||
        firstEntityPosition > totalArenaSize || secondEntityPosition > totalArenaSize) {
        console.error(`Fatal Error: Invalid game parameters detected. Arena size (N=${totalArenaSize}) or positions (A=${firstEntityPosition}, B=${secondEntityPosition}) are out of expected bounds.`);
        return;
    }

    // --- Core Logic Calculation: Determine the positional difference ---
    // The difference between the second and first entity's positions.
    // Rewriting `B - A` as `B + (-A)` for a structural change.
    const positionalDifference = secondEntityPosition + (-firstEntityPosition);

    let finalCalculatedOutcome; // Variable to store the result before output.

    // --- Conditional Logic: Evaluate based on parity of the positional difference ---
    // Check if the positional difference is an odd number.
    // Using `!== 0` for explicit odd check, compatible with negative numbers if they occur.
    const isDifferenceOdd = (positionalDifference % 2 !== 0);

    if (isDifferenceOdd) {
        // Scenario 1: If the difference is odd, direct meeting is not possible.
        // They must move towards boundaries.
        // Calculate moves for the second entity to reach the start boundary (position 1).
        const distanceToLeftmostBoundary = secondEntityPosition - 1; // Corresponds to original `b-1`.

        // Calculate moves for the first entity to reach the end boundary (position N).
        const distanceToRightmostBoundary = totalArenaSize - firstEntityPosition; // Corresponds to original `n-a`.

        // The outcome is the minimum of these two boundary-related distances.
        finalCalculatedOutcome = Math.min(distanceToLeftmostBoundary, distanceToRightmostBoundary);
    } else {
        // Scenario 2: If the difference is even, they can meet directly in the middle.
        // The number of steps is half the positional difference.
        // Using a bitwise right shift (`>> 1`) for integer division by 2,
        // which is an equivalent and often optimized operation.
        finalCalculatedOutcome = positionalDifference >> 1; // Equivalent to positionalDifference / 2.
    }

    // --- Output Result ---
    // Display the final computed outcome to standard output.
    console.log(finalCalculatedOutcome);
};

/**
 * Initializes the program by reading input from standard input and
 * invoking the main analysis function. Includes basic I/O error handling.
 */
const initializeApplication = () => {
    try {
        // Dynamic import or require for 'fs' module.
        const fileSystem = require("fs");
        // Read the entire content of standard input as UTF-8.
        const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
        // Split the content into an array of lines.
        const inputLinesArray = rawInputContent.split('\n');

        // Pass the processed input lines to the core logic function.
        analyzeGameOutcome(inputLinesArray);

    } catch (errorReadingInput) {
        // Catch and log any errors that occur during file reading.
        console.error("An error occurred while attempting to read from standard input:", errorReadingInput.message);
        // Depending on requirements, could exit process or provide a default.
        process.exit(1);
    }
};

// Start the application's execution flow.
initializeApplication();