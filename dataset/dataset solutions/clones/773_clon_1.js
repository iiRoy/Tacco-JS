var fs = require( 'fs' )
    ; // Require the Node.js file system module

// Determine the size of the input stream from standard input
var length = fs.fstatSync( process.stdin.fd ).size
    ;

// Create a new buffer to hold the input data
var buffer = new Buffer( length )
    ;

// Read bytes from standard input into the buffer
var bytesRead = fs.readSync( process.stdin.fd ,  buffer ,  0 ,  length ,  0 )
    ;

// Convert the buffer to a UTF-8 string and split it into an array of lines
var input = buffer.toString( 'utf8' , 0 , bytesRead ).split( '\n' )
    ;

// Call the main function to start program execution
main ( ) ;


// This is the primary function where the program logic resides
function main ( ) {

    // Parse the first line of input to extract various parameters
    var temp = input.shift( ).split( ' ' )
        ;

    // n: Number of nodes in the graph
    var n = +temp[0]
        ;

    // m: Number of edges in the graph
    var m = +temp[1]
        ;

    // s: Starting node (adjusted to be 0-indexed)
    var s = temp[2] - 1
        ;

    // g1: First destination node (adjusted to be 0-indexed)
    var g1 = temp[3] - 1
        ;

    // g2: Second destination node (adjusted to be 0-indexed)
    var g2 = temp[4] - 1
        ;

    // d: Adjacency matrix to store shortest path distances
    var d = [ ]
        ;

    // i, j, k: Loop counters
    var i , j , k
        ;

    // Initialize the distance matrix
    // All distances are set to Infinity, except for self-loops (distance 0)
    for ( i = 0 ;  i < n ;  i++ ) {

        d[i] = [ ] ; // Initialize row for node i

        for ( j = 0 ;  j < n ;  j++ ) {

            // If it's the same node, distance is 0; otherwise, it's infinity
            d[i][j] = i === j ? 0 : Infinity
                ;
        } // End of inner loop for j
    } // End of outer loop for i

    // Populate the distance matrix with initial edge weights
    // This loop processes 'm' lines of input, each representing an edge
    for ( i = 0 ;  i < m ;  i++ ) {

        // Split the current input line to get source, destination, and weight
        temp = input[i].split( ' ' )
            ;

        // Assign the weight to the corresponding edge in the distance matrix
        // Node indices are adjusted to be 0-indexed
        d[temp[0] - 1][temp[1] - 1] = +temp[2]
            ;
    } // End of loop for m edges

    // Floyd-Warshall Algorithm: Compute all-pairs shortest paths
    // Iterate through all possible intermediate nodes 'k'
    for ( k = 0 ;  k < n ;  k++ ) {

        // Iterate through all possible source nodes 'i'
        for ( i = 0 ;  i < n ;  i++ ) {

            // Iterate through all possible destination nodes 'j'
            for ( j = 0 ;  j < n ;  j++ ) {

                // Update the shortest path from i to j if a shorter path through k is found
                d[i][j] = Math.min( d[i][j] , d[i][k] + d[k][j] )
                    ;
            } // End of innermost loop for j
        } // End of middle loop for i
    } // End of outermost loop for k

    // Initialize minimum cost to infinity
    var cost = Infinity
        ;

    // Calculate the minimum cost to travel from 's' to 'g1' and 'g2'
    // This involves finding an intermediate node 'k' that minimizes the total path
    for ( k = 0 ;  k < n ;  k++ ) {

        // The path is s -> k -> g1 and s -> k -> g2.
        // We are looking for s -> k + k -> g1 + k -> g2
        cost = Math.min( cost , d[s][k] + d[k][g1] + d[k][g2] )
            ;
    } // End of loop for k

    // Output the calculated minimum cost to the console
    console.log( cost )
        ;

} // End of main function