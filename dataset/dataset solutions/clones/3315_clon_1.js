'use strict' /* This directive enables strict mode for the entire script. */

// --- Depth First Search (DFS) function to find the longest path from a given node.
function dfs(
  root /* The current node being visited. */,
  list /* The adjacency list representing the graph. */,
  memo /* A memoization table to store computed results. */
) {
  // Check if the result for the current root is already memoized.
  if (memo[root.toString()]) {
    // If yes, return the memoized value.
    return memo[root.toString()]
  }

  // If the current node has no outgoing edges (it's a sink node).
  if (
    !list[root].length /* Check if the adjacency list for 'root' is empty. */
  ) {
    // The longest path from a sink node is 0.
    return 0
  }

  // Initialize maximum path length from this node.
  var max = 0 // Variable to store the maximum path length.

  // Iterate over all neighbors of the current node.
  for (var i = 0; i < list[root].length; i++) {
    /* Loop through each adjacent node. */
    // Recursively call dfs for the neighbor and update max.
    max = Math.max(
      max,
      1 + dfs(list[root][i], list, memo)
    ) /* Update max with the longest path. */
  }

  // Store the computed maximum path length in the memoization table.
  memo[root.toString()] = max

  // Return the maximum path length found.
  return max
}

// --- Function to build an adjacency list and count incoming edges.
function adjList(
  N /* The number of nodes in the graph. */,
  edges /* An array of edges [u, v]. */
) {
  // Initialize an adjacency list where each node has an empty array for its neighbors.
  var res = new Array(N + 1).fill(0).map(e => []) // 'res' will store the adjacency list.

  // Initialize an array to count incoming edges for each node.
  var incoming = new Array(N + 1).fill(0) // 'incoming' counts dependencies.

  // Populate the adjacency list and incoming edge counts.
  for (
    var i = 0;
    i < edges.length;
    i++ // Loop through all provided edges.
  ) {
    // Add the destination node to the source node's adjacency list.
    res[edges[i][0]].push(
      edges[i][1]
    ) /* Add edge to adjacency list. */

    // Increment the incoming edge count for the destination node.
    incoming[edges[i][1]]++
  }

  // Return an object containing both the adjacency list and incoming counts.
  return {
    list: res,
    incoming: incoming,
  }
}

// --- Main function to solve the problem (find the longest path in a DAG).
function solve(
  N /* Total number of nodes. */,
  edges /* Array of edges. */
) {
  // Build the adjacency list and count incoming edges.
  var adjListRes = adjList(N, edges) // Get graph representation.

  var list = adjListRes.list // Adjacency list.
  var incoming = adjListRes.incoming // Incoming edge counts.

  // Initialize overall maximum path length.
  var max = 0 // Stores the global maximum path.

  // Iterate through all nodes to find starting points (nodes with no incoming edges).
  for (
    var i = 1;
    i <= incoming.length;
    i++ // Nodes are 1-indexed.
  ) {
    // If a node has no incoming edges, it's a potential starting point for a path.
    if (
      incoming[i] ===
      0 /* Check if the node 'i' has no incoming edges. */
    ) {
      // Initialize a new memoization table for each DFS traversal from a new starting point.
      var memo = {} // Memoization for current DFS.

      // Perform DFS from this starting point and update the overall maximum.
      max = Math.max(
        max,
        dfs(i, list, memo)
      ) /* Update the overall max path. */
    }
  }

  // Return the maximum path length found across all possible starting points.
  return max
}

// --- Main entry point function for handling input and output.
function main(
  input /* The raw input string from stdin. */
) {
  // Split the input string into individual lines.
  var lines = input.split('\n') // Array of input lines.

  // Parse the first line to get N and M (M is not used here but often present).
  var NM = lines[0].split(' ').map(i => parseInt(i)) // N and M values.
  var N = NM[0] // Number of nodes.

  // Parse the remaining lines to get the edges.
  var edges = lines
    .slice(1)
    .map(l => l.split(' ').map(e => parseInt(e))) // Array of edge arrays.

  // Solve the problem using the parsed N and edges.
  var ans = solve(N, edges) // The computed answer.

  // Return the final answer.
  return ans
}

// Call the main function with input read from standard input and print the result.
// This part handles the execution environment.
console.log(
  main(require('fs').readFileSync('/dev/stdin', 'utf8'))
) /* Execute main and output result. */