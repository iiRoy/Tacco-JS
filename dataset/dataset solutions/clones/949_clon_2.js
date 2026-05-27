const settings = {
  input: '/dev/stdin', // Specifies the input source, typically standard input for Linux
  newline: '\n'        // Defines the newline character used to split input lines
};

// Reads the entire content of the specified input file,
// converts it to ASCII, removes leading/trailing whitespace,
// splits it into an array of lines, and then parses each line.
let inputLines = require('fs').readFileSync(settings.input, 'ascii')
  .trim() // Removes any whitespace from both ends of the input string
  .split(settings.newline) // Divides the string into an ordered list of substrings based on the newline character
  .map(function (currentLine) {
    // For each line, it splits the line by spaces and converts each part into a number.
    return currentLine.split(' ').map(Number);
  });

// Extracts key parameters from the processed input data.
let nodeCount = inputLines[0][0]; // The total number of nodes in the graph structure
let edgeCount = inputLines[0][1]; // The total number of edges that define connections
let queryCount = inputLines[edgeCount + 1][0]; // The number of connectivity queries to perform

// Initializes a parent array for a Disjoint Set Union (DSU) data structure.
// The array size is `nodeCount + 1` to support 1-based indexing for nodes.
let parentArray = new Array(nodeCount + 1);
// Fills the parent array with `null` values, indicating that initially, each node is its own parent (root of its set).
for (let idx = 0; idx <= nodeCount; idx++) {
  parentArray[idx] = null;
}

// Processes each edge to perform union operations, building the DSU structure.
// Edges are read from the input, starting from the second line (index 1).
for (let idx = 1; idx <= edgeCount; idx++) {
  // Determines the two nodes involved in the current edge.
  // `nodeA` will hold the smaller ID, `nodeB` the larger, for consistent union logic.
  let nodeA = Math.min(inputLines[idx][0], inputLines[idx][1]);
  let nodeB = Math.max(inputLines[idx][0], inputLines[idx][1]);

  // Finds the root of `nodeA`'s set using path compression.
  // It traverses up the parent chain until it finds a node whose parent is `null`.
  while (parentArray[nodeA] !== null) {
    nodeA = parentArray[nodeA];
  }
  // Performs the union operation: sets the root of `nodeB`'s set to be the root of `nodeA`'s set.
  // This effectively merges the two sets.
  parentArray[nodeB] = nodeA;
}

// Processes each connectivity query.
// Queries start after the initial parameters and all edge definitions.
for (let idx = edgeCount + 2; idx < (edgeCount + 2) + queryCount; idx++) {
  // Extracts the two nodes for the current query.
  let queryNodeA = inputLines[idx][0];
  let queryNodeB = inputLines[idx][1];

  // Finds the root of `queryNodeA`'s set using path compression.
  while (parentArray[queryNodeA] !== null) {
    queryNodeA = parentArray[queryNodeA];
  }
  // Finds the root of `queryNodeB`'s set using path compression.
  while (parentArray[queryNodeB] !== null) {
    queryNodeB = parentArray[queryNodeB];
  }

  // Compares the roots of the two query nodes.
  // If their roots are identical, they belong to the same connected component.
  // Outputs 'yes' if connected, 'no' otherwise.
  console.log((queryNodeA === queryNodeB) ? 'yes' : 'no');
}
