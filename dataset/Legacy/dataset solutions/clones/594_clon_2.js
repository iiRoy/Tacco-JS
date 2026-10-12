let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process raw input into an array of lines
let lineData = rawData.trim().split("\n");

// Extract dimensions (rows and columns) from the first line
const dimensions = lineData.shift().split(" ").map(Number);
const rows = dimensions[0];
const cols = dimensions[1];

// Populate the array of step increments
let stepIncrements = [];
for (let idx = 0; idx < rows - 1; idx++) {
    stepIncrements.push(lineData.shift() - 0); // Convert to number
}

// Populate the array of movement instructions
let movementInstructions = [];
for (let idx = 0; idx < cols; idx++) {
    movementInstructions.push(lineData.shift() - 0); // Convert to number
}

// Initialize total value and current position
let totalValue = 0;
let currentPos = 0;

// Iterate through each movement instruction
movementInstructions.forEach(function(instructionVal) {
    // Determine the direction factor (1 for positive, -1 for negative)
    const directionFactor = (instructionVal > 0) ? 1 : -1;
    
    // Get the absolute value of the instruction for the loop count
    let absInstructionVal = Math.abs(instructionVal);
    
    // Perform movements based on the absolute instruction value
    while (absInstructionVal--) {
        // If moving forward, add the value at the current position
        if (directionFactor === 1) {
            totalValue += stepIncrements[currentPos];
        }
        
        // Update the current position
        currentPos = currentPos + directionFactor;
        
        // If moving backward, add the value at the new current position
        if (directionFactor === -1) {
            totalValue += stepIncrements[currentPos];
        }
    }
});

// Output the final calculated total value
console.log(totalValue);
