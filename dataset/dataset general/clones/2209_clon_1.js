/******************************************************************************
 *
 * This file contains various algorithms and data structures implemented in
 * JavaScript.
 *
 * Licensed under the MIT license.
 * (c) 2010 by Johann Philipp Strathausen <strathausen@gmail.com>
 * More information at: http://strathausen.eu
 *
 *****************************************************************************/


/**
 * Bellman-Ford Algorithm
 *
 * A path-finding algorithm that computes the shortest paths from a single
 * source node to all other nodes in a weighted digraph.
 *
 *
 * Complexity Analysis:
 * Time Complexity: O( |E| * |V| ), where E represents the number of edges
 *                  and V represents the number of vertices (nodes) in the graph.
 *
 *
 * Constraints and Applicability:
 * This algorithm can effectively handle graphs that contain negative edge
 * weights. However, it is crucial that the graph does not contain any
 * negative weight cycles, as such cycles would lead to infinite loops and
 * an undefined shortest path.
 *
 * @param {object} g      The graph object, containing 'nodes' and 'edges'.
 * @param {object} source The starting node from which to calculate shortest paths.
 */
function bellman_ford ( g, source ) {

    var i,
        l; // Loop counters for iteration.

    /*
     * STEP 1: Initialization Phase
     * Sets up initial distance estimates and predecessors for all nodes.
     */
    for ( var n in g.nodes ) {
        g.nodes[n].distance = Infinity; // Initialize all distances to positive infinity.
    }

    // Predecessors are implicitly set to null/undefined by default.
    source.distance = 0; // The distance from the source to itself is zero.

    // Snapshot for visualization or debugging purposes.
    step( "Initially, all distances are set to infinite and all predecessors are null." );

    /*
     * STEP 2: Edge Relaxation Phase
     * This is the core of the Bellman-Ford algorithm. We repeatedly relax
     * each edge to find shorter paths.
     */
    // This process must be repeated |V| - 1 times.
    for ( i = 1, l = g.nodes.length; i < l; i++ ) {

        // Iterate over every edge in the graph.
        for ( var e in g.edges ) {
            var edge = g.edges[e]; // Get the current edge.

            // Check if a shorter path to the target node can be found
            // through the current edge's source node.
            if ( edge.source.distance + edge.weight < edge.target.distance ) {
                step( "Relaxing edge between " + edge.source.id + " and " + edge.target.id + "." );
                edge.target.distance = edge.source.distance + edge.weight; // Update distance.
                edge.target.predecessor = edge.source; // Update predecessor.
            }
            // The commented-out block below seems to be an experimental feature
            // for undirected edges, which is not part of the standard Bellman-Ford
            // for directed graphs, and needs further testing.
            // if ( !edge.style.directed ) {
            //     if ( edge.target.distance + edge.weight < edge.source.distance ) {
            //         g.snapShot( "Relaxing edge between " + edge.target.id + " and " + edge.source.id + "." );
            //         edge.source.distance = edge.target.distance + edge.weight;
            //         edge.source.predecessor = edge.target;
            //     }
            // }
        }
    }

    step( "Bellman-Ford relaxation complete." );

    /*
     * STEP 3: Negative Cycle Detection (TO DO)
     * This crucial step verifies the absence of negative cycles.
     * If a negative cycle is detected, shortest paths are undefined.
     * For now, this implementation assumes no negative cycles exist.
     * (This part is left as an exercise for the reader.)
     */
}


/******************************************************************************
 *
 * Dijkstra's Algorithm
 *
 * A path-finding algorithm that computes the shortest paths from a single
 * source node to all other nodes in a graph with non-negative edge weights.
 *
 *
 * Performance Characteristics:
 * Worst-case running time: O((|E| + |V|) * log |V|).
 * This makes it more efficient than Bellman-Ford for sparse graphs (graphs
 * with fewer edges relative to nodes).
 *
 * Important Limitation:
 * Dijkstra's algorithm cannot correctly handle graphs with negative edge weights.
 *
 * @param {object} g      The graph object, containing 'nodes' and 'edges'.
 * @param {object} source The starting node from which to calculate shortest paths.
 */
function dijkstra ( g, source ) {

    // Initial setup: all distances are infinite, predecessors are initially null.
    for ( var n in g.nodes ) {
        g.nodes[n].distance = Infinity;
    }
    // Predecessors are not explicitly set but are implicitly null/undefined.

    g.snapShot( "Initially, all node distances are infinite and all predecessors are null." );

    source.distance = 0; // The source node's distance to itself is zero.

    // Initialize a min-priority queue (BinaryMinHeap) with all graph nodes.
    // The queue is ordered by the 'distance' property of each node.
    var q = new BinaryMinHeap( g.nodes, "distance" );

    var node; // Variable to hold the currently processed node.

    /*
     * Main loop of Dijkstra's algorithm.
     * Continues as long as there are unoptimized nodes in the priority queue.
     * `q.min()` operation can take O(log n) time.
     */
    while ( q.min() !== undefined ) {

        node = q.extractMin(); // Extract the node with the smallest distance.
        node.optimized = true; // Mark this node as optimized (processed).

        // If the extracted node's distance is still Infinity, it implies
        // that this node (and any subsequent nodes with Infinity distance)
        // is unreachable from the source. This should typically not happen
        // in a connected graph or if the graph is properly initialized.
        if ( node.distance === Infinity ) {
            throw "Error: Orphaned node detected! Cannot reach all nodes from source.";
        }

        // Iterate over all edges connected to the current node.
        node.edges.forEach( function ( e ) {
            // Determine the 'other' node connected by the edge 'e'.
            var other = ( node === e.target ) ? e.source : e.target;

            // If the 'other' node has already been optimized, skip it.
            if ( other.optimized ) {
                return;
            }

            // Calculate an alternative path distance through the current node.
            var alt = node.distance + e.weight;

            // If the alternative path is shorter than the current recorded distance
            // to the 'other' node, update its distance and predecessor.
            if ( alt < other.distance ) {

                other.distance = alt; // Update the distance to 'other'.

                // Re-heapify the priority queue to reflect the updated distance.
                // This is crucial for maintaining the min-heap property.
                q.heapify();

                other.predecessor = node; // Set the current node as 'other's predecessor.
                g.snapShot( "Enhancing node: " + other.id + " via " + node.id + "." );
            }
        } );
    }
}


/******************************************************************************
 *
 * Floyd-Warshall Algorithm
 *
 * An algorithm for finding shortest paths in a weighted graph with positive
 * or negative edge weights (but no negative cycles). It calculates shortest
 * paths between ALL pairs of vertices.
 *
 *
 * Complexity:
 * Runs in O(|V|³) time, where |V| is the number of vertices. This complexity
 * applies to both worst-case and best-case scenarios.
 *
 *
 * Current Status:
 * This implementation is specifically designed to work with the Dracula
 * graph library and might not be ready for general use without adaptation.
 *
 * @param {object} g      The graph object.
 * @param {object} source This parameter is typically not used in Floyd-Warshall
 *                        as it computes all-pairs shortest paths, not single-source.
 */
function floyd_warshall ( g, source ) { // 'source' parameter is largely ignored in this context.

    /*
     * Step 1: Initialization of Path and Next-hop Matrices.
     * We create two matrices: 'path' to store shortest distances and 'next'
     * to reconstruct the actual paths.
     */
    var path = []; // Matrix to store shortest path distances.
    var next = []; // Matrix to store next-hop information for path reconstruction.
    var n    = g.nodes.length; // Total number of nodes in the graph.
    var i, j, k, e; // Loop counters and edge iterator.

    // Construct path matrix, initializing all distances to Infinity,
    // and self-loop distances to 0.
    for ( j in g.nodes ) {
        path[j] = []; // Initialize inner array for node 'j'.
        next[j] = []; // Initialize inner array for next-hop matrix.
        for ( i in g.nodes ) {
            path[j][i] = ( j === i ) ? 0 : Infinity; // Distance to self is 0, others are Infinity.
        }
    }

    // Initialize the 'path' matrix with direct edge weights.
    // If an edge exists between two nodes, its weight is the initial shortest path.
    for ( e in g.edges ) {
        path[g.edges[e].source.id][g.edges[e].target.id] = g.edges[e].weight;
    }

    /*
     * Note on Initialization:
     * Typically, initialization involves reading weights from an adjacency
     * matrix. This implementation iterates through an edge list, which is
     * functionally equivalent but might be less direct for matrix-based algorithms.
     */

    /*
     * Step 2: Core Floyd-Warshall Computation.
     * This triple-nested loop finds the shortest paths by considering
     * all possible intermediate nodes 'k'.
     */
    for ( k in g.nodes ) { // Iterate through all possible intermediate nodes.
        for ( i in g.nodes ) { // Iterate through all possible source nodes.
            for ( j in g.nodes ) { // Iterate through all possible destination nodes.
                // If a path from 'i' to 'j' through 'k' is shorter than the
                // currently known shortest path from 'i' to 'j'.
                if ( path[i][j] > path[i][k] + path[k][j] ) {
                    path[i][j] = path[i][k] + path[k][j]; // Update shortest distance.
                    /*
                     * Step 2.b: Path Reconstruction - Remember the intermediate node.
                     */
                    next[i][j] = k; // Store 'k' as the next hop from 'i' to 'j'.
                }
            }
        }
    }

    /*
     * Step 3: Path Reconstruction Function.
     * This helper function reconstructs the actual shortest path between
     * two given nodes using the 'next' matrix.
     *
     * @param {string} i The ID of the starting node.
     * @param {string} j The ID of the ending node.
     * @returns {Array|null} An array of intermediate node IDs, or null if direct.
     * @throws {string} If no path exists between the given nodes.
     */
    function getPath ( i, j ) {
        if ( path[i][j] === Infinity ) {
            throw "Error: There is no path between node " + i + " and node " + j + ".";
        }
        var intermediate = next[i][j]; // Get the next intermediate node.
        if ( intermediate === undefined ) {
            return null; // No intermediate node, means direct path or path of length 0.
        } else {
            // Recursively reconstruct the path.
            return getPath( i, intermediate )
                .concat( [ intermediate ] ) // Add the intermediate node itself.
                .concat( getPath( intermediate, j ) );
        }
    }

    /*
     * TODO: Integrate usage of the computed paths, e.g.,
     * mark the shortest path in the graph visualization.
     */
}


/******************************************************************************
 *
 * Ford-Fulkerson Algorithm (Conceptual Overview)
 *
 * This section describes the Ford-Fulkerson algorithm for finding the maximum
 * flow through a directed graph from a specified source to a sink.
 * It also encompasses the Edmonds-Karp implementation variant.
 *
 *
 * Algorithm Description:
 * The core idea is to repeatedly find an augmenting path from the source
 * to the sink in the residual graph and increase the flow along this path
 * until no more augmenting paths can be found.
 *
 *
 * Complexity:
 * The general Ford-Fulkerson algorithm has a complexity of O(E * max(f)),
 * where E is the number of edges and max(f) is the maximum flow value.
 * Its convergence can be slow or non-existent with irrational capacities.
 *
 *
 * Constraints:
 * This algorithm primarily works correctly when all edge capacities (weights)
 * are integers. If capacities are real numbers, the algorithm may not converge
 * to the true maximum flow, or may do so very slowly.
 *
 *
 * Input Parameters:
 * g - The graph object (expected to have nodes and edges, with edges
 *     having a 'capacity' property).
 * s - The ID of the source node.
 * t - The ID of the target (sink) node.
 *
 *
 * Output:
 * The maximum flow value that can be sent from source 's' to target 't'.
 *
 *****************************************************************************/
/*
 * Edmonds-Karp Algorithm (A specific implementation of Ford-Fulkerson)
 *
 * This algorithm is a particular specialization of the Ford-Fulkerson method
 * that guarantees polynomial time complexity by using Breadth-First Search (BFS)
 * to find augmenting paths.
 *
 *
 * Complexity:
 * The Edmonds-Karp algorithm has a worst-case time complexity of O(|V| * |E|²),
 * where |V| is the number of vertices and |E| is the number of edges.
 *
 *
 * Input Parameters:
 * g - The graph object (expected to have node and edge lists, with edges
 *     possessing a 'capacity' property).
 * s - The ID of the source node.
 * t - The ID of the sink node.
 *
 */
function edmonds_karp ( g, s, t ) {
    // Implementation details for Edmonds-Karp would go here.
    // This function body is currently empty.
}


/******************************************************************************
 *
 * BinaryMinHeap - A simple binary min-heap implementation.
 *
 * This data structure serves as a priority queue, efficiently storing elements
 * and allowing quick retrieval of the minimum element.
 *
 *
 * Features:
 * - Takes an array as input during construction.
 * - Elements in the array are expected to have a 'key' property, or a custom
 *   key can be specified. If no key is provided, the element itself is used.
 * - Provides `insert()`, `min()`, `extractMin()`, and `heapify()` methods.
 *
 *
 * Element Structure:
 * Elements stored in the heap can be objects like:
 *   { key: "... key property ...", value: "... element content ..." }
 * Or simply primitive values if `key` is not specified.
 *
 *
 * Example Usage (e.g., in a browser console like Firebug or Chromium DevTools):
 *   var x = { foo: 20, hui: "bla" };
 *   var a = new BinaryMinHeap( [ x, { foo: 3 }, { foo: 10 }, { foo: 20 },
 *                                { foo: 30 }, { foo: 6 }, { foo: 1 }, { foo: 3 } ], "foo" );
 *   console.log( a.extractMin() ); // Should output { foo: 1 }
 *   console.log( a.extractMin() ); // Should output { foo: 3 }
 *   x.foo = 0; // Update the key of an existing element.
 *   a.heapify(); // IMPORTANT: Call heapify() after updating any element's key.
 *   console.log( a.extractMin() ); // Should output { foo: 0, hui: "bla" }
 *   console.log( a.extractMin() ); // Should output { foo: 3 }
 *
 *   The heap can also be used with a simple array of numbers, e.g., [ 9, 7, 8, 5 ].
 *
 * @param {Array}  array An initial array of elements to populate the heap.
 * @param {string} key   The property name to use as the key for comparison.
 */
function BinaryMinHeap ( array, key ) {

    /*
     * The binary tree is represented as an array.
     * This avoids the need for complex node objects with pointers.
     */
    var tree = [];

    // Default key property is 'key', but can be overridden.
    key = key || 'key';

    /*
     * Helper functions to calculate array indices for parent and children.
     *
     * @param {number} index The current node's index.
     * @returns {number} The index of the parent or child.
     */
    var parent = function ( index ) { return Math.floor( ( index - 1 ) / 2 ); };
    var right  = function ( index ) { return 2 * index + 2; };
    var left   = function ( index ) { return 2 * index + 1; };

    /*
     * `bubble_up` function:
     * Restores the min-heap property by moving an element up the tree
     * as long as its key is smaller than its parent's key.
     *
     * @param {number} i The index of the element to bubble up.
     */
    function bubble_up ( i ) {
        var p = parent( i ); // Get parent's index.
        while ( ( p >= 0 ) && ( tree[i][key] < tree[p][key] ) ) {
            // Swap the element with its parent.
            var temp = tree[i];
            tree[i] = tree[p];
            tree[p] = temp;

            i = p; // Move up one level.
            p = parent( i ); // Update parent index.
        }
    }

    /*
     * `bubble_down` function:
     * Restores the min-heap property by moving an element down the tree
     * as long as it is larger than one of its children.
     * It swaps with the smaller of its children.
     *
     * @param {number} i The index of the element to bubble down.
     */
    function bubble_down ( i ) {
        var l = left( i );  // Index of the left child.
        var r = right( i ); // Index of the right child.

        // Loop as long as the current element is larger than at least one child.
        while ( ( tree[l] && ( tree[i][key] > tree[l][key] ) ) ||
                ( tree[r] && ( tree[i][key] > tree[r][key] ) ) ) {

            var child; // Index of the smaller child.

            // Determine which child is smaller (if both exist).
            if ( tree[l] && tree[r] ) {
                child = ( tree[l][key] > tree[r][key] ) ? r : l;
            } else if ( tree[l] ) {
                child = l;
            } else { // Only right child exists (shouldn't happen in a complete binary tree, but for robustness).
                child = r;
            }

            // Swap the current element with the smaller child.
            var temp = tree[i];
            tree[i] = tree[child];
            tree[child] = temp;

            i = child; // Move down to the child's position.
            l = left( i );  // Update child indices.
            r = right( i );
        }
    }

    /*
     * `insert` method:
     * Adds a new element to the heap while maintaining the min-heap property.
     * 1. Appends the element to the end of the array.
     * 2. Calls `bubble_up` to reposition it correctly.
     *
     * @param {any} element The element to insert.
     */
    this.insert = function ( element ) {

        // Ensure the element has a 'key' property, wrapping it if necessary.
        if ( element[key] === undefined ) {
            element = { key: element };
        }

        tree.push( element ); // Insert at the end.

        bubble_up( tree.length - 1 ); // Restore heap property by bubbling up.
    };

    /*
     * `min` method:
     * Returns the element with the smallest key without removing it.
     *
     * @returns {any|undefined} The minimum element, or undefined if the heap is empty.
     */
    this.min = function () {
        return tree.length === 0 ? undefined : tree[0];
    };

    /*
     * `extractMin` method:
     * Removes and returns the element with the smallest key (the root).
     * 1. Stores the root element as the result.
     * 2. Moves the last element of the array to the root position.
     * 3. Calls `bubble_down` on the new root to restore the heap property.
     *
     * @returns {any|undefined} The minimum element that was extracted, or undefined if empty.
     */
    this.extractMin = function () {
        var result = this.min(); // Get the minimum element.

        if ( tree.length === 0 ) {
            return undefined; // Heap is empty.
        } else if ( tree.length === 1 ) {
            tree = []; // If only one element, clear the tree.
        } else {
            tree[0] = tree.pop(); // Move the last element to the root.
            bubble_down( 0 ); // Bubble down the new root.
        }

        return result;
    };

    /*
     * `changeKey` method: (CURRENTLY UNUSED AND UNIMPLEMENTED)
     * This method would update the key of an element at a given index
     * and then restore the heap property (either bubble up or bubble down).
     *
     * @param {number} index The index of the element whose key is to be changed.
     * @param {any}    newKey The new value for the element's key.
     * @throws {string} If the function is called, as it's not implemented.
     */
    this.changeKey = function ( index, newKey ) {
        throw "Error: 'changeKey' function not yet implemented!";
    };

    /*
     * `heapify` method:
     * Rebuilds the heap from an arbitrary array, or after an element's key
     * has been externally modified. It does this by calling `bubble_down`
     * from the last non-leaf node up to the root.
     */
    this.heapify = function () {
        var start;
        // Start from the last non-leaf node and go up to the root.
        for ( start = Math.floor( ( tree.length - 2 ) / 2 ); start >= 0; start-- ) {
            bubble_down( start ); // Apply bubble_down to each node.
        }
    };

    /*
     * Initial population of the heap during construction.
     * Inserts all elements from the input array.
     * (Note: This loop handles cases where elements might not have the 'key' property
     *  by wrapping them, which could be optimized for already-keyed objects.)
     */
    var i;
    for ( i in ( array || [] ) ) {
        this.insert( array[i] );
    }
}


/******************************************************************************
 *
 * Quick Sort Algorithm
 *
 * A highly efficient, comparison-based sorting algorithm.
 *
 *
 * Algorithm Steps:
 * 1.  **Pivot Selection**: Choose an element from the array, called the pivot (median).
 *     A common strategy is to pick a random element.
 * 2.  **Partitioning**: Rearrange the array elements into three sub-arrays:
 *     - Elements less than the pivot.
 *     - Elements equal to the pivot.
 *     - Elements greater than the pivot.
 * 3.  **Recursive Sorting**: Recursively apply Quick Sort to the sub-array
 *     of elements less than the pivot and the sub-array of elements greater
 *     than the pivot.
 * 4.  **Concatenation**: Combine the three sorted sub-arrays (less, equal, greater)
 *     to form the final sorted array.
 * 5.  **Base Case**: An array with zero or one element is considered already sorted.
 *
 *
 * TODO:
 * This implementation uses multiple array objects, which can be inefficient
 * due to memory allocation. A more efficient in-place implementation would
 * use pointers within a single array.
 *
 * @param {Array} arr The array of elements to be sorted.
 * @returns {Array} A new array containing the sorted elements.
 */
function quickSort ( arr ) {

    // Base case for recursion: an array with 0 or 1 element is already sorted.
    if ( arr.length <= 1 ) return arr;

    // Select a pivot element randomly to improve average-case performance.
    var median = arr[ Math.floor( Math.random() * arr.length ) ];

    var arr1 = [], // Stores elements less than the median.
        arr2 = [], // Stores elements equal to the median.
        arr3 = [], // Stores elements greater than the median.
        i;         // Loop counter.

    // Partition the array based on the chosen median.
    for ( i in arr ) {
        if ( arr[i] < median ) {
            arr1.push( arr[i] );
        }
        if ( arr[i] === median ) {
            arr2.push( arr[i] );
        }
        if ( arr[i] > median ) {
            arr3.push( arr[i] );
        }
    }

    // Recursively sort the 'less' and 'greater' sub-arrays, then concatenate
    // them with the 'equal' sub-array to produce the final sorted result.
    return quickSort( arr1 ).concat( arr2 ).concat( quickSort( arr3 ) );
}

/******************************************************************************
 *
 * Selection Sort Algorithm
 *
 * A simple, in-place comparison sorting algorithm.
 *
 *
 * Algorithm Steps:
 * 1.  **Find Minimum**: In the unsorted portion of the array, find the element
 *     with the smallest value.
 * 2.  **Remove and Sort Recursively**: Remove this minimum element from the
 *     unsorted portion. Recursively sort the remaining elements.
 * 3.  **Combine**: Return the found minimum element prepended to the
 *     recursively sorted rest of the array.
 * 4.  **Base Case**: An array containing only one element is considered sorted.
 *
 * @param {Array} arr The array of elements to be sorted.
 * @returns {Array} A new array containing the sorted elements.
 */
function selectionSort ( arr ) {

    // Base case for recursion: an array with a single element is already sorted.
    if ( arr.length === 1 ) return arr;

    var minimum = Infinity; // Initialize minimum to a very large value.
    var index;              // To store the index of the minimum element.

    // Iterate through the array to find the smallest element and its index.
    for ( var i in arr ) {
        if ( arr[i] < minimum ) {
            minimum = arr[i]; // Update the minimum value.
            index   = i;      // Store the index of this minimum.
        }
    }

    // Remove the identified minimum element from the array.
    arr.splice( index, 1 );

    // Assemble the result: the found minimum followed by the recursively sorted
    // remaining elements. (This could also be implemented iteratively.)
    return [ minimum ].concat( selectionSort( arr ) );
}

/******************************************************************************
 *
 * Merge Sort Algorithm
 *
 * A highly efficient, stable, comparison-based sorting algorithm.
 * It is a divide-and-conquer algorithm.
 *
 *
 * Algorithm Steps:
 * 1.  **Divide**: Split the unsorted list into two sub-lists of about half the size.
 * 2.  **Conquer**: Recursively sort each of the sub-lists.
 * 3.  **Combine**: Merge the two sorted sub-lists back into one sorted list.
 * 4.  **Base Case**: A list containing zero or one element is considered sorted.
 *
 * @param {Array} arr The array of elements to be sorted.
 * @returns {Array} A new array containing the sorted elements.
 */
function mergeSort ( arr ) {

    /*
     * `merge` helper function:
     * Merges two already sorted arrays into a single sorted array.
     *
     * @param {Array} a The first sorted array.
     * @param {Array} b The second sorted array.
     * @returns {Array} A new sorted array containing elements from both 'a' and 'b'.
     */
    function merge ( a, b ) {
        var c = []; // Resulting merged array.

        // Continue merging as long as there are elements in either array.
        while ( a.length > 0 || b.length > 0 ) {
            var n; // The next element to be added to 'c'.

            // Compare the first elements of 'a' and 'b' (if they exist)
            // and take the smaller one. If one array is empty, take from the other.
            if ( a.length > 0 && b.length > 0 ) {
                n = ( a[0] < b[0] ) ? a.shift() : b.shift();
            } else if ( b.length > 0 ) {
                n = b.shift();
            } else if ( a.length > 0 ) {
                n = a.shift();
            } else {
                n = null; // Both arrays are empty.
            }

            // Push the chosen element onto the result array, if it's not null.
            if ( n !== null ) {
                c.push( n );
            }
        }
        return c;
    }

    // Find the middle point to divide the array.
    var median = Math.floor( arr.length / 2 );

    // Create the two halves of the array.
    // Note: `arr.slice` is used to create new arrays.
    var part1 = arr.slice( 0, median );
    var part2 = arr.slice( median - arr.length ); // Correctly handles the second half.

    // Base case: if the array has 0 or 1 element, it's already sorted.
    // Otherwise, recursively sort the two halves and merge them.
    return arr.length <= 1 ? arr : merge(
        mergeSort( part1 ), // Recursively sort the first half.
        mergeSort( part2 )  // Recursively sort the second half.
    );
}

// Placeholder for Red-Black Tree implementation.
function RedBlackTree ( arr ) {
    // This function is currently empty.
}

// Placeholder for B-Tree implementation.
function BTree ( arr ) {
    // This function is currently empty.
}

// Placeholder for N-ary Tree implementation.
function NaryTree ( n, arr ) {
    // This function is currently empty.
}

/**
 * Knuth-Morris-Pratt (KMP) String Matching Algorithm
 *
 * This algorithm efficiently searches for occurrences of a "pattern" string
 * within a "text" string. It avoids re-examining characters in the text
 * that have already been matched, by pre-processing the pattern to create
 * a "prefix function" or "failure function".
 *
 * FIXME: This implementation is noted as not working correctly yet.
 *
 * @param {string} p The pattern string to search for.
 * @param {string} t The text string in which to search.
 */
function kmp ( p, t ) {

    /**
     * `prefix` (also known as `overlap` or `failure`) function for KMP.
     * This function computes the longest proper prefix of `p[1..q]` that is
     * also a suffix of `p[1..q]` for each `q`. This array helps determine
     * how many characters the algorithm can "skip" after a mismatch.
     *
     * @param {string} p The pattern string.
     * @returns {Array<number>} An array where `pi[q]` stores the length of the
     *                          longest proper prefix of `p[0..q]` that is also
     *                          a suffix of `p[0..q]`.
     */
    function prefix ( p ) {
        /*
         * `pi` array will store the computed skip marks (lengths of longest
         * proper prefixes that are also suffixes).
         */
        var pi = [ 0 ], // `pi[0]` is always 0.
            k  = 0;     // `k` is the length of the current longest prefix suffix.

        // Iterate through the pattern string, starting from the second character.
        for ( q = 1; q < p.length; q++ ) {
            // ... (rest of prefix function implementation)
        }
    }
}