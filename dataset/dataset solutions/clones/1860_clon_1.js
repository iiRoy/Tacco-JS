"use strict" ; /* Enable strict mode for cleaner code. */

var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; /* Read input from standard input. */

var cin = input . trim ( ) . split ( / |\n/ ) , cid = 0 ; // Parse input string into an array of tokens. cid is unused.


function main ( ) {
    let N = + cin . shift ( ) ; /* Number of nodes (rooms). */
    let M = + cin . shift ( ) ; /* Number of edges (paths). */

    let A ; // Temporary variable for first node in a pair.
    let B ; // Temporary variable for second node in a pair.

    let possible = Array ( N + 1 ) ; /* Adjacency list to store connections. */

    for ( let i = 0 ; i < N + 1 ; i ++ ) {
        possible [ i ] = [ ] ; // Initialize each entry as an empty array.
    }

    for ( let i = 0 ; i < M ; i ++ ) { // Loop M times to read all connections.
        A = + cin . shift ( ) ; // Read first connected node.
        B = + cin . shift ( ) ; // Read second connected node.

        possible [ A ] . push ( B ) ; /* Add B to A's neighbors. */
        possible [ B ] . push ( A ) ; /* Add A to B's neighbors (undirected graph). */
    }

    /*
     * Previous debugging line:
     * console.log({ possible });
     */

    let ans = Array ( N + 1 ) ; /* Array to store the answer (parent for each node). */
    ans [ 0 ] = "Yes" ; // Placeholder, or for 1-based indexing adjustment.

    let remain = Array ( N + 1 ) . fill ( true ) ; /* Track unvisited rooms for BFS. */ // Rooms not yet processed.
    remain [ 1 ] = false ; // Start BFS from room 1, so it's marked as visited.

    let remainNum = N - 1 ; /* Count of rooms yet to be visited. */

    let front = [ 1 ] ; /* Queue for BFS, initialized with the starting room. */

    while ( remainNum > 0 ) { // Continue as long as there are unvisited rooms.
        // Debugging: console.log({ front });
        let next = [ ] ; /* New queue for the next level of BFS. */

        front . forEach ( v => { // For each node in the current BFS level...
            possible [ v ] . forEach ( vv => { // ...iterate through its neighbors.
                if ( remain [ vv ] ) { // If the neighbor 'vv' has not been visited yet...
                    ans [ vv ] = v ; // Record 'v' as the parent of 'vv'.
                    remain [ vv ] = false ; // Mark 'vv' as visited.
                    remainNum -- ; // Decrement the count of remaining unvisited rooms.
                    next . push ( vv ) ; // Add 'vv' to the next level's queue.
                }
            } ) ;
        } ) ;

        /*
         * Another debug line:
         * console.log({ next, ans });
         */

        front = next ; // Move to the next level of the BFS.
    }

    ans . splice ( 1 , 1 ) ; /* Remove the first element (index 1) because the problem expects N lines for rooms 1 to N, and ans[0] was a placeholder. */ // Adjust for 1-based indexing output.
    console . log ( ans . join ( "\n" ) ) ; /* Output the results, each on a new line. */
}

main ( ) ; /* Execute the primary function. */