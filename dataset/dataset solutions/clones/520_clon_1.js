/*
 * This is a Type I clone of an existing JavaScript program.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */

var input = ''; // Initialize an empty string to accumulate input data.


// Resume the standard input stream to begin listening for data.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding(
  'utf8'
);


// Attach an event listener for when data chunks are received.
process.stdin.on('data', function (chunk) {
  // Append each incoming data chunk to the 'input' variable.
  input += chunk;
});


// Attach an event listener for when the input stream ends.
process.stdin.on('end', function () {
  // Once all input has been received, split the accumulated string by newlines
  // and pass the resulting array of lines to the main processing function.
  main(input.split('\n'));
});


// The main function that orchestrates the problem-solving logic.
function main(
  input // An array of strings, where each string is a line from the input.
) {

  var max, // Declares a variable 'max' to store the maximum jump length.
    n; // Declares a variable 'n' to store the number of intermediate points.
  var i; // Declares a loop counter variable 'i'.


  // Loop continues as long as the first element of the input array (converted to a number)
  // is not equal to zero. This element represents 'max' for the current test case.
  while ((max = input.shift() - 0) !== 0) {
    var d = []; // Initialize an empty array 'd' to store jump offsets for each point.
    n = input.shift() - 0; // Read the next input line and convert it to a number for 'n'.
    d[0] = 0; // Set the jump offset for the starting point (index 0) to 0.
    d[n + 1] = 0; // Set the jump offset for the ending point (index n+1) to 0.

    // Loop to read 'n' additional jump offsets from the input.
    for (i = 1; i <= n; i++) {
      d[i] = input.shift() - 0; // Store each jump offset, converting it to a number.
    }

    // Call the 'solve' function with the current 'max', 'n', and 'd' values.
    // Based on the boolean result, print 'OK' or 'NG' to the console.
    console.log(solve(max, n, d) ? 'OK' : 'NG');
  }
}


// Function to create an adjacency matrix for a graph with 'n' nodes.
function makeGraph(n) {

  var i, // Outer loop counter.
    j, // Inner loop counter.
    g; // Variable to hold the adjacency matrix (the graph).

  g = []; // Initialize 'g' as an empty array.

  // Outer loop to create rows for the adjacency matrix.
  for (i = 0; i < n; i++) {
    g[i] = []; // Initialize each row 'i' as an empty array.
    // Inner loop to populate columns for the current row.
    for (j = 0; j < n; j++) {
      // Set the distance from a node to itself to 0.
      // Set the distance between different nodes to Infinity, indicating no direct path initially.
      g[i][j] = i === j ? 0 : Infinity;
    }
  }
  return g; // Return the newly created and initialized graph.
}


// Implements the Warshall-Floyd algorithm to find all-pairs shortest paths in a graph.
function warshall_floyd(d) {
  var i, // Represents the source node in the path.
    j, // Represents the destination node in the path.
    k, // Represents the intermediate node through which paths are considered.
    n = d.length; // The total number of nodes in the graph (length of the adjacency matrix).

  // The outermost loop iterates through all possible intermediate nodes 'k'.
  for (k = 0; k < n; k++) {
    // The second loop iterates through all possible source nodes 'i'.
    for (i = 0; i < n; i++) {
      // The innermost loop iterates through all possible destination nodes 'j'.
      for (j = 0; j < n; j++) {
        // This is the core of the Warshall-Floyd algorithm:
        // It checks if the path from 'i' to 'j' via 'k' is shorter than the currently known path.
        // If (d[i][k] + d[k][j]) is less than d[i][j], update d[i][j] with the shorter path.
        d[i][j] = d[i][j] > d[i][k] + d[k][j] ? d[i][k] + d[k][j] : d[i][j];
      }
    }
  }
  return d; // Return the graph with all-pairs shortest paths calculated.
}


// The core function to solve the specific problem using graph traversal.
function solve(
  max, // The maximum distance a jump can cover.
  n, // The number of intermediate points in the problem.
  d // An array containing the jump offsets for each point.
) {
  // Create a graph with 'n + 2' nodes: 0 (start), 1 to n (intermediate), n+1 (end).
  var g = makeGraph(n + 2);
  var i, // Loop counter for the current position.
    j; // Loop counter for the jump distance.
  var pos; // Variable to store the calculated next position after a jump.

  // Build the graph by adding edges representing possible jumps.
  // Iterate through all possible starting points, from 0 to 'n'.
  for (i = 0; i <= n; i++) {
    // For each starting point, iterate through all possible jump distances (1 to 'max').
    for (j = 1; j <= max; j++) {
      // Calculate the next position: current position + jump distance + jump offset (if applicable).
      // The jump offset 'd[i + j]' is applied only if 'i + j' is within the bounds of 'n + 1'.
      pos = i + j + (i + j < n + 1 ? d[i + j] : 0);

      // Ensure the calculated position 'pos' stays within the valid range [0, n+1].
      pos = Math.min(Math.max(pos, 0), n + 1);

      // If the calculated next position is different from the current position 'i',
      // it means a valid jump occurred, so add an edge to the graph.
      if (pos !== i) {
        g[i][pos] = 1; // Set the edge weight to 1, indicating a direct jump.
      }
    }
  }

  // After constructing the graph, apply the Warshall-Floyd algorithm
  // to find the shortest path between all pairs of nodes.
  warshall_floyd(g);

  // Check the connectivity from the start node (0) to the end node (n+1)
  // and ensure all reachable intermediate nodes can also reach the end.
  for (i = 0; i <= n; i++) {
    // If node 'i' is reachable from the start (g[0][i] is not Infinity),
    // BUT node 'i' cannot reach the end (g[i][n+1] is Infinity),
    // then it's impossible to reach the end from some reachable path.
    if (g[0][i] < Infinity && g[i][n + 1] === Infinity) {
      return false; // Return false, as the condition is not met.
    }
  }
  return true; // If the loop completes without returning false, all conditions are met.
}