/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct but functionally equivalent version.
 */
(function main()
{
    // Initialize required modules and read input data from stdin
    const lines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;

    // The first line contains the number of nodes (n)
    const n = Number ( lines . shift ( ) ) ; /* Number of vertices in the graph */

    // Create an array of arrays to represent adjacency lists for each node
    const adjLists = Array . from ( Array ( n ) , ( ) => [ ] ) ;

    /*
     * Populate the adjacency lists based on the input lines.
     * Each subsequent line (after the first) describes a node and its neighbors.
     * The format of each line is: 'u k v1 v2 ... vk'
     * We need to skip 'u' (index 0) and 'k' (index 1) and convert 'v_i' to 0-indexed.
     */
    lines . forEach ( ( l , i ) =>
    {
        // Split the line by spaces, then remove the first two elements
        l . split ( ' ' ) . splice ( 2 ) . forEach ( e =>
        {
            // Add the adjacent node (converted to 0-indexed) to the current node's list
            adjLists [ i ] . push ( e - 1 ) ;
        } ) ;
    } ) ;

    // Initialize arrays to store discovery times (d) and finish times (f) for DFS
    const d = [ ] , f = [ ] ;

    // Execute the Depth First Search algorithm
    dfs ( adjLists , d , f ) ;

    // Prepare an empty string to build the final output
    let str = '' ; // Output string buffer

    // Loop through each node to format its ID, discovery time, and finish time
    for ( let i = 0 ; i < n ; i ++ )
    {
        // Append the formatted string for the current node, followed by a newline
        str += `${ i + 1 } ${ d [ i ] } ${ f [ i ] }\n` ;
    }

    // Write the accumulated string to standard output
    process . stdout . write ( str ) ;
} ) ( ) ; /* End of the Immediately Invoked Function Expression (IIFE) for main */


/**
 * Performs a Depth First Search (DFS) on the given graph to compute discovery and finish times.
 *
 * @param {Array<Array<number>>} adjLists - The adjacency lists representing the graph.
 * @param {Array<number>} d - Array to store discovery times for each node.
 * @param {Array<number>} f - Array to store finish times for each node.
 */
function dfs ( adjLists , d , f )
{
    // Define constants for node colors (states) during DFS
    const WHITE = 0 ; // Node is unvisited
    const GRAY = 1 ;  // Node is currently being visited (in recursion stack)
    const BLACK = 2 ; // Node has been fully visited

    const size = adjLists . length ; // Get the total number of nodes in the graph

    // Initialize all nodes with the WHITE color (unvisited state)
    const color = Array . from ( adjLists , ( ) => WHITE ) ;

    let time = 0 ; // Global time counter, incremented for discovery and finish events

    // Recursive helper function to visit a node and its descendants
    function visit ( u )
    {
        color [ u ] = GRAY ; // Mark the current node 'u' as GRAY (discovered)
        d [ u ] = ++ time ;  // Assign discovery time to 'u' and increment the global time

        // Iterate over all neighbors 'v' of the current node 'u'
        adjLists [ u ] . forEach ( v =>
        {
            // If a neighbor 'v' is WHITE, it means it hasn't been visited yet
            if ( color [ v ] === WHITE )
            {
                visit ( v ) ; // Recursively call visit for the unvisited neighbor
            }
        } ) ;

        color [ u ] = BLACK ; // Mark the current node 'u' as BLACK (finished visiting)
        f [ u ] = ++ time ;   // Assign finish time to 'u' and increment the global time
    }

    // Iterate through all nodes to ensure that all connected components are traversed
    adjLists . forEach ( ( e , u ) =>
    {
        // If a node 'u' is WHITE, it means it's the root of an unvisited component
        if ( color [ u ] === WHITE )
        {
            visit ( u ) ; // Start DFS from this unvisited node
        }
    } ) ;
}