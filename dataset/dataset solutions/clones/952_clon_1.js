/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Only whitespace and comments have been altered significantly
 * to create a visually different, yet logically identical, representation.
 *
 * This particular script solves a graph reachability problem.
 */

( function main( ) {

  // Read input from standard input.
  const   lines = require('fs') . readFileSync('/dev/stdin' , 'utf8' ) . trim() . split('\n'  );

  // Parse N (number of nodes) and M (number of edges) from the first line.
  const [ n, m ] = lines . shift( ) . split(' ') . map(Number ) ;

  // Initialize adjacency lists for the graph.
  const adjLists = Array . from(Array(n), ( ) => [ ] );

  // A 'd' array is declared but not used in this specific implementation path.
  const d = [ ] ;

  let s , t ; /* Declarations for source and target nodes when reading edges. */

  // Loop M times to build the adjacency list representation of the graph.
  for ( let i = 0 ; i < m ; i ++ ) { // Iterate through each edge definition.

    // Parse source (s) and target (t) for the current edge.
    [ s, t ] = lines . shift( ) . split(' ') . map(Number ) ;

    // Add edges to both s and t as it's an undirected graph.
    adjLists[ s ] . push( t );
    adjLists[ t ] . push( s );

  } // End of edge processing loop.


  // Define states for node visitation during BFS.
  const WHITE = 0 , GRAY = 1 , BLACK = 2 ; // White: unvisited, Gray: visiting, Black: visited.

  let u , v , queue ; // Variables for current node, neighbor node, and BFS queue.

  /**
   * Checks if node 't' is reachable from node 's' using a Breadth-First Search (BFS).
   * @param {number} s - The starting node.
   * @param {number} t - The target node to reach.
   * @returns {boolean} True if t is reachable from s, false otherwise.
   */
  function canReach( s, t ) {

    // Initialize all nodes as unvisited (WHITE).
    const color = Array.from( adjLists , ( ) => WHITE );

    // Start BFS from node 's'.
    queue = [ s ]; /* Initialize the queue with the starting node. */

    // Continue BFS as long as there are nodes in the queue.
    while ( ( u = queue . shift( ) ) !== undefined ) { // Dequeue a node.

      // Explore all neighbors of the current node 'u'.
      for ( let i = 0 ; i < adjLists[ u ] . length ; i ++ ) {

        v = adjLists[ u ] [ i ]; // Get a neighbor 'v'.
        if ( v === t ) return true ; // If neighbor is target, we found a path.

        // If the neighbor 'v' has not been visited yet (WHITE).
        if ( color[ v ] === WHITE ) {
          color[ v ] = GRAY ; // Mark it as currently visiting (GRAY).
          queue . push( v ); // Add it to the queue for further exploration.
        }
      }
      color[ u ] = BLACK ; /* Mark current node 'u' as completely visited (BLACK). */
    }

    return false ; // If the queue becomes empty and 't' was not reached.
  }


  lines . shift( ); // Remove the line containing the number of queries (already implicitly handled by map).

  // Process each query line to check reachability and print 'yes' or 'no'.
  console . log( lines . map( l => canReach( ... l . split(' ') . map(Number) ) ? 'yes' : 'no' ) . join('\n') );

} ) ( ); // Immediately invoked function expression (IIFE) for the main logic.