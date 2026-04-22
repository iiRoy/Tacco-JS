// This JavaScript file implements a solution for a graph/tree problem.
// It involves constructing an adjacency list and performing a Depth First Search (DFS).
// The problem likely calculates some properties of nodes or paths in a tree structure.

'use strict'
// Enforce strict parsing and error handling for cleaner code.


// Define a global modulus constant.
// This is frequently used in competitive programming to prevent integer overflow
// when dealing with large numbers, typically 10^9 + 7.
var mod = 1e9 + 7;


/**
 *  Performs a Depth First Search (DFS) traversal starting from a given root node.
 *  This function is designed to calculate two specific values (ans[0] and ans[1])
 *  for the subtree rooted at 'root', based on its children's results.
 *
 *  @param   {number}   root      The current node from which the DFS is performed.
 *  @param   {Array[]}  adj       The adjacency list representing the graph.
 *                                Each element adj[i] is an array of neighbors of node i.
 *  @param   {number[]} visited   An array used to keep track of visited nodes
 *                                to prevent infinite loops in cyclic graphs or
 *                                re-processing nodes in a tree traversal.
 *  @returns {number[]} An array `[ans0, ans1]` containing the two calculated values
 *                                for the subtree rooted at 'root', respecting the modulus.
 */
function dfs
(
  root,    // The identifier of the current node being processed.
  adj,     // The complete adjacency list of the graph.
  visited  // The array tracking which nodes have already been visited.
)
{
  // Initialize the result array for the current node.
  // These are often base cases or initial values for a dynamic programming-like
  // calculation on trees.
  var ans = [ 1, 1 ];

  // Iterate through all immediate neighbors (children/adjacent nodes) of the current 'root'.
  for (
    var i = 0; // Initialize loop counter for iterating through neighbors.
    i < adj[root].length; // Loop continues as long as there are more neighbors to check.
    i++ // Increment the counter after each iteration.
  )
  {
    // Check if the current neighbor has not been visited yet.
    // This is crucial to ensure each node is processed once in a tree context
    // and to avoid cycles in general graphs.
    if (
      !visited[ adj[root][i] ] // Check the visited status of the neighbor node.
    )
    {
      // Mark the neighbor as visited before recursively calling DFS on it.
      visited[ adj[root][i] ] = 1;

      // Recursively call DFS on the unvisited neighbor.
      // The result 'res' will contain the calculated values for the subtree
      // rooted at this neighbor.
      var res = dfs
      (
        adj[root][i], // Pass the neighbor as the new root for the recursive call.
        adj,          // Pass the adjacency list unchanged.
        visited       // Pass the updated visited array.
      );

      // Update ans[0] based on the recursive results from the child.
      // The expression (res[0] + res[1]) suggests a combination of child properties.
      // The modulus operation is applied to keep the result within integer limits.
      ans[0] = (
        ans[0] * ( res[0] + res[1] )
      ) % mod;

      // Update ans[1] based on the recursive results from the child.
      // This uses only res[0] from the child, implying a different calculation logic.
      // Modulus is also applied here.
      ans[1] = (
        ans[1] * res[0]
      ) % mod;
    }
  }

  // After processing all children, return the calculated 'ans' array for the current subtree.
  return ans;
}


/**
 *  Constructs an adjacency list representation of an undirected graph.
 *  Given the number of nodes (N) and a list of edges (E), it creates
 *  a data structure where each node maps to a list of its neighbors.
 *
 *  @param   {number}   N The total number of nodes in the graph. Nodes are assumed
 *                        to be 1-indexed (from 1 to N).
 *  @param   {Array[]}  E An array of edges. Each edge is an array `[source, destination]`.
 *  @returns {Array[]}  The adjacency list. `list[i]` will contain an array of nodes
 *                        directly connected to node `i`.
 */
function adjList
(
  N, // The total count of nodes in the graph.
  E  // An array where each element is an array [u, v] representing an edge between u and v.
)
{
  // Initialize the adjacency list.
  // It's an array of size N+1 (to support 1-indexed nodes).
  // Each element is initialized to an empty array to store neighbors.
  var list = new Array(N + 1)
    .fill(0) // First, fill with placeholder values.
    .map(
      e => new Array(0).fill(0) // Then, transform each into an empty array.
    );

  // Iterate over each edge provided in the input array 'E'.
  for (
    var i = 0; // Initialize loop index.
    i < E.length; // Loop as long as there are edges to process.
    i++ // Increment index after each edge.
  )
  {
    // Extract the source and destination nodes from the current edge.
    var src = E[i][0];  // The first node in the edge pair.
    var dest = E[i][1]; // The second node in the edge pair.

    // Add the destination node to the source node's adjacency list.
    // This represents a connection from src to dest.
    list[src].push(dest);

    // Add the source node to the destination node's adjacency list.
    // This makes the graph undirected, meaning connection goes both ways.
    list[dest].push(src);
  }

  // Return the fully populated adjacency list.
  return list;
}


/**
 *  The main problem-solving function. It orchestrates the graph construction,
 *  DFS traversal, and final result calculation.
 *
 *  @param   {number}   N The number of nodes in the graph.
 *  @param   {Array[]}  E The list of edges defining the connections between nodes.
 *  @returns {number}   The final computed answer, modulo 'mod', after the DFS.
 */
function solve
(
  N, // Number of nodes.
  E  // Edges of the graph.
)
{
  // Build the adjacency list from the input number of nodes and edges.
  var adj = adjList(N, E);

  // Initialize a 'visited' array for the DFS.
  // All nodes are initially marked as unvisited (0).
  // Size N+1 for 1-indexed nodes.
  var visited = new Array(N + 1)
    .fill(0);

  // Mark the starting node (node 1) as visited before initiating the DFS.
  // This is a common practice when the problem specifies starting from a particular node.
  visited[1] = 1;

  // Perform the initial DFS call starting from node 1.
  // This call will traverse the entire connected component containing node 1.
  var res = dfs
  (
    1,       // Start the DFS from node 1.
    adj,     // Pass the generated adjacency list.
    visited  // Pass the initialized visited array.
  );

  // Calculate the final answer by summing the two components obtained from the root DFS call
  // and applying the modulus operation.
  return (
    res[0] + res[1] // Sum the two elements of the result array.
  ) % mod;
}


/**
 *  The entry point of the program. It reads input from stdin, parses it,
 *  calls the 'solve' function, and prints the result to stdout.
 *
 *  @param {string} input The entire input content read as a single string.
 */
function main
(
  input // The raw input string, typically from standard input.
)
{
  // Split the input string into an array of lines.
  var lines = input.split("\n");

  // Parse the first line to get the number of nodes (N).
  // parseInt converts the string to an integer.
  var N = parseInt(lines[0]);

  // Parse the remaining lines to get the edges (E).
  // - 'lines.slice(1)' gets all lines except the first one.
  // - '.map(l => ...)' iterates over each edge line.
  // - 'l.split(' ')' splits each line into string parts based on space.
  // - '.map(e => parseInt(e))' converts each part (src/dest) to an integer.
  var E = lines
    .slice(1) // Skips the first line which contains N.
    .map(
      l => l.split(' ') // Splits each line into string components.
        .map(
          e => parseInt(e) // Converts each component to an integer.
        )
    );

  // Call the 'solve' function with the parsed N and E to get the final answer.
  var ans = solve(N, E);

  // Print the calculated answer to the console (standard output).
  console.log(ans);
}


// This block is for executing the main function, typically in a Node.js environment.
// It reads the entire content of standard input (usually from a pipe or file redirection)
// as a UTF-8 string and passes it to the 'main' function.
main
(
  require('fs') // Node.js built-in 'fs' (file system) module.
    .readFileSync // Synchronously reads the entire contents of a file.
    (
      '/dev/stdin', // Standard input path on Unix-like systems.
      'utf8'        // Specifies UTF-8 encoding for reading the input.
    )
);