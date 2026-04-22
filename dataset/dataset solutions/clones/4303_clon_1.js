/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same as in the source.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 * The functional behavior of this code is identical to the original.
 */
"use strict"; // Enforce strict mode for better code quality.


process.stdin.resume(); // Ensure the standard input stream stays open.


process.stdin.setEncoding('utf8'); // Set the encoding for incoming data to UTF-8.


var input_string = ''; // Initialize an empty string to accumulate all input data.


/*
 * Event listener for 'data' events on the standard input.
 * Appends received data chunks to the input_string.
 */
process.stdin.on('data', function (chunk) {

    input_string += chunk; // Concatenate the current data chunk to the accumulated string.

});


/**
 * Parses a line of space-separated numbers into an array of numbers.
 *
 * @param {string} line - The input string line.
 * @returns {number[]} An array of numbers.
 */
const space_input = function (line) {

    // Remove leading/trailing whitespace and split the line by spaces.
    var arr = line.replace(/(^\s+)|(\s+$)/g, "").split(" ");

    // Iterate through the array and convert each string element to a number.
    for (var i = 0; i < arr.length; ++i) {

        arr[i] = +arr[i]; // Unary plus operator converts string to number.

    }

    return arr; // Return the array of numbers.
};


/**
 * Parses a line of space-separated characters/strings into an array of strings.
 * Note: In its current form, this function is identical to space_input
 * except for the type conversion, which is explicitly skipped here.
 *
 * @param {string} line - The input string line.
 * @returns {string[]} An array of strings.
 */
const space_input_char = function (line) {

    // Remove leading/trailing whitespace and split the line by spaces.
    var arr = line.replace(/(^\s+)|(\s+$)/g, "").split(" ");

    // For character input, no type conversion is performed here.
    for (var i = 0; i < arr.length; ++i) {

        arr[i] = arr[i]; // Keep as string.

    }

    return arr; // Return the array of strings.
};


/*
 * Event listener for the 'end' event on the standard input.
 * This block executes once all input has been received.
 */
process.stdin.on('end', function () {
    // Split the accumulated input string into an array of lines.
    const lines = input_string.split('\n');

    // Parse the first line to get N and M.
    const nm = space_input(lines[0]);
    const N = nm[0]; // N represents the number of nodes.
    const M = nm[1]; // M represents the number of edges.

    // Process the remaining lines (from index 1 onwards) to get edge data.
    // Each line is parsed into an array of numbers representing an edge.
    let ab = lines.splice(1).map(l => space_input(l));

    // Initialize an adjacency list for the graph.
    // pts[i] will store a list of nodes connected to node i.
    let pts = new Array(N + 1);

    // Populate the adjacency list with empty arrays for each node.
    for (let i = 0; i < N + 1; ++i) {
        pts[i] = [];
    }

    // Build the graph by adding edges to the adjacency list.
    // This assumes a 0-indexed graph internally, so adjust node indices.
    for (let e of ab) {
        e[0]--; // Decrement first node index to be 0-based.
        e[1]--; // Decrement second node index to be 0-based.
        pts[e[0]].push(e[1]); // Add connection from e[0] to e[1].
        pts[e[1]].push(e[0]); // Add connection from e[1] to e[0] (undirected graph).
    }

    // Array to store detected loops (cycles) in the graph.
    let loop = [];

    // Iterate through each node to find cycles starting from it.
    for (let i = 0; i < N; ++i) {
        // Initialize 'next' with paths of length 1 starting from node 'i'.
        let next = [].concat(pts[i].map(v => [v]));

        // Set to keep track of visited nodes within the current DFS/BFS-like traversal.
        let done = new Set();

        // Continue exploring paths as long as there are 'next' paths to process.
        while (next.length > 0) {
            let nextnext = []; // Stores paths for the next iteration.
            done.add(i); // Mark the starting node as visited for this traversal.

            // Process each path in the current 'next' array.
            for (let n of next) {
                const sentan = n[n.length - 1]; // The last node in the current path.
                let nikomae = -1; // Node before the last one (used for simple path logic).

                // If the path has at least two nodes, get the second-to-last node.
                if (n.length >= 2) {
                    nikomae = n[n.length - 2];
                }

                // Find neighbors of 'sentan' that can extend the path.
                // - n.indexOf(p) < 0: Neighbor 'p' is not already in the current path (avoid immediate self-loops and simple path repeats).
                // - p !== sentan: Neighbor 'p' is not the current 'sentan' node itself.
                // - (!done.has(p) || p === i): Neighbor 'p' has not been visited in *this* traversal, OR 'p' is the starting node 'i' (potential cycle closure).
                const nextsentan = pts[sentan].filter(p => n.indexOf(p) < 0 && p !== sentan && (!done.has(p) || p === i));

                // For each valid next neighbor:
                nextsentan.forEach(Nsentan => {
                    done.add(Nsentan); // Mark the neighbor as visited.
                    let ttt = [].concat(n); // Create a new path by copying the current path.
                    ttt.push(Nsentan); // Extend the new path with the neighbor.

                    // If the neighbor is not the starting node 'i', continue extending the path.
                    if (Nsentan !== i) {
                        nextnext.push(ttt);
                    } else {
                        // If the neighbor IS the starting node 'i', a cycle has been found.
                        loop.push(ttt);
                    }
                });
            }
            next = nextnext; // Move to the next set of paths for the next iteration.
        }
    }

    // Filter out loops that have less than 3 distinct nodes (e.g., A-B-A are not considered "real" cycles in some contexts).
    loop = loop.filter(v => v.length > 2);

    // Iterate through each identified loop.
    for (let l of loop) {
        // For each edge within a loop.
        for (let i = 0; i < l.length; ++l) { // Note: original code has `++l` which is likely a typo and should be `++i`.
                                            // As per Type I clone rules, this is preserved.
            // Filter out edges from 'ab' that are part of the current loop.
            // This removes edges that form cycles.
            ab = ab.filter(v => !(v[1] == l[i] && v[0] == l[i + 1 % l.length]) && !(v[0] == l[i] && v[1] == l[i + 1 % l.length]));
        }
    }

    // Output the number of remaining edges after removing those involved in cycles.
    console.log(ab.length);
});