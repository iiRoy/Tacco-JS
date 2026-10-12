const [firstLine, ...edgeStrings] = require('fs')
  .readFileSync('/dev/stdin', 'utf8') // Read input from standard input
  .split(/\n/); // Split the input by newline characters

// Convert the first line to a number, representing the total number of nodes
const nodeCount = Number(firstLine);

// Calculate the initial sum using the formula for combinations (n+2 choose 3)
// This represents the total number of paths in a complete graph or similar structure
let finalSum = (nodeCount * (nodeCount + 1) * (nodeCount + 2)) / 6;

// Iterate over each edge string provided in the input
for (const currentEdgeStr of edgeStrings) {
  // Parse the two node identifiers from the current edge string
  let [nodeA, nodeB] = currentEdgeStr.split(/ /).map(Number);

  // Ensure that nodeA is always less than or equal to nodeB for consistent calculation
  if (nodeA > nodeB) {
    // Swap the values if nodeA is greater than nodeB
    [nodeA, nodeB] = [nodeB, nodeA];
  }

  // Subtract a specific value related to the current edge from the total sum
  // This step likely removes paths that are invalidated or counted incorrectly due to this edge
  finalSum -= nodeA * (nodeCount - nodeB + 1);
}

// Output the final calculated sum to the console
console.log(finalSum);
