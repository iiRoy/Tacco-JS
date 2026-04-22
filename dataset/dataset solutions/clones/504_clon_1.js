/*
 * This JavaScript code processes graph data from standard input to solve a shortest path problem.
 * It's designed to handle multiple test cases, each defining a graph.
 * The algorithm appears to be a modified shortest-path search, possibly tracking
 * multiple shortest path candidates (e.g., shortest, second shortest, third shortest).
 */

//  Import the 'fs' (file system) module to read input.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

//  Read the entire input, remove any leading/trailing whitespace,
//  and then split it into an array of strings, where each string is a line.
var arr = input . trim ( ) . split ( "\n" ) ;

//  The main loop processes each test case. It continues indefinitely
//  until a specific termination condition is met within the loop.
while ( true ) {
    //  Extract the first line of the current test case.
    //  This line typically contains 'n' (number of nodes) and 'm' (number of edges).
    //  It's shifted from the 'arr' array, split by spaces, and each part converted to a Number.
    var nm = arr . shift ( ) . split ( " " ) . map ( Number ) ;

    //  Check if the current test case line indicates termination.
    //  The problem defines "0 0" as the signal to stop processing.
    if ( nm . join ( " " ) === "0 0" ) {
        break ; // Exit the main processing loop.
    }

    //  Assign the number of nodes (n) and edges (m) from the parsed input.
    var n = nm [ 0 ] ; //  Number of nodes in the graph.
    var m = nm [ 1 ] ; //  Number of edges in the graph.

    //  'c' defines the number of alternative path types to track for each node.
    //  A value of 2 implies tracking 3 path types (indices 0, 1, 2).
    var c = 2 ;
    var s = 1 ; //  The starting node (source). Assuming 1-indexed nodes.
    var d = n ; //  The destination node.

    //  'ary' will store the graph's edges. Each element is an array [nodeA, nodeB, weightF].
    var ary = [ ] ;

    //  Populate the 'ary' array with 'm' edge definitions.
    //  Each line is read, split, and converted to numbers, then pushed into 'ary'.
    for ( var i = 0 ; i < m ; i ++ ) {
        ary . push ( arr . shift ( ) . split ( " " ) . map ( Number ) ) ;
    }

    //  'dp' is a 2D array used for dynamic programming or shortest path calculations.
    //  dp[node_index][path_type_index] will store the minimum distance.
    var dp = [ ] ;

    //  Initialize the 'dp' array.
    //  For each node (from 0 to n), create an inner array.
    for ( var i = 0 ; i <= n ; i ++ ) {
        dp [ i ] = [ ] ;
        //  Initialize all path types for the current node to Infinity.
        //  This signifies that these paths are currently unreachable.
        for ( var j = 0 ; j <= c ; j ++ ) {
            dp [ i ] [ j ] = Infinity ;
        }
    }

    //  Set the distance for the source node 's' for the "shortest" path type (index 0) to 0.
    //  The cost to reach the starting node from itself is zero.
    dp [ s ] [ 0 ] = 0 ;

    //  'bomb' acts as a queue for nodes that need to be processed.
    //  It's initialized with the starting node.
    var bomb = [ s ] ;

    //  'obj' is used as a set to keep track of nodes that have already been fully processed,
    //  preventing redundant work and infinite loops in cyclic graphs.
    var obj = { } ;

    //  This is the main graph traversal loop, resembling a breadth-first search (BFS)
    //  or a simplified Dijkstra's algorithm for finding multiple shortest paths.
    while ( true ) {
        //  If the 'bomb' queue is empty, it means all reachable nodes have been explored.
        if ( bomb . length === 0 ) {
            break ; // Exit the graph traversal loop.
        }

        //  Dequeue the next node 'S' to process.
        var S = bomb . shift ( ) ;

        //  If node 'S' has already been marked as processed, skip it.
        if ( obj . hasOwnProperty ( S ) ) {
            continue ; // Move to the next node in the queue.
        }

        //  Mark node 'S' as processed to avoid re-evaluating it.
        obj [ S ] = true ;

        //  Iterate over all edges in the graph to find neighbors of 'S'.
        ary . forEach ( function ( v ) {
            //  Extract the two connected nodes (a, b) and the edge weight (f) from the current edge 'v'.
            var a = v [ 0 ] ;
            var b = v [ 1 ] ;
            var f = v [ 2 ] ;

            //  If node 'a' of the current edge is the node 'S' being processed,
            //  then 'b' is a neighbor of 'S'.
            if ( a === S ) {
                //  Update the path distances for node 'b' based on paths through 'S'.
                //  dp[b][0]: Shortest path to b.
                //  dp[b][1]: Second shortest path to b (derived from shortest path to a).
                //  dp[b][2]: Third shortest path to b (derived from second/third shortest path to a).
                dp [ b ] [ 0 ] = Math . min ( dp [ b ] [ 0 ] , dp [ a ] [ 0 ] + f ) ;
                dp [ b ] [ 1 ] = Math . min ( dp [ b ] [ 1 ] , dp [ a ] [ 0 ] ) ;
                dp [ b ] [ 2 ] = Math . min ( dp [ b ] [ 2 ] , dp [ a ] [ 1 ] ) ;
                dp [ b ] [ 2 ] = Math . min ( dp [ b ] [ 2 ] , dp [ a ] [ 2 ] + f ) ;
                bomb . push ( b ) ; // Add 'b' to the queue to be processed later.
            }
            //  If node 'b' of the current edge is the node 'S' being processed,
            //  then 'a' is a neighbor of 'S'. This handles undirected edges or reverse paths.
            else if ( b === S ) {
                //  Update the path distances for node 'a' similarly.
                dp [ a ] [ 0 ] = Math . min ( dp [ a ] [ 0 ] , dp [ b ] [ 0 ] + f ) ;
                dp [ a ] [ 1 ] = Math . min ( dp [ a ] [ 1 ] , dp [ b ] [ 0 ] ) ;
                dp [ a ] [ 2 ] = Math . min ( dp [ a ] [ 2 ] , dp [ b ] [ 1 ] ) ;
                dp [ a ] [ 2 ] = Math . min ( dp [ a ] [ 2 ] , dp [ b ] [ 2 ] + f ) ;
                bomb . push ( a ) ; // Add 'a' to the queue to be processed later.
            }
        } ) ; // End of forEach for edges.
    } // End of while (true) for graph traversal.

    //  Initialize 'ans' to Infinity. This variable will store the final answer
    //  for the current test case.
    var ans = Infinity ;

    //  Iterate through the calculated path types for the destination node 'd'.
    //  The problem statement implies we need the minimum of all path types *except* the second one (index 1).
    dp [ d ] . forEach ( function ( v , i ) {
        if ( i !== 1 ) { // If the current path type index is not 1 (the second shortest).
            ans = Math . min ( ans , v ) ; // Update 'ans' with the minimum value found so far.
        }
    } ) ;

    //  Output the calculated answer for the current test case to the console.
    console . log ( ans ) ;
} // End of the main while loop for test cases.

/*
 * This script efficiently finds specific shortest path variants in a graph.
 * The intricate updates to dp[node][path_type] suggest a problem
 * where not just the absolute shortest path, but also alternative short paths
 * are important, possibly in scenarios like finding paths with one detour.
 */