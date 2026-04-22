'use strict';
// This line enforces strict mode for the entire script.

function Main ( input ) {
    // The main function where the program execution begins.

    /*
     * Process the raw input string:
     * 1. Remove leading/trailing whitespace.
     * 2. Split the string into an array of lines.
     */
    input = input.trim().split( '\n' );

    // Parse the first line of input to get N, u, and v.
    const array = input[0].split( ' ' ).map( s => parseInt( s, 10 ) );

    // N represents the total number of nodes in the graph.
    const N = array[0];
    // 'u' is one of the starting nodes for DFS.
    const u = array[1];
    // 'v' is the other starting node for DFS.
    const v = array[2];

    // 'rest' contains the remaining lines, which describe the graph edges.
    const rest = input.slice( 1 );

    /*
     * Convert the 'rest' array of strings into an array of arrays of numbers.
     * Each inner array represents an edge [nodeA, nodeB].
     */
    const list = rest.map( s => {
        return s.split( ' ' ).map( ss => parseInt( ss, 10 ) );
    } );

    // Initialize an adjacency list to represent the graph.
    var map = {};

    // Build the adjacency list from the 'list' of edges.
    for ( var i = 0; i < N - 1; ++i ) {
        var tmp = list[i];
        var a   = tmp[0];
        var b   = tmp[1];

        // Ensure that nodes 'a' and 'b' exist in the map before pushing.
        if ( !map[a] ) {
            map[a] = [];
        }
        if ( !map[b] ) {
            map[b] = [];
        }

        // Add bidirectional edges for an undirected graph.
        map[a].push( b );
        map[b].push( a );
    }

    // Initialize an array to store distances from node 'u'.
    var distA = Array( N + 1 );
    // Fill with a default value (e.g., 0) or a placeholder indicating unvisited.
    distA.fill( 0 );

    // Initialize an array to store distances from node 'v'.
    var distB = Array( N + 1 );
    // Fill with a default value (e.g., 0).
    distB.fill( 0 );

    /**
     * Performs a Depth-First Search (DFS) to calculate distances from a starting node.
     * @param {number} curr - The current node being visited.
     * @param {number} pre - The previous node (parent) to avoid revisiting.
     * @param {number} d - The current distance from the starting node.
     * @param {Array<number>} dist - The array to store calculated distances.
     */
    const dfs = ( curr, pre, d, dist ) => {
        // Set the distance for the current node.
        dist[curr] = d;

        // Iterate over all neighbors of the current node.
        for ( var i in map[curr] ) {
            var next = parseInt( map[curr][i], 10 );

            // If the neighbor is not the parent node, proceed with DFS.
            if ( next !== pre ) {
                dfs( next, curr, d + 1, dist );
            }
        }
    };

    // Perform DFS starting from node 'u' to populate distA.
    dfs( u, 0, 0, distA );

    // Perform DFS starting from node 'v' to populate distB.
    dfs( v, 0, 0, distB );

    // Initialize 'max' to store the maximum required value.
    var max = 0;

    // Iterate through all nodes to find the maximum value based on distances.
    for ( var i = 0; i < N + 1; ++i ) {
        // If the distance from 'u' is less than the distance from 'v' for a node.
        if ( distA[i] < distB[i] ) {
            // Update 'max' with the greater value between current 'max' and (distB[i] - 1).
            max = Math.max( max, distB[i] - 1 );
        }
    }

    // Output the final calculated maximum value.
    console.log( max );

}

// Read input from standard input and pass it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );