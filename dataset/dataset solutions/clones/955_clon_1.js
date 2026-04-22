/*
 *   Global variables for the min-priority queue (min-heap) implementation.
 *   'h' will store the heap elements, using 1-based indexing for convenience.
 *   'hs' will track the current size of the heap.
 */
var h = [],
    hs = 0; // Initialize heap size to zero.

// Initialize the first element of the heap (index 0) with dummy values.
// This allows for simpler 1-based indexing in heap operations.
h[0] = new Array(2);
h[0][0] = -1;
h[0][1] = -1;


/*
 *   Function to insert a new element (key) into the min-heap.
 *   The 'key' is expected to be an array, where key[1] represents the priority value
 *   (e.g., edge weight in Prim's algorithm).
 */
function insert(key) {

    // Increment the heap size and place the new key at the very end of the heap.
    h[++hs] = key;

    // 'i' represents the current index of the newly inserted element.
    var i = hs;

    // Perform the up-heap (percolate-up) operation to restore the heap property.
    // This loop continues as long as the current element has a parent
    // AND its priority is less than its parent's priority.
    while (h[i][1] < h[Math.floor(i / 2)][1]) {

        // Swap the current element with its parent.
        var ex = h[i]; // Temporarily store the current element.
        h[i] = h[Math.floor(i / 2)]; // Move the parent element down to current position.
        h[Math.floor(i / 2)] = ex; // Move the original current element up to parent's position.

        // Update 'i' to the parent's position for the next iteration of the loop.
        i = Math.floor(i / 2);
    }
}


/*
 *   Function to extract the minimum element from the min-heap.
 *   In a min-heap, the minimum element is always at the root (index 1).
 *   Returns the extracted element, or 'undefined' if the heap is empty.
 */
function extract() {

    // Check if the heap is empty (size is 0 or less).
    // If so, there's nothing to extract, so return.
    if (hs <= 0) {
        return;
    }

    // The minimum element is always stored at index 1.
    var ret = h[1];

    // Replace the root element with the last element in the heap,
    // then decrement the heap size.
    h[1] = h[hs--];

    // 'i' is the index of the element that needs to be percolated down.
    // It starts at the root (index 1).
    i = 1;

    // Perform the down-heap (percolate-down) operation to restore the heap property.
    // The loop continues as long as the current element has at least one child
    // AND its priority is greater than the priority of one of its children.
    while ((i * 2 <= hs && h[i][1] > h[i * 2][1]) ||
        (i * 2 + 1 <= hs && h[i][1] > h[i * 2 + 1][1])) {

        // Calculate the index of the left child.
        var l = i * 2;
        // Initialize the right child index; it might be the same as 'l' if no right child exists.
        var r = i * 2;

        // If a right child exists (i.e., its index is within the heap bounds), update 'r'.
        if (i * 2 + 1 <= hs) {
            r++;
        }

        // Determine which child has the minimum priority.
        // 'm' will store the index of the child with the smaller priority.
        var m = h[l][1] <= h[r][1] ? l : r;

        // Swap the current element with the minimum child.
        var ex = h[i]; // Temporarily store the current element.
        h[i] = h[m]; // Move the minimum child up to the current element's position.
        h[m] = ex; // Move the original current element down to the child's position.

        // Update 'i' to the child's position for the next iteration of the loop.
        i = m;
    }
    // Return the extracted minimum element.
    return ret;
}


/*
 *   Main function to execute the program logic.
 *   This implementation appears to be Prim's algorithm for finding the
 *   Minimum Spanning Tree (MST) of a given graph.
 *   'input' is expected to be a string containing the graph data.
 */
function Main(input) {

    // Split the input string into an array of lines.
    input = input.split("\n");

    // Parse the number of nodes (vertices) 'n' from the first line of input.
    var n = parseInt(input[0], 10);

    // Initialize the adjacency matrix for the graph.
    // 'graph[i][j]' will store the weight of the edge between node 'i' and node 'j'.
    var graph = [];

    // Populate the graph adjacency matrix from the input.
    // The input format is assumed to be: first line 'n', followed by 'n' lines
    // representing the rows of the adjacency matrix, each line space-separated,
    // with an extra leading dummy element in each input row.
    for (var i = 0; i < n; i++) {
        graph[i] = new Array(n); // Create a new row for the adjacency matrix.
        input[i + 1] = input[i + 1].split(" "); // Split the input line by spaces.

        for (var j = 0; j < n; j++) {
            // Parse the integer value for the edge weight.
            // input[i + 1][j + 1] accounts for the first line being 'n' and
            // the first element of each subsequent line being a dummy value.
            graph[i][j] = parseInt(input[i + 1][j + 1], 10);
        }
    }

    // Initialize the 'ans' matrix to store the edges of the Minimum Spanning Tree (MST).
    // 'ans[i][j]' will store the weight of the edge between 'i' and 'j' if it's in the MST.
    // -1 signifies no edge yet.
    var ans = [];
    for (var i = 0; i < n; i++) {
        ans[i] = new Array(n); // Create a new row for the MST matrix.
        for (var j = 0; j < n; j++) {
            ans[i][j] = -1; // Initialize all elements to -1.
        }
    }

    // 'count' tracks the number of nodes that have been included in the MST.
    var count = 1;
    // 'fin' is a boolean array to mark whether a node has been "finished"
    // (i.e., included in the MST).
    var fin = Array(n);

    // Initialize all nodes as not finished (not yet part of the MST).
    for (var i = 0; i < n; i++) {
        fin[i] = false;
    }

    // Start Prim's algorithm from node 0.
    // Mark node 0 as finished, as it's the starting point of the MST.
    fin[0] = true;

    // Add all valid edges connected to the starting node (node 0) to the priority queue.
    // Each element inserted into the heap will be an array:
    // [destination_node_index, edge_weight, source_node_index].
    for (var i = 0; i < n; i++) {
        if (graph[0][i] > -1) { // If there's a valid edge (weight is not -1).
            var a = [];
            a[0] = i; // The destination node of this edge.
            a[1] = graph[0][i]; // The weight of the edge.
            a[2] = 0; // The source node (in this case, node 0).
            insert(a); // Insert this edge into the min-heap.
        }
    }

    // Main loop for Prim's algorithm.
    // Continues until 'n' nodes have been included in the MST.
    while (count < n) {
        // Extract the minimum weight edge from the priority queue.
        // 'aa' will contain [destination_node, weight, source_node].
        var aa = extract();

        // If the destination node of the extracted edge is already in the MST,
        // this edge forms a cycle, so skip it.
        if (fin[aa[0]]) {
            continue;
        }

        // Mark the destination node of the extracted edge as finished (included in MST).
        fin[aa[0]] = true;

        // Add this edge to the 'ans' matrix (MST).
        // Since the graph is undirected, record the edge in both directions.
        ans[aa[0]][aa[2]] = ans[aa[2]][aa[0]] = aa[1];

        // Increment the count of nodes in the MST.
        count++;

        // Now, add all valid edges connected to the newly added node (aa[0])
        // to the priority queue.
        for (var i = 0; i < n; i++) {
            if (graph[aa[0]][i] > -1) { // If there's a valid edge from 'aa[0]' to 'i'.
                var a = [];
                a[0] = i; // The destination node.
                a[1] = graph[aa[0]][i]; // The weight of the edge.
                a[2] = aa[0]; // The source node (the one just added to MST).
                insert(a); // Insert this new edge into the heap.
            }
        }
    }

    // Calculate the total sum of edge weights in the Minimum Spanning Tree.
    var sum = 0;

    // Iterate through the upper triangle of the 'ans' matrix to sum unique edge weights.
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            // Only consider edges where i < j to avoid double-counting edges
            // and to exclude self-loops (i == j).
            // Also, ensure the edge exists in the MST (weight > -1).
            if (i < j && ans[i][j] > -1) {
                sum += ans[i][j];
            }
        }
    }
    // Output the total sum of the MST edge weights to the console.
    console.log(sum);
}

// Read input from standard input (stdin) using Node.js 'fs' module.
// The input is read as a UTF-8 string and then passed to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));