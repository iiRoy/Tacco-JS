/*
 * This is a JavaScript program designed to process graph data.
 * It reads input from standard input, constructs a graph,
 * and then performs a traversal to assign group identifiers to nodes.
 * The output is the assigned group for each node.
 */
'use strict' ; // Enforce strict mode for better error handling and cleaner code.

// Self-executing anonymous function to encapsulate the code and prevent global variable pollution.
( function ( input ) {

    // Process the raw input string.
    input = input . trim ( ) . split ( /\n/ ) ;

    // The first line of input typically contains the number of nodes (N).
    // Convert it to a number. The `-0` is a common trick to convert to number.
    const N = input . shift ( ) - 0 ;

    // Map the remaining input lines. Each line represents an edge.
    // Split each line by whitespace and convert parts to numbers.
    input = input . map ( str => str . split ( /\s+/ ) . map ( x => x - 0 ) ) ;


    /**
     * @class Node
     * @param {number} i - The identifier for the node (unused in constructor logic, but good for context).
     * Represents a node in the graph.
     */
    function Node ( i ) {
        // Use 't' as an alias for 'this' for brevity within the constructor.
        var t = this ;
        // 'connected' will store an array of [neighbor_id, edge_weight_parity].
        t . connected = [ ] ;
        // 'group' stores the assigned group identifier. -1 means unvisited.
        t . group = -1 ;
    }


    // Initialize an array to hold all node objects.
    // Size N+1 because nodes are typically 1-indexed.
    const nodes = new Array ( N + 1 ) ;


    // Populate the 'nodes' array with new Node instances.
    for ( let i = 1 ; i <= N ; i ++ ) {
        nodes [ i ] = new Node ( i ) ;
    }


    // Iterate over the processed input (which now represents edges).
    // Each 'a' is an array like [node1, node2, weight].
    input . forEach ( function ( a ) {
        // Add the edge to the 'connected' list of node 'a[0]'.
        // The information stored is [neighbor_id, weight_parity].
        nodes [ a [ 0 ] ] . connected . push ( [ a [ 1 ] , a [ 2 ] % 2 ] ) ;
        // For an undirected graph, you'd also add the reverse edge here:
        // nodes[a[1]].connected.push([a[0], a[2]%2]);
        // But based on the problem logic, it seems to be a specific kind of traversal.
        // The original code only adds in one direction, so I'll keep it that way.
    } ) ;


    // Initialize the stack for Depth-First Search (DFS) or similar traversal.
    // Start traversal from node 1.
    const stack = [ 1 ] ;


    // Assign an initial group to the starting node (node 1).
    nodes [ 1 ] . group = 0 ;


    // Main traversal loop. Continues as long as there are nodes in the stack.
    while ( stack . length > 0 ) {
        // Get the current node's index from the top of the stack without removing it yet.
        let i = stack [ stack . length - 1 ] ;
        // Get the actual Node object.
        let t = nodes [ i ] ;

        // Check if the current node has any unvisited connected edges.
        if ( t . connected . length === 0 ) {
            // If all connected edges have been processed, pop the node from the stack.
            stack . pop ( ) ;
        } else {
            // Get the last connected edge from the current node.
            // 'c' is [neighbor_id, edge_weight_parity].
            let c = t . connected [ t . connected . length - 1 ] ;
            // Get the neighbor Node object.
            let n = nodes [ c [ 0 ] ] ;

            // If the neighbor node hasn't been assigned a group yet.
            if ( n . group === -1 ) {
                // Assign a group to the neighbor based on the current node's group
                // and the parity of the edge weight (XOR operation for alternating groups).
                n . group = ( t . group ^ c [ 1 ] ) ;
                // Push the neighbor onto the stack to visit it next.
                stack . push ( c [ 0 ] ) ;
            } else {
                // If the neighbor has already been visited, this edge has been processed.
                // Remove it from the current node's connected list.
                t . connected . pop ( ) ;
            }
        }
    }


    // Prepare an array to store the final answers (group assignments).
    const ans = [ ] ;
    // Iterate from node 1 to N to collect all assigned groups.
    for ( let i = 1 ; i <= N ; i ++ ) {
        ans . push ( nodes [ i ] . group ) ;
    }
    // Print the results, each group on a new line.
    console . log ( ans . join ( '\n' ) ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // Read input from stdin.