function warshall()
{
    /*
     * This function implements the Floyd-Warshall algorithm
     * to find the shortest paths between all pairs of nodes
     * in a graph. It operates on two matrices, C (cost) and T (time).
     *
     * The algorithm iterates through all possible intermediate nodes 'k'.
     */
    for ( var k = 0; k < nm[1]; k++ )
    {
        // Iterate through all possible source nodes 'i'
        for ( var i = 0; i < nm[1]; i++ )
        {
            // Iterate through all possible destination nodes 'j'
            for ( var j = 0; j < nm[1]; j++ )
            {
                // Update the minimum cost path from i to j,
                // considering k as an intermediate node.
                C[i][j] = Math.min( C[i][j], C[i][k] + C[k][j] );

                // Update the minimum time path from i to j,
                // considering k as an intermediate node.
                T[i][j] = Math.min( T[i][j], T[i][k] + T[k][j] );
            }
        }
    }
}


// Read the entire input from standard input as a UTF-8 string.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Trim any leading/trailing whitespace and split the input into an array of lines.
var Arr = ( input.trim() ).split( "\n" );


// Main processing loop: Continues until a specific termination condition is met.
while ( true )
{
    // Parse the first line of the current input block.
    // This line contains two numbers: nm[0] (number of edges) and nm[1] (number of nodes).
    var nm = ( Arr.shift() ).split( " " ).map( Number );

    // Check for the termination condition: both nm[0] and nm[1] are zero.
    if ( nm[0] == 0 && nm[1] == 0 )
    {
        break; // Exit the loop if the termination condition is met.
    }


    // Initialize two 2D arrays, C (for cost) and T (for time),
    // to store the adjacency matrices.
    var C = [];
    var T = [];

    // Populate the initial C and T matrices.
    // They are initialized for up to 101 nodes, assuming 1-based indexing for input.
    for ( var i = 0; i < 101; i++ )
    {
        C[i] = []; // Initialize inner array for C
        T[i] = []; // Initialize inner array for T

        for ( var j = 0; j < 101; j++ )
        {
            // If i and j are the same node, the cost/time is 0.
            // Otherwise, initialize with Infinity (representing no direct path).
            C[i][j] = ( i == j ) ? 0 : Infinity;
            T[i][j] = ( i == j ) ? 0 : Infinity;
        }
    }


    // Read and process the 'nm[0]' edges.
    // Each edge specifies source, destination, cost, and time.
    for ( var i = 0; i < nm[0]; i++ )
    {
        // Parse an edge line: A[0] (source), A[1] (destination), A[2] (cost), A[3] (time).
        var A = ( Arr.shift() ).split( " " ).map( Number );

        // Store the cost for the edge (adjusting for 0-based indexing).
        C[A[0] - 1][A[1] - 1] = A[2];
        // Store the time for the edge (adjusting for 0-based indexing).
        T[A[0] - 1][A[1] - 1] = A[3];
    }


    // Run the Floyd-Warshall algorithm to compute all-pairs shortest paths for both cost and time.
    warshall();


    // Read the number of queries 'k' for the current graph.
    var k = Arr.shift() - 0; // Subtract 0 to ensure it's treated as a number.


    // Process each query.
    for ( var i = 0; i < k; i++ )
    {
        // Parse a query line: B[0] (source), B[1] (destination), B[2] (type: 0 for cost, 1 for time).
        var B = ( Arr.shift() ).split( " " ).map( Number );

        // If B[2] is 0, print the minimum cost between B[0] and B[1].
        if ( B[2] == 0 )
        {
            console.log( C[B[0] - 1][B[1] - 1] );
        }

        // If B[2] is 1, print the minimum time between B[0] and B[1].
        if ( B[2] == 1 )
        {
            console.log( T[B[0] - 1][B[1] - 1] );
        }
    }
}