let rawData = require('node:fs').readFileSync('/dev/stdin', 'utf-8'); // Read raw input from standard input

const lineArray = rawData.trim().split('\n'); // Split input into an array of lines

let lineIndex = 0; // Initialize line pointer

const dimensions = lineArray[lineIndex].split(' ').map(Number); // Parse dimensions (rows, columns)
lineIndex++; // Advance line pointer

const rows = dimensions[0]; // Get number of rows
const cols = dimensions[1]; // Get number of columns

const segmentCosts = []; // Array to store costs for each segment
for (let idx = 0; idx < rows - 1; idx++) { // Populate segment costs
  segmentCosts[idx] = Number(lineArray[lineIndex]); // Convert string to number
  lineIndex++; // Move to next input line
}

const movements = []; // Array to store movement instructions
for (let idx = 0; idx < cols; idx++) { // Populate movement instructions
  movements[idx] = Number(lineArray[lineIndex]); // Convert string to number
  lineIndex++; // Move to next input line
}

let segmentCounts = []; // Array to count how many times each segment is crossed
for (let idx = 0; idx < rows - 1; idx++) { // Initialize segment crossing counts to zero
  segmentCounts[idx] = 0;
}

let currentSegmentIdx = 0; // Current position, starting at segment 0

movements.forEach(function(currentMove) { // Process each movement instruction
  const direction = (currentMove > 0) ? 1 : -1; // Determine movement direction (up/down)
  let stepsRemaining = Math.abs(currentMove); // Number of steps for this movement

  while (stepsRemaining--) { // Loop for each step in the current movement
    if (direction === 1) { // If moving downwards
      segmentCounts[currentSegmentIdx]++; // Increment count for the current segment
    }

    currentSegmentIdx += direction; // Update current position

    if (direction === -1) { // If moving upwards
      segmentCounts[currentSegmentIdx]++; // Increment count for the segment just moved into
    }
  }
});

let totalCost = 0; // Initialize total accumulated cost

segmentCounts.forEach(function(count, segmentIdx) { // Calculate total cost based on segment crossings and costs
  totalCost += segmentCosts[segmentIdx] * count; // Add cost for this segment
  totalCost %= 100000; // Apply modulo operation to keep sum within limits
});

console.log(totalCost); // Output the final calculated total cost