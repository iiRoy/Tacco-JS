/*
 * This comprehensive JavaScript code snippet demonstrates
 * the implementation of a Depth-First Search (DFS) algorithm.
 * It is designed to process graph data provided via standard input,
 * perform a full traversal, and then output the discovery and finish
 * times for each node within the graph structure.
 */
( function ( stdin ) {
  // This section handles the initial parsing of the input data.
  // The entire input string is first trimmed of leading/trailing whitespace,
  // and then split into an array of individual lines based on the newline character.
  var lines = stdin . trim ( ) . split ( '\n' ) ;

  // The very first line of input is expected to contain the total number of nodes (N)
  // in the graph. We extract this value and convert it to an integer.
  var n = parseInt ( lines . shift ( ) , 10 ) ;

  // Initialization of core data structures required for graph representation and DFS.
  var nodes = [ ] ; // This array will store the adjacency list for each node.
                     // `nodes[i]` will contain an array of nodes adjacent to node `i+1`.
  var color = [ ] ; // This array tracks the visitation state of each node during DFS.
                     // Possible states: 'WHITE' (unvisited), 'GRAY' (visiting), 'BLACK' (visited).

  /*
   * We now iterate through the remaining lines of input.
   * Each subsequent line describes a node and its outgoing edges (adjacencies).
   */
  lines . forEach ( function ( nodeDefinitionLine ) {
    // For each line, we split it by spaces, convert the parts to numbers,
    // and then slice off the first two elements (typically node ID and degree count)
    // to obtain only the list of adjacent nodes.
    var adjs = nodeDefinitionLine . split ( ' ' ) . map ( Number ) . slice ( 2 ) ;

    // The extracted adjacency list is then added to our `nodes` array.
    nodes . push ( adjs ) ;

    // Concurrently, for each node, its initial color is set to 'WHITE',
    // indicating that it has not yet been visited by the DFS algorithm.
    color . push ( 'WHITE' ) ;
  } ) ; // End of the input parsing loop.


  // Variables dedicated to tracking time during the Depth-First Search.
  var time = 0 ; // A global counter that increments with each discovery or finish event.
  var d = [ ] ; // An array to store the 'discovery time' for each node.
                 // `d[i]` will hold the time when node `i+1` was first visited.
  var f = [ ] ; // An array to store the 'finish time' for each node.
                 // `f[i]` will hold the time when the DFS for node `i+1` and all its
                 // descendants has completed.

  /**
   * The core Depth-First Search function.
   * This recursive function explores as far as possible along each branch
   * before backtracking.
   *
   * @param {number} k The 1-based identifier of the node to start or continue DFS from.
   *                  This is converted to a 0-based index for array access.
   */
  function dfs ( k ) {
    // Convert the 1-based node ID to a 0-based array index for internal use.
    var id = k - 1 ;

    // Mark the current node as 'GRAY' to indicate that it is currently being visited.
    color [ id ] = 'GRAY' ;

    // Increment the global time counter and record it as the discovery time for this node.
    d [ id ] = ++ time ;

    /*
     * Iterate through all the nodes adjacent to the current node (`id`).
     * Each element `neighborId` in `nodes[id]` is a 1-based node identifier.
     */
    nodes [ id ] . forEach ( function ( neighborId ) {
      // Check if the adjacent node has not yet been visited ('WHITE').
      // If it's 'WHITE', it means we can explore this path further.
      if ( color [ neighborId - 1 ] == 'WHITE' ) {
        // Recursively call DFS on the unvisited adjacent node.
        dfs ( neighborId ) ;
      } // End of conditional check for unvisited neighbors.
    } ) ; // End of loop over adjacent nodes.

    // Once all descendants of the current node have been visited and processed,
    // mark the current node as 'BLACK' to signify that its DFS is complete.
    color [ id ] = 'BLACK' ;

    // Increment the global time counter again and record it as the finish time for this node.
    f [ id ] = ++ time ;
  } // End of the `dfs` function definition.

  // Initiate the Depth-First Search process.
  // By convention, we typically start DFS from node 1 (or the first node if 0-indexed).
  dfs ( 1 ) ;

  /*
   * After the DFS traversal is complete for all reachable nodes,
   * this loop iterates through all `n` nodes to print their results.
   * For each node, it outputs its 1-based ID, its discovery time, and its finish time.
   */
  for ( var i = 0 ; i < n ; i ++ ) {
    // Construct an array with the node ID (i+1), discovery time, and finish time,
    // then join these elements with a space and print to the console.
    console . log ( [ i + 1 , d [ i ] , f [ i ] ] . join ( ' ' ) ) ;
  } // End of the results printing loop.

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // The entire script is wrapped in an Immediately Invoked Function Expression (IIFE),
                                                                 // which directly reads the content of '/dev/stdin' as a UTF-8 string
                                                                 // and passes it as the `stdin` argument.