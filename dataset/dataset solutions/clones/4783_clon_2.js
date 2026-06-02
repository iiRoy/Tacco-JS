"use strict"; // Enforce strict mode for cleaner code

/**
 * Processes the raw input string to determine a specific movement sequence.
 * This function calculates a path based on target coordinates.
 * @param {string} inputData - The raw string input, typically from standard input.
 */
const processInput = (inputData) => {
    // Clean up the input: remove leading/trailing whitespace and split by newline.
    inputData = inputData.trim().split("\n");

    // Parse the coordinate values from the first line of input.
    const coordinateParts = inputData[0].split(" ");
    const startX = parseInt(coordinateParts[0], 10); // Starting X coordinate (not used in path generation logic)
    const startY = parseInt(coordinateParts[1], 10); // Starting Y coordinate (not used in path generation logic)
    const targetX = parseInt(coordinateParts[2], 10); // The X-dimension target for path calculation
    const targetY = parseInt(coordinateParts[3], 10); // The Y-dimension target for path calculation

    // Initialize an array to store the sequence of movements.
    let pathSequence = [];

    // --- First phase of movement: A rectangular path from origin to target and back ---

    // Move Right 'targetX' times.
    for (let idx = 0; idx < targetX; idx++) {
        pathSequence.push("R");
    }

    // Move Up 'targetY' times.
    for (let idx = 0; idx < targetY; idx++) {
        pathSequence.push("U");
    }

    // Move Left 'targetX' times.
    for (let idx = 0; idx < targetX; idx++) {
        pathSequence.push("L");
    }

    // Move Down 'targetY' times.
    for (let idx = 0; idx < targetY; idx++) {
        pathSequence.push("D");
    }

    // --- Second phase of movement: A larger loop around the target area ---

    // Perform one additional Left movement.
    pathSequence.push("L");

    // Move Up 'targetY + 1' times.
    for (let idx = 0; idx < targetY + 1; idx++) {
        pathSequence.push("U");
    }

    // Move Right 'targetX + 1' times.
    for (let idx = 0; idx < targetX + 1; idx++) {
        pathSequence.push("R");
    }

    // Perform one additional Down movement.
    pathSequence.push("D");

    // Move Down 'targetY + 1' times.
    for (let idx = 0; idx < targetY + 1; idx++) {
        pathSequence.push("D");
    }

    // Move Left 'targetX + 1' times.
    for (let idx = 0; idx < targetX + 1; idx++) {
        pathSequence.push("L");
    }

    // Perform one additional Up movement.
    pathSequence.push("U");

    // Join all movement characters into a single string and print to console.
    console.log(pathSequence.join(""));
};

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
