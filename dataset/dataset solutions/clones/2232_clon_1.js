/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It includes an input reading utility, helper functions, and the main logic.
 *
 */

"use strict" ; // Enforces strict mode for cleaner code and error handling.


/*
 * The GET utility is an Immediately Invoked Function Expression (IIFE)
 * designed to parse input from standard input or a file.
 * It provides methods to read different types of data (single values, lines, arrays).
 */
var GET = ( function ( ) {

  /**
   * Factory function to create a new input reader instance.
   * @param {string} s - The raw input string.
   * @returns {g} A new instance of the input reader.
   */
  function f ( s ) {
    return new g ( s ) ;
  }


  /**
   * Constructor for the input reader.
   * Initializes the internal state with the provided string.
   * @param {string} s - The input string.
   */
  function g ( s ) {
    // Trim whitespace and split the input string into an array of lines.
    this._s = s . trim ( ) . split ( "\n" ) ;
    // Initialize the current line index to 0.
    this._y = 0 ;
  }


  /**
   * Reads an 'atom' from the current line. An atom is typically a single number or string.
   * If the current line has not been processed yet, it splits it by spaces and reverses it
   * so that pop() retrieves elements in forward order.
   * Advances the line pointer if the current line is exhausted.
   * @param {boolean} f - If true, returns the atom as a string; otherwise, as a number.
   * @returns {(string|number)} The read atom.
   */
  g . prototype . a = function ( f ) {
    var s = this._s ,
        y = this._y ,
        r ;

    // Check if the current line needs to be parsed into individual elements.
    if ( typeof s [ y ] === "string" ) {
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    // Pop the last element (which is the next element in original order).
    r = s [ y ] . pop ( ) ;

    // If the current line is now empty, move to the next line.
    if ( ! s [ y ] . length ) {
      this._y ++ ;
    }

    // Return as string or number based on the flag 'f'.
    return f ? r : + r ;
  } ;


  /**
   * Reads an entire line of input.
   * Advances the line pointer.
   * @param {boolean} f - If true, returns elements as strings; otherwise, as numbers.
   * @returns {Array<(string|number)>} An array of values from the line.
   */
  g . prototype . l = function ( f ) {
    // Get the current line, split it by spaces, and advance the line pointer.
    var s = this._s [ this._y ++ ] . split ( " " ) ;
    // Return as strings or map to numbers.
    return f ? s : s . map ( a => + a ) ;
  } ;


  /**
   * Reads 'n' lines of input, treating each line as an array of values.
   * This effectively reads an n x M matrix where M varies per line.
   * Advances the line pointer by 'n'.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns elements as strings; otherwise, as numbers.
   * @returns {Array<Array<(string|number)>>} A 2D array representing the matrix.
   */
  g . prototype . m = function ( n , f ) {
    // Slice 'n' lines from the input, split each line by spaces.
    var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;
    // Return as strings or map all nested elements to numbers.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ;


  /**
   * Reads 'n' lines of input, treating each line as a single value.
   * Advances the line pointer by 'n'.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns elements as strings; otherwise, as numbers.
   * @returns {Array<(string|number)>} An array of values, one per line.
   */
  g . prototype . r = function ( n , f ) {
    // Slice 'n' lines from the input.
    var r = this._s . slice ( this._y , this._y += n ) ;
    // Return as strings or map to numbers.
    return f ? r : r . map ( a => + a ) ;
  } ;

  // The IIFE returns the factory function 'f'.
  return f ;

} ) ( ) ; // End of GET IIFE.


// Initialize the input reader 'o' by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * Helper function to create multi-dimensional arrays initialized with a value.
 * This uses a recursive string construction and then eval() to create the array.
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments , // The arguments object contains 'v' and all dimension sizes.
      l = a . length , // Total number of arguments.
      r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ; // Innermost array creation string.

  // Loop backwards through dimensions to build the nested array creation string.
  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  // Evaluate the constructed string to create the actual array.
  return eval ( r ) ;
}


// Declare global variables for graph representation and bitwise operations.
var graph ,
    bitor ;


// Execute the main logic and store its result.
var myOut = main ( ) ;

// If the main function returns a defined value, print it to console.
if ( myOut !== undefined ) {
  console . log ( myOut ) ;
}


/**
 * The main function containing the core problem-solving logic.
 * It reads graph data, processes queries, and uses dynamic programming.
 * @returns {number} The final calculated result.
 */
function main ( ) {

  // Read the number of nodes 'n'.
  var n = o . a ( ) ;

  // Initialize arrays to store edges (min/max nodes for each edge).
  var a = [ ] ,
      b = [ ] ;

  // Initialize the adjacency list for the graph.
  // Each node will have an empty array to store its neighbors.
  graph = xArray ( "[]" , n ) ;

  // Initialize the bitor array for edges, representing bitmasks for queries.
  bitor = xArray ( 0 , n - 1 ) ;


  // Loop to read 'n-1' edges and construct the graph.
  for ( var i = 0 ; i < n - 1 ; i ++ ) {
    // Read two nodes 's' and 't' for an edge, adjusting for 0-based indexing.
    var s = o . a ( ) - 1 ,
        t = o . a ( ) - 1 ;

    // Store the edge nodes in sorted order (min, max) for easy lookup later.
    a [ i ] = Math . min ( s , t ) ;
    b [ i ] = Math . max ( s , t ) ;

    // Add edges to the adjacency list (undirected graph).
    graph [ s ] . push ( t ) ;
    graph [ t ] . push ( s ) ;
  }


  // Read the number of queries 'm'.
  var m = o . a ( ) ;

  // Process each query.
  for ( var i = 0 ; i < m ; i ++ ) {
    // Read the start 'u' and end 'v' nodes for the current query path.
    var u = o . a ( ) - 1 ,
        v = o . a ( ) - 1 ;

    // Create a bitmask for the current query (1 shifted by 'i').
    var bit = 1 << i ;

    // Perform a Depth-First Search (DFS) to find the path from 'u' to 'v'.
    // The DFS function returns the path as an array of nodes.
    var vv = dfs ( u , v , - 1 , [ ] ) ; // -1 for parent, [] for path accumulation.

    // Iterate through the path to identify edges involved in this query.
    for ( var j = 1 ; j < vv . length ; j ++ ) {
      // Get the two nodes forming the current segment of the path.
      // 'p' is the smaller node, 'q' is the larger node.
      var p = Math . min ( vv [ j - 1 ] , vv [ j ] ) ,
          q = vv [ j - 1 ] + vv [ j ] - p ;

      // Find the index 'k' of this edge in the 'a' and 'b' arrays.
      for ( var k = 0 ; ; k ++ ) {
        if ( a [ k ] === p && b [ k ] === q ) {
          // Apply the current query's bitmask to the corresponding edge.
          bitor [ k ] |= bit ;
          break ; // Found the edge, move to the next path segment.
        }
      }
    }
  }


  // Calculate the total number of possible bitmasks for 'm' queries.
  var mb = 1 << m ;

  // Initialize the dynamic programming array.
  // dp[mask] will store the count of ways to satisfy the mask.
  dp = xArray ( 0 , mb ) ;

  // Base case: There's 1 way to satisfy an empty set of queries (mask 0).
  dp [ 0 ] = 1 ;


  // Iterate through each edge in the graph.
  for ( var j = 0 ; j < n - 1 ; j ++ ) {
    // If an edge is not part of any query (its bitor is 0).
    if ( bitor [ j ] === 0 ) {
      // Each existing state can be doubled because this edge can be chosen or not.
      for ( var i = 0 ; i < mb ; i ++ ) {
        dp [ i ] *= 2 ;
      }
    }
    // If an edge is part of one or more queries.
    else {
      // Create a temporary DP array for the current iteration.
      var dp2 = xArray ( 0 , mb ) ;

      // Update dp2 based on dp for the current edge.
      for ( var i = 0 ; i < mb ; i ++ ) {
        // Option 1: Don't select the current edge.
        // It contributes to the same mask 'i'.
        dp2 [ i ] += dp [ i ] ;

        // Option 2: Select the current edge.
        // It contributes to the mask 'i' ORed with the edge's bitor.
        dp2 [ i | bitor [ j ] ] += dp [ i ] ;
      }
      // Update the main DP array with the results from dp2.
      dp = dp2 ;
    }
  }

  // The final result is the count of ways to satisfy all 'm' queries (mask mb-1).
  return dp [ mb - 1 ] ;
}


/**
 * Performs a Depth-First Search (DFS) to find a path between two nodes in the graph.
 * This function returns the path as an array of nodes from 's' to 'g'.
 * @param {number} s - The starting node.
 * @param {number} g - The goal node.
 * @param {number} p - The parent node (to avoid going backward).
 * @param {Array<number>} V - The current path being built.
 * @returns {(Array<number>|undefined)} The path if found, otherwise undefined.
 */
function dfs ( s , g , p , V ) {
  // Add the current node 's' to the path.
  V . push ( s ) ;

  // If the goal node is reached, return the current path.
  if ( g === s ) {
    return V ;
  }

  // Iterate over neighbors of the current node 's'.
  for ( var v of graph [ s ] ) {
    // Skip the parent node to prevent infinite loops in undirected graphs.
    if ( v === p ) {
      continue ;
    }

    // Recursively call DFS for the neighbor 'v'.
    var q = dfs ( v , g , s , V ) ;

    // If a path was found in the recursive call, return it immediately.
    if ( q ) {
      return q ;
    }
  }

  // If no path was found through this branch, backtrack by removing the current node.
  V . pop ( ) ;
}