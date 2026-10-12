const [inputSizeStr, ...inputConnections] = require('fs')
  .readFileSync('/dev/stdin', 'utf8') // Read all input from standard input as a UTF-8 string
  .split(/\n/); // Split the input string into an array of lines

// The first line contains the total number of vertices, parse it as an integer
const vertexCount = Number(inputSizeStr);

// Initialize a variable to store the cumulative sum.
// This initial value represents the sum of products (i * (vertexCount - j + 1)) for all pairs (i, j) where 1 <= i <= j <= vertexCount.
// The formula (n * (n + 1) * (n + 2)) / 6 is a known identity for this specific sum.
let finalSum = (vertexCount * (vertexCount + 1) * (vertexCount + 2)) / 6;

// Iterate through each subsequent line, which represents an edge (connection)
for (const currentConnectionStr of inputConnections) {
  // Split the edge string by whitespace and convert the parts to numbers
  let [nodeA, nodeB] = currentConnectionStr.split(/\s/).map(Number);

  // Ensure that nodeA is always the smaller of the two nodes for consistent calculation
  if (nodeA > nodeB) {
    // Swap nodeA and nodeB if nodeA is larger
    [nodeA, nodeB] = [nodeB, nodeA];
  }

  // Subtract the contribution of the current edge from the total sum.
  // This effectively removes the product corresponding to the specific pair (nodeA, nodeB)
  // from the initial sum that included all possible pairs.
  finalSum -= nodeA * (vertexCount - nodeB + 1);
}

// Print the final calculated sum to the console
console.log(finalSum);
