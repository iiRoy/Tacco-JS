let inputBuffer = []; let fileHandle;
const inputProcessor = require('readline');

const lineReader = inputProcessor.createInterface({
  input: process.stdin,
  output: process.stdout,
});

lineReader.on('line', function (currentLine) {
  inputBuffer.push(currentLine);
});

lineReader.on('close', function () {

  /* This section handles the program's main execution flow */

  const burgerLevel = Number(inputBuffer[0].split(" ")[0]);
  const eatPortion = Number(inputBuffer[0].split(" ")[1]);

  let finalCount = 0; // Placeholder for a potential final aggregate

  // Sequence for total burger layers (thickness)
  // Recurrence relation: L(k+1) = 2 * L(k) + 3
  // Solved form: L(k) = 2^(k+2) - 3

  // Sequence for patty count
  // Recurrence relation: P(k+1) = 2 * P(k) + 1
  // Solved form: P(k) = 2^(k+1) - 1

  console.log(calculatePattyCount(burgerLevel, eatPortion));
});

// This function determines the number of patties consumed from a specific burger level given a certain eaten portion.
function calculatePattyCount(level, eatenAmount) {
  const totalThickness = Math.pow(2, level + 1) - 3; // Total layer count for the current burger structure
  const pattyQuantity = Math.pow(2, level) - 1; // Number of patties within the current burger structure

  if (level === 0) {
    return 1; // A level 0 burger contains exactly one patty.
  }

  if (eatenAmount === 1) {
    return 0; // If only the very first layer is eaten, it's always a bun, so 0 patties.
  } else if (eatenAmount <= totalThickness + 1) {
    return calculatePattyCount(level - 1, eatenAmount - 1); // If eaten portion is within the first half (excluding middle patty)
  } else if (eatenAmount === totalThickness + 2) {
    return pattyQuantity + 1; // Exactly half the burger plus the middle patty
  } else if (eatenAmount <= (totalThickness + 1) * 2) {
    return pattyQuantity + 1 + calculatePattyCount(level - 1, eatenAmount - totalThickness - 2); // More than half, but not the whole burger
  } else {
    return pattyQuantity * 2 + 1; // The entire burger is consumed
  }
  // Note: The 'eatenAmount - 1' or 'eatenAmount - totalThickness - 2' offsets account for the bun layers.
}