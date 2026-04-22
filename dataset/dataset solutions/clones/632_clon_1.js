var input =require ('fs') .readFileSync ('/dev/stdin' , 'utf8') ;

/*
 * This section handles initial input reading and parsing.
 * It reads the entire standard input and splits it into lines.
 */


var lines = input .split('\n') ;


// Parse N, M, and X from the first line of input.
// The '- 0' trick is used to convert string to number.
var n = lines[0].split(' ')[0] - 0;
var m = lines[0].split(' ')[1] - 0;

var x = lines[0].split(' ')[2] - 0;


// Declare loop counters and other utility variables.
var i, j, k ;

// Initialize array 'h' to store heights of nodes.
var h = Array(n) ;

// Initialize adjacency list 'gl' for the graph.
var gl = Array(n) ;

// Initialize the stack for DFS/BFS-like traversal.
var stack = [ ] ;


// Loop to initialize node heights and graph adjacency lists.
// The heights are read from lines 1 to N.
for( i = 0 ; i < n ; i ++ ) {

    h[i] = lines[i + 1] - 0 ; // Convert height string to number.

    gl[i] = [ ] ; // Each node gets an empty list for its neighbors.
}



var temp, a, b, t ;

// This loop processes the M edges (connections) between nodes.
// Edges are read from lines N+1 to N+M.
for ( i = 0 ; i < m ; i ++ ) {

    // Split the current line to get edge details.
    temp = lines[i + n + 1].split(' ') ;

    // Parse node 'a' (0-indexed).
    a = temp[0] - 1 ;

    // Parse node 'b' (0-indexed).
    b = temp[1] - 1 ;

    // Parse travel time 't'.
    t = temp[2] - 0 ;

    // Add edge from 'a' to 'b' to the adjacency list.
    gl[a].push( {
        next: b,
        t: t
    } ) ;

    // Add edge from 'b' to 'a' as well (undirected graph).
    gl[b].push( {
        next: a,
        t: t
    } ) ;
}


// Push the starting node onto the stack.
// p: current node index
// t: total time elapsed
// height: current water height
// history: path taken so far to detect cycles
stack.push({
    p: 0,
    t: 0,
    height: x,
    history: [0]
});


var node, next, obj, goal;

// Initialize minimum time to infinity.
var min = Infinity;

// Main loop for graph traversal (Dijkstra-like or modified DFS).
while (stack.length > 0) {

    // Pop the node with the highest priority (usually smallest t, but here it's sorted descending).
    node = stack.pop();

    // If current path already exceeds minimum found, skip it.
    if (node.t >= min) {
        continue;
    }

    // Iterate over all neighbors of the current node.
    for (i = 0; i < gl[node.p].length; i++) {

        obj = gl[node.p][i]; // Get neighbor object.
        next = obj.next;     // Get neighbor node index.

        // If the neighbor is already in the history, it's a cycle, skip.
        if (node.history.indexOf(next) !== -1) {
            continue;
        }

        // Check if current water height is sufficient to traverse the edge.
        if (h[node.p] < obj.t) {
            continue; // Cannot cross, water too low.
        }

        /*
         * Three different scenarios for updating water height and time
         * based on the height of the next node and travel time.
         */

        if (h[next] + obj.t < node.height) {
            // Case 1: Water level after crossing is still higher than next node's height + travel time.
            // The water level decreases to the next node's height.
            stack.push({
                p: next,
                t: node.t + obj.t + node.height - (h[next] + obj.t),
                height: h[next],
                history: node.history.concat(next)
            });
        } else if (h[next + obj.t >= node.height && node.height >= obj.t]) {
            // Case 2: Water level after crossing is between next node's height + travel time
            // and the current height, and current height is enough to cross.
            // Water level decreases by travel time.
            stack.push({
                p: next,
                t: node.t + obj.t,
                height: node.height - obj.t,
                history: node.history.concat(next)
            });
        } else {
            // Case 3: Water level is too low to reach next node's height,
            // or some other condition not met by the first two.
            // Water level drops to 0, and extra time is added for pumping.
            stack.push({
                p: next,
                t: node.t + obj.t + obj.t - node.height,
                height: 0,
                history: node.history.concat(next)
            });
        }

        // If the destination node (n-1) is reached.
        if (next === n - 1) {
            goal = stack.pop(); // Get the state of the path that reached the goal.
            // Update the minimum time.
            min = Math.min(min, goal.t + h[n - 1] - goal.height);
        }
    }

    // Sort the stack to prioritize nodes with lower accumulated time 't'.
    // Note: This is a descending sort, so pop() gets the largest 't'.
    // This implies a modified search strategy, possibly aiming for shortest path in a specific way.
    stack.sort(function (a, b) {
        return b.t - a.t;
    });
}


// After the loop, check the result.
if (min === Infinity) {
    console.log(-1); // If destination was unreachable.
} else {
    console.log(min); // Output the minimum time found.
}