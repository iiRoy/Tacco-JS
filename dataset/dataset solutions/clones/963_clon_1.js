/*
 * This is a configuration object for input/output.
 * It determines where the program reads its input from
 * and what character sequence represents a newline.
 */
// Original config comment: //config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // This config is for Linux environment

// Read the entire input file,
// convert it to ASCII,
// remove leading/trailing whitespace,
// and then split it into an array of lines based on the configured newline character.
line = require('fs')
  .readFileSync(config.input, 'ascii')
  .trim()

  .split(config.newline);

// The first line of the input typically contains the number of nodes.
// We extract and convert this to a number.
n = Number(line.shift());

// Initialize two global objects:
// V will store node information (id, distance, predecessor).
// w will store the adjacency list with weights.
V = {}; // Represents all vertices/nodes in the graph.
w = {}; // Represents the adjacency list with edge weights.

/**
 * Adds an edge to an adjacency list object.
 *
 * @param {object} obj - The adjacency list object (e.g., 'w').
 * @param {number} u - The source node.
 * @param {number} v - The destination node.
 * @param {number} c - The cost/weight of the edge from u to v.
 */
function add(obj, u, v, c) {
  // If the source node 'u' is not yet a key in the object, initialize it with an empty object.
  if (!obj.hasOwnProperty(u)) {
    obj[u] = {};
  }

  // Assign the cost 'c' to the edge from 'u' to 'v'.
  obj[u][v] = c;
}

// Process each remaining line from the input to build the graph.
for (i in line) {
  // Parse the current line: split by space and convert parts to numbers.
  ary = line[i].split(' ').map(Number);

  // The first number on the line is the current node 'u'.
  u = ary[0];

  // Initialize node 'u' in the 'V' object.
  // 'id': its own identifier.
  // 'd': distance from the source, initialized to positive infinity.
  // 'pi': predecessor node, initialized to null.
  V[u] = { 'id': u, 'd': Number.POSITIVE_INFINITY, 'pi': null };

  // Iterate through the rest of the numbers on the line to add edges.
  // Edges are given as (destination_node, weight) pairs.
  for (j = 2; j < ary.length; j += 2) {
    // Add the edge (u -> ary[j]) with weight ary[j+1] to the adjacency list 'w'.
    add(w, u, ary[j], ary[j + 1]);
  }
}

// Find the starting node for Dijkstra's algorithm.
// Assuming the starting node has an ID of 0.
for (i in V) {
  if (V[i].id === 0) {
    // Set the distance of the source node to 0.
    V[i].d = 0;
    // Once found, we can break out of the loop.
    break;
  }
}

/**
 * The relax function updates the shortest path estimate to a vertex.
 * This is a core operation in Dijkstra's algorithm.
 *
 * @param {object} u - The source vertex object.
 * @param {object} v - The destination vertex object.
 * @param {object} w - The adjacency list with edge weights.
 */
function relax(u, v, w) {
  // Check if the current path to 'v' through 'u' is shorter than the previously known path.
  // u.d is distance to u, w[u.id][v.id] is weight of edge (u, v).
  if (v.d > u.d + w[u.id][v.id]) {
    // If it's shorter, update the distance to 'v'.
    v.d = u.d + w[u.id][v.id];
    // Set 'u' as the predecessor of 'v' in the shortest path.
    v.pi = u;
  }
}

/**
 * Implements Dijkstra's algorithm to find the shortest paths from a single source
 * to all other vertices in a graph with non-negative edge weights.
 *
 * @param {object} w - The adjacency list representing the graph with edge weights.
 */
function dijkstra(w) {
  var S = [], // S: Set of vertices whose final shortest-path weights have been determined.
    i, // Loop counter.
    Q, // Q: Min-priority queue of vertices, initially all vertices in V.
    u; // Current vertex with minimum distance from source.

  Q = []; // Initialize the priority queue.
  for (i in V) {
    // Add all vertices from V to the priority queue.
    Q.push(V[i]);
  }

  // Continue until the priority queue is empty.
  while (Q.length !== 0) {
    // Sort Q to find the vertex with the minimum distance.
    // (Note: A proper min-priority queue implementation would be more efficient here).
    // This sorts in descending order, so pop() gets the minimum.
    Q.sort(function (a, b) {
      return b.d - a.d;
    });

    // Extract the vertex 'u' with the minimum distance from Q.
    u = Q.pop();

    // Add 'u' to the set of finalized vertices.
    S.push(u);

    // For each neighbor 'j' of 'u':
    // (Iterate through the keys of the adjacency list for u.id)
    for (j in w[u.id]) {
      // Get the vertex object for the neighbor 'j'.
      v = V[j];

      // Perform the relax operation on the edge (u, v).
      relax(u, v, w);
    }
  }
}

// Execute Dijkstra's algorithm using the constructed graph 'w'.
dijkstra(w);

// After Dijkstra's algorithm completes, print the shortest distance
// from the source node (node 0) to every other node.
for (i in V) {
  // Output format: "node_id distance_from_source"
  console.log("%s %d", i, V[i].d);
}