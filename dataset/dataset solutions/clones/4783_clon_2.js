"use strict"; // Enforces stricter parsing and error handling in the code.

/**
 * Orchestrates the generation of a specific movement sequence.
 * This function processes raw input coordinates to construct a path.
 * @param {string} inputContent The complete string of input data, typically from standard input.
 */
const calculateTraversal = inputContent => {

    // Preprocessing the input: remove leading/trailing whitespace and split into individual lines.
    const inputLines = inputContent.trim().split("\n");

    // Extracting the four coordinate values from the first line of the processed input.
    // The values represent a starting X, starting Y, target X, and target Y.
    const startHorizon = parseInt(inputLines[0].split(" ")[0]); // Horizontal start position.
    const startVert = parseInt(inputLines[0].split(" ")[1]);    // Vertical start position.
    const destHorizon = parseInt(inputLines[0].split(" ")[2]);  // Horizontal destination position.
    const destVert = parseInt(inputLines[0].split(" ")[3]);     // Vertical destination position.

    // Initialize an array to accumulate the individual movement commands.
    let motionPlan = [];

    // --- Section 1: Initial path to destination and back to origin ---

    // Move 'Right' (R) for the number of steps equivalent to the target horizontal coordinate.
    for (let stepCount = 0; stepCount < destHorizon; stepCount++) {
        motionPlan.push("R");
    }

    // Move 'Up' (U) for the number of steps equivalent to the target vertical coordinate.
    for (let stepCount = 0; stepCount < destVert; stepCount++) {
        motionPlan.push("U");
    }

    // Move 'Left' (L) for the number of steps equivalent to the target horizontal coordinate.
    for (let stepCount = 0; stepCount < destHorizon; stepCount++) {
        motionPlan.push("L");
    }

    // Move 'Down' (D) for the number of steps equivalent to the target vertical coordinate.
    for (let stepCount = 0; stepCount < destVert; stepCount++) {
        motionPlan.push("D");
    }

    // --- Section 2: Detour to the left and up, then back ---

    // Execute a single 'Left' (L) movement.
    motionPlan.push("L");

    // Move 'Up' (U) for one more step than the target vertical coordinate.
    for (let stepCount = 0; stepCount < destVert + 1; stepCount++) {
        motionPlan.push("U");
    }

    // Move 'Right' (R) for one more step than the target horizontal coordinate.
    for (let stepCount = 0; stepCount < destHorizon + 1; stepCount++) {
        motionPlan.push("R");
    }

    // Execute a single 'Down' (D) movement.
    motionPlan.push("D");

    // --- Section 3: Final return path ---

    // Move 'Down' (D) for one more step than the target vertical coordinate.
    for (let stepCount = 0; stepCount < destVert + 1; stepCount++) {
        motionPlan.push("D");
    }

    // Move 'Left' (L) for one more step than the target horizontal coordinate.
    for (let stepCount = 0; stepCount < destHorizon + 1; stepCount++) {
        motionPlan.push("L");
    }

    // Execute a single 'Up' (U) movement to complete the sequence.
    motionPlan.push("U");

    // Output the final concatenated string of all movement commands to the console.
    console.log(motionPlan.join(""));
};

// Initiate the traversal calculation by reading input from the standard input stream.
// This typically involves reading from a file path like '/dev/stdin' in Unix-like systems.
calculateTraversal(require('fs').readFileSync('/dev/stdin', 'utf8'));