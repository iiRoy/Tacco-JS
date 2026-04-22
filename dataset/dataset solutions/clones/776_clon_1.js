var input = ''; // This variable will accumulate all input data from stdin

// It is good practice to resume the stdin stream
process.stdin.resume();

// Set the encoding for standard input to UTF-8
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks from stdin
process.stdin.on( 'data', function ( chunk ) {

    // Append the received data chunk to the 'input' string
    input += chunk;

} ); // End of data event handler


// Event listener for the 'end' of the stdin stream
process.stdin.on( 'end', function ( ) {

    // Once all input has been received, split it into an array of lines
    input = input . split( '\n' );

    // Extract and parse the first line of input, which contains problem parameters
    var firstLine = input . shift( ) . split( ' ' ) ,
        n = + firstLine [ 0 ] , // N: Number of nodes in the graph
        m = + firstLine [ 1 ] , // M: Number of initial edges (this variable 'm' is not explicitly used after this point)
        s = firstLine [ 2 ] - 1 , // S: Starting node (converted to 0-indexed)
        g1 = firstLine [ 3 ] - 1 , // G1: First goal node (converted to 0-indexed)
        g2 = firstLine [ 4 ] - 1 , // G2: Second goal node (converted to 0-indexed)
        d = [ ] , // 'd' will be the adjacency matrix storing shortest path distances
        temp , // Temporary variable for processing input lines
        i , j , k ; // Loop counters for iterating through nodes

    // Initialize the distance matrix 'd'
    // All distances are initially set to Infinity, except for paths from a node to itself (which are 0)
    for ( i = 0 ; i < n ; i ++ ) {
        d [ i ] = [ ] ; // Create a new row for node 'i'

        for ( j = 0 ; j < n ; j ++ ) {
            // If it's the same node, distance is 0; otherwise, it's unknown (Infinity)
            d [ i ] [ j ] = i === j ? 0 : Infinity ;
        }
    }


    // Read and process edge information from the input
    // The loop continues until a specific termination string "0 0 0 0 0" is encountered
    while ( input [ 0 ] !== '0 0 0 0 0' ) {

        // Take the next line, split it by space, and store in 'temp'
        temp = input . shift( ) . split( ' ' ) ;

        // Update the direct distance between the two specified nodes
        // Input nodes are 1-indexed, so we subtract 1 to make them 0-indexed
        // The third element is the weight, converted to a number using unary plus operator
        d [ temp [ 0 ] - 1 ] [ temp [ 1 ] - 1 ] = + temp [ 2 ] ;

    }


    // Apply the Floyd-Warshall algorithm to find all-pairs shortest paths
    // This algorithm considers every node 'k' as an intermediate point
    for ( k = 0 ; k < n ; k ++ ) {
        // Iterate through all possible source nodes 'i'
        for ( i = 0 ; i < n ; i ++ ) {
            // Iterate through all possible destination nodes 'j'
            for ( j = 0 ; j < n ; j ++ ) {
                // If the path from 'i' to 'j' via 'k' is shorter than the current known path, update it
                d [ i ] [ j ] = Math . min( d [ i ] [ j ] , d [ i ] [ k ] + d [ k ] [ j ] ) ;
            }
        }
    }


    // Calculate the minimum required result
    // We need to find an intermediate node 'i' such that the path from 's' to 'i',
    // plus 'i' to 'g1', plus 'i' to 'g2' is minimized.
    var res = Infinity ; // Initialize result with a very large value

    for ( i = 0 ; i < n ; i ++ ) {
        // For each possible intermediate node 'i', calculate the total path length
        res = Math . min( res , d [ s ] [ i ] + d [ i ] [ g1 ] + d [ i ] [ g2 ] ) ;
    }

    // Output the final calculated minimum distance to the console
    console . log( res ) ;

} ) ; // End of process.stdin.on('end') handler