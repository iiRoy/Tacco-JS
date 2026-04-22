/* This JavaScript code reads input from stdin,
 * processes it to build a graph, and then performs a
 * depth-first search (or similar traversal) to find
 * a minimum value based on certain conditions.
 *
 * It simulates a pathfinding problem with dynamic height/time calculations.
 */

// Import the 'fs' module for file system operations.
var input = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// Split the entire input string into an array of lines.
var lines = input . split ( '\n' ) ;


// Parse the first line of input to get N, M, and X.
// N: number of nodes (vertices)
// M: number of edges
// X: initial height/energy
var n = lines [ 0 ] . split ( ' ' ) [ 0 ] - 0 ; // Convert string to number using subtraction
var m = lines [ 0 ] . split ( ' ' ) [ 1 ] - 0 ;
var x = lines [ 0 ] . split ( ' ' ) [ 2 ] - 0 ;


// Declare loop counters and auxiliary variables.
var i , j , k ;

// Initialize an array 'h' of size 'n' to store heights of nodes.
var h = Array ( n ) ;


// Initialize 'gl' (adjacency list) for the graph.
var gl = Array ( n ) ;

// Initialize the stack for the traversal algorithm.
var stack = [ ] ;

/* Loop to initialize node heights and adjacency list structures. */
for ( i = 0 ; i < n ; i ++ )
{
    // Read height for the current node from input lines.
    h [ i ] = lines [ i + 1 ] - 0 ;

    // Initialize an empty array for the adjacency list of node 'i'.
    gl [ i ] = [ ] ;
}

// Declare temporary variables for processing edges.
var temp , a , b , t ;

// Loop through the remaining lines to build the graph's adjacency list.
for ( i = 0 ; i < m ; i ++ )
{
    // Parse the current line representing an edge.
    temp = lines [ i + n + 1 ] . split ( ' ' ) ;

    // Extract node indices (0-based) and edge traversal time.
    a = temp [ 0 ] - 1 ; // Adjust to 0-based indexing
    b = temp [ 1 ] - 1 ; // Adjust to 0-based indexing
    t = temp [ 2 ] - 0 ; // Edge traversal time

    /* Add edge to adjacency list for both directions (undirected graph). */
    gl [ a ] . push ( {
        next : b , // Neighboring node
        t : t      // Time to travel to 'next'
    } ) ;

    gl [ b ] . push ( {
        next : a , // Neighboring node
        t : t      // Time to travel to 'next'
    } ) ;
}


// Push the starting node onto the stack.
// p: current node index
// t: total time elapsed
// height: current height/energy level
// history: path taken to reach this node
stack . push ( {
    p : 0 ,
    t : 0 ,
    height : x ,
    history : [ 0 ]
} ) ;


// Declare variables for processing nodes during traversal.
var node , next , obj , goal ;

// Initialize 'min' with a very large value (infinity) to find the minimum time.
var min = Infinity ;

// Main loop for the graph traversal (e.g., DFS variant).
while ( stack . length > 0 )
{
    // Pop a node from the stack to process.
    node = stack . pop ( ) ;

    // Iterate through all neighbors of the current node.
    for ( i = 0 ; i < gl [ node . p ] . length ; i ++ )
    {
        obj = gl [ node . p ] [ i ] ; // Get edge object (neighbor and travel time)
        next = obj . next ;           // The next node to potentially visit

        // Check if the next node has already been visited in the current path (to avoid cycles).
        if ( node . history . indexOf ( next ) !== -1 )
        {
            continue ; // Skip if already visited
        }

        // Check if current node's height is sufficient to traverse the edge.
        if ( h [ node . p ] < obj . t )
        {
            continue ; // Cannot traverse if height is less than edge time
        }

        // --- Different path exploration scenarios based on height conditions ---

        // Scenario 1: Next node's height + edge time is less than current height.
        if ( h [ next ] + obj . t < node . height )
        {
            // Push new state to stack.
            stack . push ( {
                p : next ,                                                   // Next node
                t : node . t + obj . t + node . height - ( h [ next ] + obj . t ) , // Updated total time
                height : h [ next ] ,                                        // New height becomes next node's height
                history : node . history . concat ( next )                   // Add next node to history
            } ) ;
        }
        // Scenario 2: Next node's height + edge time is sufficient and current height is also sufficient for the edge.
        else if ( h [ next + obj . t >= node . height && node . height >= obj . t ] ) // This condition looks suspicious, likely a typo in original: `h[next] + obj.t >= node.height`
        {
            // Push new state to stack.
            stack . push ( {
                p : next ,                         // Next node
                t : node . t + obj . t ,           // Updated total time
                height : node . height - obj . t , // Height decreases by edge time
                history : node . history . concat ( next )
            } ) ;
        }
        // Scenario 3: Default case if neither of the above conditions met.
        else
        {
            // Push new state to stack.
            stack . push ( {
                p : next ,                                       // Next node
                t : node . t + obj . t + obj . t - node . height , // Updated total time
                height : 0 ,                                     // Height becomes 0
                history : node . history . concat ( next )
            } ) ;
        }

        // Check if the target node (n-1) has been reached.
        if ( next === n - 1 )
        {
            // If target reached, pop the state, calculate final time, and update minimum.
            goal = stack . pop ( ) ; // Get the state that just reached the goal
            min = Math . min ( min , goal . t + h [ n - 1 ] - goal . height ) ; // Calculate and update min time
        }
    }
}

// Output the calculated minimum time to console.
console . log ( min ) ;