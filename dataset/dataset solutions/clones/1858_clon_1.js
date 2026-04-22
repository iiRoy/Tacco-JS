/*
 * This JavaScript module processes graph data from standard input.
 * It reads node and edge information to construct an adjacency list,
 * then performs a graph traversal (likely a form of BFS)
 * to determine connectivity or path information, finally outputting results.
 */
const input = require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" )

; ( ( input ) => { // This is an Immediately Invoked Function Expression (IIFE)

  // Split the entire input string into an array of lines.
  const rows = input . split ( '\n' )


  // Parse the number of nodes (N) and edges (M) from the first line of input.
  // The values are expected to be space-separated integers.
  const N = parseInt ( rows[0] . split ( ' ' ) [0] , 10 ) // N represents the total count of nodes.
  const M = parseInt ( rows[0] . split ( ' ' ) [1] , 10 ) // M represents the total count of edges.

  // Initialize two empty arrays, A and B, to store the endpoints of each edge.
  // A[i] and B[i] will form an edge (A[i], B[i]).
  const A = [ ]
  const B = [ ]

  // Loop through the input rows, starting from the second line (index 1),
  // to populate the A and B arrays with edge information.
  // Each subsequent row (after the first) defines an edge.
  for ( var i = 0 ; i < M ; i++ ) {
    A[i] = parseInt ( rows[i + 1] . split ( ' ' ) [0] , 10 ) // First node of the i-th edge.
    B[i] = parseInt ( rows[i + 1] . split ( ' ' ) [1] , 10 ) // Second node of the i-th edge.
  }

  // Create an adjacency list representation of the graph.
  // 'map' will be an array where map[k] contains a list of neighbors of node k.
  // The graph is 1-indexed, so we create N+1 entries and fill them with empty arrays.
  const map = Array ( N + 1 ) . fill ( null ) . map ( ( ) => [ ] )

  // Populate the adjacency list using the A and B arrays.
  // Since the graph is undirected, add each node to the other's neighbor list.
  for ( let i = 0 ; i < M ; i++ ) {
    map [ A[i] ] . push ( B[i] ) // Add B[i] as a neighbor of A[i].
    map [ B[i] ] . push ( A[i] ) // Add A[i] as a neighbor of B[i].
  }

  // 'res' array will store the "parent" node for each node during traversal,
  // used to reconstruct paths or check reachability.
  // The index `k-1` in `res` corresponds to node `k`.
  const res = [ ]

  // 's' acts as a queue for a Breadth-First Search (BFS) or similar traversal.
  // It is initialized with the starting node, which is 1.
  const s = [ 1 ]

  // 'n' will temporarily hold the current node being processed from the queue.
  let n = 0

  // Main traversal loop: continues as long as there are nodes in the queue 's'.
  while ( ( n = s . shift ( ) ) ) { // Dequeue the next node.

    // This inner loop's purpose is ambiguous in the context of graph traversal.
    // It iterates M times, and if A[i] is ever 0, it breaks.
    // Given A[i] are node IDs (typically > 0), this condition might rarely trigger.
    // It doesn't directly influence the graph traversal logic of map[n].forEach.
    for ( var i = 0 ; i < M ; i++ ) {
      if ( !A[i] ) { // If A[i] is 0 (falsy), break out of this inner loop.
        break
      }
      // For each neighbor '_n' of the current node 'n':
      map[n] . forEach ( _n => {
        // If this neighbor '_n' has not yet been visited (i.e., its entry in 'res' is undefined):
        if ( res [ _n - 1 ] === undefined ) {
          s . push ( _n ) // Add '_n' to the queue to be visited later.
          res [ _n - 1 ] = n // Record 'n' as the "parent" or predecessor of '_n'.
        }
      } ) // End of forEach over neighbors.
    } // End of inner for loop.
  } // End of while loop (traversal).

  // After traversal, check the 'res' array.
  // If 'res' contains 0, it means some nodes were not reached (their entries might be implicitly 0 if not set).
  // The problem's specific output format dictates how to interpret this.
  if ( res . indexOf ( 0 ) === -1 ) {
    res [0] = 'Yes' // This line specifically sets the first element to 'Yes'.
    // Then, iterate through the 'res' array and print each value.
    res . forEach ( val => {
      console . log ( val )
    } )
  } else {
    // If 0 is found in 'res', it indicates a failure condition (e.g., graph not fully connected).
    console . log ( 'No' )
  }

} ) ( input ) // The IIFE is executed immediately with 'input' as its argument.