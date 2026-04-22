/* This is a Type I clone of the original JavaScript code.
 * It maintains the exact same functionality and structure,
 * but with significant variations in whitespace and comments. */

// --- Input Reading Section ---
// Read the entire input from standard input,
// assuming it's UTF-8 encoded.
var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// Split the input string into an array of lines.
var lines = input.split('\n');


// --- Graph Initialization Section ---
// The first line of input represents 'n', the number of nodes.
// Convert it to a number using the unary plus operator.
var n = +lines.shift();

// Initialize the adjacency matrix 'g'.
// 'g' will store the graph structure.
// Using 1-based indexing for nodes, so size is n+1.
var g = [[]]; // Initialize with an empty array for index 0

// Populate the adjacency matrix with zeros.
// This loop creates 'n' rows (from index 1 to n)
// and initializes all cells in each row to 0.
for (var i = 1; i <= n; i++) {
  g.push([]); // Add a new row for node 'i'
  for (var j = 1; j <= n; j++) {
    g[i][j] = 0; // Initialize edge as non-existent
  }
}


// --- Graph Population Section ---
// Loop 'n' times to read the adjacency list for each node.
for (var i = 1; i <= n; i++) {
  // Read a line, split by space, and convert elements to numbers.
  // u[0] will be the node ID, u[1] will be the count of its neighbors.
  // The rest are the neighbor IDs.
  var u = lines.shift().split(' ').map(function(n_str) {
    return +n_str;
  });

  var id = u[0]; // The current node's ID (though 'i' is also used for row index)
  var k = u[1]; // The number of neighbors for node 'id'

  // Iterate through the neighbors listed in the current line.
  // u[2 + j] gives the j-th neighbor's ID.
  for (var j = 0; j < k; j++) {
    // Set the corresponding entry in the adjacency matrix to 1,
    // indicating an edge from node 'i' to its neighbor.
    g[i][u[2 + j]] = 1;
  }
}


// --- Breadth-First Search (BFS) Section ---
// 'd' will store the shortest distances from the starting node (node 1).
// Initialize 'd' with -1, indicating unvisited nodes.
var d = [];
for (var i = 0; i <= n; i++) {
  d[i] = -1; // -1 means node 'i' is not yet reached
}

// 'Q' is the queue for BFS. Start with node 1.
var Q = [1];
d[1] = 0; // Distance from source to itself is 0

var u_current_node; // Variable to hold the current node popped from the queue

// Perform BFS until the queue is empty.
while (u_current_node = Q.shift()) { // Dequeue the front element
  // Iterate through all possible neighbors of the current node 'u_current_node'.
  for (var i = 1; i <= n; i++) {
    // If there is no edge from 'u_current_node' to 'i', skip.
    if (!g[u_current_node][i]) {
      continue;
    }

    var v = i; // 'v' is the neighbor node

    // If neighbor 'v' has not been visited yet (distance is -1).
    if (d[v] == -1) {
      // Set its distance: one more than the current node's distance.
      d[v] = d[u_current_node] + 1;
      // Enqueue the neighbor to visit its neighbors later.
      Q.push(v);
    }
  }
}


// --- Output Section ---
// Print the ID of each node and its shortest distance from node 1.
// If a node was unreachable, its distance will remain -1.
for (var node_id_to_print = 1; node_id_to_print <= n; node_id_to_print++) {
  console.log(node_id_to_print, d[node_id_to_print]);
}