/* This file contains an implementation of Dijkstra's algorithm
 * for finding the shortest paths from a single source node
 * to all other nodes in a graph.
 *
 * It uses a binary min-heap for efficient extraction of the minimum distance node.
 */

// Configuration settings for input and newline characters.
// config = { input: 'tmp', newline: '\r\n' }; // Windows-specific configuration, currently commented out.
config =
    {
        input:      '/dev/stdin', // Input source for reading graph data.
        newline:    '\n'          // Newline character for parsing input. This is for Linux environments.
    };


    const assert = require('assert'); // Importing the 'assert' module for runtime checks.



line =
    require('fs').readFileSync(
        config.input,
        'ascii'
    )
        .trim()         // Remove leading/trailing whitespace from the input string.
        .split(
            config.newline
        ); // Split the input into an array of lines.

n = Number(line.shift()); // 'n' represents the number of nodes. The first line is shifted and converted to a number.


V = {}; // 'V' will store node objects, mapping node IDs to their properties (distance, predecessor, heap index).
w = {}; // 'w' will store the adjacency list representation of the graph, including edge weights.


/**
 * Adds an edge with a given weight to the adjacency list.
 *
 * @param {object} obj - The adjacency list object (either 'w' for weights).
 * @param {number} u   - The source node ID.
 * @param {number} v   - The destination node ID.
 * @param {number} c   - The cost/weight of the edge from u to v.
 */
function add(obj, u, v, c) {
    if ( ! obj.hasOwnProperty(u) ) { // If the source node 'u' is not yet in the object, initialize its entry.
        obj[u] = {};
    }
    obj[u][v] = c; // Assign the cost 'c' to the edge from 'u' to 'v'.
}


/* Loop through each remaining line in the input to build the graph structure. */
for (i in line) {
    ary = line[i].split(' ').map(Number); // Parse each line: split by space, convert parts to numbers.
    u = ary[0];                          // The first number in the line is the node ID 'u'.

    // Initialize node 'u' with default Dijkstra properties.
    V[u] = {
        'id':        u,                       // Node identifier.
        'd':         Number.POSITIVE_INFINITY, // Shortest distance from source, initialized to infinity.
        'pi':        null,                    // Predecessor node in the shortest path.
        'heapindex': null                     // Index in the min-heap, for quick updates.
    };

    /* Iterate through the rest of the numbers in the line to add edges.
     * Edges are represented as pairs: [destination_node, weight]. */
    for (j = 2; j < ary.length; j += 2) {
        add(w, u, ary[j], ary[j+1]); // Add edge from 'u' to 'ary[j]' with weight 'ary[j+1]'.
    }
}


/* Find the source node (node with ID 0) and set its distance to 0. */
for (i in V) {
    if (V[i].id === 0) { // Check if the current node is the source node.
        V[i].d = 0;      // Set the distance of the source node to zero.
        break;           // Once found, no need to check further.
    }
}


// --- Heap Data Structure Implementation ---
// This section defines the functions required to manage a min-priority queue
// based on a binary heap, essential for Dijkstra's algorithm efficiency.


heap = new Array(n+1); // The heap array, 1-indexed. Size n+1 to accommodate up to n nodes.
heapsize = 0;          // Current number of elements in the heap.

for (i = 0; i <= n; i++) {
    heap[i] = null; // Initialize all heap positions to null. Heap stores node objects.
}


/**
 * Maintains the min-heap property by sifting down an element at index 'i'.
 *
 * @param {Array} A - The heap array.
 * @param {number} i - The index of the element to heapify.
 */
function minHeapify(A, i) {
    var l, r, smallest, tmp; // Declare local variables.

    l = 2 * i;     // Calculate index of left child.
    r = 2 * i + 1; // Calculate index of right child.

    // Determine the smallest among parent, left child, and right child.
    if ( l <= heapsize && A[l].d < A[i].d ) {
        smallest = l; // Left child is smaller than parent.
    } else {
        smallest = i; // Parent is currently the smallest (or left child doesn't exist/is larger).
    }

    if ( r <= heapsize && A[r].d < A[smallest].d ) {
        smallest = r; // Right child is smaller than the current 'smallest'.
    }

    // If the smallest is not the current element 'i', a swap is needed.
    if ( smallest !== i ) {
        tmp = A[i];             // Store current element.
        A[i] = A[smallest];     // Move smallest element up.
        A[i].heapindex = i;     // Update its heap index.
        A[smallest] = tmp;      // Move original element down.
        A[smallest].heapindex = smallest; // Update its heap index.
        minHeapify(A, smallest); // Recursively heapify the affected subtree.
    }
}


/**
 * Extracts the node with the minimum distance from the min-heap.
 * This is always the root of the heap (index 1).
 *
 * @param {Array} A - The heap array.
 * @returns {object} The node object with the minimum distance.
 */
function heapExtractMin(A) {
    var min; // Variable to hold the minimum element.

    assert(heapsize >= 1, 'heap underflow'); // Ensure heap is not empty.

    min = A[1];           // The minimum element is at the root (index 1).
    min.heapindex = null; // Clear its heap index as it's being removed.

    A[1] = A[heapsize];   // Move the last element to the root.
    A[1].heapindex = 1;   // Update its heap index.
    A[heapsize] = null;   // Clear the last position.
    heapsize--;           // Decrease heap size.

    minHeapify(A, 1);     // Restore min-heap property starting from the new root.

    return min;           // Return the extracted minimum node.
}


/**
 * Decreases the key (distance) of a node at a given heap index 'i' to a new 'key' value.
 * This operation sifts the element up the heap if its new key is smaller than its parent's.
 *
 * @param {Array} A   - The heap array.
 * @param {number} i  - The index of the element to update.
 * @param {object} key - The new node object (with updated 'd' value) to place at index 'i'.
 */
function heapDecreaseKey(A, i, key) {
    var parent, tmp; // Declare local variables for parent index and temporary storage.

    assert(key.d <= A[i].d, 'new key is larger than current key'); // Assert that new key is indeed smaller or equal.

    A[i] = key;           // Update the node at index 'i' with the new key.
    A[i].heapindex = i;   // Ensure its heap index is correct.

    /* Sift up the element until min-heap property is restored or it reaches the root. */
    while (i > 1) {
        parent = Math.floor(i / 2); // Calculate parent index.
        if (A[parent].d <= A[i].d) {
            break; // If parent is smaller or equal, min-heap property is satisfied.
        }

        // Swap current element with its parent.
        tmp = A[i];
        A[i] = A[parent];
        A[i].heapindex = i;
        A[parent] = tmp;
        A[parent].heapindex = parent;

        i = parent; // Move up to the parent's position.
    }
}


/* A constant node object representing positive infinity, used for heap insertion. */
const POSITIVE_INFINITY_NODE =
  {
    'id':        null,
    'd':         Number.POSITIVE_INFINITY,
    'pi':        null,
    'heapindex': null
  };


/**
 * Inserts a new node into the min-heap.
 * It places the new key at the end and then calls heapDecreaseKey to sift it up.
 *
 * @param {Array} A   - The heap array.
 * @param {object} key - The node object to insert.
 */
function minHeapInsert(A, key) {
    heapsize++;                       // Increase heap size.
    A[heapsize] = POSITIVE_INFINITY_NODE; // Temporarily insert an "infinite" node.
    heapDecreaseKey(A, heapsize, key); // Decrease its key to the actual 'key' value, sifting it up.
}


// --- Dijkstra's Algorithm Core Logic ---
// This section implements the relaxation step and the main Dijkstra function.


/**
 * Relaxes an edge (u, v) with weight w[u.id][v.id].
 * If a shorter path to 'v' is found through 'u', update 'v's distance and predecessor.
 * If 'v' is in the heap, update its position using heapDecreaseKey.
 *
 * @param {object} u - The source node object.
 * @param {object} v - The destination node object.
 * @param {object} w - The adjacency list containing edge weights.
 */
function relax(u, v, w) {
    // Check if a shorter path to 'v' is found via 'u'.
    if (v.d > u.d + w[u.id][v.id]) {
        v.d = u.d + w[u.id][v.id]; // Update 'v's distance.
        v.pi = u;                 // Set 'u' as 'v's predecessor.

        // If 'v' is currently in the min-heap, update its position.
        if (v.heapindex !== null) {
            heapDecreaseKey(heap, v.heapindex, v);
        }
    }
}


/**
 * Implements Dijkstra's algorithm to find the shortest paths from the source node
 * (node with d=0) to all other nodes in the graph.
 *
 * @param {object} w - The adjacency list representation of the graph.
 */
function dijkstra(w) {
    var S = [], // 'S' will store nodes whose shortest path from the source has been finalized.
        i,      // Loop counter.
        Q = heap, // 'Q' is the min-priority queue, implemented using the 'heap' array.
        u;      // Variable to hold the extracted minimum node.

    // Initialize the min-priority queue 'Q' with all nodes from 'V'.
    for (i in V) {
        minHeapInsert(Q, V[i]);
    }

    // Continue as long as there are nodes in the priority queue.
    while (heapsize !== 0) {
        u = heapExtractMin(Q); // Extract the node 'u' with the smallest distance.
        S.push(u);             // Add 'u' to the set of finalized nodes.

        // Iterate over all neighbors 'j' of 'u'.
        for (j in w[u.id]) {
            v = V[j];         // Get the node object for neighbor 'j'.
            relax(u, v, w);   // Perform relaxation on the edge (u, v).
        }
    }
}


// --- Main Execution ---
// This part calls the Dijkstra algorithm and prints the results.


dijkstra(w); // Execute Dijkstra's algorithm on the graph 'w'.


/* Print the shortest distance from the source (node 0) to each node. */
for (i in V) {
    console.log("%s %d", i, V[i].d); // Output format: "node_id distance".
}