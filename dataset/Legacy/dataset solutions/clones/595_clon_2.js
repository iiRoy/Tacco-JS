var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineData = rawData.trim().split("\n"); // Split input into lines
var linePointer = 0; // Pointer to current line in lineData

// Read the first line for dimensions M and N
var dimensions = lineData[linePointer].split(" ").map(Number);
linePointer++;

var rowsCount = dimensions[0]; // M
var colsCount = dimensions[1]; // N

// Initialize array for segment lengths
var segmentLengths = [];
// Populate segment lengths from input
for (var segmentIdx = 0; segmentIdx < rowsCount - 1; segmentIdx++) {
    segmentLengths[segmentIdx] = Number(lineData[linePointer]); // Convert string to number
    linePointer++;
}

// Initialize array for movement instructions
var movementInstructions = [];
// Populate movement instructions from input
for (var instructionIdx = 0; instructionIdx < colsCount; instructionIdx++) {
    movementInstructions[instructionIdx] = Number(lineData[linePointer]);
    linePointer++;
}

// Initialize array to count visits for each segment
var segmentVisits = [];
// Set initial visit counts to zero
for (var visitCounter = 0; visitCounter < rowsCount - 1; visitCounter++) {
    segmentVisits[visitCounter] = 0;
}

var currentPosition = 0; // Current position on the segments, starting at 0

// Process each movement instruction
movementInstructions.forEach(function (instructionValue) {
    // Determine movement direction: 1 for forward, -1 for backward
    var directionFactor = (instructionValue > 0) ? 1 : -1;
    
    // Use the absolute value of the instruction for the number of steps
    // The original code reuses the 'v' variable, so we reuse 'instructionValue'
    instructionValue = Math.abs(instructionValue);
    
    // Execute the movement steps
    while (instructionValue--) {
        // If moving forward, increment visit count for the segment *before* moving
        if (directionFactor === 1) {
            segmentVisits[currentPosition]++;
        }
        
        // Update the current position
        currentPosition = currentPosition + directionFactor;
        
        // If moving backward, increment visit count for the segment *after* moving
        if (directionFactor === -1) {
            segmentVisits[currentPosition]++;
        }
    }
});

var totalLength = 0; // Initialize the total weighted length

// Calculate the final sum based on segment lengths and visit counts
segmentVisits.forEach(function (visitCount, segmentIndex) {
    totalLength += segmentLengths[segmentIndex] * visitCount;
    // Apply modulo operation to keep the sum within the specified range
    totalLength = totalLength % 100000;
});

// Output the final calculated total length
console.log(totalLength);
