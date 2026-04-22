/*
 * This JavaScript code processes graph data from standard input.
 * It identifies connected components within the graph using a Breadth-First Search (BFS)
 * approach (implemented as `dfs` function, but uses a stack/queue for BFS-like traversal).
 * Finally, it answers queries about whether two nodes belong to the same connected component.
 */

// Immediately-invoked function expression (IIFE) to encapsulate the code.
( function ( stdin ) {

    // --- Input Parsing Section ---

    // Read all lines from the standard input, trim any leading/trailing whitespace,
    // and split them into an array of strings based on newline characters.
    var lines = stdin.trim().split( '\n' ) ;

    // The first line contains N (number of nodes) and M (number of edges).
    // Shift it, split by space, and convert parts to numbers.
    var numbers = lines . shift ( ) . split ( ' ' ) . map ( Number ) ;

    // Extract N and M values.
    var n = numbers . shift ( ) ; // N: total number of nodes in the graph.
    var m = numbers . shift ( ) ; // M: total number of edges in the graph.

    // --- Graph Initialization Section ---

    // Initialize an adjacency list to represent the graph.
    // Each element `nodes[i]` will be an array of neighbors for node `i`.
    var nodes = [ ] ;

    // Initialize an array to store the component ID for each node.
    // `color[i]` will hold the ID of the connected component node `i` belongs to.
    // Initially, all nodes are uncolored (null).
    var color = [ ] ;

    // Populate the `nodes` and `color` arrays for `n` nodes.
    for ( var i = 0 ; i < n ; i ++ ) {
        nodes.push ( [ ] ) ; // Add an empty array for neighbors of node `i`.
        color.push ( null ) ; // Mark node `i` as unvisited/uncolored.
    }

    // --- Edge Parsing and Graph Construction Section ---

    // Process `m` lines, each representing an edge in the graph.
    for ( var i = 0 ; i < m ; i ++ ) {
        // Read an edge line, split by space, and convert node identifiers to numbers.
        var node = lines.shift ( ) . split ( ' ' ) . map ( Number ) ;

        // Add the edge to the adjacency list.
        // Since the graph is undirected, add connections in both directions.
        nodes [ node [ 0 ] ] . push ( node [ 1 ] ) ; // Add node[1] as a neighbor of node[0].
        nodes [ node [ 1 ] ] . push ( node [ 0 ] ) ; // Add node[0] as a neighbor of node[1].
    }

    // --- Depth-First Search (DFS) / Breadth-First Search (BFS) for Connected Components ---

    /**
     * Performs a graph traversal (BFS-like using a stack, but named dfs)
     * to find all nodes in a connected component starting from a given node.
     * It assigns a unique `id` to all nodes in this component.
     *
     * @param {number} startNode - The starting node for the traversal.
     * @param {number} componentId - The unique identifier for the connected component.
     */
    function dfs ( startNode , componentId ) {
        // Use a stack (or queue, as `shift()` is used for dequeue) for traversal.
        var stack = [ ] ;

        // Mark the starting node with the current component ID.
        color [ startNode ] = componentId ;

        // Add the starting node to the stack to begin traversal.
        stack . push ( startNode ) ;

        // Continue traversal as long as there are nodes in the stack.
        while ( stack . length > 0 ) {
            // Dequeue the next node to visit (FIFO behavior if `shift` is used as queue).
            var next = stack . shift ( ) ;

            // Iterate over all neighbors of the current node.
            for ( var i = 0 ; i < nodes [ next ] . length ; i ++ ) {
                // Check if the neighbor has not been visited/colored yet.
                if ( ! color [ nodes [ next ] [ i ] ] ) {
                    // If uncolored, assign it the current component ID.
                    color [ nodes [ next ] [ i ] ] = componentId ;
                    // Add the neighbor to the stack for further exploration.
                    stack . push ( nodes [ next ] [ i ] ) ;
                }
            }
        }
    }

    // --- Main Logic: Finding All Connected Components ---

    // Initialize a counter for component IDs. Component IDs start from 1.
    var id = 1 ;

    // Iterate through all nodes in the graph.
    for ( var i = 0 ; i < n ; i ++ ) {
        // If a node has not been assigned to a component yet,
        // it means it's the start of a new connected component.
        if ( ! color [ i ] ) {
            // Perform traversal from this node to find all nodes in its component,
            // assigning them the current `id`, and then increment `id` for the next component.
            dfs ( i , id ++ ) ;
        }
    }

    // --- Query Processing Section ---

    // The next line contains the number of queries (q).
    var q = parseInt ( lines . shift ( ) , 10 ) ;

    // Process each remaining line as a query.
    // Each query asks if two nodes are in the same connected component.
    lines . forEach ( function ( relation ) {
        // Parse the two nodes involved in the query.
        var edge = relation . split ( ' ' ) . map ( Number ) ;

        // Check if both nodes belong to the same connected component
        // by comparing their assigned `color` IDs.
        if ( color [ edge [ 0 ] ] == color [ edge [ 1 ] ] ) {
            // If component IDs are the same, they are connected.
            console . log ( 'yes' ) ;
        } else {
            // Otherwise, they are not connected.
            console . log ( 'no' ) ;
        }
    } ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // Pass standard input content to the IIFE.