// This module provides functionality for simulating dice rotations and tracking unique configurations.

/**
 * Rotates a 6-sided die based on a cardinal direction command.
 * The die faces are represented as an array: [top, front, right, back, left, bottom].
 *
 * @param {string} rotationCommand - The direction to rotate the die ("N", "S", "E", "W").
 * @param {number[]} currentFaces - An array representing the current numerical values on the die's faces.
 * @returns {number[]|null} A new array representing the die's state after rotation, or null if an invalid command or input is provided.
 */
const shiftOrientation = (rotationCommand, currentFaces) => {
    // Validate the input array to ensure it's a 6-element array.
    if (!Array.isArray(currentFaces) || currentFaces.length !== 6) {
        console.error("Invalid die face configuration provided. Expected an array of 6 numbers.");
        return null; // Return null to signal an error.
    }

    // Use array destructuring for clearer variable names representing each face.
    const [top, front, right, back, left, bottom] = currentFaces;

    let nextLayout = []; // This array will store the new arrangement of faces after rotation.

    // A switch statement provides a cleaner way to handle multiple rotation commands compared to chained if-else.
    switch (rotationCommand) {
        case "N": // North rotation: front becomes top, top becomes back, back becomes bottom, bottom becomes front.
            nextLayout = [front, bottom, right, top, left, back];
            break;
        case "S": // South rotation: back becomes top, top becomes front, front becomes bottom, bottom becomes back.
            nextLayout = [back, top, right, bottom, left, front];
            break;
        case "E": // East rotation: left becomes top, top becomes right, right becomes bottom, bottom becomes left.
            nextLayout = [left, front, top, back, bottom, right];
            break;
        case "W": // West rotation: right becomes top, top becomes left, left becomes bottom, bottom becomes right.
            nextLayout = [right, front, bottom, back, top, left];
            break;
        default:
            // Handle unrecognized rotation commands. For this problem, we might return the original state.
            console.warn(`Unrecognized rotation command: '${rotationCommand}'. No rotation applied.`);
            return [...currentFaces]; // Return a shallow copy of the original array.
    }
    return nextLayout; // Return the new configuration of the die.
};

/**
 * Performs a specific horizontal rotation (spin) of the die.
 * This operation cycles the side faces while keeping the top and bottom faces fixed.
 * The sequence is typically front -> right -> back -> left -> front.
 *
 * @param {number[]} currentFaces - An array representing the current numerical values on the die's faces.
 * @returns {number[]|null} A new array representing the die's state after the horizontal spin, or null for invalid input.
 */
const cycleHorizontal = (currentFaces) => {
    // Validate the input array.
    if (!Array.isArray(currentFaces) || currentFaces.length !== 6) {
        console.error("Invalid die face configuration provided for horizontal cycle. Expected an array of 6 numbers.");
        return null;
    }
    // Deconstruct the current face layout for readability.
    const [top, front, right, back, left, bottom] = currentFaces;

    // Apply the specific permutation for this horizontal spin.
    // Original order: [top, front, right, back, left, bottom]
    // Spun order:    [top, right, back, left, front, bottom]
    return [top, right, back, left, front, bottom];
};

// Global registry to store all unique die configurations encountered across all sets.
// A Set is used for efficient storage and lookup of stringified configurations.
const masterConfigRegistry = new Set();
// Global flag to track if any duplicate configuration has been found throughout the entire process.
// Initialized to true, meaning "YES" (no duplicates found yet).
let overallCheckResult = true;

/**
 * Explores four horizontal spin variations of a die and registers them in the global registry.
 * If any of the generated configurations are already present in the global registry,
 * it updates the global status to indicate a duplicate and returns true.
 *
 * @param {number[]} initialFaces - The starting configuration of the die faces for this exploration.
 * @returns {boolean} True if a duplicate configuration was found during this exploration, false otherwise.
 */
const registerOrientations = (initialFaces) => {
    // Input validation for the initial die configuration.
    if (!Array.isArray(initialFaces) || initialFaces.length !== 6) {
        console.error("Invalid initial die face configuration for registration. Skipping.");
        return false; // Indicate no duplicate found due to invalid input.
    }

    let currentConfiguration = [...initialFaces]; // Create a mutable copy to apply spins.
    const numSpinCycles = 4; // The `cycleHorizontal` function cycles back to the original state after 4 applications.
    const encounteredLocalStates = new Set(); // A local Set to prevent redundant checks for states within this specific function call.

    for (let iteration = 0; iteration < numSpinCycles; iteration++) {
        const serializedState = currentConfiguration.join(","); // Convert array to string for Set storage.

        // Check if this specific state has already been processed within this batch of 4 spins.
        if (encounteredLocalStates.has(serializedState)) {
             // This state was already seen in a previous spin of this batch, no need to re-check globally.
        } else {
            encounteredLocalStates.add(serializedState); // Add to the local set to mark it as processed.

            // Check if this configuration already exists in the global registry.
            if (masterConfigRegistry.has(serializedState)) {
                overallCheckResult = false; // A duplicate was found globally, update the global status.
                return true; // Immediately return true to signal a duplicate.
            } else {
                masterConfigRegistry.add(serializedState); // Add this new unique configuration to the global registry.
            }
        }
        // Apply the horizontal spin for the next iteration.
        currentConfiguration = cycleHorizontal(currentConfiguration);
        // If cycleHorizontal returns null (due to error), treat it as a duplicate/error state.
        if (!currentConfiguration) {
            overallCheckResult = false;
            return true;
        }
    }
    return false; // No duplicate was found within this set of horizontal spins.
};

/**
 * Processes a single set of die faces through a complex sequence of cardinal rotations
 * and horizontal spins, registering all generated orientations.
 * This function encapsulates the main logic for handling one die set from the input.
 *
 * @param {number[]} initialDieState - The initial configuration of the die for this specific set.
 * @returns {boolean} True if a duplicate configuration was found during this processing sequence, false otherwise.
 */
const processSingleDieSet = (initialDieState) => {
    let activeDieState = [...initialDieState]; // Create a mutable copy of the die state.
    const northRotationIterations = 4;

    // First phase: Perform four "North" rotations, checking all horizontal spin variations at each step.
    for (let i = 0; i < northRotationIterations; i++) {
        if (registerOrientations(activeDieState)) return true; // If a duplicate is found, stop and report.
        activeDieState = shiftOrientation("N", activeDieState);
        if (!activeDieState) return true; // Propagate error if rotation failed.
    }

    // Second phase: Perform an "East" rotation, then check horizontal spin variations.
    activeDieState = shiftOrientation("E", activeDieState);
    if (!activeDieState) return true;
    if (registerOrientations(activeDieState)) return true;

    // Third phase: Perform two "South" rotations, then check horizontal spin variations.
    activeDieState = shiftOrientation("S", activeDieState);
    if (!activeDieState) return true;
    activeDieState = shiftOrientation("S", activeDieState);
    if (!activeDieState) return true;
    if (registerOrientations(activeDieState)) return true;

    return false; // No duplicate found for this specific die set and its explored orientations.
};


// --- Main Program Execution Flow ---

let rawInputData = '';
try {
    // Attempt to read all input from standard input as a UTF-8 string.
    rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
} catch (error) {
    // Log an error if file reading fails and terminate the process.
    console.error("Error: Failed to read input from /dev/stdin:", error.message);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// Split the raw input into individual lines and remove any leading/trailing whitespace.
const inputLines = rawInputData.trim().split("\n");

// The first line of the input contains the total number of dice sets to process.
// Use parseInt with radix 10 for robust conversion.
const numDieSets = parseInt(inputLines.shift(), 10);

// Validate the parsed number of dice sets.
if (isNaN(numDieSets) || numDieSets < 0) {
    console.error("Error: Invalid or negative number of dice sets specified in input.");
    console.log("YES"); // If input is invalid, perhaps no dice sets means no duplicates.
    process.exit(0);
} else if (numDieSets === 0) {
    console.log("YES"); // Explicitly handle zero sets.
    process.exit(0);
}


// Iterate through each die set provided in the input.
for (let setIdx = 0; setIdx < numDieSets; setIdx++) {
    // Parse the current line into an array of numbers representing the die faces.
    // Each face value is expected to be space-separated.
    const currentDieState = inputLines[setIdx].split(" ").map(Number);

    // Call the dedicated function to process this single die set.
    const duplicateFoundInCurrentSet = processSingleDieSet(currentDieState);

    // If `overallCheckResult` has become false at any point (meaning a global duplicate was found),
    // we can terminate early as the final answer will be "No".
    if (!overallCheckResult) {
        break; // Exit the loop as the outcome is already determined.
    }
}

// Output the final result based on the `overallCheckResult` flag.
// If `overallCheckResult` is true, it means no duplicates were found ("YES").
// Otherwise, it means at least one duplicate was found ("No").
console.log(overallCheckResult ? "YES" : "No");