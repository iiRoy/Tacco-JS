// This script implements a variation of Prim's algorithm for finding the minimum spanning tree (MST)
// or rather, the sum of minimum edge weights from a source (node 0) to all other nodes in a graph.
// It uses an adjacency matrix representation for the graph.

const   [ WHITE , BLACK ]   =   [ 0 , 1 ]   ; // Define constants for node colors: WHITE (unvisited), BLACK (visited/included in MST).

// Immediately invoked function expression (IIFE) to encapsulate the main logic.
( function   main ( )   {

    // Read input from standard input, decode as UTF-8, remove leading/trailing whitespace, and split into lines.
    const   lines   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( '\n' ) ;

    // The first line contains the number of nodes (n). Parse it as an integer.
    const   n   =   Number ( lines . shift ( ) ) ;

    // Process the remaining lines to build the adjacency matrix.
    // Each line represents a row in the matrix.
    // - trim() removes whitespace.
    // - split(' ') separates values by space.
    // - map(n => n == -1 && Infinity || Number(n)) converts string numbers to actual numbers.
    //   - Special handling: -1 is converted to Infinity, indicating no direct edge.
    const   adj   =   lines . map ( ( e ,   i )   =>   e . trim ( ) . split ( ' ' ) . map ( n   =>   n   ==   -1   &&   Infinity   ||   Number ( n ) ) ) ;

    // Create an array representing the range of node indices from 0 to n-1.
    const   range_n   =   Array . from ( Array ( n ) ,   ( e ,   i )   =>   i ) ;


    // Initialize 'dist' array to store the minimum edge weight to connect each node to the MST.
    // Initialize 'color' array to track the state of each node (WHITE: not in MST, BLACK: in MST).
    const   dist   =   [ ] ;
    const   color   =   [ ] ;

    // Loop through all nodes to set initial distances and colors.
    for   ( let   i   =   0 ;   i   <   n ;   i ++ )   {
        dist [ i ]   =   Infinity ; // Initially, all nodes are infinitely far from the MST.
        color [ i ]   =   WHITE ;    // All nodes are initially unvisited.
    }

    // Set the distance of the starting node (node 0) to 0, as it's the root of the MST.
    dist [ 0 ]   =   0 ;


    // Declare variables for the main loop:
    // - mincost: Stores the minimum edge weight found in the current iteration.
    // - u: Stores the index of the node with 'mincost'.
    // - sum: Accumulates the total weight of the MST.
    let   mincost ,   u ,   sum   =   0 ;


    // Main loop: Continues until all reachable nodes are included in the MST.
    while   ( true )   {

        // Find the node 'u' that is not yet in the MST (color[i] !== BLACK)
        // and has the minimum 'dist' value among such nodes.
        mincost   =   range_n . reduce ( ( min ,   i )   =>   {
            // If the node is already in the MST or its current distance is not better than 'min', skip it.
            if   ( color [ i ]   ===   BLACK   ||   dist [ i ]   >=   min )   return   min ;
            // Otherwise, this node 'i' has a smaller 'dist', so update 'min' and store 'i' in 'u'.
            return   dist [ u   =   i ] ;
        } ,   Infinity ) ; // Start with Infinity as the initial minimum.


        // If no more reachable nodes can be added (mincost remains Infinity), break the loop.
        if   ( mincost   ===   Infinity )   break ;


        // Add the minimum cost edge to the total sum of the MST.
        sum   +=   mincost ;
        // Mark the selected node 'u' as BLACK, indicating it's now part of the MST.
        color [ u ]   =   BLACK ;


        // Iterate through all neighbors 'i' of the newly added node 'u'.
        // 'v' here represents the weight of the edge from 'u' to 'i'.
        adj [ u ] . forEach ( ( v ,   i )   =>   {
            // If the neighbor 'i' is not yet in the MST (color[i] !== BLACK)
            // and the edge from 'u' to 'i' provides a shorter path to 'i' than its current 'dist',
            // then update 'dist[i]' with this new shorter path.
            if   ( color [ i ]   !==   BLACK   &&   dist [ i ]   >   v )   dist [ i ]   =   v ;
        } ) ;

    } // End of while loop.


    // Output the total sum of edge weights in the MST.
    console . log ( sum ) ;

} ) ( ) ; // Invoke the main function.