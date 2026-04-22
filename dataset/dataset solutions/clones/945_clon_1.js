/*
 * This file contains the main logic for reading graph input
 * and performing a Breadth-First Search (BFS) to find shortest
 * distances from a source node.
 */

( function main ()
{
    // Read input from standard input.
    // The input consists of multiple lines, each representing a part of the graph.
    const lines = require('fs').readFileSync( '/dev/stdin' , 'utf8' ) .trim() .split( '\n' ) ;

    // The very first line of the input specifies the total number of nodes (vertices) in the graph.
    const n = Number( lines .shift() ) ;

    // Initialize adjacency lists for the graph structure.
    // Each element at index 'i' in 'adjLists' will be an array containing the neighbors of node 'i'.
    const adjLists = Array .from( Array( n ) , ( ) => [ ] ) ;

    // This array will store the shortest distances from the source node (node 0) to all other nodes.
    // d[i] will ultimately hold the distance to node 'i'.
    const d = [ ] ;

    // Process the remaining input lines to populate the adjacency lists.
    // Each line describes a node and its outgoing edges.
    lines .forEach( ( l , i ) =>
    {
        l .split( ' ' )           // Split the line by spaces to get individual elements.
         .splice( 2 )             // Remove the first two elements (node ID and degree, which are not needed here).
         .forEach( e => adjLists[ i ] .push( e - 1 ) ) ; // Convert neighbor IDs to 0-indexed and add to adjList.
    } ) ;

    // Execute the Breadth-First Search algorithm.
    // It takes the graph's adjacency lists and the distance array as arguments.
    bfs( adjLists , d ) ;

    // After BFS, iterate through all nodes and print their 1-indexed ID along with their calculated shortest distance.
    for ( let i = 0 ; i < n ; i ++ )
    {
        console .log( i + 1 , d[ i ] ) ;
    }
} ) ( ) ; // The Immediately Invoked Function Expression (IIFE) pattern completes here.


/**
 * Performs a Breadth-First Search (BFS) traversal on a graph.
 * This function calculates the shortest path from the source node (node 0)
 * to all other reachable nodes in an unweighted graph.
 *
 * @param {Array<Array<number>>} adjLists - The adjacency list representation of the graph.
 *                                          adjLists[i] contains an array of neighbors of node i.
 * @param {Array<number>} d - An array to store the shortest distances from the source node (node 0).
 *                            It will be populated by this function.
 */
function bfs ( adjLists , d )
{
    // Define constants for node states during BFS.
    const WHITE = 0 , // Node has not yet been discovered.
          GRAY = 1 ,  // Node has been discovered and is in the queue, awaiting processing.
          BLACK = 2 ; // Node has been completely processed (all its neighbors explored).

    // Initialize the 'color' (state) of all nodes to WHITE, indicating they are undiscovered.
    const color = Array .from( adjLists , ( ) => WHITE ) ;

    // The distance from the source node (node 0) to itself is 0.
    d[ 0 ] = 0 ;

    // Initialize the distances for all other nodes to -1, signifying they are currently unreachable.
    for ( let i = 1 ; i < adjLists .length ; i ++ )
    {
        d[ i ] = -1 ;
    }

    // Initialize the queue for BFS. The search begins from node 0.
    queue = [ 0 ] ;

    // 'u' will temporarily hold the node currently being dequeued and processed.
    let u ;

    // Continue the BFS process as long as there are nodes in the queue to visit.
    while ( ( u = queue .shift() ) !== undefined )
    {
        // For each neighbor 'v' of the current node 'u'...
        adjLists[ u ] .forEach( v =>
        {
            // If the neighbor 'v' has not yet been discovered (is WHITE)...
            if ( color[ v ] === WHITE )
            {
                color[ v ] = GRAY ;       // Mark 'v' as discovered and add it to the queue.
                d[ v ] = d[ u ] + 1 ;     // Its distance is one more than the distance to 'u'.
                queue .push( v ) ;        // Enqueue 'v' for future processing.
            }
        } ) ;
        color[ u ] = BLACK ; // Mark 'u' as completely processed after all its neighbors have been handled.
    }
}