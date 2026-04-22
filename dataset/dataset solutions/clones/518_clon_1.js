var fs = require('fs') , /* File system module */
    length = fs .fstatSync(process.stdin.fd).size , // Get the size of the standard input
    buffer = new Buffer(length) , /* Create a new buffer to hold input data */
    bytesRead = fs .readSync( process.stdin.fd , buffer , 0 , length , 0 ) ,
    input = buffer .toString('utf8', 0, bytesRead) .split('\n') ; // Read input, convert to string, and split by newlines

// Declare global variables
var max ,
    n ;
var i ;

/**
 * Creates a 2D matrix (array of arrays) with specified dimensions and initial value.
 * @param {number} n - Number of rows.
 * @param {number} m - Number of columns.
 * @param {*} init - Initial value for each element in the matrix.
 * @returns {Array<Array<*>>} - The initialized matrix.
 */
function matrix ( n , m , init ) {

    var arr = [] , // Initialize the main array
        i ,
        j ;

    // Loop through rows
    for ( i = 0 ; i < n ; i ++ ) {

        arr[i] = [] ; // Initialize each row as an empty array

        // Loop through columns
        for ( j = 0 ; j < m ; j ++ ) {

            arr[i][j] = init ; // Set the initial value for each element
        }
    }

    return arr ; // Return the created matrix
}


/**
 * Implements Dijkstra's algorithm to find the shortest paths from a source node
 * to all other nodes in a graph.
 * @param {Array<Array<number>>} g - The adjacency matrix representing the graph.
 * @param {number} s - The starting (source) node.
 * @returns {Array<number>} - An array where d[i] is the shortest distance from s to i.
 */
function dijkstra ( g , s ) {

    var d = [] , // Array to store shortest distances from source 's'
        use = [] , // Array to track visited nodes
        i ,
        n = g .length , // Number of nodes in the graph
        v ,
        u ;

    // Initialize distances and visited status for all nodes
    for ( u = 0 ; u < n ; u ++ ) {

        d[u] = Infinity ; // Set all distances to infinity initially
        use[u] = false ; // Mark all nodes as unvisited
    }

    d[s] = 0 ; // Distance from source to itself is 0

    // Main Dijkstra loop
    while ( true ) {

        v = -1 ; // Node with the smallest distance among unvisited nodes

        // Find the unvisited node with the smallest distance
        for ( u = 0 ; u < n ; u ++ ) {

            if ( ! use[u] && ( v === -1 || d[v] > d[u] ) ) {

                v = u ; // Update 'v' if a smaller distance is found
            }
        }

        // If no unvisited node can be reached, break the loop
        if ( v === -1 ) {
            break ;
        }

        use[v] = true ; // Mark 'v' as visited

        // Update distances to neighbors of 'v'
        for ( u = 0 ; u < n ; u ++ ) {

            // Relaxation step: d[u] = min(d[u], d[v] + g[v][u])
            d[u] = d[u] < d[v] + g[v][u] ? d[u] : d[v] + g[v][u] ;
        }
    }

    return d ; // Return the array of shortest distances
}


/**
 * Solves a specific problem involving reachability in a modified graph.
 * @param {number} max - A maximum value used in calculations.
 * @param {number} n - The number of intermediate nodes.
 * @param {Array<number>} d - An array of values associated with nodes.
 * @returns {boolean} - True if a certain condition is met, false otherwise.
 */
function solve ( max , n , d ) {

    // Create an adjacency matrix for the graph, initialized with Infinity
    var g = matrix( n + 2 , n + 2 , Infinity ) ;
    var i ,
        j ;
    var pos ;

    // Build the graph connections
    for ( i = 0 ; i <= n ; i ++ ) {

        for ( var j = max ; j -- ; ) { // Loop 'max' times backwards

            // Calculate 'pos' based on current 'i', 'j', and 'd' values
            pos = i + j + ( i + j < n + 1 ? d[i + j] : 0 ) ;

            // Clamp 'pos' within the valid range [0, n+1]
            pos = Math .min( Math .max( pos , 0 ) , n + 1 ) ;

            // If 'pos' is different from 'i', add an edge
            if ( pos !== i ) {
                g[i][pos] = 1 ; // Assign a weight of 1 to the edge
            }
        }
    }

    // Calculate reachability from node 0
    var reachable = dijkstra( g , 0 ) ;

    // If node n+1 is unreachable from node 0, return false
    if ( reachable[n + 1] === Infinity ) {
        return false ;
    }

    var d ; // This 'd' shadows the parameter 'd' but is only used locally below

    // Check reachability from intermediate nodes
    for ( i = 1 ; i <= n ; i ++ ) {

        if ( reachable[i] < Infinity ) { // If node 'i' is reachable from node 0

            d = dijkstra( g , i ) ; // Calculate shortest paths from node 'i'

            // If node n+1 is unreachable from node 'i', return false
            if ( d[n + 1] === Infinity ) {
                return false ;
            }
        }
    }

    return true ; // If all conditions are met, return true
}

// Main execution loop: Process input until max is 0
while ( ( max = input .shift() - 0 ) !== 0 ) {

    var d = [] ; // Array to store input values for this iteration
    n = input .shift() - 0 ; // Read 'n' for this iteration

    d[0] = 0 ; // Initialize d[0]
    d[n + 1] = 0 ; // Initialize d[n+1]

    // Read 'n' more values into the 'd' array
    for ( i = 1 ; i <= n ; i ++ ) {
        d[i] = input .shift() - 0 ;
    }

    // Call the solve function and print 'OK' or 'NG' based on its return value
    console .log( solve( max , n , d ) ? 'OK' : 'NG' ) ;
}