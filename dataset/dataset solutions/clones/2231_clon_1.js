var nodes        = []; /* This global array stores all node objects,
                                  each containing information about its connections
                                  and position within the tree structure. */
var restrictions = []; // This array will hold the calculated paths for each restriction.

// Edge naming convention: (smaller node index * 100) + (larger node index).
// This provides a unique integer identifier for each edge in the graph.

function Main( input ) {
  // The input string is initially a single block.
  // It is split into an array of strings, where each element is a line from the input.
  input = input.split( "\n" );


  /*
   * We use `parseInt()` with a radix of 10 to ensure correct conversion
   * from string representations to base-10 integer numbers.
   */
  var N = parseInt( input[0], 10 ); // N represents the total number of nodes in the graph.

  // Initialize the node data structures.
  // Each node gets a 'self' index, an empty 'child' array, 'depth' (initially 0), and 'parent' (initially null).
  for ( var i = 0; i < N; i++ ) {
    var data = {
      self: i,          // The 0-based index of this node in the 'nodes' array.
      child: [],        // An array to store the indices of its connected children.
      depth: 0,         // The depth of the node in the tree, relative to the root (node 0).
      parent: null      // The index of the parent node in the arranged tree.
      /*
       * The 'child' array will be populated with indices of other nodes
       * that are directly connected to this node.
       */
    };
    nodes.push( data ); // Add the newly created node object to the global 'nodes' array.
  }

  // Process the input lines to define the graph's edges (connections between nodes).
  // The original comment "NをNにいれる" appears to be a placeholder or mistranslation.
  for ( var i = 1; i < N; i++ ) {
    var tmp = input[i].split( " " ); // Split the current input line by space to get two node indices.
    var n1  = parseInt( tmp[0], 10 ); // Parse the first node index from the line.
    var n2  = parseInt( tmp[1], 10 ); // Parse the second node index from the line.

    // Adjust node indices to be 0-based (as they are 1-based in the input)
    // and add mutual connections to their respective 'child' arrays.
    nodes[n1 - 1].child.push( n2 - 1 );
    nodes[n2 - 1].child.push( n1 - 1 );
  }

  // Arrange the graph into a tree structure, starting with node 0 as the root.
  // This populates the 'parent' and 'depth' properties for all nodes.
  arrangement( nodes[0] );
  // At this point, the tree's structure (parent-child relationships and depths) is fully established.

  // Now, process the restrictions specified in the input.
  // Each restriction defines a pair of nodes for which a route must be calculated.
  var M = parseInt( input[N] ); // M is the total number of restrictions.
  for ( var i = N + 1; i <= N + M; i++ ) {
    var tmp = input[i].split( " " );
    var r1  = parseInt( tmp[0], 10 ); // First node involved in the restriction.
    var r2  = parseInt( tmp[1], 10 ); // Second node involved in the restriction.

    // Calculate the unique path (route) of edges between r1 and r2,
    // and add this path to the 'restrictions' array.
    restrictions.push( getRoute( r1 - 1, r2 - 1 ) );
  }

  // Compute the 'AND' combinations of these restrictions.
  // This typically refers to the union of edge sets for combinations of restrictions.
  var and = getAnd();


  var pattern = 0; // Initialize the pattern count, which will be adjusted based on restrictions.

  // Iterate through each key (representing a combination of restrictions) in the 'and' object.
  for ( var key in and ) {
    // If the number of '1's in the binary key is odd, add to the pattern.
    if ( countTargetString( key, "1" ) % 2 == 1 ) {
      pattern += Math.pow( 2, N - ( 1 + and[key].length ) );
    }
    // If the number of '1's in the binary key is even, subtract from the pattern.
    else {
      pattern -= Math.pow( 2, N - ( 1 + and[key].length ) );
    }
  }

  // Output the final result: total possible patterns minus the calculated 'pattern'.
  console.log( Math.pow( 2, N - 1 ) - pattern );
  // Original example of console.log, kept as a comment: console.log('%d %s', a + b + c, s);
}

/**
 * This function calculates combinations (unions) of restriction routes.
 * It builds up a map where keys are binary strings representing subsets of restrictions,
 * and values are the unique set of edges involved in that subset.
 *
 * @returns {Object} An object mapping binary string keys to arrays of unique edge identifiers.
 */
function getAnd() {
  var result = {}; // Initialize an object to store the computed combinations.

  // Iterate from 1 up to (2^number_of_restrictions - 1) to cover all non-empty subsets.
  for ( var i = 1; i < Math.pow( 2, restrictions.length ); i++ ) {
    var key = i.toString( 2 ); // Convert the integer 'i' to its binary string representation.

    // If the current combination 'key' represents a single restriction (only one '1' bit).
    if ( countTargetString( key, "1" ) == 1 ) {
      // The restriction is directly taken from the 'restrictions' array.
      // The index is determined by the length of the binary string 'key' minus 1,
      // assuming 'key' would be padded to match the restriction index if needed.
      result[key] = restrictions[key.length - 1];
    }
    // If the combination 'key' represents multiple restrictions.
    else {
      // Deconstruct the current key into two parts to compute its union recursively:
      // 'first' represents the highest bit set in 'key' as a power of 10-based string.
      // 'last' represents the remaining lower bits of 'key' as a binary string.
      var first = "" + key.substring( 0, 1 ) * Math.pow( 10, key.length - 1 );
      var last  = "" + parseInt( key.substring( 1, key.length ), 2 ).toString( 2 );

      // Calculate the union of the routes from 'first' and 'last' sub-combinations,
      // ensuring only unique edges are retained.
      result[key] = uniq( result[first].concat( result[last] ) );
    }
  }

  return result; // Return the object containing all combined restriction routes.
}

/**
 * Filters an array to produce a new array containing only unique elements.
 * This is a standard method for removing duplicates from an array.
 *
 * @param {Array} array The input array which may contain duplicate elements.
 * @returns {Array} A new array with all duplicate elements removed.
 */
function uniq( array ) {
  return array.filter( ( elem, index, self ) => self.indexOf( elem ) === index );
}

/**
 * Counts the occurrences of a specific target substring within a given string.
 * This is used, for example, to count '1's in a binary string.
 *
 * @param {string} str The string in which to perform the search.
 * @param {string} val The substring to count.
 * @returns {number} The total number of times 'val' appears in 'str'.
 */
function countTargetString( str, val ) {
  // Uses a regular expression with the 'g' (global) flag to find all matches.
  // If `str.match()` returns null (no matches), an empty array `[]` is used
  // to prevent errors when accessing '.length'.
  return ( str.match( new RegExp( val, "g" ) ) || [] ).length;
}

/**
 * Calculates the unique path (route) of edges between two specified nodes
 * in the arranged tree structure. The path is represented by a list of
 * integer edge identifiers.
 *
 * @param {number} node1 The 0-based index of the first node.
 * @param {number} node2 The 0-based index of the second node.
 * @returns {Array<number>} An array of unique integer identifiers for the edges
 *                          that form the path between node1 and node2.
 */
function getRoute( node1, node2 ) { // This function operates on node indices rather than node objects directly.
  var result = []; // This array will store the identifiers of the edges along the route.
  var depth1 = nodes[node1].depth; // Get the depth of the first node.
  var depth2 = nodes[node2].depth; // Get the depth of the second node.

  // Traverse upwards from both nodes simultaneously until they meet
  // or until one reaches the same depth as the other's ancestor.
  while ( true ) {
    if ( depth1 == depth2 ) {
      // If both nodes are at the same depth.
      if ( node1 == node2 ) {
        break; // The nodes have met, indicating the common ancestor (or themselves).
      }

      // Add the edge connecting node1 to its parent to the result.
      result.push( Math.min( node1, nodes[node1].parent ) * 100 + Math.max( node1, nodes[node1].parent ) );
      depth1 -= 1; // Move node1 up one level towards the root.
      node1 = nodes[node1].parent; // Update node1 to its parent.

      // Add the edge connecting node2 to its parent to the result.
      result.push( Math.min( node2, nodes[node2].parent ) * 100 + Math.max( node2, nodes[node2].parent ) );
      depth2 -= 1; // Move node2 up one level towards the root.
      node2 = nodes[node2].parent; // Update node2 to its parent.
    }
    else if ( depth1 > depth2 ) {
      // If node1 is deeper than node2, move node1 up.
      result.push( Math.min( node1, nodes[node1].parent ) * 100 + Math.max( node1, nodes[node1].parent ) );
      depth1 -= 1;
      node1 = nodes[node1].parent;
    }
    else {
      // If node2 is deeper than node1, move node2 up.
      result.push( Math.min( node2, nodes[node2].parent ) * 100 + Math.max( node2, nodes[node2].parent ) );
      depth2 -= 1;
      node2 = nodes[node2].parent;
    }
  }

  return result; // Return the array of edge identifiers that form the path.
}

/**
 * Arranges the graph into a tree structure by performing a Depth-First Search (DFS)
 * from a given starting node. It establishes parent-child relationships and calculates
 * the depth of each node.
 *
 * @param {Object} target The node object from which to begin the arrangement process.
 *                        This node is considered the root of the subtree being arranged.
 */
function arrangement( target ) {
  // Iterate through all nodes listed as 'children' (connected nodes) of the current target node.
  for ( var i = 0; i < target.child.length; i++ ) {

    var temp = []; // This variable is declared but unused; it remains for Type I cloning.
    var checking = target.child[i]; // Get the index of the connected node currently being examined.

    // Check if the 'checking' node is NOT the parent of the 'target' node.
    // If it's not the parent, then it must be a child in the tree structure.
    if ( checking != target.parent ) {
      nodes[checking].parent = target.self; // Set the current target node as the parent of 'checking'.
      nodes[checking].depth = target.depth + 1; // Increment the depth for the 'checking' node.

      // Recursively call 'arrangement' for the newly identified child node.
      arrangement( nodes[checking] );
    }
    else {
      // If 'checking' IS the parent of 'target', it means we've traversed back up.
      // In a tree, the parent should not be listed as a child. Remove it from the child list.
      target.child.splice( i, 1 );
      i--; // Decrement 'i' to correctly re-evaluate the current index after the splice operation.
    }
  }
}

/*
 * This line handles standard input/output and should remain untouched.
 * It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string
 * and passes it to the `Main` function to begin program execution.
 */
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );