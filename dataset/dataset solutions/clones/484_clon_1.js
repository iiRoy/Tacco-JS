var fs   = require('fs')
    ,length =  fs.fstatSync ( process.stdin.fd ).size
    ,buffer = new Buffer ( length )
    ,bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
    ,input = buffer.toString('utf8', 0, bytesRead).split('\n'); // Read input from stdin, split by newlines

/*
 * This function attempts to find a Hamiltonian cycle in a directed graph G.
 * G is represented as an adjacency list.
 * i: The current node being visited.
 * use: An array representing the path taken so far.
 * Returns true if a cycle is found, false otherwise.
 */
function solve ( G , i , use )
{
    // Base case: If all nodes have been visited
    if ( use.length === G.length )
    {
        // Check if there's an edge from the last node back to the first
        return ~G [ use [ use.length - 1 ] ].indexOf( use [ 0 ] ) ;
    }

    // Iterate through all neighbors of the current node 'i'
    for ( var j = 0 ; j < G [ i ].length ; j++ )
    {
        // If the neighbor G[i][j] has already been visited in the current path, skip it.
        if ( ~use.indexOf ( G [ i ] [ j ] ) )
        {
            continue ;
        }

        // Recursively call solve with the neighbor as the next node
        // and add the neighbor to the 'use' path.
        if ( solve ( G , G [ i ] [ j ] , use.concat ( G [ i ] [ j ] ) ) )
        {
            return true ; // A cycle was found
        }
    }

    return false ; // No cycle found from this path
}


// Immediately Invoked Function Expression (IIFE) to encapsulate the main logic
!function ( )
{
    // Declare all local variables at the beginning of the scope
    var N,     // Number of strings/nodes
        arr,   // Array of input strings
        G,     // Adjacency list representation of the graph
        str,   // Temporary variable for current string
        ch,    // Temporary variable for last character of current string
        min,   // Minimum degree found
        i,j;   // Loop counters


    // Main loop: Continues as long as the first line of input is not '0'
    while ( input[0] !== '0' )
    {
        N = input.shift() - 0; // Read N, convert to number, and remove from input array

        arr = []; // Initialize array to store input strings
        G = [];   // Initialize graph adjacency list

        // Populate the 'arr' array with N strings from input
        for ( i = 0 ; i < N ; i++ )
        {
            arr.push( input.shift() );
        }

        // Build the graph 'G'
        // An edge exists from node 'i' to node 'j' if arr[i]'s last char
        // matches arr[j]'s first char.
        for ( i = 0 ; i < N ; i++ )
        {
            str = arr[i];                   // Get current string
            ch = str[str.length - 1];       // Get its last character
            G[i] = [];                      // Initialize adjacency list for node 'i'

            for ( j = 0 ; j < N ; j++ )
            {
                if ( i === j ) // A node cannot have an edge to itself in this problem context
                {
                    continue;
                }

                // Check if the last character of arr[i] matches the first character of arr[j]
                if ( ch === arr[j][0] )
                {
                    G[i].push(j); // Add an edge from 'i' to 'j'
                }
            }
        }


        // Find the node with the minimum outgoing degree (heuristic for starting point)
        min = 100000; // Initialize min with a large value
        for ( i = 0 ; i < N ; i++ )
        {
            if ( G[i].length < min )
            {
                min = G[i].length; // Update minimum degree
                j = i;             // Store the index of the node with minimum degree
            }
        }

        // Call the solve function with the chosen starting node
        // and print 'OK' if a Hamiltonian cycle is found, 'NG' otherwise.
        console.log ( solve ( G , j , [j] ) ? 'OK' : 'NG' );
    }
} ( ) ; // Execute the IIFE