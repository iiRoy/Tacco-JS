/*
 * This file contains a JavaScript program that processes graph data.
 * It reads graph structure and then answers reachability queries.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

(function main() { /* Main anonymous function to encapsulate the program logic. */

  // Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains N (number of nodes) and M (number of edges).
  const [n, m] = lines.shift().split(' ').map(Number);

  // Initialize adjacency lists for the graph. N nodes, 0-indexed.
  const adjLists = Array.from(Array(n), () => []);

  // 'd' array is declared but not used in the original code. Keeping it as per Type I clone definition.
  const d = [];

  let s, t; // Variables to store source and target nodes for edges.

  // Loop M times to read all edges and populate the adjacency lists.
  for (let i = 0; i < m; i++) {
    // Read an edge: two numbers separated by a space.
    [s, t] = lines.shift().split(' ').map(Number);

    // Add edge (s, t) and (t, s) since the graph is undirected.
    adjLists[s].push(t);
    adjLists[t].push(s);
  }


  /**
   * Performs a Breadth-First Search (BFS) to check if node 't' is reachable from node 's'.
   *
   * @param {number} s - The starting node.
   * @param {number} t - The target node to reach.
   * @returns {boolean} - True if 't' is reachable from 's', false otherwise.
   */
  function canReach(s, t) {
    // Define states for nodes during BFS:
    // WHITE: Not yet visited
    // GRAY: Visited, but neighbors not yet fully explored (in queue)
    // BLACK: Visited, and all neighbors explored
    const WHITE = 0,
      GRAY = 1,
      BLACK = 2;

    // Initialize color array for all nodes to WHITE.
    const color = Array.from(adjLists, () => WHITE);

    let queue = [s]; // Initialize BFS queue with the starting node.
    color[s] = GRAY; // Mark the starting node as GRAY (in queue).

    let u, v; // Variables for current node (u) and its neighbor (v).

    // Continue BFS as long as the queue is not empty.
    while ((u = queue.shift()) !== undefined) {
      // Iterate through all neighbors of the current node 'u'.
      for (let i = 0; i < adjLists[u].length; i++) {
        v = adjLists[u][i]; // Get the current neighbor 'v'.

        // If the neighbor 'v' is the target node 't', we've found a path.
        if (v === t) {
          return true;
        }

        // If the neighbor 'v' has not been visited yet (WHITE).
        if (color[v] === WHITE) {
          color[v] = GRAY; // Mark 'v' as GRAY (add to queue).
          queue.push(v); // Add 'v' to the end of the queue.
        }
      }
      // After processing all neighbors of 'u', it can be marked BLACK (optional for reachability, but good practice for full BFS).
      // color[u] = BLACK; // Not explicitly done in original, so keeping it out.
    }

    // If the queue becomes empty and 't' was not reached, then 't' is not reachable from 's'.
    return false;
  }


  lines.shift(); // Discard the line indicating the number of queries (not used in this implementation).

  // Process the remaining lines as queries.
  // Each query consists of two numbers (start and end node).
  // Map each query to 'yes' or 'no' based on reachability, then join with newlines.
  console.log(
    lines.map(l =>
      canReach(...l.split(' ').map(Number)) ? 'yes' : 'no'
    ).join('\n')
  );

})(); // End of the main anonymous function.