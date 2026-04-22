/*
 * This script processes input from stdin to solve a graph-related problem.
 * It detects and processes cycles (loops) within a graph structure.
 */

// Resume stdin to ensure the process doesn't exit before all data is read.
process
    .stdin
    .resume();

// Set the encoding for incoming data to UTF-8.
process
    .stdin
    .setEncoding(
        'utf8'
    );


// Initialize a variable to accumulate all incoming data.
var input_string = '';


// Attach an event listener for 'data' events on stdin.
// Each time data is received, append it to input_string.
process
    .stdin
    .on(
        'data',
        function (
            chunk
        ) {
            input_string += chunk; // Concatenate the new data chunk.
        }
    );


/*
 * Helper function: Parses a line of space-separated numbers.
 * It trims whitespace, splits by space, and converts each part to a number.
 */
const space_input = function (
    line
) {
    // Remove leading/trailing whitespace, then split the line by spaces.
    var arr = line
        .replace(
            /(^\s+)|(\s+$)/g,
            ""
        )
        .split(
            " "
        );

    // Iterate through the array and convert each string element to a number.
    for (
        var i = 0;
        i < arr.length;
        ++i
    ) {
        arr[i] = +arr[i]; // Unary plus operator converts string to number.
    }

    return arr; // Return the array of numbers.
};


/*
 * Helper function: Parses a line of space-separated characters/strings.
 * Similar to space_input, but does not convert elements to numbers.
 * (Note: The conversion `arr[i] = arr[i];` is redundant but kept for Type I clone rules.)
 */
const space_input_char = function (
    line
) {
    // Trim whitespace and split the line by spaces.
    var arr = line
        .replace(
            /(^\s+)|(\s+$)/g,
            ""
        )
        .split(
            " "
        );

    // Iterate through the array. This loop effectively does nothing as arr[i] is assigned to itself.
    for (
        var i = 0;
        i < arr.length;
        ++i
    ) {
        arr[i] = arr[i];
    }

    return arr; // Return the array of strings.
};


// Attach an event listener for the 'end' event on stdin.
// This function executes once all input data has been received.
process
    .stdin
    .on(
        'end',
        function () {
            // Split the entire input string into an array of lines.
            const lines = input_string
                .split(
                    '\n'
                );

            // Parse the first line to get N (number of nodes) and M (number of edges).
            const nm = space_input(
                lines[0]
            );
            const N = nm[0]; // Number of nodes.
            const M = nm[1]; // Number of edges.


            // Parse the remaining lines to get the edges (ab).
            // Each line represents an edge, converted to an array of two numbers.
            let ab = lines
                .splice(1)
                .map(
                    l => space_input(l)
                );


            // Initialize an adjacency list for the graph.
            // pts[i] will store a list of nodes adjacent to node i.
            let pts = new Array(
                N + 1
            );

            // Initialize each entry in the adjacency list as an empty array.
            for (
                let i = 0;
                i < N + 1;
                ++i
            ) {
                pts[i] = [];
            }


            // Populate the adjacency list using the parsed edges.
            // Adjust node indices to be 0-based for easier array access.
            for (
                let e of ab
            ) {
                e[0]--; // Decrement first node index.
                e[1]--; // Decrement second node index.

                // Add bidirectional edges.
                pts[e[0]]
                    .push(
                        e[1]
                    );
                pts[e[1]]
                    .push(
                        e[0]
                    );
            }


            // Array to store detected loops.
            let loop = [];

            // Main loop to find cycles (loops) starting from each node.
            for (
                let i = 0;
                i < N;
                ++i
            ) {
                // Initialize 'next' with paths of length 1 starting from node 'i'.
                // Each path is an array containing the sequence of nodes.
                let next = []
                    .concat(
                        pts[i]
                            .map(
                                v => [v]
                            )
                    );

                // Set to keep track of visited nodes during the current BFS/DFS-like traversal.
                let done = new Set();


                // While there are paths to explore.
                while (
                    next.length > 0
                ) {
                    let nextnext = []; // Paths for the next iteration.
                    done.add(i); // Mark the starting node as visited for this traversal.

                    // Process each path in the current 'next' list.
                    for (
                        let n of next
                    ) {
                        const sentan = n[n.length - 1]; // The last node in the current path.
                        let nikomae = -1; // The second-to-last node, initialized to -1.

                        // If the path has at least two nodes, get the second-to-last node.
                        if (
                            n.length >= 2
                        ) {
                            nikomae = n[n.length - 2];
                        }

                        // Find neighbors of 'sentan' that are not already in the current path,
                        // are not 'sentan' itself (self-loops not considered here explicitly),
                        // and are either not visited yet OR are the starting node 'i'.
                        // The condition `p!==sentan` is technically redundant if `pts` doesn't contain self-loops.
                        const nextsentan = pts[sentan]
                            .filter(
                                p => n.indexOf(p) < 0 && p !== sentan && (!done.has(p) || p === i)
                            );


                        // For each valid next node 'Nsentan'.
                        nextsentan
                            .forEach(
                                Nsentan => {
                                    done.add(Nsentan); // Mark this node as visited.

                                    // Create a new path by extending the current path 'n'.
                                    ttt = []
                                        .concat(
                                            n
                                        );
                                    ttt
                                        .push(
                                            Nsentan
                                        );

                                    // If the new node is not the starting node 'i', add it to 'nextnext' for further exploration.
                                    if (
                                        Nsentan !== i
                                    ) {
                                        nextnext
                                            .push(
                                                ttt
                                            );
                                    } else {
                                        // If the new node IS the starting node 'i', a loop has been found.
                                        loop
                                            .push(
                                                ttt
                                            );
                                    }
                                }
                            );
                    }
                    next = nextnext; // Move to the next set of paths for the next iteration.
                }
            }


            // Filter out loops that have fewer than 3 nodes (e.g., A-B-A is a 2-edge loop, 3 nodes in path).
            // A simple edge A-B and back to A is not considered a "loop" in typical graph theory context for fundamental cycles.
            loop = loop
                .filter(
                    v => v.length > 2
                );


            // Remove edges that are part of any detected loop.
            // This part of the code has a potential bug: `++l` inside the inner loop condition `for(let i=0;i<l.length;++l)`.
            // It should likely be `++i`. However, as per Type I clone rules, this must remain unchanged.
            for (
                let l of loop
            ) {
                for (
                    let i = 0;
                    i < l.length;
                    ++l
                ) { // Potential bug: should be ++i, but must clone exactly.
                    // Filter out edges (v) that match a segment of the current loop (l).
                    // Checks for both (v[1]==l[i] && v[0]==l[i+1%l.length]) and (v[0]==l[i] && v[1]==l[i+1%l.length]).
                    ab = ab
                        .filter(
                            v => !(v[1] == l[i] && v[0] == l[i + 1 % l.length]) && !(v[0] == l[i] && v[1] == l[i + 1 % l.length])
                        );
                }
            }


            // Output the final count of remaining edges.
            console
                .log(
                    ab.length
                );
        }
    );