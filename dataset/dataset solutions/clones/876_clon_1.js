/*
 * This file contains the implementation for processing graph data.
 * Original creation date: 2013-10-10
 * Author: hiroqn
 */
var fs = require('fs'), // File system module for I/O operations
    length = fs.fstatSync( process.stdin.fd ).size, // Get size of standard input
    buffer = new Buffer( length ), // Allocate buffer to hold input
    bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 ), // Read data into buffer
    input = buffer.toString( 'utf8', 0, bytesRead ).split( '\n' ); // Convert buffer to string, split by newlines

// Start the main execution flow of the program.
main( );

/**
 * Implements a Union-Find (Disjoint Set Union) data structure.
 * This structure efficiently keeps track of a partitioning of a set into disjoint subsets.
 *
 * @param {number} n The number of elements in the set (0 to n-1).
 * @returns {object} An object containing methods for Union-Find operations.
 */
function UF( n )
{
  // Declare local variables for the Union-Find instance.
  var i,
      par = [ ]; // Parent array: par[i] stores the parent of element i, or -1 if i is a root.

  // Initialize each element as its own parent (a root of a new set).
  for ( i = 0 ; i < n ; i++ )
  {
    par[ i ] = -1; // -1 indicates a root, and its absolute value can store the size of the set.
  }

  /**
   * Unites the sets containing elements x and y.
   * Uses union by size/rank heuristic.
   *
   * @param {number} x First element.
   * @param {number} y Second element.
   * @returns {boolean} True if a union occurred (x and y were in different sets), false otherwise.
   */
  function union( x, y )
  {
    x = find( x ); // Find the root of x's set.
    y = find( y ); // Find the root of y's set.

    // If x and y are not already in the same set, unite them.
    if ( x !== y )
    {
      // Union by size/rank: attach smaller tree under root of larger tree.
      // par[root] stores negative of the size of the tree.
      if ( par[ x ] < par[ y ] )
      {
        par[ x ] += par[ y ]; // Update size of new root's tree.
        par[ y ] = x;         // Make x the parent of y.
      }
      else
      {
        par[ y ] += par[ x ]; // Update size of new root's tree.
        par[ x ] = y;         // Make y the parent of x.
      }
    }
    return x !== y; // Return true if union happened.
  }

  /**
   * Finds the representative (root) of the set containing element x.
   * Uses path compression heuristic.
   *
   * @param {number} x The element to find the set for.
   * @returns {number} The root of the set containing x.
   */
  function find( x )
  {
    // If x is a root (par[x] is negative), return x.
    // Otherwise, recursively find the root and compress the path.
    return par[ x ] < 0 ? x : par[ x ] = find( par[ x ] );
  }

  /**
   * Counts the number of disjoint sets among 'using' elements.
   *
   * @param {Array<boolean>} using A boolean array indicating which elements are currently 'in use'.
   * @returns {number} The count of distinct sets whose root elements are marked as 'in use'.
   */
  function count( using )
  {
    var c = 0; // Initialize counter for disjoint sets.
    // Iterate through all elements.
    for ( i = 0 ; i < n ; i++ )
    {
      // If the element is 'in use' AND it is a root of a set, increment counter.
      if ( using[ i ] && par[ i ] < 0 )
      {
        c++; // Increment the count of distinct components.
      }
    }
    return c; // Return the total count.
  }

  /**
   * Checks if two elements x and y are in the same set.
   *
   * @param {number} x First element.
   * @param {number} y Second element.
   * @returns {boolean} True if x and y are in the same set, false otherwise.
   */
  function same( x, y )
  {
    return find( x ) === find( y ); // Compare their roots.
  }

  // Return an object exposing the public methods of the Union-Find structure.
  return {
    union: union,
    find: find,
    count: count,
    same: same
  };
}


/**
 * The main function of the program.
 * Reads input, processes graph data using Kruskal-like algorithm and Union-Find,
 * and prints results.
 */
function main( )
{
  // Declare all variables used within the main function scope.
  var temp, n, m,
      i, j, k, // Loop counters and general purpose integers.
      h, // Array to store node data (node index and days).
      edges, e, // Array for edges, and a temporary variable for an individual edge.
      uf, // Union-Find instance.
      res, // Result accumulator (sum of edge weights).
      use; // Boolean array indicating which nodes are currently "in use".

  // Main processing loop; continues until a specific termination condition is met.
  while ( true )
  {
    // Read the first line for N (number of nodes) and M (number of edges).
    temp = input.shift( ).split( ' ' );
    n = +temp[ 0 ]; // Convert string to number for N.
    m = +temp[ 1 ]; // Convert string to number for M.

    // Termination condition: if N and M are both 0, exit the loop.
    if ( n === 0 && m === 0 )
    {
      break; // Exit the while loop.
    }

    h = [ ]; // Initialize array for node data.
    use = [ ]; // Initialize array for 'use' flags.

    // Read node data (days) for each node.
    for ( i = 0 ; i < n ; i++ )
    {
      h[ i ] = { // Store node index and its associated 'days' value.
        node: i,
        days: +input.shift( ) // Convert string to number.
      };
      use[ i ] = false; // Initially, no nodes are "in use".
    }

    edges = [ ]; // Initialize array for edges.

    // Read edge data (u, v, weight) for each edge.
    for ( i = 0 ; i < m ; i++ )
    {
      temp = input.shift( ).split( ' ' ); // Read edge details.
      // Store edge as [node1, node2, weight]. Convert strings to numbers and adjust node indices (0-based).
      edges[ i ] = [ temp[ 0 ] - 1, temp[ 1 ] - 1, temp[ 2 ] - 0 ];
    }

    // Sort nodes by their 'days' value in ascending order.
    h.sort( function ( a, b )
    {
      return a.days - b.days;
    } );

    // Sort edges by their weight in ascending order.
    edges.sort( function ( e1, e2 )
    {
      return e1[ 2 ] - e2[ 2 ];
    } );

    uf = UF( n ); // Initialize Union-Find structure for 'n' nodes.
    res = 0; // Initialize result (sum of edge weights) to 0.

    // Iterate through nodes in reverse sorted order of 'days' (from largest days to smallest).
    for ( i = n - 1 ; i >= 0 ; i-- )
    {
      use[ h[ i ].node ] = true; // Mark the current node as "in use".

      // Handle nodes with the same 'days' value.
      while ( i > 0 && h[ i ].days === h[ i - 1 ].days )
      {
        i--; // Move to the previous node.
        use[ h[ i ].node ] = true; // Mark this node as "in use" as well.
      }

      // Iterate through all sorted edges.
      for ( j = 0 ; j < m ; j++ )
      {
        e = edges[ j ]; // Get the current edge.

        // Check if both endpoints of the edge are "in use" AND they are not already connected.
        if ( use[ e[ 0 ] ] && use[ e[ 1 ] ] && !uf.same( e[ 0 ], e[ 1 ] ) )
        {
          uf.union( e[ 0 ], e[ 1 ] ); // Union the sets of the two nodes.
          res += e[ 2 ]; // Add the edge's weight to the total result.
        }
      }

      // If the number of connected components among 'in use' nodes is greater than 1,
      // it implies that a valid MST cannot be formed under current 'days' constraint.
      if ( uf.count( use ) > 1 )
      {
        res = 0; // Reset result as this path is invalid.
        uf = UF( n ); // Re-initialize Union-Find for a fresh start for the next iteration (if any).
        // The commented out break suggests an optimization that was considered or removed.
        /*
         * This break statement was likely used for debugging or an alternative logic path.
         * For this problem, it is kept commented as per the original code.
         */
        // break;
      }
    }
    console.log( res ); // Output the final calculated result for the current test case.
  }
}