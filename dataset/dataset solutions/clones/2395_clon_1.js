/*
 * This JavaScript code processes graph-like input to assign a "color" to each edge.
 * It reads node connections from standard input and determines a unique color for each edge
 * such that no two edges incident to the same node share the same color.
 * The maximum color used is also determined and printed.
 */


// --- Input Processing Section ---

// Read the entire standard input, decode it as UTF-8, and split it into lines.
inp = require('fs') . readFileSync( '/dev/stdin' , 'utf8' ) . split( '\n' )


// The first line of input contains the total number of nodes, N.
// `shift()` removes the first element from `inp` and returns it.
// `* 1` converts the string to a number.
N = inp . shift() * 1


// Initialize an object `b` which will act as an adjacency list and
// store additional properties for each node.
b = { }


// --- Node Initialization Section ---

// Loop N times to initialize data structures for each node (from 0 to N-1).
for ( i = 0 ; i < N ; i++ )
{
  b[ i ] = {
    n : [ ] ,   // 'n': An array to store neighbors. Each element will be an object { n: neighbor_node_index, i: original_input_line_index }.
    b : 0 ,     // 'b': A counter, possibly for back-edges or incoming connections.
    u : { } ,   // 'u': An object (hash map) to keep track of colors already used by this node.
    k : 0       // 'k': The highest color used by this node so far, or a starting point for color search.
  }
}


// Initialize `max` variable, which will store the maximum degree (or related metric) found among nodes.
max = 0


// --- Edge Processing and Max Degree Calculation Section ---

// Loop through the remaining N-1 lines of input, which represent the edges.
for ( i = 0 ; i < N - 1 ; i++ )
{
  // Split the current line (representing an edge) into two node indices.
  l = inp[ i ] . split( ' ' )

  // Convert node indices from 1-based to 0-based.
  j = l[ 0 ] - 1
  k = l[ 1 ] - 1

  // Add node `k` as a neighbor to node `j`. Store original input line index `i`.
  b[ j ] . n . push( { n : k , i : i } )

  // Increment the 'b' counter for node `k`.
  b[ k ] . b += 1


  // Update `max` if the sum of `n.length` (neighbors) and `b` (back-connections) for node `j` is greater.
  if ( max < b[ j ] . n . length + b[ j ] . b )
  {
    max = b[ j ] . n . length + b[ j ] . b
  }

  // Update `max` if the sum of `n.length` and `b` for node `k` is greater.
  if ( max < b[ k ] . n . length + b[ k ] . b )
  {
    max = b[ k ] . n . length + b[ k ] . b
  }
}


// --- Edge Coloring Section ---

// Initialize an array `a` to store the assigned color for each edge.
// The index of `a` will correspond to the original input line index `i`.
a = [ ]


// Iterate through each node from 0 to N-1.
for ( i = 0 ; i < N ; i++ )
{
  // For each node `i`, iterate through its list of neighbors/edges.
  for ( j = 0 ; j < b[ i ] . n . length ; j++ )
  {
    // Get the current neighbor/edge object `o`.
    o = b[ i ] . n[ j ]

    // Flag `f` to indicate if a suitable color has been found.
    f = false

    // Try to find an unused color for the edge (i, o.n) starting from `b[i].k + 1`.
    // The search goes up to `max`.
    for ( k = b[ i ] . k + 1 ; k < max ; k++ )
    {
      // If color `k` is not marked as used by node `i`.
      if ( ! b[ i ] . u[ k ] )
      {
        f = true      // A color is found.
        break;        // Exit this inner loop.
      }
    }


    // If no color was found in the range `b[i].k + 1` to `max`,
    // then search for the first available color starting from 1.
    if ( ! f )
    {
      for ( k = 1 ; k < max ; k++ )
      {
        // If color `k` is not marked as used by node `i`.
        if ( ! b[ i ] . u[ k ] )
        {
          break; // Found the first available color.
        }
      }
    }

    // Assign the chosen color `k` to the current edge `o`.
    o . c = k

    // Mark color `o.c` as used by node `i`.
    b[ i ] . u[ o . c ] = 1

    // Update the last used color (`k`) for node `i`.
    b[ i ] . k = k

    // Mark color `o.c` as used by the connected node `o.n`.
    b[ o . n ] . u[ o . c ] = 1

    // Update the last used color (`k`) for the connected node `o.n`.
    b[ o . n ] . k = k

    // Store the assigned color `o.c` in the results array `a` at the original edge index `o.i`.
    a[ o . i ] = o . c
  }
}


// --- Output Section ---

// Print the maximum color value determined.
console . log( max )


// Print all assigned colors, each on a new line.
console . log( a . join( "\n" ) )