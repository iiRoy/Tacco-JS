"use strict" ; // Enable strict mode for better error handling and cleaner code.

// This is an Immediately Invoked Function Expression (IIFE) that returns a data parser.
var GET = ( function ( ) {

  /**
   * Factory function to create a new parser instance.
   * @param {string} s - The input string to parse.
   * @returns {g} A new parser object.
   */
  function f ( s ) { return new g ( s ) ; }

  /**
   * Constructor for the parser object.
   * Initializes the internal state from the input string.
   * @param {string} s - The raw input string.
   */
  function g ( s ) {
    // Trim whitespace and split the input string by newlines into an array of lines.
    this._s = s . trim ( ) . split ( "\n" ) ;
    // Initialize the current line index to 0.
    this._y = 0 ;
  }

  /**
   * Reads a single item from the current line.
   * If the current line hasn't been split yet, it splits it into words and reverses it.
   * This allows popping items from the "end" (which is actually the start after reverse).
   * @param {boolean} f - If true, return as string; otherwise, convert to number.
   * @returns {string|number} The parsed item.
   */
  g . prototype . a = function ( f ) {
    var s = this . _s , // Reference to the array of lines.
        y = this . _y , // Current line index.
        r ;              // Variable to hold the result.

    // Check if the current line is still a single string.
    if ( typeof s [ y ] === "string" ) {
      // Split the line by spaces and reverse the order of elements.
      // This allows 'pop()' to retrieve elements from left to right in the original string.
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    // Pop the last element (which is the next item in original order).
    r = s [ y ] . pop ( ) ;

    // If the current line is now empty, advance to the next line.
    if ( ! s [ y ] . length ) {
      this . _y ++ ;
    }

    // Return the result, optionally converting it to a number.
    return f ? r : + r ;
  } ; // End of 'a' method.

  /**
   * Reads an entire line as a list of items.
   * Advances the line pointer after reading.
   * @param {boolean} f - If true, return items as strings; otherwise, convert to numbers.
   * @returns {string[]|number[]} An array of parsed items from the line.
   */
  g . prototype . l = function ( f ) {
    // Get the current line, split it by spaces, and then increment the line index.
    var s = this . _s [ this . _y ++ ] . split ( " " ) ;
    // Return the array, optionally mapping all elements to numbers.
    return f ? s : s . map ( a => + a ) ;
  } ; // End of 'l' method.

  /**
   * Reads 'n' lines as a matrix of items.
   * Advances the line pointer by 'n' lines.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, return items as strings; otherwise, convert to numbers.
   * @returns {string[][]|number[][]} A 2D array (matrix) of parsed items.
   */
  g . prototype . m = function ( n , f ) {
    // Extract 'n' lines, split each line into words, and store in 'r'.
    var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;
    // Return the matrix, optionally mapping all inner elements to numbers.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ; // End of 'm' method.

  /**
   * Reads 'n' lines, each containing a single item (or a whole line as one item).
   * Advances the line pointer by 'n' lines.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, return items as strings; otherwise, convert to numbers.
   * @returns {string[]|number[]} An array of parsed items.
   */
  g . prototype . r = function ( n , f ) {
    // Extract 'n' lines directly.
    var r = this . _s . slice ( this . _y , this . _y += n ) ;
    // Return the array, optionally mapping all elements to numbers.
    return f ? r : r . map ( a => + a ) ;
  } ; // End of 'r' method.

  return f ; // Return the factory function.

} ) ( ) ; // IIFE execution.

// Initialize the parser 'o' by reading the entire content of standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/**
 * Creates a multi-dimensional array initialized with a specific value or expression.
 * This function uses 'eval' and is generally considered unsafe for untrusted input.
 * @param {*} v - The initial value or expression for the innermost elements.
 * @returns {Array} The multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments , // All arguments passed to the function.
      l = a . length , // Number of dimensions.
      // Build the innermost array creation string.
      r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;
  // Loop backwards through dimensions to construct the nested map calls.
  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }
  // Evaluate the constructed string to create the array.
  return eval ( r ) ;
}

// Global variables for graph representation and bitmask storage.
var graph , bitor ;

// Execute the main function and store its result.
var myOut = main ( ) ;

// If the main function returned a value (not undefined), print it to console.
if ( myOut !== undefined ) {
  console . log ( myOut ) ;
}

/**
 * Main logic function of the program.
 * Reads input, constructs a graph, performs path analysis, and calculates a final result.
 * @returns {number} The calculated result from dynamic programming.
 */
function main ( ) {
  // Read the number of nodes 'n'.
  var n = o . a ( ) ;

  // Arrays to store edges in a canonical form (min, max).
  var a = [ ] ,
      b = [ ] ;

  // Initialize the adjacency list for the graph.
  // Each node will have an empty array to store its neighbors.
  graph = xArray ( "[]" , n ) ;

  // Initialize bitor array, which will store bitmasks for each edge.
  // Its size is n-1 because there are n-1 edges in a tree.
  bitor = xArray ( 0 , n - 1 ) ;

  // Loop to read n-1 edges and build the graph.
  for ( var i = 0 ; i < n - 1 ; i ++ ) {
    // Read two nodes for the current edge, adjusting to 0-indexed.
    var s = o . a ( ) - 1 ,
        t = o . a ( ) - 1 ;

    // Store the edge in canonical form (smaller node first).
    a [ i ] = Math . min ( s , t ) ;
    b [ i ] = Math . max ( s , t ) ;

    // Add edges to the adjacency list (undirected graph).
    graph [ s ] . push ( t ) ;
    graph [ t ] . push ( s ) ;
  }

  // Read the number of queries 'm'.
  var m = o . a ( ) ;

  // Loop through each query.
  for ( var i = 0 ; i < m ; i ++ ) {
    // Read the start and end nodes for the current query path.
    var u = o . a ( ) - 1 ,
        v = o . a ( ) - 1 ;

    // Create a bitmask for the current query.
    var bit = 1 << i ;

    // Find the path from 'u' to 'v' using DFS.
    // 'vv' will contain the nodes in the path.
    var vv = dfs ( u , v , -1 , [ ] ) ;

    // Iterate through the path to identify edges.
    for ( var j = 1 ; j < vv . length ; j ++ ) {
      // Get two adjacent nodes in the path.
      var p = Math . min ( vv [ j - 1 ] , vv [ j ] ) ,
          q = vv [ j - 1 ] + vv [ j ] - p ; // Calculate the other node.

      // Find the index of this edge in the 'a' and 'b' arrays.
      for ( var k = 0 ; ; k ++ ) {
        if ( a [ k ] === p && b [ k ] === q ) {
          // Apply the current query's bitmask to the edge.
          bitor [ k ] |= bit ;
          break ; // Edge found, move to the next path segment.
        }
      }
    }
  }

  // Calculate the total number of possible subsets of queries (2^m).
  var mb = 1 << m ;

  // Initialize DP array. dp[i] will store the count for bitmask 'i'.
  // All elements initialized to 0.
  var dp = xArray ( 0 , mb ) ;

  // Base case: There is 1 way to have no queries selected (empty set).
  dp [ 0 ] = 1 ;

  // Iterate through each edge in the graph.
  for ( var j = 0 ; j < n - 1 ; j ++ ) {
    // If an edge is not part of any query path.
    if ( bitor [ j ] === 0 ) {
      // This edge can either be included or excluded independently.
      // So, double the count for all existing query subsets.
      for ( var i = 0 ; i < mb ; i ++ ) {
        dp [ i ] *= 2 ;
      }
    }
    // If the edge is part of one or more query paths.
    else {
      // Iterate through DP states in reverse to avoid using updated values in the same iteration.
      for ( var i = mb ; i -- ; ) {
        // If the current query subset 'i' already contains all queries associated with this edge.
        if ( ( i | bitor [ j ] ) === i ) {
          // This edge can be chosen or not, effectively doubling the count for this subset.
          dp [ i ] *= 2 ;
        }
        // If the current query subset 'i' does NOT contain all queries associated with this edge.
        else {
          // If we include this edge, it means we satisfy the queries in 'bitor[j]'.
          // So, add the count from 'dp[i]' to the state 'i | bitor[j]'.
          dp [ i | bitor [ j ] ] += dp [ i ] ;
        }
      }
    }
  }

  // The final answer is the count for the state where all queries are satisfied (bitmask mb-1).
  return dp [ mb - 1 ] ;
}

/**
 * Performs a Depth First Search (DFS) to find a path between two nodes in the graph.
 * This DFS is designed to find the first path encountered.
 * @param {number} s - The starting node.
 * @param {number} g - The target (goal) node.
 * @param {number} p - The parent node (to avoid going backward). Initialized to -1 for the start node.
 * @param {number[]} V - The current path being explored (passed by reference).
 * @returns {number[]|undefined} The path from 's' to 'g' if found, otherwise undefined.
 */
function dfs ( s , g , p , V ) {
  // Add the current node to the path.
  V . push ( s ) ;

  // If the current node is the target node, we found the path.
  if ( g === s ) {
    return V ;
  }

  // Explore neighbors of the current node.
  for ( var v of graph [ s ] ) {
    // Skip the parent node to avoid cycles and going backward.
    if ( v === p ) {
      continue ;
    }

    // Recursively call DFS for the neighbor.
    var q = dfs ( v , g , s , V ) ;

    // If a path was found in the recursive call, return it immediately.
    if ( q ) {
      return q ;
    }
  }

  // If no path was found through any neighbor, backtrack by removing the current node from the path.
  V . pop ( ) ;
}