/*
 * This JavaScript file processes input to solve a specific graph-related problem.
 * It reads data from standard input, constructs a graph, and then determines
 * if a Hamiltonian cycle exists starting from a specific node.
 */

// Core module for file system operations.
var fs = require('fs');

// Determine the size of the standard input stream in bytes.
var length = fs.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data.
var buffer = new Buffer(length);

// Synchronously read data from standard input into the buffer.
// Parameters: file descriptor, buffer, offset, length, position.
var bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0);

// Convert the buffer to a UTF-8 string, then split it into lines.
// This forms the primary input array for the problem.
var input = buffer.toString('utf8', 0, bytesRead).split('\n');


/**
 * Solves the Hamiltonian cycle problem for a given graph.
 * This function uses a recursive backtracking approach.
 *
 * @param {Array<Array<number>>} G - The adjacency list representation of the graph.
 * @param {number} i - The current node being visited.
 * @param {Array<number>} use - An array representing the current path taken (sequence of visited nodes).
 * @returns {boolean} - True if a Hamiltonian cycle is found, false otherwise.
 */
function solve( G, i, use ) {

  // Base case: If all nodes have been visited (path length equals graph size),
  // check if the last node can connect back to the first node to complete the cycle.
  if ( use.length === G.length ) {
    // The '~' operator is used here to convert the result of indexOf (which is -1 if not found)
    // into a truthy/falsy value: ~-1 is 0 (falsy), ~any_other_number is non-zero (truthy).
    return ~G[use[use.length - 1]].indexOf( use[0] );
  }

  // Iterate through all possible neighbors of the current node 'i'.
  for ( var j = 0; j < G[i].length; j++ ) {

    // Check if the neighbor G[i][j] has already been visited in the current path.
    // If it has, skip this neighbor to avoid cycles within the path before completing it.
    if ( ~use.indexOf( G[i][j] ) ) {
      continue; // Move to the next neighbor.
    }

    // Recursively call solve for the next node, adding it to the current path.
    // If the recursive call returns true (a cycle is found), propagate true upwards.
    if ( solve( G, G[i][j], use.concat( G[i][j] ) ) ) {
      return true; // A Hamiltonian cycle has been found.
    }
  }

  // If no Hamiltonian cycle is found from the current state, return false.
  return false;
}


// Immediately Invoked Function Expression (IIFE) to encapsulate the main program logic.
!function () {

  // Declare variables used within the main processing loop.
  var N;    // Number of nodes/strings.
  var arr;  // Array to store input strings.
  var G;    // Adjacency list representation of the graph.
  var str;  // Temporary variable for current string.
  var ch;   // Temporary variable for the last character of a string.
  var i, j; // Loop counters.

  // Main processing loop: continues as long as the first line of input is not '0'.
  // '0' acts as a sentinel value to indicate the end of input sets.
  while ( input[0] !== '0' ) {

    // Read the number of nodes (N) for the current test case.
    // `input.shift()` removes the first element and returns it. `- 0` converts it to a number.
    N = input.shift() - 0;

    // Initialize arrays for the current test case.
    arr = []; // Stores the N input strings.
    G = [];   // Stores the graph as an adjacency list.

    // Populate the 'arr' array with N strings from the input.
    for ( i = 0; i < N; i++ ) {
      arr.push( input.shift() );
    }

    // Construct the graph G (adjacency list).
    // An edge exists from node `i` to node `j` if the last character of `arr[i]`
    // matches the first character of `arr[j]`.
    for ( i = 0; i < N; i++ ) {
      str = arr[i]; // Get the current string.
      ch = str[str.length - 1]; // Get its last character.

      G[i] = []; // Initialize the adjacency list for node `i`.

      // Iterate through all other nodes `j` to find potential connections.
      for ( j = 0; j < N; j++ ) {

        // A node cannot connect to itself in this specific problem context.
        if ( i === j ) {
          continue;
        }

        // Check if the last character of `arr[i]` matches the first character of `arr[j]`.
        if ( ch === arr[j][0] ) {
          G[i].push( j ); // Add an edge from `i` to `j`.
        }
      }
    }

    // Solve the Hamiltonian cycle problem starting from node 0.
    // The initial path contains only node 0.
    // Output 'OK' if a cycle is found, 'NG' otherwise.
    console.log( solve( G, 0, [0] ) ? 'OK' : 'NG' );
  }

}(); // Execute the IIFE.