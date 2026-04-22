'use strict' /* This directive enforces strict parsing and error handling in the script. */



function    Main (    input    )    {

    // Pre-process the input string: trim whitespace and split into lines.
    input = input . trim ( ) . split ( '\n' )

    /*
     * The first line of input typically contains important parameters.
     * Split it by space and parse each part as an integer.
     */
    const array = input [ 0 ] . split ( ' ' ) . map ( s => parseInt ( s ) ) ;

    // Extract N, u, and v from the parsed array.
    const N = array [ 0 ] ; // N represents the number of nodes in the graph.
    const u = array [ 1 ] ; // u is the starting node for the first DFS.
    const v = array [ 2 ] ; // v is the starting node for the second DFS.

    // Get the remaining lines of input, which represent the edges.
    const rest = input . slice ( 1 ) ;

    /*
     * Process the 'rest' of the input lines.
     * Each line describes an edge, consisting of two node IDs.
     * Convert these lines into an array of arrays, where each inner array is an edge [nodeA, nodeB].
     */
    const list = rest . map ( s => {
        return s . split ( ' ' ) . map ( ss => parseInt ( ss ) ) ;
    } ) ;


    // Initialize an adjacency list to represent the graph.
    // The 'map' object will store arrays of connected nodes for each node.
    var map = { } ;

    /*
     * Iterate through the list of edges to build the adjacency list.
     * The loop runs N-1 times because a tree with N nodes has N-1 edges.
     */
    for ( var i = 0 ; i < N - 1 ; ++ i ) {
        var tmp = list [ i ] ; // Get the current edge [a, b].
        var a = tmp [ 0 ] ;    // Extract the first node of the edge.
        var b = tmp [ 1 ] ;    // Extract the second node of the edge.

        // Ensure that map[a] exists and is an array. If not, initialize it.
        if ( ! map [ a ] ) {
            map [ a ] = [ ] ;
        }
        // Ensure that map[b] exists and is an array. If not, initialize it.
        if ( ! map [ b ] ) {
            map [ b ] = [ ] ;
        }

        // Add 'b' to the adjacency list of 'a', representing an edge between a and b.
        map [ a ] . push ( b ) ;
        // Add 'a' to the adjacency list of 'b', as the graph is undirected.
        map [ b ] . push ( a ) ;
    }

    // Initialize an array to store distances from node 'u'.
    // The size is N+1 to accommodate 1-based indexing for nodes.
    var distA = Array ( N + 1 ) ;
    // Fill the array with a default value (e.g., 0) before BFS/DFS.
    distA . fill ( 0 ) ;


    // Initialize an array to store distances from node 'v'.
    // The size is N+1 for 1-based indexing.
    var distB = Array ( N + 1 ) ;
    // Fill the array with a default value.
    distB . fill ( 0 ) ;


    /*
     * Define a Depth-First Search (DFS) function.
     * curr: current node being visited.
     * pre:  previous node (parent) to avoid going back immediately.
     * d:    current distance from the starting node.
     * dist: the distance array to update (either distA or distB).
     */
    const dfs = ( curr , pre , d , dist ) => {

        // Store the distance of the current node from the source.
        dist [ curr ] = d ; // This updates the distance for the current node.

        // console.log(curr, d) // Debugging line, commented out.

        // Iterate over all neighbors of the current node.
        for ( var i in map [ curr ] ) {
            // Get the neighbor node from the adjacency list.
            var next = parseInt ( map [ curr ] [ i ] ) ;

            // If the neighbor is not the parent node, proceed with DFS.
            if ( next !== pre ) {
                // Recursively call DFS for the neighbor, incrementing the distance.
                dfs ( next , curr , d + 1 , dist ) ;
            }
        }
        // console.log(dist[curr], curr) // Another debugging line, commented out.
    } ;

    // Perform DFS starting from node 'u' to populate distA.
    // Start node u, no parent (0), distance 0, update distA.
    dfs ( u , 0 , 0 , distA ) ;

    // Perform DFS starting from node 'v' to populate distB.
    // Start node v, no parent (0), distance 0, update distB.
    dfs ( v , 0 , 0 , distB ) ;


    // Initialize 'max' to store the maximum required distance.
    var max = 0 ;

    // Iterate through all possible nodes (from 0 to N).
    for ( var i = 0 ; i < N + 1 ; ++ i ) {
        // If the distance from 'u' to node 'i' is less than the distance from 'v' to node 'i'...
        if ( distA [ i ] < distB [ i ] ) {
            // Update 'max' with the larger value between current 'max' and (distB[i] - 1).
            // The problem statement implies we want the maximum distance from 'v' among nodes closer to 'u',
            // and then subtract 1 from it.
            max = Math . max ( max , distB [ i ] - 1 ) ;
        }
    }
    // Output the final calculated maximum value.
    console . log ( max ) ;

}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;