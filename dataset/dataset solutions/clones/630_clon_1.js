/*
 * This file contains a JavaScript program to solve a graph traversal problem.
 * It reads input from stdin, processes it, and then outputs a result to stdout.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Purpose: Demonstrate Type I code cloning - exact logical equivalence with
 *          variations only in whitespace and comments.
 */

// Import the 'fs' module for file system operations.
var input = require('fs') .readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Split the input string into an array of lines based on newline characters.
var lines = input .split ( '\n' ) ;


/*
 * Parse the first line of input to get N, M, and X.
 * N: number of nodes
 * M: number of edges
 * X: initial height
 */
var n = lines[0] .split ( ' ' ) [0] - 0 ; // Convert string to number
var m = lines[0] .split ( ' ' ) [1] - 0 ; // Another number
var x = lines[0] .split ( ' ' ) [2] - 0 ; // Yet another number


// Declare loop counters and auxiliary variables.
var i , j , k ;

// Initialize an array 'h' to store heights of nodes.
var h = Array ( n ) ;

// Initialize an adjacency list 'gl' for the graph.
var gl = Array ( n ) ;

// Initialize a stack for DFS/BFS-like traversal.
var stack = [ ] ;

// Loop to read node heights and initialize adjacency list entries.
for ( i = 0 ; i < n ; i ++ ) { // Iterate from 0 to N-1
  h [ i ] = lines [ i + 1 ] - 0 ; // Assign height for node 'i'
  gl [ i ] = [ ] ; // Initialize an empty array for node 'i's neighbors
}


// Declare temporary variables for edge processing.
var temp , a , b , t ;

// Loop to read and process graph edges.
for ( i = 0 ; i < m ; i ++ ) {
  // Split the line containing edge information.
  temp = lines [ i + n + 1 ] .split ( ' ' ) ;

  // Parse start node, end node, and travel time/cost.
  a = temp [ 0 ] - 1 ; // Adjust to 0-indexed
  b = temp [ 1 ] - 1 ; // Adjust to 0-indexed
  t = temp [ 2 ] - 0 ; // Travel time/cost

  // Add edge (a, b) to the adjacency list.
  gl [ a ] .push ( {
    next : b , // Destination node
    t : t      // Travel time
  } ) ;

  // Add edge (b, a) (assuming an undirected graph).
  gl [ b ] .push ( {
    next : a , // Destination node
    t : t      // Travel time
  } ) ;
}

// Push the starting state onto the stack.
// p: current node, t: total time elapsed, height: current height, history: path taken
stack .push ( {
  p : 0 ,           // Starting node is 0
  t : 0 ,           // Initial time is 0
  height : x ,      // Initial height is 'x'
  history : [ 0 ]   // Path starts with node 0
} ) ;


// Declare variables for traversal.
var node , next , obj , goal ;

// Initialize minimum time to infinity.
var min = Infinity ;

// Main traversal loop (while stack is not empty).
while ( stack .length > 0 )
{
  node = stack .pop ( ) ; // Get the last element from the stack

  // Iterate through neighbors of the current node.
  for ( i = 0 ; i < gl [ node .p ] .length ; i ++ ) {
    obj = gl [ node .p ] [ i ] ; // Get neighbor object
    next = obj .next ;           // Get next node index

    // Check if the next node has already been visited in the current path.
    if ( node .history .indexOf ( next ) !== -1 ) {
      continue ; // Skip if already visited
    }

    // Check if current node's height is sufficient to cross the edge.
    if ( h [ node .p ] < obj .t ) {
      continue ; // Not enough height, skip
    }

    /*
     * Three main conditions for pushing new states onto the stack,
     * based on height dynamics.
     */
    if ( h [ next ] + obj .t < node .height ) {
      // Condition 1: Next node's height + travel time is less than current height.
      stack .push ( {
        p : next ,                                            // Next node
        t : node .t + obj .t + node .height - ( h [ next ] + obj .t ) , // Calculate new time
        height : h [ next ] ,                                 // New height is next node's height
        history : node .history .concat ( next )              // Add next node to history
      } ) ;
    }
    else if ( h [ next ] + obj .t >= node .height && node .height >= obj .t ) {
      // Condition 2: Next node's height + travel time is greater than or equal to current height,
      // and current height is greater than or equal to travel time.
      stack .push ( {
        p : next ,                                    // Next node
        t : node .t + obj .t ,                        // Calculate new time
        height : node .height - obj .t ,              // New height
        history : node .history .concat ( next )      // Add next node to history
      } ) ;
    }
    else {
      // Condition 3: Default case.
      stack .push ( {
        p : next ,                                        // Next node
        t : node .t + obj .t + obj .t - node .height ,    // Calculate new time
        height : 0 ,                                      // Height becomes 0
        history : node .history .concat ( next )          // Add next node to history
      } ) ;
    }

    // If the next node is the target node (n-1).
    if ( next === n - 1 ) {
      goal = stack .pop ( ) ; // Retrieve the state that just reached the goal
      // Update minimum time if current path is shorter.
      min = Math .min ( min , goal .t + h [ n - 1 ] - goal .height ) ;
    }
  }
}

// Check if a path to the target was found.
if ( min === Infinity ) {
  // If min is still Infinity, no path was found.
  console .log ( -1 ) ;
}
else {
  // Otherwise, print the minimum time.
  console .log ( min ) ;
}
// End of program.