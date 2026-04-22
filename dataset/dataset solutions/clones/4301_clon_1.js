'use strict' // This enables strict mode for the entire script.

// Global variables declaration.
let n, m, visited, graph; // n: number of nodes, m: number of edges, visited: tracking array, graph: adjacency matrix.

/**
 * A utility function to visualize the graph or a 2D array.
 * It prints '@' for true/connected and '-' for false/not connected.
 * @param {Array<Array<boolean>>} arr - The 2D array to visualize.
 */
const trace = arr => {
  let tmp = ''; // Initialize an empty string to build the visualization.

  // Iterate over rows of the input array.
  for (let i in arr) {
    // Iterate over columns in the current row.
    for (let j in arr[i]) {
      // Append '@' if the element is true, otherwise append '-'.
      tmp += arr[i][j] ? '@' : '-';
    }
    tmp += '\n'; // Add a newline character after each row.
  }
  console.log(tmp); // Print the complete visualization string to the console.
};

/**
 * Performs a Depth First Search (DFS) starting from a given node.
 * Marks visited nodes to prevent infinite loops and redundant exploration.
 * @param {number} i - The starting node for the DFS traversal.
 */
const dfs = i => {
  visited[i] = true; // Mark the current node 'i' as visited.

  // Iterate through all possible neighbors of the current node.
  for (let i2 = 0; i2 < n; i2++) {
    // If the neighbor 'i2' has already been visited,
    // or if there is no edge between 'i' and 'i2',
    // then skip this neighbor and continue to the next.
    if (visited[i2] || graph[i][i2] == false) {
      continue; // Skip this iteration.
    }
    dfs(i2); // Recursively call DFS on the unvisited and connected neighbor.
  }
};

/**
 * The main function that processes the input, builds the graph,
 * finds bridges, and outputs the result.
 * @param {string} input - The raw input string from stdin.
 */
function main(input) {
  // --- Data Parsing and Initialization ---

  // Split the input string by newlines, then each line by spaces,
  // and convert string numbers to actual numbers (using double bitwise NOT for truncation).
  input = input.split('\n').map(v => v.split(' ').map(v => ~~v));

  n = input[0][0]; // The first number on the first line is 'n' (number of nodes).
  m = input[0][1]; // The second number on the first line is 'm' (number of edges).

  // Extract the edge list, excluding the first line (n, m) and the last empty line.
  const edges = input.slice(1, -1);

  // Initialize the adjacency matrix for the graph.
  // It's an n x n matrix, initially filled with 'false' (no connections).
  graph = Array.apply(null, {
    length: n
  }).map(
    // For each row, create another array of length 'n' and fill it with 'false'.
    v =>
      (v = Array.apply(null, {
        length: n
      }).fill(false))
  );

  // Populate the adjacency matrix based on the input edges.
  // The graph is undirected, so add edges in both directions (a to b, and b to a).
  for (let i = 0; i < m; i++) {
    let a = edges[i][0] - 1; // Get the first node of the edge (adjust for 0-indexing).
    let b = edges[i][1] - 1; // Get the second node of the edge (adjust for 0-indexing).
    graph[a][b] = true; // Set connection from 'a' to 'b'.
    graph[b][a] = true; // Set connection from 'b' to 'a'.
  }

  // Initialize the 'visited' array for DFS.
  // All nodes are initially not visited.
  visited = Array.apply(null, {
    length: n
  }).fill(false);

  // --- Bridge Detection Logic ---

  let cnt = 0; // Counter for the number of bridges.

  // Iterate through all possible pairs of nodes (potential edges).
  // We only need to check each unique edge once, so i <= j is sufficient.
  // However, the original code iterates through all i,j and then divides by 2.
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Check if there is an existing edge between node 'i' and node 'j'.
      if (graph[i][j]) {
        // --- Edge Removal ---
        // If an edge exists, temporarily remove it to test if it's a bridge.
        graph[i][j] = false; // Remove edge from 'i' to 'j'.
        graph[j][i] = false; // Remove edge from 'j' to 'i' (undirected).

        // --- Connectivity Check ---
        // Reset the 'visited' array for a fresh DFS traversal.
        visited.fill(false); // Mark all nodes as unvisited.

        // Perform DFS starting from node 0.
        // We assume the graph is initially connected. If not, this approach needs adjustment.
        dfs(0); // Start DFS from node 0 to check connectivity.

        // After DFS, check if all nodes were visited.
        // If not all nodes were visited, it means removing the edge (i,j)
        // disconnected the graph, hence (i,j) is a bridge.
        if (!visited.every(v => v == true)) {
          cnt++; // Increment the bridge counter.
        }

        // --- Edge Restoration ---
        // Restore the removed edge to its original state for subsequent checks.
        graph[i][j] = true; // Restore edge from 'i' to 'j'.
        graph[j][i] = true; // Restore edge from 'j' to 'i'.
      }
    }
  }

  // The counter 'cnt' will have counted each bridge twice (once for (i,j) and once for (j,i)).
  // Therefore, divide by 2 to get the actual number of unique bridges.
  console.log(cnt / 2);

  // The following lines are commented out in the original code,
  // so they remain commented here to preserve Type I clone properties.
  //   count(graph)
  // trace(graph)
}

// Read input from stdin and pass it to the main function.
main(require("fs").readFileSync("/dev/stdin", "utf8"));