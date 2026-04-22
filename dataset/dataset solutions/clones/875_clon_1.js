// This file contains a JavaScript implementation for a graph-related problem, likely involving
// a Union-Find data structure and a modified Kruskal's algorithm.
// The creation date is noted below.
// Original creation date: 2013-10-10, by hiroqn.

// --- Global Variable Declarations and Initialization ---

var fs = require('fs') , // File system module for I/O operations.
    length = fs.fstatSync( process.stdin.fd ).size , // Get the size of the standard input file descriptor.
    buffer = new Buffer( length ) , // Create a buffer to hold the input data.
    bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 ) , // Read data from stdin into the buffer.
    input = buffer.toString( 'utf8' , 0 , bytesRead ) . split( '\n' ) ; // Convert buffer to UTF-8 string and split by newline.

// Call the main function to start program execution.
main( ) ;

/**
 * Implements a Union-Find (Disjoint Set) data structure.
 * @param {number} n - The number of elements in the set.
 * @returns {object} An object containing methods for Union-Find operations.
 */
function UF ( n ) { // union find structure definition starts here
  var i , // Loop counter variable.
      par = [ ] ; // The parent array, stores parent of i or negative size of set if i is root.

  // Initialize each element as a separate set (its own root).
  for ( i = 0 ; i < n ; i ++ ) {
    par [ i ] = -1 ; // -1 indicates it's a root and its set has size 1.
  }

  /**
   * Unites the sets containing elements x and y.
   * Uses union by size/rank heuristic.
   * @param {number} x - The first element.
   * @param {number} y - The second element.
   * @returns {boolean} True if a union occurred (x and y were in different sets), false otherwise.
   */
  function union ( x , y ) {
    x = find ( x ) ; // Find the root of x's set.
    y = find ( y ) ; // Find the root of y's set.

    if ( x !== y ) { // If they are in different sets, perform union.
      if ( par [ x ] < par [ y ] ) { // x's set is larger (more negative par[x]).
        par [ x ] += par [ y ] ; // Add y's set size to x's set.
        par [ y ] = x ; // Make x the parent of y.
      } else { // y's set is larger or equal.
        par [ y ] += par [ x ] ; // Add x's set size to y's set.
        par [ x ] = y ; // Make y the parent of x.
      }
    }
    return x !== y ; // Return true if a union happened.
  }

  /**
   * Finds the representative (root) of the set containing element x.
   * Uses path compression heuristic.
   * @param {number} x - The element to find the root for.
   * @returns {number} The root of the set containing x.
   */
  function find ( x ) {
    // If par[x] is negative, x is the root. Otherwise, recursively find parent and compress path.
    return par [ x ] < 0 ? x : par [ x ] = find ( par [ x ] ) ;
  }

  /**
   * Counts the number of disjoint sets among the 'using' elements.
   * @param {boolean[]} using - An array indicating which elements are currently 'in use'.
   * @returns {number} The count of distinct sets among 'using' elements.
   */
  function count ( using ) {
    var c = 0 ; // Initialize counter for distinct sets.
    for ( i = 0 ; i < n ; i ++ ) {
      // If the element is 'in use' and it's a root (par[i] < 0), increment count.
      if ( using [ i ] && par [ i ] < 0 ) {
        c ++ ; // Increment the count of roots.
      }
    }
    return c ; // Return the total count of distinct sets.
  }

  /**
   * Checks if two elements x and y are in the same set.
   * @param {number} x - The first element.
   * @param {number} y - The second element.
   * @returns {boolean} True if x and y are in the same set, false otherwise.
   */
  function same ( x , y ) {
    return find ( x ) === find ( y ) ; // Compare their roots.
  }

  // Return an object with public methods.
  return {
    union : union , // Expose the union operation.
    find : find , // Expose the find operation.
    count : count , // Expose the count operation.
    same : same // Expose the same set check.
  } ;
}

/**
 * The main function where the program logic resides.
 * Processes input data to solve a specific problem (likely a variation of MST).
 */
function main ( ) {
  var temp , n , m , // Temporary variables, number of nodes, number of edges.
      i , j , k , // Loop counters.
      h , // Array to store node data (e.g., days).
      edges , e , // Array to store edge data, single edge temp var.
      uf , // Union-Find instance.
      res , // Result variable.
      use ; // Array to track which nodes are currently 'in use'.

  while ( true ) { // Loop indefinitely until an explicit break condition is met.
    temp = input . shift ( ) . split ( ' ' ) ; // Read a line, split by space.
    n = + temp [ 0 ] ; // Parse first part as number of nodes.
    m = + temp [ 1 ] ; // Parse second part as number of edges.

    if ( n === 0 ) { // If number of nodes is 0, it's the termination condition.
      break ; // Exit the while loop.
    }

    h = [ ] ; // Initialize array for node properties.
    use = [ ] ; // Initialize array to track used nodes.

    for ( i = 0 ; i < n ; i ++ ) { // Loop to read node-specific data.
      h [ i ] = { // Create an object for each node.
        node : i , // Store original node index.
        days : + input . shift ( ) // Read and parse 'days' property for the node.
      } ;
      use [ i ] = false ; // Initialize all nodes as not 'in use'.
    }
    edges = [ ] ; // Initialize array to store graph edges.

    for ( i = 0 ; i < m ; i ++ ) { // Loop to read edge data.
      temp = input . shift ( ) . split ( ' ' ) ; // Read a line, split by space.
      edges [ i ] = [ temp [ 0 ] - 1 , temp [ 1 ] - 1 , temp [ 2 ] - 0 ] ; // Store edge: u, v, weight. Adjust indices.
    }

    // Sort the 'h' array based on the 'days' property in ascending order.
    h . sort ( function ( a , b ) {
      return a . days - b . days ;
    } ) ;

    // Sort the 'edges' array based on the edge weight (third element) in ascending order.
    edges . sort ( function ( e1 , e2 ) {
      return e1 [ 2 ] - e2 [ 2 ] ;
    } ) ;

    uf = UF ( n ) ; // Create a new Union-Find instance for 'n' nodes.
    res = 0 ; // Initialize the result (e.g., total weight) to 0.

//    The following commented-out block appears to be an implementation
//    of a specific algorithm, possibly a variation of Kruskal's for a
//    minimum spanning tree or similar problem, but it is currently
//    disabled in the provided code.
//
//    for ( i = n - 1 ; i >= 0 ; i -- ) {
//      use [ h [ i ] . node ] = true ;
//      while ( i > 0 && h [ i ] . days === h [ i - 1 ] . days ) {
//        i -- ;
//        use [ h [ i ] . node ] = true ;
//      }
//      // Kruskal's logic for selected nodes
//      for ( j = 0 ; j < m ; j ++ ) {
//        e = edges [ j ] ;
//        if ( use [ e [ 0 ] ] && use [ e [ 1 ] ] && ! uf . same ( e [ 0 ] , e [ 1 ] ) ) {
//          uf . union ( e [ 0 ] , e [ 1 ] ) ;
//          res += e [ 2 ] ;
//        }
//      }
//      if ( uf . count ( use ) > 1 ) {
//        res = 0 ;
//        uf = UF ( n ) ;
//      }
//    }

    console . log ( res ) ; // Output the computed result to the console.
  }
}