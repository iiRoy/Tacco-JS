config = { input: 'tmp', newline: '\r\n' }; /* Default configuration for Windows-like systems */
// config = { input: '/dev/stdin', newline: '\n' }; /* Alternative config for Linux/Unix */


assert = require('assert'); // Import the 'assert' module for testing and validation.

// Read input from the specified file and process it.
line = require('fs').readFileSync(config.input, 'ascii')
    .trim() // Remove leading/trailing whitespace from the entire content.
    .split(config.newline); // Split the content into an array of lines based on the newline character.

n = Number(line.shift()); // The first line contains the number of nodes (N). Convert it to a number.

adj = {};     // Adjacency list for forward edges (u -> v with cost c)
adjinv = {};  // Adjacency list for inverse edges (v -> u with cost c)

/**
 * Adds an edge to the given adjacency object.
 * @param {object} obj - The adjacency object (adj or adjinv).
 * @param {number} u - The source node.
 * @param {number} v - The destination node.
 * @param {number} c - The cost/weight of the edge.
 */
function add(obj, u, v, c) {
  if (!obj.hasOwnProperty(u)) { /* Check if the source node already exists in the object */
    obj[u] = {}; // Initialize an empty object for the source node if it doesn't exist.
  }
  obj[u][v] = c; // Assign the cost 'c' for the edge from 'u' to 'v'.
}

// Loop through the remaining lines to populate adjacency lists.
for (i in line) {
  ary = line[i].split(' ').map(Number); // Split each line by space and convert parts to numbers.
  u = ary[0]; // The first element is the source node 'u'.
  // Iterate through the rest of the array, which contains pairs of (neighbor, cost).
  for (j = 2; j < ary.length; j += 2) {
    // Add forward edge: u -> ary[j] with cost ary[j+1]
    add(adj, u, ary[j], ary[j+1]);
    // Add inverse edge: ary[j] -> u with cost ary[j+1]
    add(adjinv, ary[j], u, ary[j+1]);
  }
}

// Basic assertions to ensure adjacency lists are populated.
assert(adj);
assert(adjinv);


// --- Start of BFS (Breadth-First Search) for shortest path in terms of hops ---

cnt = 0; // Current hop count from the starting node (node 0).
dist = new Array(n); // Stores the minimum number of hops from node 0 to each node.
d = new Array(n);    // Stores the minimum path cost from node 0 to each node (Dijkstra-like).

// Initialize distance arrays.
for (i = 0; i < n; i++) {
  dist[i] = null;          // 'null' indicates unvisited in terms of hops.
  d[i] = Number.MAX_VALUE; // Initialize path costs to infinity.
}

dist[0] = 0; // Node 0 is 0 hops from itself.
d[0] = 0;    // Cost to node 0 from itself is 0.

do {
  rest = 0; // Flag to check if any new nodes were visited in this iteration.
  for (i in adj) {
    if (dist[i] !== cnt) continue; // Process nodes at the current hop count 'cnt'.

    adj_i = adj[i]; // Get neighbors of node 'i'.
    for (j in adj_i) {
      if (dist[j] === null) {
        dist[j] = cnt + 1; // If 'j' is unvisited, set its hop count.
        rest = 1;          // Mark that progress was made.
      }
      // Update the minimum path cost to 'j' using node 'i'.
      d[j] = Math.min(d[j], d[i] + adj_i[j]);
    }
  }
  cnt++; // Increment hop count for the next iteration.
} while (rest); // Continue as long as new nodes are being reached.

// Assertions for the BFS results.
assert(dist);
assert(d);

// --- End of BFS ---


// Prepare nodes for processing in topological order based on their minimum path costs.
bfsnode = new Array(n); // Array to hold node indices.
for (i = 0; i < n; i++) {
  bfsnode[i] = i; // Populate with node indices 0 to n-1.
}

// Sort nodes by their minimum path cost 'd' in ascending order.
bfsnode.sort(function (a, b) {
  return d[a] - d[b]; // Custom comparison function.
});

bfsnodeinv = {}; // Maps node index to its sorted position (rank) in bfsnode.
for (i = 0; i < n; i++) {
  bfsnodeinv[bfsnode[i]] = i; // Store the rank for each node.
}

// Assertions for sorted node arrays.
assert(bfsnode);
assert(bfsnodeinv);


// --- Dynamic Programming and DFS approach for finding shortest paths ---
// The general idea is to compute min[0, u] (shortest path from 0 to u) using
// a combination of direct predecessors and a DFS for more complex paths.
//
// min[0, u] = min { min[0, v] + adj[v, u]  (if min[0, v] is already known, i.e., v has smaller bfsnodeinv rank)
//                   OR
//                   find min[0, v] starting from (min[0, u] - adj[u, v])
//                       and then min[0, v] + adj[v, u] }
//                   for all v in adjinv[u] (predecessors of u)


visited = new Array(n); // Tracks visited nodes during DFS.
for (i = 0; i < n; i++) {
  visited[i] = false; // Initialize all nodes as unvisited.
}

cur = new Array(n);  // Stack for current path in DFS.
rest = new Array(n); // Stack for remaining neighbors to explore at each level of DFS.

// Assertions for DFS auxiliary arrays.
assert(visited);
assert(cur);
assert(rest);

/**
 * Performs a Depth-First Search to find alternative paths.
 * This DFS is designed to explore paths 'backwards' from a potential predecessor 'v'
 * towards 'u', to find if a shorter path to 'u' can be established via 'v'.
 *
 * @param {number} v - The starting node for the DFS (a potential predecessor).
 * @param {number} u - The target node for which we are trying to find a shorter path.
 * @param {number} start - An initial upper bound for the path cost (d[u] - adj[v][u]).
 * @returns {number} The minimum path cost found from 'v' to 'u' that completes a path to 'u'.
 */
function dfs(v, u, start) {
  var sp = 0, cost = 0, res = start, next; // sp: stack pointer, cost: current path cost, res: minimum result found.

  // Mark 'u' and 'v' as visited for the current DFS call.
  // Note: 'visited' array needs to be reset for each call to 'dfs' or managed carefully.
  // In this context, it seems 'visited' is global, which might be a source of issues
  // if not handled by resetting before each dfs call, or if its purpose is to prevent cycles within one dfs run.
  // Assuming it's for the latter, preventing cycles within *this specific* path exploration.
  visited[u] = true;
  visited[v] = true;

  cur[0] = v; // Push 'v' onto the current path stack.
  rest[0] = Object.keys(adjinv[v]); // Get predecessors of 'v' to explore.

  while (true) {
    if (rest[sp].length === 0) {
      if (sp === 0) return res; // If stack is empty and no more neighbors, return the best result.
      cost -= adjinv[cur[sp-1]][cur[sp]]; // Backtrack: remove cost of the edge.
      sp--; // Pop from stack.
      continue;
    }
    next = rest[sp].pop(); // Get the next predecessor to explore.
    if (visited[next]) continue; // Skip if already visited in this path.

    // Pruning: if current path cost + new edge cost already exceeds the best known path, skip.
    if (cost + adjinv[cur[sp]][next] >= start) continue;

    // If 'next' has a smaller rank than 'u' (meaning d[next] is already finalized),
    // we can potentially form a full path: 0 -> next -> ... -> v -> u.
    // Update 'res' with this potential shorter path.
    if (bfsnodeinv[next] < bfsnodeinv[u]) {
      res = Math.min(res, cost + adjinv[cur[sp]][next] + d[next]);
      continue;
    }

    // If 'next' has a larger rank than 'u', we need to continue DFS.
    cost += adjinv[cur[sp]][next]; // Add cost of the new edge.
    sp++; // Push onto stack.
    cur[sp] = next; // Set current node.
    rest[sp] = Object.keys(adjinv[next]); // Get predecessors of 'next'.
  }
}

// Main loop for dynamic programming, processing nodes in increasing order of their shortest path 'd'.
for (i in bfsnode) {
  u = bfsnode[i]; // Get the current node 'u' based on its sorted rank.

  // First pass: Consider direct predecessors 'v' with already finalized shortest paths (d[v]).
  // This means 'v' has a smaller bfsnodeinv rank than 'u'.
  for (v in adjinv[u]) {
    if (bfsnodeinv[v] < bfsnodeinv[u]) {
      d[u] = Math.min(d[u], d[v] + adj[v][u]); // Update d[u] if a shorter path is found.
    }
  }

  // Second pass: Consider predecessors 'v' that have a larger bfsnodeinv rank than 'u'.
  // For these, we might need to use DFS to find the shortest path from 'v' back to 'u'.
  for (v in adjinv[u]) {
    if (bfsnodeinv[v] > bfsnodeinv[u]) {
      // The DFS call finds min_path_from_v_to_u.
      // Then d[u] is updated by d[v] + min_path_from_v_to_u.
      // The 'start' parameter for DFS is an upper bound: d[u] - adj[v][u]
      // This part appears to be a bit complex and potentially specific to the problem.
      // It seems to be calculating d[v] from d[u] by "subtracting" adj[v][u] and then re-adding.
      // This implies d[v] + adj[v][u] should be considered for d[u].
      d[u] = dfs(v, u, d[u] - adj[v][u]) + adj[v][u];
    }
  }
}

// Output the final shortest path costs from node 0 to all other nodes.
for (i = 0; i < n; i++) {
  console.log(i + ' ' + d[i]); // Print node index and its shortest path cost.
}