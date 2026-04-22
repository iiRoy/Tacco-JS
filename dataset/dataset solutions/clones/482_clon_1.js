/*
 * This file contains a JavaScript program designed to solve a specific
 * graph-related problem, likely involving cycles or paths within a directed graph.
 * It reads input from standard input, processes it, and prints 'OK' or 'NG'
 * based on the outcome of its internal logic.
 *
 * Author: Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */

// Core Node.js module for file system operations.
var fs = require('fs');

// Determine the size of the standard input stream.
var length = fs.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data.
var buffer = new Buffer(length);

// Read the entire standard input into the buffer synchronously.
var bytesRead = fs.readSync(
  process.stdin.fd, // File descriptor for standard input
  buffer,           // Buffer to write data into
  0,                // Offset in the buffer to start writing
  length,           // Number of bytes to read
  0                 // Position in the file to begin reading from (0 for stdin)
);

// Convert the buffer content to a UTF-8 string,
// then split it into an array of lines.
var input = buffer
  .toString('utf8', 0, bytesRead)
  .split('\n');


/**
 * Recursively checks for a cycle starting from a given node within a graph.
 *
 * @param {Array<Array<number>>} G   - The adjacency list representation of the graph.
 * @param {number}               i   - The current node being visited.
 * @param {Array<number>}        use - An array of nodes visited in the current path
 *                                     to detect cycles.
 * @returns {boolean} Returns true if a cycle is detected, false otherwise.
 */
function solve(
  G,   // Graph adjacency list
  i,   // Current node index
  use  // Path of visited nodes
) {
  // Iterate through all neighbors of the current node 'i'.
  for (
    var j = 0;
    j < G[i].length;
    j++
  ) {
    // Check if the neighbor G[i][j] is already in the current path 'use'.
    // The '~' operator converts -1 (not found) to 0 (falsy) and any
    // other index (found) to a non-zero (truthy) value.
    if (
      ~use.indexOf(G[i][j])
    ) {
      // If found, a cycle is detected.
      return true;
    }

    // Recursively call solve for the neighbor, adding the neighbor to the path.
    if (
      solve(
        G,
        G[i][j],
        use.concat(G[i][j]) // Create a new array with the neighbor added
      )
    ) {
      // If the recursive call finds a cycle, propagate true upwards.
      return true;
    }
  }

  // No cycle found from this node 'i' through its descendants.
  return false;
}


// This is an Immediately Invoked Function Expression (IIFE).
// It encapsulates the main logic of the program, preventing
// global variable pollution.
!function () {

  // Declare variables used within the main loop scope.
  var N,       // Number of elements.
    arr,       // Array to store input strings.
    G,         // Graph adjacency list.
    str,       // Temporary string variable.
    ch,        // Temporary character variable.
    min,       // (unused in provided code, perhaps a leftover from a previous version)
    i,         // Loop counter.
    j;         // Another loop counter.


  // Main processing loop: continues as long as the first line of input
  // (which represents N) is not '0'.
  while (input[0] !== '0') {

    // Parse the number of elements N from the first line of input.
    // `shift()` removes the first element from `input`.
    N = input.shift() - 0;

    // Initialize an empty array to store the input strings.
    arr = [];

    // Initialize an empty array for the graph's adjacency list.
    G = [];

    // Read N lines of input and populate the `arr` array.
    for (i = 0; i < N; i++) {
      arr.push(input.shift());
    }

    // Construct the graph `G` based on the relationships between strings in `arr`.
    // A directed edge exists from string `i` to string `j` if the last character
    // of `arr[i]` matches the first character of `arr[j]`.
    for (i = 0; i < N; i++) {
      str = arr[i];                       // Get the current string.
      ch = str[str.length - 1];           // Get its last character.
      G[i] = [];                          // Initialize adjacency list for node `i`.

      for (j = 0; j < N; j++) {
        if (i === j) {                    // A node cannot have an edge to itself in this context.
          continue;
        }

        // Check if the last character of `arr[i]` matches the
        // first character of `arr[j]`.
        if (ch === arr[j][0]) {
          G[i].push(j);                   // Add an edge from `i` to `j`.
        }
      }
    }

    // After constructing the graph, check for cycles.
    // Iterate through each node as a potential starting point for a cycle.
    for (i = 0; i < N; i++) {
      // Call the `solve` function to check for a cycle starting from node `i`.
      // The initial path `use` contains only the starting node `i`.
      if (
        solve(G, i, [i])
      ) {
        // If a cycle is found, we can stop searching.
        break;
      }
    }

    // Output 'OK' if a cycle was found (i.e., `i` did not reach `N`),
    // otherwise output 'NG' (no cycle found).
    console.log(
      i !== N
        ? 'OK'
        : 'NG'
    );
  }
}(); // Immediately invoke the function.