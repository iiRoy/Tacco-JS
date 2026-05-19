const INPUT_FILE_PATH = '/dev/stdin';
const MODULO_VALUE = 100000;

// Helper function for robust integer parsing
const parseInteger = (inputString) => parseInt(inputString, 10);

// Read raw input data from the specified path
const rawInputData = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
const inputLines = rawInputData.trim().split("\n");

// Extract and parse dimensions (m and n) from the first line
const dimensionStrings = inputLines.shift().split(" ");
const numRows = parseInteger(dimensionStrings[0]);
const numCols = parseInteger(dimensionStrings[1]);

// Populate the array of segment values (si)
const segmentValues = [];
// The loop runs 'numRows - 1' times as per original logic
for (let segmentIndex = 0; segmentIndex < numRows - 1; segmentIndex++) {
    segmentValues.push(parseInteger(inputLines.shift()));
}

// Populate the array of movement instructions (ai)
const movementInstructions = [];
for (let instructionIndex = 0; instructionIndex < numCols; instructionIndex++) {
    movementInstructions.push(parseInteger(inputLines.shift()));
}

let accumulatedSum = 0;
let currentTrackPosition = 0; // Represents the 'i' variable from the original code

// Helper function to calculate the state after a single step
// This encapsulates the core movement and sum update logic
const calculateNextStateAfterStep = (moveDirection, currentPos, segments, currentTotal) => {
    let newPos = currentPos;
    let newTotal = currentTotal;

    // Add value of current segment if moving forward
    if (moveDirection === 1) {
        newTotal += segments[newPos];
    }
    
    // Update position
    newPos += moveDirection;
    
    // Add value of new segment if moving backward
    if (moveDirection === -1) {
        newTotal += segments[newPos];
    }
    
    return { updatedPosition: newPos, updatedSum: newTotal };
};

// Process each movement instruction
for (const instructionMagnitude of movementInstructions) {
    // Determine the direction multiplier (1 for positive, -1 for negative)
    const directionMultiplier = (instructionMagnitude > 0) ? 1 : -1;
    let remainingSteps = Math.abs(instructionMagnitude);

    // Execute steps based on the instruction magnitude
    while (remainingSteps--) {
        const stepResult = calculateNextStateAfterStep(
            directionMultiplier,
            currentTrackPosition,
            segmentValues,
            accumulatedSum
        );
        currentTrackPosition = stepResult.updatedPosition;
        accumulatedSum = stepResult.updatedSum;
    }
}

// Output the final sum modulo MODULO_VALUE
console.log(accumulatedSum % MODULO_VALUE);
