/*
 * This JavaScript code implements an iterative Depth-First Search (DFS) algorithm
 * to compute discovery and finish times for nodes in a graph.
 * The graph data is read from standard input.
 */

// Define configuration for input source and newline character.
// The commented-out line below shows a configuration for Windows systems.
// config = { input: 'tmp', newline: '\r\n' }; // Configuration for Windows environment.

// Current configuration is set for Unix-like systems (e.g., Linux), using stdin.
config = {
  input: '/dev/stdin', // Specifies the input stream (standard input).
  newline: '\n'        // Defines the newline character for parsing input lines.
};


// Read the entire input, process it, and prepare an array of lines.
line = require('fs') // Access the Node.js File System module.
  .readFileSync(config.input, 'ascii') // Read file content synchronously as ASCII.
  .trim() // Remove leading/trailing whitespace from the entire content.
  .split(config.newline); // Split the content into an array of strings, one per line.

// Extract the number of nodes (n) from the first line of input.
n = Number(line.shift()); // The .shift() method removes the first element from 'line' array.

// Initialize an empty object to represent the adjacency list of the graph.
adj = {}; // 'adj' will store nodes as keys and arrays of their neighbors as values.

// Populate the adjacency list by parsing the remaining input lines.
for (i in line) { // Iterate over each line in the 'line' array.
  ary = line[i].split(' '); // Split the current line by spaces to get node and its neighbors.
  j = ary.shift(); // The first element is the current node's identifier.
  ary.shift(); // The second element (usually neighbor count) is discarded as it's not used here.
  adj[j] = ary; // Assign the rest of the elements (neighbors) to node 'j' in the adjacency list.
}


// Sort the adjacency list for each node to ensure consistent traversal order.
for (i in adj) { // Loop through each node (key) in the 'adj' object.
  adj[i].sort( // Sort the array of neighbors for the current node 'i'.
    function (a, b) { // Custom comparison function for numeric sorting.
      return Number(a) - Number(b); // Sort neighbors numerically in ascending order.
    }
  );
}


// Initialize variables required for the DFS traversal.
d = {}; // 'd' object will store discovery times for each node.
f = {}; // 'f' object will store finish times for each node.
t = 1; // 't' is a global timer, initialized to 1, increments with each discovery/finish event.
stack = []; // 'stack' is used for iterative DFS to keep track of the path.
next = '1'; // 'next' holds the identifier of the node currently being processed, starting with '1'.


// Begin the iterative Depth-First Search (DFS) traversal.
do {
  // If the current node 'next' has not yet been discovered (i.e., not in 'd').
  if (!d.hasOwnProperty(next)) {
    // Record its discovery time.
    d[next] = t; // Assign the current timer value to 'd[next]'.
  }

  // Find the next unvisited neighbor of the current node.
  idx = null; // 'idx' will store the index of the unvisited neighbor.
  ary = adj[next]; // Get the list of neighbors for the current node 'next'.
  for (i in ary) { // Iterate through the neighbors.
    if (!d.hasOwnProperty(ary[i])) { // Check if the neighbor 'ary[i]' has been discovered.
      idx = i; // If not discovered, this is our next node to visit.
      break; // Stop searching for neighbors.
    }
  }

  // Decision logic based on whether an unvisited neighbor was found.
  if (idx) {
    // If an unvisited neighbor exists:
    stack.push(next); // Push the current node onto the stack to backtrack later.
    next = ary[idx]; // Move to the newly found unvisited neighbor.
    t++; // Increment the global timer for this discovery.
  } else {
    // If no unvisited neighbors (all neighbors visited or no neighbors):
    t++; // Increment the global timer (marks the finish event for 'next').
    f[next] = t; // Record the finish time for the current node 'next'.
    next = stack.pop(); // Backtrack: pop the last node from the stack to continue from there.
  }
} while (stack.length !== 0); // Continue the loop as long as the stack is not empty.

// After the main DFS loop, the last node to be processed (which caused the stack to empty)
// still needs its final finish time recorded.
t++; // Increment the timer one last time.
f[next] = t; // Assign the final finish time to the last node.


// Output the discovery and finish times for all nodes.
// The loop iterates from node 1 up to 'n' (inclusive).
for (i = 1; i <= n; i++) { // Loop through each node identifier.
  // Print the node ID, its discovery time, and its finish time.
  console.log("%d %s %s", i, d[i], f[i]); // Uses C-style format string for output.
}