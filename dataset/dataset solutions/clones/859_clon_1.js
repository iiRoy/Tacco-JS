/*
 * This file contains some utility functions for graph manipulation
 * and a main script to process input data.
 *
 * It was initially created by hiroqn on 2013-10-05.
 *
 * The script reads graph relations from standard input,
 * constructs a graph, counts rooms, and then checks if removing
 * any single relation reduces the room count.
 */

var fs = require('fs')
  , length = fs.fstatSync(process.stdin.fd).size // Get the size of the standard input
  , buffer = new Buffer(length)                  // Allocate a buffer to hold the input
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0) // Read from stdin into the buffer
  , input = buffer.toString('utf8', 0, bytesRead) // Convert buffer to a UTF-8 string
            .split('\n')                         // Split the input string by newlines into an array
; // End of initial variable declarations

/**
 * Constructs an adjacency list representation of a graph.
 *
 * @param {number} n    The number of nodes in the graph.
 * @param {number} m    The number of relations (edges).
 * @param {Array<Array<number>>} rels An array of relations, where each relation is [sourceNode, targetNode].
 * @returns {Array<Array<number>>} The adjacency list representation of the graph.
 */
function makeGraph(n, m, rels) {

    var g = []
      , i
    ; /* Declare graph array 'g' and loop counter 'i' */

    // Initialize an empty adjacency list for each node
    for (i = 0; i < n; i++) {
        g[i] = [];
    }

    // Populate the adjacency list based on the provided relations
    for (i = 0; i < m; i++) {
        // Adjust for 0-based indexing: rels[i][0] and rels[i][1] are 1-based
        g[rels[i][0] - 1].push(rels[i][1] - 1);
    }

    return g;
}

/**
 * Creates a new graph by removing a specific relation from an existing graph.
 *
 * @param {Array<Array<number>>} g    The original graph (adjacency list).
 * @param {Array<number>} rel         The relation to remove, e.g., [sourceNode, targetNode].
 * @returns {Array<Array<number>>} A new graph with the specified relation removed.
 */
function pickGraph(g, rel) {
    var a = rel[0] - 1 // Get the 0-based index of the source node
      , b = rel[1] - 1 // Get the 0-based index of the target node
      , newG = g.slice() // Create a shallow copy of the graph to avoid modifying the original
    ;

    // Filter out the target node 'b' from the adjacency list of source node 'a'
    newG[a] = g[a].filter(function(e, i) {
        return b !== e; // Keep elements that are not equal to 'b'
    });

    return newG;
}

/**
 * Counts the maximum number of "rooms" (or longest path length) in a directed acyclic graph (DAG).
 * This function seems to calculate the longest path from any node to any other node,
 * assuming 'n' is globally available or passed implicitly.
 *
 * @param {Array<Array<number>>} g The graph (adjacency list).
 * @returns {number} The maximum room count.
 */
function countRoom(g) {
    var d = [] // Array to store the longest path length to each node
      , i
      , j
      , max = 1 // Initialize maximum path length to 1 (for a single node)
    ;

    // Initialize all path lengths to 1
    for (i = 0; i < n; i++) {
        d[i] = 1;
    }

    // Iterate through each node to calculate longest paths
    for (i = 0; i < n; i++) {
        // The commented line below suggests a possible debugging or alternative logic previously considered
        // d[i]++;

        // For each neighbor of the current node 'i'
        for (j = 0; j < g[i].length; j++) {
            // Update the path length to the neighbor if a longer path is found through 'i'
            d[g[i][j]] = Math.max(d[g[i][j]], d[i] + 1);
        }
        // Update the overall maximum path length found so far
        max = Math.max(max, d[i]);
    }

    // The commented lines below were likely used for debugging output
    // console.log(g)
    // console.log(d)

    return max;
}

// --- Main script execution starts here ---

// Parse the first line of input to get n (number of nodes) and m (number of relations)
var temp = input.shift().split(' ')
  , n = temp[0] // Number of nodes (global variable for countRoom)
  , m = temp[1] // Number of relations
  , relations = [] // Array to store all relations
  , graph // Variable to hold the constructed graph
  , graph2 // Variable to hold a temporary graph for testing
  , i // Loop counter
;

// Read the remaining 'm' lines of input to populate the 'relations' array
for (i = 0; i < m; i++) {
    relations[i] = input[i].split(' ');
}

// Calculate the initial number of rooms in the full graph
var nRooms = countRoom(graph = makeGraph(n, m, relations))
  , flag = false // Flag to indicate if a relation was found whose removal reduces rooms
;

// Iterate through each relation to see if its removal reduces the room count
for (i = 0; i < m; i++) {
    // Create a new graph with the i-th relation removed
    graph2 = pickGraph(graph, relations[i]);

    // If removing this relation reduces the total number of rooms
    if (countRoom(graph2) < nRooms) {
        console.log(i + 1); // Output the 1-based index of the relation
        flag = true; // Set the flag to true
    }
}

// If no relation was found whose removal reduced the room count
if (!flag) {
    console.log(-1); // Output -1
}