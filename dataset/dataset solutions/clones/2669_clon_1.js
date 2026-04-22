var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' )
  . split("\n")
    . map( ( s ) =>
      {
        return s.split(" ")
          .map ( ( i ) =>
            {
              return i - 0 ; // Convert string segment to a numeric value
            }
          ) ;
      }
    ) ;

// Extracting initial parameters from the parsed input's first line.
var N = input[0][0] ; // N: Represents the total number of nodes in the graph.
var E = input[0][1] ; // E: Represents the number of edges (not explicitly used here).
var P = input[0][2] ; // P: The target or destination node for the traversal.

input . unshift ( ) ; // NOTE: This operation adds an element to the beginning of the array.
                      // If the intent was to remove the first element (e.g., header line),
                      // 'shift()' would be used. Per Type I rules, this must remain unchanged.


/*
 *  Data structure initialization for graph representation.
 *  'data' will serve as an adjacency list, mapping node IDs to their outgoing edges.
 */
var data = { } ;

// Initialize adjacency lists for nodes from 1 up to N-1.
for ( var i = 1 ; i < N ; i++ )
  {
    data[i] = [ ] ; // Each node starts with an empty list of neighbors.
  }

// Populate the adjacency list using the remaining input lines.
// Each input line (after the first) represents an edge: [source, destination, weight].
input . forEach ( ( i ) =>
  {
    data[i[0]] . push ( [ i[1] , i[2] ] ) ; // Adds an edge from i[0] to i[1] with weight i[2].
  }
) ;


// --- Main Logic Encapsulated in an Immediately Invoked Function Expression (IIFE) ---
( ( ) => {

  // Variables to manage the depth-first search (DFS) traversal.
  var route     = [ 1 ] ; // Tracks the sequence of nodes visited in the current path. Starts at node 1.
  var gain      = [ 0 ] ; // Accumulates the weights/gains along the current 'route'.
  var pathStack = [ Array . from ( data[1] ) ] ; // Stores alternative paths to explore; essentially a stack of path lists.
                                                 // Initialized with paths from the starting node (node 1).
  var paths     = pathStack . pop ( ) ; // The current list of paths (edges) to explore from the current node.
  var ans       = -1 ; // Stores the maximum "gain" found across all valid paths to node 'P'. Initialized to -1.


  // The core traversal loop. This is a modified iterative DFS.
  do {

    var path = paths . pop ( ) ; // Get the next edge/path segment to explore from the current 'paths'.
    var p    = path[0] ;         // 'p' is the destination node of this 'path' segment.

    //console.log("> " +  route + " - " + p); // Original debug comment, kept as-is.

    // Check if the current node 'p' is the target node 'P'.
    if ( p == P )
      {
        // If 'P' is reached, calculate the total gain for this specific path.
        // Then, update 'ans' if this path's gain is greater than the previously recorded maximum.
        ans = Math . max (
          gain . reduce ( ( pAccumulator , iCurrent ) => {
            return pAccumulator + iCurrent ; // Sums all elements in the 'gain' array.
          } , 0 ) ,
          ans
        ) ;
      }

    // Check for cycles: if 'p' is already in the current 'route', we've found a cycle
    // or revisited a node in the current traversal branch.
    if ( route . indexOf ( p ) == -1 )
      {
        // If 'p' has NOT been visited in the current 'route' (no cycle detected for this branch):
        if ( data[p] . length > 0 )
          {
            // If node 'p' has outgoing edges (i.e., it's not a dead end from this perspective):
            pathStack . push ( paths ) ; // Push the remaining unexplored paths from the current level onto the stack.
            paths = Array . from ( data[p] ) ; // 'paths' now becomes the list of edges originating from node 'p'.
            route . push ( p ) ; // Add node 'p' to the current route.
            gain . push ( path[1] ) ; // Add the gain associated with traversing to node 'p'.
            continue ; // Continue to the next iteration of the 'do-while' loop to explore from 'p'.
          }
      }
    else
      {
        //console.log("loop detected"); // Original debug comment, kept as-is.
        // A loop was detected, or 'p' is already part of the current path.
        // In this specific logic, it means we don't explore further down this branch from 'p'.
      }

    // Backtracking logic: If the current set of 'paths' (from the current node) is exhausted,
    // we need to go back up the call stack (simulate popping from recursion stack).
    while ( paths . length == 0 )
      {
        route . pop ( ) ; // Remove the last node from the route (backtrack one step).
        gain . pop ( ) ; // Remove the corresponding gain.

        // If there are previous sets of paths stored in 'pathStack', restore them.
        if ( pathStack . length > 0 )
          {
            paths = pathStack . pop ( ) ; // Restore the previous set of paths to explore.
          }
        else
          {
            //console.log("bye"); // Original debug comment, kept as-is.
            // If 'pathStack' is also empty, it means all possible paths have been explored.
            return ; // Exit the IIFE, effectively ending the program's main logic.
          }
      }

  } while ( true ) ; // The loop continues indefinitely until a 'return' statement is hit.


} ) ( ) ; // End of the IIFE.


// Finally, print the maximum gain found to standard output.
console . log ( ans ) ;