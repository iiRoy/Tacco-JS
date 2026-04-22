/*
 * This configuration object holds essential settings
 * for input/output operations, specifically defining
 * the source of input data and the newline character.
 */
// config = { input: 'tmp', newline: '\r\n' };                             // Commented out: Configuration for Windows environments.

config = { input: '/dev/stdin' , newline: '\n' }; /* Configuration for Linux/Unix environments. */


/**
 * Reads input from the specified source, processes it,
 * and stores it in the 'line' variable.
 * The input is read as ASCII, trimmed of leading/trailing whitespace,
 * and then split into an array of strings based on the configured newline character.
 */
line = require( 'fs' ) . readFileSync( config . input ,  'ascii' )
  . trim ( )
  . split ( config . newline ) ;


// The first element of the 'line' array is shifted off and converted to a number,
// representing 'n', typically the number of nodes or vertices in a graph.
n = Number ( line . shift ( ) ) ;


// 'adj' is initialized as an empty object, which will serve as an adjacency list
// or matrix representation of a graph.
adj = { } ;



/**
 * Adds an edge (u, v) with a weight (c) to the adjacency list 'obj'.
 *
 * @param {object} obj - The adjacency list object.
 * @param {number} u   - The source node.
 * @param {number} v   - The destination node.
 * @param {number} c   - The cost/weight of the edge.
 */
function add ( obj , u , v , c )
{
    // If the source node 'u' does not yet exist in the adjacency list,
    // initialize it as an empty object.
    if ( ! obj . hasOwnProperty ( u ) )
    {
        obj [ u ] = { } ;
    }

    // Assign the cost 'c' to the edge from 'u' to 'v'.
    obj [ u ] [ v ] = c ;
}


/*
 * Iterates through each remaining line of input to populate the adjacency list.
 * Each line represents a node and its outgoing edges.
 */
for ( i in line )
{
    // Split the current line by spaces and convert each part to a number.
    ary = line [ i ] . split ( ' ' ) . map ( Number ) ;

    // The first element of the parsed array is the source node 'u'.
    u = ary [ 0 ] ;

    /*
     * Loop through the rest of the array, starting from the third element (index 2),
     * incrementing by 2 to get pairs of (destination node, edge weight).
     */
    for ( j = 2 ; j < ary . length ; j += 2 )
    {
        // Add the edge to the adjacency list.
        add ( adj , u , ary [ j ] , ary [ j + 1 ] ) ;
    }
}


/*
 * 'd' array: Stores the shortest distance from the source node to each other node.
 *            Initialized to 'n' elements.
 */
d = new Array ( n ) ;

/*
 * 'pi' array: Stores the predecessor of each node in the shortest path.
 *             Initialized to 'n' elements.
 */
pi = new Array ( n ) ;


/**
 * Initializes the shortest path distances and predecessors for all nodes
 * with respect to a given source node 's'.
 * All distances are set to infinity, and predecessors to null,
 * except for the source node 's' itself, which has a distance of 0.
 *
 * @param {number} s - The source node for which to initialize.
 */
function initializeSingleSource ( s )
{
    var i ; // Loop counter declaration.

    // Iterate through all nodes from 0 to n-1.
    for ( i = 0 ; i < n ; i ++ )
    {
        // Set the distance to each node to positive infinity initially.
        d [ i ] = Number . POSITIVE_INFINITY ;

        // Set the predecessor of each node to null initially.
        pi [ i ] = null ;
    }

    // The distance from the source node to itself is 0.
    d [ s ] = 0 ;
}


/**
 * Attempts to relax an edge (u, v) with weight w.
 * If a shorter path to 'v' is found through 'u',
 * update 'd[v]' and 'pi[v]'.
 *
 * @param {number} u - The source node of the edge.
 * @param {number} v - The destination node of the edge.
 * @param {number} w - The weight of the edge (u, v).
 */
function relax ( u , v , w )
{
    // Check if the current path to 'v' (d[v]) is longer than
    // the path to 'u' (d[u]) plus the edge weight 'w'.
    if ( d [ v ] > d [ u ] + w )
    {
        // If a shorter path is found, update the distance to 'v'.
        d [ v ] = d [ u ] + w ;

        // Set 'u' as the predecessor of 'v' in this shorter path.
        pi [ v ] = u ;
    }
}


/**
 * Implements the Bellman-Ford algorithm to find the shortest paths
 * from a single source node 's' to all other nodes in a graph represented by 'adj'.
 * It can also detect negative cycles reachable from the source.
 *
 * @param {object} adj - The adjacency list representation of the graph.
 * @param {number} s   - The source node.
 * @returns {boolean}  - True if no negative cycles are detected, false otherwise.
 */
function bellmanFord ( adj , s )
{
    // Step 1: Initialize distances and predecessors for all nodes from the source 's'.
    initializeSingleSource ( s ) ;

    // Step 2: Relax all edges |V| - 1 times.
    // This ensures that all shortest paths (if no negative cycles) are found.
    for ( i = 1 ; i < n ; i ++ )
    {
        // Iterate through each source node 'u' in the adjacency list.
        for ( u in adj )
        {
            // Iterate through each destination node 'v' connected to 'u'.
            for ( v in adj [ u ] )
            {
                // Relax the edge (u, v) with its corresponding weight.
                relax ( u , v , adj [ u ] [ v ] ) ;
            }
        }
    }

    // Step 3: Check for negative-weight cycles.
    // If we can still relax an edge, it means a negative cycle exists.
    for ( u in adj )
    {
        // Iterate through each destination node 'v' connected to 'v'
        // (Note: This loop condition `adj[v]` seems unusual and might be a bug
        // in the original code, as it typically should iterate over `adj[u]`
        // to check outgoing edges from `u`. However, as per Type I cloning rules,
        // it must be preserved exactly as written in the original code).
        for ( v in adj [ v ] )
        {
            // If a shorter path to 'v' is found, a negative cycle is present.
            if ( d [ v ] > d [ u ] + adj [ u ] [ v ] )
            {
                // Return false, indicating the presence of a negative cycle.
                return false ;
            }
        }
    }

    // If no negative cycles are detected, return true.
    return true ;
}


// Execute the Bellman-Ford algorithm starting from node 0.
bellmanFord ( adj , 0 ) ;


/*
 * Iterate through the computed distances 'd' and print
 * each node's index and its shortest distance from the source.
 */
for ( i in d )
{
    // Output the node index and its shortest distance.
    console . log ( "%s %d" , i , d [ i ] ) ;
}