function main() {
    // This is the main function where the program execution begins.
    // It implements Dijkstra's algorithm using a min-priority queue (heap).

    var heap = []; // Initialize an empty array to serve as our min-heap.

    /**
     * Inserts an element 'x' into the min-heap, maintaining the heap property.
     * @param {Array} x - The element to be inserted, typically [priority, value].
     */
    function heap_push(x) {
        // Start by placing the new element at the end of the heap.
        var i = heap.length;

        // Perform "bubble up" operation to restore heap property.
        while (i > 0) {
            // Calculate the parent index. (i - 1) / 2, floored.
            var p = (i - 1) >> 1;

            // If the parent is less than or equal to the new element,
            // the heap property is satisfied, so we can stop.
            if (heap[p] <= x) {
                break;
            }

            // Otherwise, swap the current element with its parent.
            heap[i] = heap[p];
            i = p; // Move up to the parent's position.
        }

        // Place the new element in its final sorted position.
        heap[i] = x;
    }


    /**
     * Removes and returns the smallest element (root) from the min-heap.
     * Restores the heap property after removal.
     * @returns {Array} The smallest element from the heap.
     */
    function heap_pop() {
        // The smallest element is always at the root (index 0).
        var result = heap[0];

        // Take the last element from the heap to replace the root temporarily.
        // This also handles the case where the heap becomes empty.
        var x = heap.pop();

        // If the heap is now empty, simply return the result.
        if (!heap.length) {
            return result;
        }

        // Perform "bubble down" operation to restore heap property.
        var i = 0; // Start from the root.
        while (i * 2 + 1 < heap.length) { // Check if left child exists.
            var a = i * 2 + 1; // Index of the left child.
            var b = i * 2 + 2; // Index of the right child.

            // Determine which child is smaller (if both exist).
            if (b < heap.length && heap[b] < heap[a]) {
                a = b; // 'a' now points to the smaller child.
            }

            // If the smaller child is greater than or equal to 'x',
            // the heap property is satisfied, so we can stop.
            if (heap[a] >= x) {
                break;
            }

            // Otherwise, swap the current element with the smaller child.
            heap[i] = heap[a];
            i = a; // Move down to the child's position.
        }

        // Place 'x' (the element that was originally at the end) in its final sorted position.
        heap[i] = x;

        // Return the original smallest element.
        return result;
    }


    // Read input values: number of nodes (n), number of edges (m), and start node (s).
    var n = scan();
    var m = scan();
    var s = scan();

    // Initialize an adjacency list for the graph.
    var g = [];
    rep(n, function(i) {
        g[i] = []; // Each node gets an empty list for its outgoing edges.
    });

    // Read 'm' edges and populate the adjacency list.
    rep(m, function() {
        var a = scan(); // Source node.
        var b = scan(); // Destination node.
        var c = scan(); // Weight of the edge.

        g[a].push([b, c]); // Add edge (b, c) to node 'a''s list.
    });


    // Initialize distance array with Infinity for all nodes, except the start node.
    var d = []; // 'd' will store the shortest distance from 's' to each node.
    rep(n, function(i) {
        d[i] = Infinity; // Initialize all distances to unreachable.
    });


    d[s] = 0; // The distance from the start node to itself is 0.
    heap_push([0, s]); // Add the start node to the priority queue with distance 0.

    // Dijkstra's algorithm main loop.
    // Continues as long as there are nodes in the priority queue.
    while (heap.length) {
        var v = heap_pop(); // Get the node with the smallest distance from the priority queue.

        // If we have already found a shorter path to 'v[1]' (the node)
        // than the one currently in the heap ('v[0]'), skip this entry.
        // This handles stale entries in the priority queue.
        if (v[0] > d[v[1]]) {
            continue;
        }

        // Iterate over all neighbors of the current node 'v[1]'.
        rep(g[v[1]].length, function(i) {
            var edge = g[v[1]][i]; // An edge is [destination_node, weight].

            // Check if a shorter path to the neighbor 'edge[0]' can be found
            // by going through the current node 'v[1]'.
            if (d[edge[0]] > d[v[1]] + edge[1]) {
                // If a shorter path is found, update the distance.
                d[edge[0]] = d[v[1]] + edge[1];
                // Add the neighbor to the priority queue with its new, shorter distance.
                heap_push([d[edge[0]], edge[0]]);
            }
        });
    }

    // Output the shortest distances to all nodes.
    rep(n, function(i) {
        // If the distance is still Infinity, it means the node is unreachable.
        print(d[i] !== Infinity ? d[i] : 'INF');
    });
} // End of main function.


/**
 * A utility function for looping.
 * Behaves like a 'for' loop from 'a' to 'b' (exclusive) calling 'c(i)'.
 * If only two arguments are provided, it loops from 0 to 'a' (exclusive) calling 'b(i)'.
 * @param {number} a - Start index or end index.
 * @param {function|number} b - End index or callback function.
 * @param {function} [c] - Callback function.
 */
function rep(a, b, c) {
    // If 'c' is not provided, it means 'b' is the callback and 'a' is the upper limit.
    if (c == null) {
        c = b; // 'c' becomes the callback.
        b = a; // 'b' becomes the upper limit.
        a = 0; // 'a' (start index) defaults to 0.
    }
    // Execute the loop.
    for (var i = a; i < b; ++i) {
        c(i); // Call the callback with the current loop index.
    }
}


// Set up standard input processing.
process.stdin.resume(); // Keep the process running to receive input.
process.stdin.setEncoding('utf8'); // Interpret input as UTF-8 encoded text.


var input = ''; // Accumulates all incoming input data.
var input_index = 0; // Tracks the current position in the 'input' array during scanning.


/**
 * Reads and returns the next token from the pre-processed input.
 * Converts to a number by default, or returns as a string if 'string' type is specified.
 * @param {string} [type] - Optional type, 'string' for string, otherwise number.
 * @returns {number|string} The parsed token.
 */
function scan(type) {
    if (type === 'string') {
        return input[input_index++]; // Return as string.
    } else {
        return +input[input_index++]; // Convert to number using unary plus.
    }
}


/**
 * Prints a value to the console, followed by a newline.
 * This is a wrapper around console.log.
 * @param {*} val - The value to be printed.
 */
function print(val) {
    console.log(val);
}


// Event listener for incoming data chunks.
process.stdin.on('data', function(chunk) {
    input += chunk; // Append new data to the 'input' string.
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
    // When all input is received, split it by whitespace into an array of tokens.
    input = input.split(/\s+/);
    // Call the main function to start program logic.
    main();
});