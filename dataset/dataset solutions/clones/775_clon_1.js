/*
 * This is an extensively modified Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace (indentation, line breaks, spacing) and comments have been altered.
 * The purpose is to demonstrate a visually different, yet functionally equivalent,
 * code structure as per the Type I clone definition.
 */

// Initial setup for standard input processing
// This section handles reading data from stdin asynchronously.
var stdin = '',
    input; // Declare variables stdin and input

process.stdin.resume(); // Ensure stdin stream remains open
process.stdin.setEncoding('utf8'); // Set the encoding for incoming data

// Event listener for 'data' chunks from stdin
process.stdin.on('data', function (chunk) {
  // Append each incoming chunk of data to the stdin buffer
  stdin += chunk;
});

// Event listener for the 'end' of the stdin stream
process.stdin.on('end', function () {
    // Once all data is received, split the accumulated string into an array of lines.
    // Each element in 'input' array will represent one line from the standard input.
    input = stdin.split('\n');
    // After processing input, invoke the main logic of the program.
    main();
});

// The core function containing the program's main logic.
function main() {
  // Parse the first line of input to extract key parameters.
  // The first line is expected to contain space-separated numbers.
  var firstLine = input[0].split(' '),
      // N: Number of nodes in the graph.
      n = +firstLine[0], // Convert string to number using unary plus operator.
      // M: Number of edges in the graph.
      m = +firstLine[1], // Convert string to number.
      // S: Starting node for path calculations (0-indexed).
      s = +firstLine[2] - 1, // Convert string to number, then adjust to 0-indexed.
      // G1: First target node (0-indexed).
      g1 = +firstLine[3] - 1, // Convert string to number, then adjust to 0-indexed.
      // G2: Second target node (0-indexed).
      g2 = +firstLine[4] - 1, // Convert string to number, then adjust to 0-indexed.
      // D: Adjacency matrix to store shortest path distances.
      d = new Array(n), // Initialize an array to hold rows of the matrix.
      // Temporary variable for parsing input lines.
      temp,
      // Loop counters.
      i,
      j,
      k;

  // Initialize the adjacency matrix for Floyd-Warshall algorithm.
  // Set diagonal elements to 0 (distance from a node to itself).
  // Set all other elements to Infinity (representing no direct path initially).
  for (i = 0; i < n; i++) {
    d[i] = new Array(n); // Create a new row for the matrix.
    for (j = 0; j < n; j++) {
      d[i][j] = i === j ? 0 : Infinity; // Conditional (ternary) operator for initialization.
    }
  }

  // Process the M edges provided in the input.
  // Edges start from the second line (input[1]).
  i = 1;
  while (i <= m) {
    temp = input[i].split(' '); // Split the current edge line into components.
    // Store the edge weight in the adjacency matrix.
    // Note: The input nodes are 1-indexed, so we subtract 1 to make them 0-indexed.
    d[temp[0] - 1][temp[1] - 1] = +temp[2]; // Convert weight to number.
    i++; // Move to the next edge line.
  }

  // Apply the Floyd-Warshall algorithm to find all-pairs shortest paths.
  // K is the intermediate node in the path (k-th iteration considers paths
  // that can go through nodes 0 to k-1).
  for (k = 0; k < n; k++) {
    // I is the source node.
    for (i = 0; i < n; i++) {
      // J is the destination node.
      for (j = 0; j < n; j++) {
        // Update the shortest path from i to j if a shorter path through k is found.
        d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
      }
    }
  }

  // Calculate the minimum total distance for the specific problem:
  // S -> X -> G1 + S -> X -> G2
  // Which is equivalent to d[s][x] + d[x][g1] + d[x][g2] for some intermediate node X.
  var res = Infinity; // Initialize result with a very large value.

  // Iterate through all possible intermediate nodes (X) from 0 to n-1.
  for (i = 0; i < n; i++) {
    // Update 'res' if the current path (S -> i -> G1 + S -> i -> G2) is shorter.
    // This is equivalent to finding a node 'i' such that the path from 's' to 'i',
    // then from 'i' to 'g1', and from 'i' to 'g2' is minimized.
    res = Math.min(res, d[s][i] + d[i][g1] + d[i][g2]);
  }
  // Output the final minimum distance to the console.
  console.log(res);
}