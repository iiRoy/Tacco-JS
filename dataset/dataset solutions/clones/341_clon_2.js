let dataMap = {}; // Initialize an empty object to store calculated costs by weight.

// Outer loop for item type A (e.g., 'i' in original)
for (let idxA = 0; idxA <= 25; idxA++) {
  // Middle loop for item type B (e.g., 'j' in original)
  for (let idxB = 0; idxB <= 16; idxB++) {
    // Inner loop for item type C (e.g., 'k' in original)
    for (let idxC = 0; idxC <= 10; idxC++) {

      // Calculate the total mass for the current combination of items
      const totalMass = (200 * idxA) + (300 * idxB) + (500 * idxC);

      // If the total mass exceeds the limit, skip this combination
      if (totalMass > 5000) {
        continue;
      }

      let totalCost = 0; // Initialize the total cost for this specific combination

      // Calculate cost for item A, considering bulk discounts
      totalCost += 380 * 5 * 0.8 * Math.floor(idxA / 5); // Bulk of 5 units at 80% price
      // Calculate cost for item B, considering bulk discounts
      totalCost += 550 * 4 * 0.85 * Math.floor(idxB / 4); // Bulk of 4 units at 85% price
      // Calculate cost for item C, considering bulk discounts
      totalCost += 850 * 3 * 0.88 * Math.floor(idxC / 3); // Bulk of 3 units at 88% price

      // Add cost for remaining individual units of item A
      totalCost += 380 * (idxA % 5);
      // Add cost for remaining individual units of item B
      totalCost += 550 * (idxB % 4);
      // Add cost for remaining individual units of item C
      totalCost += 850 * (idxC % 3);

      // Check if this totalMass already exists in our map
      if (dataMap.hasOwnProperty(totalMass)) {
        // If it exists, update with the minimum cost found so far for this mass
        dataMap[totalMass] = Math.min(dataMap[totalMass], totalCost);
      } else {
        // If it's a new totalMass, store its calculated cost
        dataMap[totalMass] = totalCost;
      }
    }
  }
}

// Read all input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the input: trim whitespace and split into an array of lines
let inputLines = rawData.trim().split("\n");

// Loop to process each input line
while (true) {
  // Get the next mass value from the input array and convert it to a number
  const currentMass = inputLines.shift() - 0;

  // If the input mass is 0, it signifies the end of input, so break the loop
  if (currentMass === 0) {
    break;
  }

  // Output the minimum cost associated with the requested mass from our pre-calculated map
  console.log(dataMap[currentMass]);
}
