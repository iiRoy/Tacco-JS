/*
 * This JavaScript code reads input from /dev/stdin, processes it,
 * and outputs a calculated result. It appears to solve a shortest path
 * problem or a similar graph traversal problem with specific conditions.
 */

// Module to interact with the file system.
// Reads the entire content of '/dev/stdin' as UTF-8.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Trim leading/trailing whitespace from the input and split it into an array of lines.
var   arr   =   input . trim ( ) . split ( "\n" ) ;

/*
 * Main processing loop.
 * Continues indefinitely until a specific termination condition is met.
 */
while   ( true )
{
    // Shift the first line from 'arr', split it by space, and convert parts to numbers.
    // This line typically contains problem parameters N and M.
    var   nm   =   arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Check for the termination condition: "0 0" indicates end of input.
    if   ( nm . join ( " " )   ==   "0 0" )
        break ; // Exit the loop if the condition is met.

    // Initialize problem-specific variables.
    // 'n' is derived from the first parameter, often representing a maximum node index or similar.
    var   n   =   nm [ 0 ]   +   100 ;
    // 'm' is the second parameter, typically the number of edges or connections.
    var   m   =   nm [ 1 ] ;
    // 'c' seems to be a constant, possibly related to states or dimensions in DP.
    var   c   =   2 ;
    // 's' is the starting node/state.
    var   s   =   1 ;
    // 'd' is the destination node/state, derived from the first parameter.
    var   d   =   nm [ 0 ] ;

    // 'ary' will store the graph's edges or connections.
    var   ary   =   [ ] ;
    // Loop 'm' times to read 'm' lines representing edges.
    for   ( var   i   =   0 ;   i   <   m ;   i ++ )
        // Each line is split, converted to numbers, and pushed into 'ary'.
        ary . push ( arr . shift ( ) . split ( " " ) . map ( Number ) ) ;

    // 'dp' is a dynamic programming table, initialized here.
    var   dp   =   [ ] ;
    // Initialize the 'dp' table with 'Infinity' to represent unreached states/paths.
    for   ( var   i   =   0 ;   i   <=   n ;   i ++ )
    {
        dp [ i ]   =   [ ] ; // Create an inner array for each 'i'.
        for   ( var   j   =   0 ;   j   <=   c ;   j ++ )
        {
            dp [ i ] [ j ]   =   Infinity ; // Set initial value to Infinity.
        }
    }

    // Set the initial state for the DP table.
    // dp[s][0] is set to 0, indicating the cost to reach the starting node 's' in state 0 is 0.
    dp [ s ] [ 0 ]   =   0 ;

    // 'bomb' acts as a queue for nodes to be processed (similar to a BFS queue).
    var   bomb   =   [ s ] ;
    // 'obj' is used to keep track of visited nodes to prevent redundant processing.
    var   obj   =   { } ;

    /*
     * Graph traversal loop (likely a variation of Dijkstra or BFS).
     * Continues as long as there are nodes in the 'bomb' queue.
     */
    while   ( true )
    {
        // If the queue is empty, all reachable nodes have been processed.
        if   ( bomb . length   ==   0 )
            break ;

        // Dequeue a node 'S' for processing.
        var   S   =   bomb . shift ( ) ;

        // If 'S' has already been processed, skip it.
        if   ( obj . hasOwnProperty ( S ) )
            continue ;

        // Mark 'S' as processed.
        obj [ S ]   =   true ;

        // Iterate over all edges in 'ary' to find connections to 'S'.
        ary . forEach ( function ( v )
        {
            var   a   =   v [ 0 ] ; // First node in the edge.
            var   b   =   v [ 1 ] ; // Second node in the edge.
            var   f   =   v [ 2 ] ; // Cost/weight of the edge.

            // If 'a' is the current node 'S'.
            if   ( a   ==   S )
            {
                // Update DP states for node 'b' based on paths through 'a'.
                dp [ b ] [ 0 ]   =   Math . min ( dp [ b ] [ 0 ] ,   dp [ a ] [ 0 ]   +   f ) ;
                dp [ b ] [ 1 ]   =   Math . min ( dp [ b ] [ 1 ] ,   dp [ a ] [ 0 ] ) ;
                dp [ b ] [ 2 ]   =   Math . min ( dp [ b ] [ 2 ] ,   dp [ a ] [ 1 ] ) ;
                dp [ b ] [ 2 ]   =   Math . min ( dp [ b ] [ 2 ] ,   dp [ a ] [ 2 ]   +   f ) ;
                // Enqueue node 'b' for further processing.
                bomb . push ( b ) ;
            }
            // If 'b' is the current node 'S'.
            else   if   ( b   ==   S )
            {
                // Update DP states for node 'a' based on paths through 'b'.
                dp [ a ] [ 0 ]   =   Math . min ( dp [ a ] [ 0 ] ,   dp [ b ] [ 0 ]   +   f ) ;
                dp [ a ] [ 1 ]   =   Math . min ( dp [ a ] [ 1 ] ,   dp [ b ] [ 0 ] ) ;
                dp [ a ] [ 2 ]   =   Math . min ( dp [ a ] [ 2 ] ,   dp [ b ] [ 1 ] ) ;
                dp [ a ] [ 2 ]   =   Math . min ( dp [ a ] [ 2 ] ,   dp [ b ] [ 2 ]   +   f ) ;
                // Enqueue node 'a' for further processing.
                bomb . push ( a ) ;
            }
        } ) ;
    }

    // Initialize 'ans' to Infinity to find the minimum possible answer.
    var   ans   =   Infinity ;
    // Iterate through the DP states for the destination node 'd'.
    dp [ d ] . forEach ( function ( v ,   i )
    {
        // Exclude the state at index 1 (i.e., dp[d][1]) from the final answer calculation.
        if   ( i   !=   1 )
            ans   =   Math . min ( ans ,   v ) ; // Update 'ans' with the minimum value found.
    } ) ;

    // Output the calculated minimum answer to the console.
    console . log ( ans ) ;
}