"use strict" ;

// This is a self-executing anonymous function that takes 'input' as an argument.
// It processes input data to solve a graph-related problem.
( function ( input ) {

    // Process the raw input string:
    // 1. Remove leading/trailing whitespace.
    // 2. Split into an array of strings using one or more whitespace characters as delimiters.
    // 3. Convert each string element to a number (by subtracting 0).
    input = input . trim ( ) . split ( /\s+/ ) . map ( x => x - 0 ) ;

    // Declare constant variables from the processed input.
    // N: Number of nodes in the graph.
    // K: A constant used in calculations.
    // P: A large prime number for modulo operations, preventing integer overflow.
    const N = input . shift ( ) ,
          K = input . shift ( ) ,
          P = 1e9 + 7 ; /* A common prime modulus (1,000,000,007) */

    /**
     * @class Node
     * @description Represents a node in the graph structure.
     * Each node has a list of children (connected nodes) and a height property.
     */
    function Node ( ) {
        /* Assign 'this' to 't' for consistent access within the constructor. */
        let t = this ;
        // Initialize an empty array to store references to child nodes.
        t . children = [ ] ;
        // Initialize the height of the node, typically used in tree/graph traversals.
        t . height = 0 ;
    }

    /*
     * Create an array of N+1 Node objects.
     * The array is initialized with N+1 zeros, then mapped to new Node instances.
     * This allows for 1-based indexing if desired, or simply provides N+1 nodes.
     */
    const nodes = new Array ( N + 1 ) . fill ( 0 ) . map ( z => new Node ( ) ) ;

    /*
     * Establish initial connections for nodes 0 and 1.
     * This might be a special handling for the root or a specific edge case.
     */
    nodes [ 0 ] . children . push ( nodes [ 1 ] ) ; // Node 0 connects to Node 1.
    nodes [ 1 ] . children . push ( nodes [ 0 ] ) ; // Node 1 connects to Node 0 (undirected edge).

    // Read remaining input to build the graph's adjacency list.
    // The input contains pairs of (u, v) representing edges.
    while ( input . length ) {
        /* Extract node indices from the end of the input array. */
        let u = input . pop ( ) ,
            v = input . pop ( ) ;

        // Add bidirectional connections between nodes u and v.
        nodes [ u ] . children . push ( nodes [ v ] ) ; // Add v to u's children.
        nodes [ v ] . children . push ( nodes [ u ] ) ; // Add u to v's children.
    }

    // Initialize a stack for the first graph traversal (e.g., BFS or DFS to set heights).
    // Start traversal from node 0.
    const stack = [ nodes [ 0 ] ] ;

    // Perform a graph traversal to determine the height of each node.
    // This effectively builds a tree structure (or a spanning tree) from the graph.
    while ( stack . length ) {
        // Get the top element from the stack without removing it initially.
        let t = stack [ stack . length - 1 ] ;
        stack . pop ( ) ; // Remove the current node from the stack.

        /* Iterate over each child of the current node 't'. */
        t . children . forEach ( function ( c ) {
            let cc = c . children ; // Get children array of child 'c'.
            c . height = t . height + 1 ; // Set child's height relative to parent.

            // Remove the parent 't' from the child 'c''s children list.
            // This effectively "directs" the edges away from the root (node 0)
            // and prunes the back-edge to the parent.
            cc . splice ( cc . indexOf ( t ) , 1 ) ;
            stack . push ( c ) ; // Add the child to the stack for further processing.
        } ) ;
    }

    // Initialize the answer variable, which will accumulate results.
    let ans = 1 ;

    // Reset the stack for the second traversal, starting again from node 0.
    stack . push ( nodes [ 0 ] ) ;

    // Perform a second traversal to calculate the final answer based on node heights and K.
    while ( stack . length ) {
        // Retrieve the current node from the stack.
        let t = stack [ stack . length - 1 ] ;
        stack . pop ( ) ; // Remove it from the stack.

        // Conditional logic based on the node's height.
        if ( t . height < 2 ) {
            // If height is 0 or 1.
            for ( let i = 0 , I = t . children . length ; i < I ; i ++ ) {
                ans = ( ans * ( K - t . height - i ) ) % P ;
            }
        } else {
            // If height is 2 or more.
            for ( let i = 0 , I = t . children . length ; i < I ; i ++ ) {
                ans = ( ans * ( K - 2 - i ) ) % P ;
            }
        }

        // Add all children of the current node to the stack for continued traversal.
        t . children . forEach ( function ( c ) {
            stack . push ( c ) ;
        } ) ;
    }

    // Output the final calculated answer to the console.
    console . log ( ans ) ;

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// The entire script is executed with input read from standard input.