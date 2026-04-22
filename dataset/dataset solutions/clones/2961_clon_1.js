/*
 * This JavaScript code solves a tree coloring problem.
 * It reads graph data from standard input, constructs an adjacency list
 * representation of the tree, and then performs a traversal (BFS/DFS-like)
 * to assign colors to nodes based on edge weights.
 *
 * The coloring logic determines node colors (0 or 1) such that
 * if an edge (u, v) has weight 1 (odd), then color[v] is different from color[u].
 * If the edge has weight 0 (even), then color[v] is the same as color[u].
 *
 * The result is a newline-separated string of assigned colors for each node.
 */

// Output the result of the immediately invoked function expression (IIFE)
console.log ( function ( args ) {

  // Parse input: The first line contains N (number of nodes).
  // Subsequent N-1 lines contain u, v, w representing edges.
  const [ [N] , ...tmp ] = args . trim ( ) . split ( '\n' ) . map ( r => r . split ( ' ' ) . map ( v => v | 0 ) ) ;

  // Initialize an adjacency list for the tree. Each node initially has an empty list.
  const tree = Array . from ( { length : N } , _ => [ ] ) ;

  // Populate the tree adjacency list with edges.
  // Edges are bidirectional, so add to both u's and v's list.
  // Edge weights (w) are stored as 0 or 1 (w & 1).
  for ( let i = 0 ; i < N - 1 ; i ++ ) {
    const [ u , v , w ] = tmp [ i ] ; // Destructure edge data

    // Add edge (v, w&1) to u's list. Adjusting to 0-indexed.
    tree [ u - 1 ] . push ( [ v - 1 , w & 1 ] ) ;

    // Add edge (u, w&1) to v's list. Adjusting to 0-indexed.
    tree [ v - 1 ] . push ( [ u - 1 , w & 1 ] ) ;
  }


  // Initialize an array to store node colors. NaN indicates uncolored.
  const color = Array . from ( { length : N } , _ => NaN ) ;

  // Start coloring from node 0, assigning it color 0.
  color [ 0 ] = 0 ;

  // Initialize a stack for traversal (DFS-like). Start with node 0.
  const stack = [ 0 ] ;

  // Perform traversal to color all connected nodes.
  while ( stack . length ) {
    const u = stack . pop ( ) ; // Get the current node from the stack

    // Iterate through all neighbors of the current node u.
    for ( const [ v , w ] of tree [ u ] ) {

      // If neighbor v is already colored, skip it.
      if ( isFinite ( color [ v ] ) ) continue ;

      // Push uncolored neighbor onto the stack for future processing.
      stack . push ( v ) ;

      // Determine the color of neighbor v based on edge weight w and current node u's color.
      if ( w ) {
        // If edge weight is 1 (odd), flip the color of u for v.
        // ~color[u] flips bits, &1 isolates the LSB (0 becomes 1, 1 becomes 0).
        color [ v ] = ~ color [ u ] & 1 ;
      } else {
        // If edge weight is 0 (even), v gets the same color as u.
        color [ v ] = color [ u ] ;
      }
    }
  }

  // Join the array of colors into a single string, separated by newlines.
  return color . join ( '\n' ) ;

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // End of IIFE and console.log