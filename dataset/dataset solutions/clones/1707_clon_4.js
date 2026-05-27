const [firstLineData, ...remainingLines] = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);
const limitValue = Number(firstLineData);

let finalTally = 0;
// Calculate the sum of lengths of all possible subsegments [x, y] where 1 <= x <= y <= limitValue
for (let xCoord = 1; xCoord <= limitValue; xCoord++) {
  for (let yCoord = xCoord; yCoord <= limitValue; yCoord++) {
    finalTally += (yCoord - xCoord + 1);
  }
}

// Process each specified segment using a functional reduction approach
finalTally = remainingLines.reduce((accumulator, currentSegmentSpec) => {
  // The original code would process an empty string from a trailing newline,
  // resulting in [0, 0] after map(Number), which subtracts 0.
  // We maintain this behavior.
  const [rawStart, rawEnd] = currentSegmentSpec.split(/\s/).map(Number);
  
  let startPoint = rawStart;
  let endPoint = rawEnd;

  // Ensure startPoint is less than or equal to endPoint, matching original logic
  if (startPoint > endPoint) {
    [startPoint, endPoint] = [endPoint, startPoint];
  }

  // Subtract the count of subsegments [a, b] such that a <= startPoint and b >= endPoint
  return accumulator - (startPoint * (limitValue - endPoint + 1));
}, finalTally); // Initialize the accumulator with the pre-calculated total

console.log(finalTally);
