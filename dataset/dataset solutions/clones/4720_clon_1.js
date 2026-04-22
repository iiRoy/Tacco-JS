"use strict"; // Enable strict mode for JavaScript parsing and execution.

// This is the primary function for the application, handling input processing and core logic.
const main = (arg) => {

  // First, clean up the raw input string: trim leading/trailing whitespace and split into individual lines.
  arg = arg.trim().split("\n");

  // Extract problem parameters N (number of nodes) and M (number of edges) from the first line of input.
  const N = parseInt(arg[0].split(" ")[0]); // N is the first number on the first line.
  const M = parseInt(arg[0].split(" ")[1]); // M is the second number on the first line.


  // Parse the adjacency list (edges) from the input.
  // We slice the array to get only the edge definitions, then map each line to an array of two integers.
  const ab = arg.slice(1, N + 1).map(n => n.split(" ").map(l => parseInt(l)));


  // Initialize the adjacency matrix (mx) for the graph representation.
  // It's an N x N matrix, with all elements initially set to 0.
  const mx = [...Array(N)].map(n => [...Array(N)].fill(0));


  // Populate the adjacency matrix based on the 'ab' (edges) array.
  // For each edge (from, to), mark connectivity in both directions as it's an undirected graph.
  for (let i in ab) {
    const from = ab[i][0] - 1; // Adjust node index to be 0-based.
    const to = ab[i][1] - 1;   // Adjust node index to be 0-based.

    mx[from][to] = 1; // Mark connection from 'from' to 'to'.
    mx[to][from] = 1; // Mark connection from 'to' to 'from'.
  }


  // Initialize a counter variable. This will store the total number of valid paths found.
  let sum = 0;


  // Define the Depth First Search (DFS) function.
  // 'v' represents the current node being visited.
  // 'visited' is an array tracking which nodes have been visited in the current path.
  const dfs = (v, visited) => {

    // Base case for the recursion: If all nodes have been visited, we've found a valid path.
    if (visited.every(v => v === true)) {
      sum++; // Increment the counter for valid paths.
    }


    // Iterate through all possible neighbors of the current node 'v'.
    for (let i = 0; i < N; i++) {
      // Check if there is an edge between node 'v' and node 'i'.
      if (mx[v][i] === 0) {
        continue; // If no edge exists, skip this potential neighbor.
      }
      // Check if node 'i' has already been visited in the current DFS path.
      if (visited[i]) {
        continue; // If already visited, skip to avoid cycles in the current path.
      }

      // Mark node 'i' as visited for the current path.
      visited[i] = true;
      // Recursively call dfs for the next node 'i'.
      dfs(i, visited);
      // Backtrack: Unmark node 'i' as visited. This is crucial for exploring other paths.
      visited[i] = false;
    }

    // The function explicitly returns nothing, as its primary effect is updating the 'sum' variable.
    return;
  };


  // Initialize the 'visited' array for the initial DFS call.
  // Node 0 is marked as visited to start the traversal from it, others are initially false.
  const visited = [true, ...[...Array(N - 1)].map(n => false)];
  // Begin the DFS traversal from node 0.
  dfs(0, visited);


  // Output the final calculated sum (number of valid paths) to the console.
  console.log(sum);

}; // End of the main function definition.

// Execute the main function, reading input from standard input (/dev/stdin).
main(require('fs').readFileSync('/dev/stdin', 'utf8'));