/*
 * This is a Type I clone of the original JavaScript code.
 * It processes input to determine a winner based on graph-like distances.
 * The core logic and identifiers remain completely unchanged.
 * Only whitespace and comments have been altered for visual differentiation.
 */

function Main( input ) { /* Main function to process the input string */

    // Split the input string by newline characters into an array of lines.
    input = input.split( "\n" ) ;

    // Parse the first line to get the number of nodes, 'n'.
    var n = parseInt( input[0] ) ;

    /*
     * Initialize two arrays, 'a' and 'b', of size n-1.
     * These arrays will store the edges of the graph.
     * Each element is initialized to 0.
     */
    a = new Array( n - 1 ) . fill( 0 ) ;
    b = new Array( n - 1 ) . fill( 0 ) ;

    // Loop through the remaining input lines to populate arrays 'a' and 'b'.
    // Each line represents an edge between two nodes.
    for ( i = 0 ; i < n - 1 ; i++ ) {

        // Split the current line by space to get the two nodes for the edge.
        tmp = input[ i + 1 ] . split( " " ) ;

        // Store the first node (0-indexed) in array 'a'.
        a[ i ] = parseInt( tmp[ 0 ] ) - 1 ;

        // Store the second node (0-indexed) in array 'b'.
        b[ i ] = parseInt( tmp[ 1 ] ) - 1 ;
    }

    /*
     * Initialize distance array d1.
     * This array will store distances from node 0.
     * All distances are initially set to 'n' (a large value representing infinity).
     */
    d1 = new Array( n ) . fill( n ) ;

    // The distance from node 0 to itself is 0.
    d1[ 0 ] = 0 ;

    /*
     * Initialize distance array d2.
     * This array will store distances from node n-1.
     * All distances are initially set to 'n'.
     */
    d2 = new Array( n ) . fill( n ) ;

    // The distance from node n-1 to itself is 0.
    d2[ n - 1 ] = 0 ;


    /*
     * This function calculates the shortest path distances from a starting node 'x'
     * to all other nodes in the graph, using a modified Dijkstra-like approach.
     * 'd' is the distance array to be updated.
     */
    function f( x , d ) {

        // Initialize a queue with all node indices.
        queue = new Array( n ) ;
        for ( i = 0 ; i < n ; i++ ) {
            queue[ i ] = i ;
        }

        // Continue as long as there are nodes in the queue.
        while ( queue.length != 0 ) {

            // Iterate through all edges to update distances.
            for ( i = 0 ; i < n - 1 ; i++ ) {

                // If node 'a[i]' is the current node 'x',
                // and the path through 'x' to 'b[i]' is shorter than current 'd[b[i]]'.
                if ( a[ i ] == x && d[ b[ i ] ] > d[ a[ i ] ] ) {
                    d[ b[ i ] ] = d[ a[ i ] ] + 1 ; // Update distance to 'b[i]'.
                }

                // If node 'b[i]' is the current node 'x',
                // and the path through 'x' to 'a[i]' is shorter than current 'd[a[i]]'.
                if ( b[ i ] == x && d[ a[ i ] ] > d[ b[ i ] ] ) {
                    d[ a[ i ] ] = d[ b[ i ] ] + 1 ; // Update distance to 'a[i]'.
                }
            }

            // Remove the current node 'x' from the queue.
            queue.splice( queue.indexOf( x ) , 1 ) ;

            // Find the next node to process: the one in the queue with the minimum distance.
            var min = n ; // Initialize min distance to a large value.
            for ( i = 0 ; i < queue.length ; i++ ) {
                if ( d[ queue[ i ] ] < min ) {
                    x = queue[ i ] ; // Update 'x' to the node with minimum distance.
                    min = d[ queue[ i ] ] ; // Update minimum distance.
                }
            }
        }
        return d ; // Return the updated distance array.
    }

    // Calculate distances from node 0 and store them in d1.
    d1 = f( 0 , d1 ) ;

    // Calculate distances from node n-1 and store them in d2.
    d2 = f( n - 1 , d2 ) ;

    // Initialize a counter 'x' to count nodes closer to Fennec (node 0).
    var x = 0 ;

    // Iterate through all nodes (excluding 0 and n-1).
    for ( i = 0 ; i < n ; i++ ) {

        if ( i != 0 && i != n - 1 ) {

            // If a node 'i' is closer to node 0 (Fennec) or equidistant.
            if ( d1[ i ] <= d2[ i ] ) {
                x++ ; // Increment the counter for Fennec.
            }
        }
    }

    // Determine the winner.
    var ans = "Fennec" ; // Fennec is the default winner.

    // If the number of nodes closer to Fennec (x) is less than or equal to
    // the number of nodes closer to Snuke (n-2-x, considering nodes 0 and n-1 are excluded from count).
    if ( x <= n - 2 - x ) {
        ans = "Snuke" ; // Snuke wins.
    }

    // Output the name of the winner.
    console.log( '%s' , ans ) ;
}

// Read input from stdin and pass it to the Main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;