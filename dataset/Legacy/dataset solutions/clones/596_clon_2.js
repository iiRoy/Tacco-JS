let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input

let lineArray = rawData.trim().split("\n"); // Process raw data into an array of lines

const dimensions = lineArray.shift().split(" ").map(Number); // Extract the first line, split by space, and convert to numbers
const rows = dimensions[0]; // Store the first dimension (M)
const cols = dimensions[1]; // Store the second dimension (N)

let stepIncrements = []; // Initialize an array to hold step increment values
// Populate the step increments array from the input lines
for (let currentIdx = 0; currentIdx < rows - 1; currentIdx++) {
    stepIncrements.push(Number(lineArray.shift()));
}

let actionInstructions = []; // Initialize an array to hold action instruction values
// Populate the action instructions array from the input lines
for (let currentIdx = 0; currentIdx < cols; currentIdx++) {
    actionInstructions.push(Number(lineArray.shift()));
}

let totalValue = 0; // Initialize the accumulator for the total value
let currentIdx = 0; // Initialize the current position index

// Iterate over each action instruction
actionInstructions.forEach(function(instructionVal) {
    const directionMultiplier = (instructionVal > 0) ? 1 : -1; // Determine the direction of movement (1 for forward, -1 for backward)
    let absoluteInstruction = Math.abs(instructionVal); // Get the absolute value of the instruction for loop iterations

    // Loop for the number of steps indicated by the absolute instruction value
    while (absoluteInstruction--) {
        // If moving forward, add the value at the current index before moving
        if (directionMultiplier === 1) {
            totalValue += stepIncrements[currentIdx];
        }
        
        currentIdx = currentIdx + directionMultiplier; // Update the current position index
        
        // If moving backward, add the value at the new (decremented) index after moving
        if (directionMultiplier === -1) {
            totalValue += stepIncrements[currentIdx];
        }
    }
});

// Output the final accumulated value modulo 100000
console.log(totalValue % 100000);
