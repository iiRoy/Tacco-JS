var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )
    . split ( "\n" ) . map ( ( s ) => {
        return   s . split ( " " ) . map ( ( i ) => {
            return   i   -   0 ;
        } ) ;
    } ) ;

/*
 * Initialize main variables.
 * N: Number of nodes in the graph.
 * P: Penalty for each step.
 */
var N = input [ 0 ] [ 0 ] ;
/* The variable E (input[0][1]) is commented out in the original and not used.
 * We keep it commented out to maintain logical equivalence. */
// var E = input[0][1];
var P = input [ 0 ] [ 2 ] ;

// Remove the first line of input as it contains N, E, P which are already processed.
input . shift ( ) ;

// Data structure to store the graph: an adjacency list.
var data = { } ;

/* Initialize an empty array for each node in the graph.
 * Nodes are numbered from 1 to N. */
for   ( var   i   =   1 ;   i   <=   N ;   i ++ )   {
    data [ i ]   =   [ ] ;
}

/* Populate the adjacency list from the input.
 * Each input line (after the first) represents an edge: [from_node, to_node, gain]. */
input . forEach ( ( i ) => {
    // Add the destination node and the gain for the edge to the source node's list.
    data [ i [ 0 ] ] . push ( [ i [ 1 ] ,   i [ 2 ] ] ) ;
} ) ;

// Variable to store the maximum gain found, initialized to -1.
var   ans   =   -1 ;

/*
 * Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.
 * This simulates a depth-first search (DFS) to find the optimal path.
 */
( ( )   =>   {

    // `route` stores the current path being explored (sequence of nodes).
    var   route   =   [ 1 ] ;
    // `gain` stores the cumulative gain from edges along the current path.
    var   gain   =   [ 0 ] ;

    /* `pathStack` stores arrays of possible paths from previous nodes
     * when backtracking occurs. */
    var   pathStack   =   [ Array . from ( data [ 1 ] ) ] ;
    // `paths` holds the available paths to explore from the current node.
    var   paths   =   pathStack . pop ( ) ;

    // Main loop for DFS traversal.
    do   {
        // Get the next path segment to explore.
        var   path   =   paths . pop ( ) ;
        // `p` is the next node to visit.
        var   p   =   path [ 0 ] ;

        // Uncomment for debugging path traversal:
        // console.log ( "> " + route + " - " + p ) ;

        // Check if the current node `p` is the target node `N`.
        if   ( p   ==   N )   {
            // A goal node has been reached. Calculate the score for this path.
            var   score   =   gain . reduce ( ( pAcc ,   iVal ) => {
                return   pAcc   +   iVal ;
            } ,   0 )   +   path [ 1 ]   -   P   *   ( route . length   +   1 ) ;
            // Update the maximum answer if the current score is higher.
            ans   =   Math . max ( score ,   ans ) ;
        }

        // Check if the node `p` has not been visited in the current route to avoid cycles.
        if   ( route . indexOf ( p )   ==   -1 )   {
            // If there are outgoing paths from node `p`.
            if   ( data [ p ] . length   >   0 )   {
                // Push the remaining paths from the current level onto the stack.
                pathStack . push ( paths ) ;
                // Set `paths` to the new set of paths from node `p`.
                paths   =   Array . from ( data [ p ] ) ;
                // Add `p` to the current route.
                route . push ( p ) ;
                // Add the gain from the edge leading to `p`.
                gain . push ( path [ 1 ] ) ;
                // Continue to the next iteration to explore from node `p`.
                continue ;
            }
        }   else   {
            // This branch is executed if a loop is detected.
            console . log ( "loop detected" ) ; // Log a message for cycle detection.
        }

        /*
         * Backtracking mechanism:
         * If there are no more paths to explore from the current node,
         * backtrack up the `pathStack`.
         */
        while   ( paths . length   ==   0 )   {
            // Remove the last node from the route.
            route . pop ( ) ;
            // Remove the last gain from the gain array.
            gain . pop ( ) ;

            // Check if there are previous paths on the stack to resume exploration.
            if   ( pathStack . length   >   0 )   {
                paths   =   pathStack . pop ( ) ; // Restore paths from the previous level.
            }   else   {
                // If the pathStack is empty, all possible routes have been explored.
                // console.log("bye"); // Debug message indicating completion.
                return ; // Exit the IIFE.
            }
        }
    }   while   ( true ) ; // Loop indefinitely until an explicit return is encountered.

} ) ( ) ; // End of the IIFE.

// Output the final maximum answer found.
console . log ( ans ) ; /* Display the result to the standard output. */