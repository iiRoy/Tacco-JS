/*
 * This file contains logic for graph processing, including BFS and DFS-based dynamic programming.
 * It reads graph data from a specified input source, either a temporary file or standard input.
 * The goal is to compute shortest path distances from a source node (node 0) to all other nodes
 * in a potentially weighted graph, handling both forward and reverse edges.
 */

// Configuration object to determine input source and newline character.
// The commented-out line is for Windows, the active one is for Linux/Unix systems.
// config = { input: 'tmp', newline: '\r\n' }; // Windows-specific configuration, currently inactive.
config = {
    input: '/dev/stdin', // Specifies the input file path, typically standard input on Linux.
    newline: '\n'        // Defines the newline character for parsing input lines.
};


// Read the entire content of the specified input file synchronously.
// Then, convert it to ASCII, remove leading/trailing whitespace,
// and split it into an array of lines based on the configured newline character.
line = require('fs')
    .readFileSync(config.input, 'ascii') // Reads file content as ASCII.
    .trim()                              // Removes whitespace from both ends of the string.
    .split(config.newline);              // Splits the string into an array of substrings based on the newline delimiter.


// The first line of the input typically contains the number of nodes (n).
// Remove the first element from the 'line' array and convert it to a number.
n = Number(line.shift());


// Initialize adjacency lists for the graph.
// 'adj' stores forward edges (u -> v with weight c).
// 'adjinv' stores inverse edges (v -> u with weight c), useful for back-traversal.
adj    = {};    // Adjacency list: adj[u][v] = c (cost from u to v).
adjinv = {}; // Inverse adjacency list: adjinv[v][u] = c (cost from v to u).


/*
 * Helper function to add an edge to an adjacency list.
 * If the source node 'u' does not exist in 'obj', it initializes 'obj[u]' as an empty object.
 * Then, it sets the cost 'c' for the edge from 'u' to 'v'.
 *
 * @param {object} obj - The adjacency list (e.g., 'adj' or 'adjinv').
 * @param {number} u   - The source node.
 * @param {number} v   - The destination node.
 * @param {number} c   - The cost/weight of the edge.
 */
function add(
    obj, // The graph object (adjacency list).
    u,   // Source node.
    v,   // Destination node.
    c    // Edge cost.
) {
    if ( ! obj.hasOwnProperty(u) ) { // Check if the source node 'u' already has an entry.
        obj[u] = {};                 // If not, initialize it as an empty object.
    }
    obj[u][v] = c;                   // Assign the cost 'c' to the edge from 'u' to 'v'.
}


// Iterate through the remaining lines of input to populate the adjacency lists.
// Each line represents a node and its outgoing edges.
for ( i in line ) {

    // Split the current line by space and convert each part to a number.
    // The format is typically: u count v1 c1 v2 c2 ...
    ary = line[i]
        .split(' ')     // Splits the line string into an array of strings.
        .map(Number);   // Converts each string element to a number.

    u = ary[0]; // The first element is the source node 'u'.

    // Loop through the array starting from the third element (index 2)
    // to parse pairs of (destination node, cost).
    // The loop increments by 2 for each pair.
    for ( j = 2; j < ary.length; j += 2 ) {
        // Add the forward edge (u -> ary[j]) with cost ary[j+1].
        add(adj, u, ary[j], ary[j+1]);

        // Add the inverse edge (ary[j] -> u) with cost ary[j+1].
        add(adjinv, ary[j], u, ary[j+1]);
    }
}


/*
 *  Simple Breadth-First Search (BFS) implementation
 *  This BFS primarily determines the "layer" or "level" of each node
 *  from the starting node (node 0) in an unweighted sense,
 *  and also calculates an initial shortest path estimate `d[j]`.
 */

// `cnt` serves as the current BFS layer/distance from the source.
cnt = 0;

// `dist` array stores the BFS level of each node. `null` means unvisited.
dist = new Array(n);

// `d` array stores the shortest path distance from the source (node 0) to each node.
// Initialized to `Number.MAX_VALUE` for unreachability.
d = new Array(n);

// Initialize `dist` and `d` for all nodes.
for ( i = 0; i < n; i++ ) {
    dist[i] = null;             // Mark all nodes as unvisited for BFS level.
    d[i]    = Number.MAX_VALUE; // Initialize shortest distances to infinity.
}

// Set initial conditions for the source node (node 0).
dist[0] = 0; // Source node is at BFS level 0.
d[0]    = 0; // Shortest path to source node itself is 0.


// Main BFS loop. Continues as long as new nodes are visited in the current layer.
do {
    rest = 0; // Flag to indicate if any new nodes were visited in the current iteration.

    // Iterate through all nodes that have an adjacency list (i.e., have outgoing edges).
    for ( i in adj ) {

        // Only process nodes that are at the current BFS level (`cnt`).
        // This ensures a level-by-level traversal.
        if ( dist[i] !== cnt ) {
            continue; // Skip nodes not in the current layer.
        }

        adj_i = adj[i]; // Get the adjacency list for the current node `i`.

        // Iterate through all neighbors `j` of node `i`.
        for ( j in adj_i ) {

            // If neighbor `j` has not been visited yet (BFS level is null).
            if ( dist[j] === null ) {
                dist[j] = cnt + 1; // Assign `j` to the next BFS level.
                rest    = 1;       // Set flag to indicate progress (new node visited).
            }

            // Update the shortest path distance `d[j]` to `j`.
            // `d[j]` is the minimum of its current value and `d[i]` (path to `i`)
            // plus the cost of the edge `i` to `j` (`adj_i[j]`).
            d[j] = Math.min(d[j], d[i] + adj_i[j]);
        }
    }
    cnt++; // Increment the BFS layer counter.
} while ( rest ); // Continue as long as `rest` is 1 (meaning new nodes were found).


// Prepare nodes for processing in increasing order of their shortest path distances.
// This is crucial for the dynamic programming approach.

// `bfsnode` will store an array of node indices.
bfsnode = new Array(n);
for ( i = 0; i < n; i++ ) {
    bfsnode[i] = i; // Initialize with node indices 0 to n-1.
}

// Sort `bfsnode` based on the shortest path distances `d[a]` to `d[b]`.
// Nodes with smaller `d` values will appear earlier in the array.
bfsnode.sort(function (a, b) {
    return d[a] - d[b]; // Ascending order sort based on 'd' values.
});


// `bfsnodeinv` will store the rank/index of each node in the sorted `bfsnode` array.
// This allows quick lookup of a node's position in the sorted order.
bfsnodeinv = {};
for ( i = 0; i < n; i++ ) {
    bfsnodeinv[bfsnode[i]] = i; // Map node ID to its index in the sorted array.
}


/*
 * Dynamic Programming and Depth-First Search (DFS) for finding shortest paths.
 *
 * The core idea is to compute shortest paths `d[u]` for nodes `u`
 * by considering paths from predecessors `v`.
 *
 *   min[0, u] = min {
 *     min[0, v] + adj[v, u]  // If min[0, v] is already known and 'v' is "before" 'u' in sorted order.
 *     find min[0, v] starting from (min[0, u] - adj[u, v])
 *       and min[0, v] + adj[v, u] // This implies a DFS to explore paths from 'v' to 'u'
 *                                  // where 'v' might be "after" 'u' in sorted order,
 *                                  // but a path *through* 'v' could still be optimal.
 *   } for v in adjinv[u] (i.e., for all nodes 'v' that have an edge to 'u').
 */


// `visited` array to keep track of visited nodes during DFS.
visited = new Array(n);
for ( i = 0; i < n; i++ ) {
    visited[i] = false; // Initialize all nodes as not visited.
}

// `cur` array acts as a stack for the current path in DFS.
cur = new Array(n);

// `rest` array acts as a stack for remaining neighbors to explore from a node in DFS.
rest = new Array(n);


/*
 * Performs a modified Depth-First Search (DFS) to find potential shorter paths.
 * This DFS explores paths from `v` (a predecessor of `u`) back towards `u`,
 * but with a cost constraint (`start`).
 * It's designed to find `min[0, v]` effectively, given `u` and an initial path cost estimate.
 *
 * @param {number} v     - The starting node for this DFS traversal (a predecessor of u).
 * @param {number} u     - The target node for which `d[u]` is being calculated.
 * @param {number} start - An upper bound for the path cost (d[u] - adj[v][u]).
 * @returns {number} The minimum path cost found from some node to `v` that satisfies conditions.
 */
function dfs(
    v,     // Starting node for DFS (a neighbor of u, in adjinv[u]).
    u,     // The target node for which d[u] is being calculated.
    start  // Cost constraint (current d[u] - cost of edge (v,u)).
) {
    var sp    = 0;              // Stack pointer for `cur` and `rest` arrays.
    var cost  = 0;              // Current path cost from `v` in the DFS.
    var res   = start;          // Minimum cost found so far for the current path.
    var going;                  // Placeholder, not used in this specific implementation logic.
    var next;                   // Next node to visit in DFS.

    // Mark the initial nodes as visited for this DFS call.
    visited[u] = true;
    visited[v] = true;

    cur[0]  = v;                                 // Push `v` onto the path stack.
    rest[0] = Object.keys(adjinv[v]); // Initialize the stack of neighbors to explore from `v`.

    while ( true ) { // Main DFS loop.
        // If there are no more neighbors to explore from the current node on the stack.
        if ( rest[sp].length === 0 ) {
            if ( sp === 0 ) { // If the stack is empty, DFS from `v` is complete.
                return res;   // Return the minimum cost found.
            }
            // Backtrack: remove the last edge cost and pop from stack.
            cost -= adjinv[cur[sp - 1]][cur[sp]]; // Subtract cost of edge just traversed.
            sp--;                                 // Decrement stack pointer.
            continue;                             // Continue to check next node from previous level.
        }

        next = rest[sp].pop(); // Get the next neighbor to explore from the current node.

        if ( visited[next] ) { // If `next` has already been visited in *this* DFS branch.
            continue;          // Skip it to avoid cycles or redundant work within this branch.
        }

        // Pruning step: If the path cost (current path + edge to next) exceeds the 'start' limit.
        if ( cost + adjinv[cur[sp]][next] >= start ) {
            continue; // This path is already too expensive, prune it.
        }

        // If 'next' node's rank in the sorted `bfsnode` array is less than `u`'s rank.
        // This means `d[next]` is likely already finalized or a better path.
        if ( bfsnodeinv[next] < bfsnodeinv[u] ) {
            // Update the minimum result `res` with the path through `next` and its `d[next]`.
            res = Math.min(
                res,
                cost + adjinv[cur[sp]][next] + d[next] // Path cost + edge to next + shortest path to next.
            );
            continue; // Continue to next neighbor, don't explore deeper from `next` in this case.
        }

        // If no pruning condition met, extend the current path.
        cost += adjinv[cur[sp]][next]; // Add the cost of the edge to `next`.
        sp++;                          // Increment stack pointer.
        cur[sp] = next;                // Push `next` onto the path stack.
        rest[sp] = Object.keys(adjinv[next]); // Initialize neighbors to explore from `next`.
    }
}


// Main loop to compute final shortest path distances using the sorted `bfsnode` order.
// This iterates through nodes in an order that ensures `d[v]` is likely finalized
// when considering `v` as a predecessor for `u`.
for ( i in bfsnode ) {

    u = bfsnode[i]; // Get the current node `u` from the sorted array.

    // First pass: Consider predecessors `v` where `v` appears *before* `u` in the sorted list.
    // This implies `d[v]` is likely finalized or a very good estimate.
    for ( v in adjinv[u] ) {
        if ( bfsnodeinv[v] < bfsnodeinv[u] ) {
            // Update `d[u]` if a shorter path is found via `v`.
            d[u] = Math.min(d[u], d[v] + adj[v][u]);
        }
    }

    // Second pass: Consider predecessors `v` where `v` appears *after* `u` in the sorted list.
    // For these cases, `d[v]` might not be finalized yet. We use DFS to explore.
    for ( v in adjinv[u] ) {
        if ( bfsnodeinv[v] > bfsnodeinv[u] ) {
            // Call DFS to find a potentially better path from `v` to `u`.
            // The `start` parameter for DFS is `d[u] - adj[v][u]`, which is the
            // maximum allowed cost to reach `v` if the current path `d[u]` is to be improved.
            // The DFS returns `min[0, v]`, which is then added to `adj[v][u]` to update `d[u]`.
            d[u] = dfs(v, u, d[u] - adj[v][u]) + adj[v][u];
        }
    }
}


// Output the final shortest path distances for each node.
// Format: "node_id distance"
for ( i = 0; i < n; i++ ) {
    console.log(i + ' ' + d[i]); // Print node ID and its shortest distance from node 0.
}