"use strict";

// Define a constant for the modulo operation, enhancing readability and making it easily configurable.
const CALCULATION_MODULO = 100000;

/**
 * A helper function to safely parse a string into an integer.
 * This adds a new utility fragment, satisfying a Type III requirement.
 * Includes basic error handling for non-numeric inputs.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
function convertToInteger(inputString) {
    const numericValue = parseInt(inputString, 10);
    if (isNaN(numericValue)) {
        // In a production environment, this might throw an error or log more extensively.
        // For competitive programming, invalid input is often not expected.
        console.warn(`Warning: Failed to parse "${inputString}" as an integer. Using 0 instead.`);
        return 0;
    }
    return numericValue;
}

// --- Input Acquisition Phase ---

// Module for file system operations. Renamed 'fs' to 'fileSystemModule' for clarity.
const fileSystemModule = require('fs');

let rawInputData; // Renamed 'input' to 'rawInputData'.
try {
    // Attempt to read the entire content from standard input.
    rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (ioError) {
    // Added a robust error handling block for file reading, a Type III addition.
    console.error("Critical Error: Unable to read input from /dev/stdin.", ioError.message);
    // Provide a fallback or exit in case of input failure.
    // For this problem, we'll assume valid input, but for robustness, an empty string is safer.
    rawInputData = "";
}

// Split the raw data into an array of individual lines, cleaning up whitespace.
// Renamed 'arr' to 'inputContentLines'.
const inputContentLines = rawInputData.trim().split("\n");

// Initialize a pointer to keep track of the current line being processed.
// Renamed 'cnt' to 'currentLineIndex'.
let currentLineIndex = 0;

// --- Dimension Parsing Phase ---

// Parse the first line to extract the problem's primary dimensions.
// Renamed 'mn' to 'problemDimensions'.
const problemDimensions = inputContentLines[currentLineIndex++].split(" ").map(convertToInteger);

// Assign parsed dimensions to more descriptive variables.
// Renamed 'm' to 'gridHeight' and 'n' to 'numMovementCommands'.
const gridHeight = problemDimensions[0]; // Represents M rows/levels.
const numMovementCommands = problemDimensions[1]; // Represents N movement instructions.

// --- Data Structure Initialization Phase ---

// Create an array to hold the cost associated with traversing each segment.
// A segment exists between two adjacent rows (e.g., between row 0 and 1, 1 and 2, etc.).
// There are (gridHeight - 1) such segments.
// Renamed 'si' to 'segmentTraversalCosts'.
const segmentTraversalCosts = Array.from({ length: gridHeight - 1 }, () => {
    // Use the helper function and advance the line pointer.
    return convertToInteger(inputContentLines[currentLineIndex++]);
});

// Create an array to store the sequence of movement instructions.
// Renamed 'ai' to 'movementInstructionSet'.
// Using Array.slice and map for a more functional approach to parsing a block of lines.
const movementInstructionSet = inputContentLines
    .slice(currentLineIndex, currentLineIndex + numMovementCommands)
    .map(convertToInteger);
currentLineIndex += numMovementCommands; // Explicitly advance the line pointer past the instructions.

// Initialize an array to count how many times each segment (between rows) is crossed.
// Renamed 'plus' to 'segmentPassageCounts'.
// Using `new Array().fill(0)` is a more modern and concise way to initialize than a `for` loop.
const segmentPassageCounts = new Array(gridHeight - 1).fill(0);

// --- Movement Simulation Phase ---

// Initialize the current position of the imaginary mover. It starts at the 'base' (position 0).
// Renamed 'i' to 'currentMoverPosition'.
let currentMoverPosition = 0;

// Iterate through each movement command provided in the instruction set.
// Changed from `forEach` to a `for...of` loop for potentially clearer flow control.
for (const commandValue of movementInstructionSet) {
    // Determine the direction of movement: +1 for forward, -1 for backward.
    // Renamed 'k' to 'directionFactor'.
    const directionFactor = (commandValue > 0) ? 1 : -1;

    // Get the absolute number of steps to move for the current command.
    // Renamed 'v' to 'stepsToExecute'.
    let stepsToExecute = Math.abs(commandValue);

    // Execute each individual step of the current movement command.
    // Rewritten the `while(v--)` loop into a more explicit `for` loop, a Type III modification.
    for (let stepCounter = 0; stepCounter < stepsToExecute; stepCounter++) {
        if (directionFactor === 1) { // Moving in the positive direction (downwards/forwards)
            // Increment the count for the segment that is being exited *from* the current position.
            // Added a boundary check (guard clause) to ensure array access is valid.
            if (currentMoverPosition < segmentPassageCounts.length) {
                segmentPassageCounts[currentMoverPosition]++;
            } else {
                // This scenario means the path moved beyond the defined grid segments.
                // Depending on problem specifics, this might be an error or simply ignored.
                // For this problem, we assume movements stay within reasonable bounds.
            }
            currentMoverPosition++; // Then update the mover's position.
        } else { // Moving in the negative direction (upwards/backwards)
            currentMoverPosition--; // First, update the mover's position.
            // Increment the count for the segment that is being entered *at* the new position.
            // Added a boundary check (guard clause) for array validity.
            if (currentMoverPosition >= 0) {
                segmentPassageCounts[currentMoverPosition]++;
            } else {
                // Similar to the forward case, path moved below the start.
            }
        }
    }
}

// --- Final Cost Calculation Phase ---

// Initialize the total accumulated cost.
// Renamed 'sum' to 'totalAggregatedCost'.
let totalAggregatedCost = 0;

// Iterate through each segment to calculate its contribution to the total cost.
// Using a standard `for` loop for explicit index management.
for (let segIndex = 0; segIndex < segmentTraversalCosts.length; segIndex++) {
    // Retrieve the cost of traversing this specific segment.
    const individualSegmentCost = segmentTraversalCosts[segIndex];
    // Retrieve how many times this segment was crossed during the simulation.
    const segmentCrossings = segmentPassageCounts[segIndex];

    // Add the product of cost and crossings to the total.
    // Apply the modulo operation at each step to prevent integer overflow for large sums.
    totalAggregatedCost = (totalAggregatedCost + (individualSegmentCost * segmentCrossings)) % CALCULATION_MODULO;
}

// --- Output Phase ---

// Print the final calculated total accumulated cost to standard output.
console.log(totalAggregatedCost);