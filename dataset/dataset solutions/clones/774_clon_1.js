/*
 * This file processes graph data from standard input.
 * It calculates the shortest path between specific nodes
 * using a modified Floyd-Warshall algorithm.
 *
 * Author: A clone generator bot
 * Date: 2023-10-27
 * Version: 1.0
 */

// Import the Node.js 'fs' module for file system operations.
var  fs = require('fs')
   , // Get the size of the standard input stream.
     length = fs.fstatSync(process.stdin.fd).size
   , // Allocate a buffer to hold the input data.
     buffer = new Buffer(length)
   , // Read data synchronously from standard input into the buffer.
     bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
   , // Convert the buffer to a UTF-8 string and split it by newlines.
     input = buffer.toString('utf8', 0, bytesRead).split('\n')
;


// Parse the first line of input to get graph parameters.
var firstLine = input.shift().split(' ');

// Extract number of nodes (n) and edges (m).
var n = +firstLine[0]
  , m = +firstLine[1]
;

// Extract starting node (s) and two goal nodes (g1, g2).
// Subtract 1 for 0-based indexing.
var s  = firstLine[2] - 1
  , g1 = firstLine[3] - 1
  , g2 = firstLine[4] - 1
;

// Initialize the distance matrix 'd'.
var d = [];

// Declare temporary variables for loop iterations and input parsing.
var temp
  , i
  , j
  , k
;



// Initialize the distance matrix for all pairs.
// d[i][j] will store the shortest distance from node i to node j.
for (i = 0; i < n; i++) {
  // Create a row for the current node i.
  d[i] = [];

  // Initialize distances for all other nodes j.
  for (j = 0; j < n; j++) {

    // Distance from a node to itself is 0.
    // Otherwise, initialize to Infinity (unreachable).
    d[i][j] = i === j ? 0 : Infinity;

  }
}


// Process the 'm' edges provided in the input.
// Each edge represents a direct path between two nodes with a specific cost.
while (m--) {
    // Get the next line from input, split it by space.
    temp = input.shift().split(' ');

    // Assign the cost (temp[2]) to the corresponding edge in the distance matrix.
    // Adjust node indices (temp[0], temp[1]) for 0-based indexing.
    d[temp[0] - 1][temp[1] - 1] = +temp[2];
}



// Apply the Floyd-Warshall algorithm to find all-pairs shortest paths.
// This calculates the shortest path between every pair of nodes.

// Iterate through all possible intermediate nodes 'k'.
for (k = 0; k < n; k++) {

  // Iterate through all possible source nodes 'i'.
  for (i = 0; i < n; i++) {

    // Iterate through all possible destination nodes 'j'.
    for (j = 0; j < n; j++) {

      // Update the shortest path from i to j if a shorter path is found
      // by going through k (i.e., i -> k -> j).
      d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);

    }
  }
}



// Calculate the minimum cost to reach node 's', then visit some intermediate node 'i',
// and finally go to both 'g1' and 'g2' from 'i'.
// The 'res' variable will store this minimum cost.
var res = Infinity;

// Iterate through all possible intermediate nodes 'i'.
for (i = 0; i < n; i++) {

  // The path is s -> i -> g1 + s -> i -> g2.
  // We need to find 'i' that minimizes d[s][i] + d[i][g1] + d[i][g2].
  res = Math.min(res, d[s][i] + d[i][g1] + d[i][g2]);

}

// Output the final minimum result to the console.
console.log(res);