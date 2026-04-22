/*
 * This file processes input data to solve a graph-related problem.
 * Initial creation date: 2013-10-05.
 * Author: hiroqn (original)
 */


var fs      = require('fs')                                           // File system module for I/O operations.
  , length  = fs.fstatSync(process.stdin.fd).size                     // Determine the size of the standard input.
  , buffer  = new Buffer(length)                                      // Create a buffer to hold the input data.
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)   // Read data from stdin into the buffer.
  , input   = buffer.toString('utf8', 0, bytesRead).split('\n');      // Convert buffer to string, then split into lines.



/**
 * Creates a new graph by removing a specified edge from an existing graph.
 * @param {Array<Array<number>>} g - The original graph (adjacency list representation).
 * @param {Array<number>} edge - The edge to remove, represented as [source, destination].
 * @returns {Array<Array<number>>} A new graph with the edge removed.
 */
function pickGraph (g, edge) {
  // Extract source and destination nodes from the edge.
  var a   = edge[0]
    , b   = edge[1]
    , g2  = g.slice(); // Create a shallow copy of the graph.

  // Deep copy the adjacency list for node 'a' and remove 'b' from it.
  (g2[a] = g[a].slice()).splice(g[a].indexOf(b), 1);

  // Return the modified graph.
  return g2;
}



/*
 * This function calculates the "room count" for each node in a given graph 'g'.
 * It seems to be a form of depth or distance calculation, but its usage is commented out later.
 * It is not used in the final logic.
 */
function countRoom(g) {
  var d = [], i, j, max = 1; // Initialize distance array, loop counters, and max value.

  // Initialize all distances to 1.
  for (i = 0; i < n; i++) {
    d[i] = 1;
  }

  // Iterate through the graph to update distances.
  for (i = 0; i < n; i++) {
    for (j = 0; j < g[i].length; j++) {
      // Update distance for the neighbor.
      d[g[i][j]] = Math.max(d[g[i][j]], d[i] + 1);
    }
//    max = Math.max(max, d[i]); // This line was commented out in the original.
  }
  // Return the maximum distance found.
  return Math.max.apply(null, d);
} // End of countRoom function.


// Dynamic Programming approach for calculating rooms.
// This function calculates the maximum "room count" within a specific subgraph (defined by nodeList).
function getNumRoom(g, nodeList) {
  // Initialize distance array, loop counters, node variable, lengths, and max.
  var d = [], i, j, node, len, len2, max = 1;

  // Initialize distances for nodes in the current list to 1.
  for (i = 0, len = nodeList.length; i < len; i++) {
    d[nodeList[i]] = 1;
  }

  // Traverse the nodes in the provided list.
  for (i = 0, len = nodeList.length; i < len; i++) {
    node = nodeList[i]; // Get the current node.
//    d[i]++; // Another commented-out line from the original.

    // Iterate through neighbors of the current node.
    for (j = 0, len2 = g[node].length; j < len2; j++) {
      // Update the "room count" for the neighbor.
      d[g[node][j]] = Math.max(d[g[node][j]], d[node] + 1);
    }
    max = Math.max(max, d[node]); // Keep track of the overall maximum.
  }
  return max; // Return the maximum "room count" found in this subgraph.
}


// --- Main program execution starts here ---

// Parse the first line of input to get N (number of nodes) and M (number of edges).
var temp    = input.shift().split(' ')
  , n       = temp[0]                                   // Total number of nodes.
  , m       = temp[1]                                   // Total number of edges.
  , edges   = []                                        // Array to store all edges.
  , graph                                               // Variable to hold temporary graph structures.
  , graph2                                              // Another temporary graph variable (unused in final logic).
  , i, a, b;                                            // Loop counters and edge node variables.


// Define a Union-Find data structure to manage connected components.
var UF = function () {
  var i                                               // Loop index for initialization.
    , par = []                                        // Parent array: par[i] stores parent of i, or negative size if root.
    , nodesListGroup = [];                            // Stores lists of nodes for each component.

  // Initialize parent array and node list groups.
  for (i = 0; i < n; i++) {
    par[i] = -1;                                      // Each node is initially its own root with size -1.
    nodesListGroup[i] = [];                           // Initialize empty list for each potential group.
  }

  /**
   * Unions two sets (components) containing elements x and y.
   * Uses union by size/rank heuristic.
   * @param {number} x - An element in the first set.
   * @param {number} y - An element in the second set.
   * @returns {boolean} True if a union occurred (x and y were in different sets), false otherwise.
   */
  function union(x, y) {
    x = find(x); // Find the root of x's set.
    y = find(y); // Find the root of y's set.

    if (x !== y) { // If they are in different sets.
      if (par[x] < par[y]) { // Union by size (negative values: smaller negative means larger set).
        par[x] += par[y];    // Add size of y's set to x's set.
        par[y] = x;          // Make x the parent of y.
      } else {
        par[y] += par[x];    // Add size of x's set to y's set.
        par[x] = y;          // Make y the parent of x.
      }
    }
    return x !== y; // Return true if union happened.
  }

  /**
   * Finds the representative (root) of the set containing element x.
   * Uses path compression for optimization.
   * @param {number} x - The element to find the root for.
   * @returns {number} The root of the set containing x.
   */
  function find(x) {
    // If x is a root (par[x] is negative), return x.
    // Otherwise, recursively find the root and apply path compression.
    return par[x] < 0 ? x : par[x] = find(par[x]);
  }

  /**
   * Gathers all nodes into their respective connected component lists.
   * @returns {Array<Array<number>>} An array of arrays, where each inner array is a sorted list of nodes in a component.
   */
  function getNodeListGroup() {
    // Populate nodesListGroup with nodes belonging to their root.
    for (i = 0; i < n; i++) {
      nodesListGroup[find(i)].push(i);
    }
    // Filter out empty lists and sort the nodes within each component.
    nodesListGroup = nodesListGroup.filter(function (e, i) {
      return e.length > 0;
    }).map(function (e) {
          return e.sort(); // Sort nodes for consistent output/processing.
        });
    return nodesListGroup; // Return the processed list of node groups.
  }

  // Expose public methods of the Union-Find structure.
  return {
    union: union,
    find: find,
    getNodeListGroup: getNodeListGroup
  };
}(); // Immediately invoke the function to create the UF instance.


// Initialize graph and perform Union-Find operations based on input edges.
// This section constructs the graph as an adjacency list and groups nodes into connected components.
var g = []; // Adjacency list representation of the graph.
for (i = 0; i < n; i++) {
  g[i] = []; // Initialize an empty array for each node's neighbors.
}

// Process each edge from the input.
for (i = 0; i < m; i++) {
  temp = input[i].split(' '); // Split current input line to get edge nodes.
  a = temp[0] - 1;            // Convert node 'a' to 0-indexed.
  b = temp[1] - 1;            // Convert node 'b' to 0-indexed.

  edges[i] = [a, b];          // Store the edge.
  g[a].push(b);               // Add 'b' to 'a's adjacency list (directed graph assumed from problem context).
  UF.union(a, b);             // Union the sets containing 'a' and 'b'.
}


// Get the connected components after processing all edges.
var nodeListGroup = UF.getNodeListGroup();
console.log(nodeListGroup); // Output the list of connected components.


// Calculate the "room count" for each connected component.
var numRoomList = nodeListGroup.map(function (nodeList) {
  return getNumRoom(g, nodeList); // Apply getNumRoom to each component.
});
//console.log(numRoomList) // This line was commented out in the original.

// Find the maximum room count among all components and its index.
var maxNum  = Math.max.apply(null, numRoomList) // Maximum room count found.
  , index   = numRoomList.indexOf(maxNum)       // Index of the component with the maximum room count.
  , flag                                        // Flag variable for loop control.
  , nodeList = nodeListGroup[index];            // The nodeList corresponding to maxNum.

//console.log(nodeList) // This line was also commented out.

// Check if there's another component with the same maximum room count.
// If so, output -1 and terminate, indicating ambiguity.
if ( ~numRoomList.slice(index + 1).indexOf(maxNum) ) {
  console.log(-1); // Output -1 for multiple maximums.
  return;          // Exit the script.
}


// The following commented section was in the original, likely for filtering edges, but not used.
//var edges2 = edges.filter(function (e, i) {
//  return ~nodeList.indexOf(e[0]);
//});

// Main loop to find a critical edge.
flag = true; // Initialize flag to true, assuming no critical edge is found yet.
for (i = 0; i < m; i++) {
//  console.log(edges[i][0]); // Another commented-out debug line.

  // If the source node of the current edge is part of the 'maxNum' component.
  if ( ~nodeList.indexOf(edges[i][0]) ) {
    graph = pickGraph(g, edges[i]); // Create a temporary graph by removing the current edge.

    // If removing this edge reduces the 'room count' of the 'maxNum' component,
    // then this is a critical edge.
    if (getNumRoom(graph, nodeList) < maxNum) {
      console.log(i + 1); // Output the 1-indexed edge number.
      flag = false;       // Set flag to false, as a critical edge is found.
    }
  }
}

// This block was also commented out in the original, possibly an alternative iteration.
//for (i = 0; i < edges2.length; i++) {
//  graph = pickGraph(g, edges2[i]);
//  console.log(graph)
//  if (getNumRoom(graph, nodeList) < maxNum) {
//    console.log(i + 1);
//    flag = false;
//  }
//}

// If no critical edge was found after checking all relevant edges.
if (flag) {
  console.log(-1); // Output -1, indicating no single critical edge.
}


// This entire section was commented out in the original, indicating unused or experimental code.
//var nRooms = countRoom(g);
//flag = true;
//
//
//for (i = 0; i < m; i++) {
//  graph2 = pickGraph(g, edges[i]);
//  if (countRoom(graph2) < nRooms) {
//    console.log(i + 1);
//    flag = false;
//  }
//}