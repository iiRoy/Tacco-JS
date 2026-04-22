var GET = ( function( ) { /* This is a self-invoking function expression (IIFE)
                               * that sets up a custom input parsing utility.
                               * The 'GET' variable will hold the main function 'f'.
                               */

  // Internal function 'f' acts as a factory for 'g'.
  function f ( s ) { return new g ( s ) ; }

  /* The 'g' constructor initializes an input source.
   * It takes a string 's', trims whitespace, and splits it into lines.
   * _s stores the lines, _y tracks the current line index.
   */
  function g ( s ) {
    this._s = s . trim ( ) . split ( "\n" ) ; /* Store lines as an array. */
    this._y = 0 ;                              /* Initialize line counter. */
  }

  /* Prototype method 'a' (for 'atom' or 'argument').
   * Retrieves the next item from the current line.
   * If 'f' is true, returns as string; otherwise, as number.
   * Handles reversing the line for 'pop' operations.
   */
  g.prototype.a = function ( f ) {
    var s = this._s , // Reference to the lines array.
        y = this._y , // Current line index.
        r ;          // Variable to hold the result.

    // If the current line hasn't been processed, split and reverse it.
    if ( typeof s [ y ] === "string" ) {
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    r = s [ y ] . pop ( ) ; // Pop the last element (first in original order).

    // If the current line is exhausted, advance to the next.
    if ( ! s [ y ] . length ) { this._y ++ ; }

    // Return as number or string based on 'f'.
    return f ? r : + r ;
  } ;

  /* Prototype method 'l' (for 'line').
   * Retrieves and processes an entire line.
   * Advances the line counter.
   * If 'f' is true, returns strings; otherwise, maps to numbers.
   */
  g.prototype.l = function ( f ) {
    var s = this._s [ this._y ++ ] . split ( " " ) ; // Get line, split, advance counter.

    // Return as strings or numbers.
    return f ? s : s . map ( a => + a ) ;
  } ;

  /* Prototype method 'm' (for 'matrix').
   * Retrieves 'n' lines and processes them as a matrix.
   * Advances the line counter by 'n'.
   * If 'f' is true, returns string arrays; otherwise, maps to number arrays.
   */
  g.prototype.m = function ( n , f ) {
    var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ; // Slice 'n' lines, split each.

    // Return as string matrix or number matrix.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ;

  /* Prototype method 'r' (for 'rows' or 'raw lines').
   * Retrieves 'n' raw lines.
   * Advances the line counter by 'n'.
   * If 'f' is true, returns raw strings; otherwise, maps to numbers.
   */
  g.prototype.r = function ( n , f ) {
    var r = this._s . slice ( this._y , this._y += n ) ; // Slice 'n' lines.

    // Return as raw strings or numbers.
    return f ? r : r . map ( a => + a ) ;
  } ;

  // The IIFE returns the 'f' function, which is assigned to 'GET'.
  return f ;

} ) ( ) ; // End of the IIFE.

// Initialize an input object 'o' using the GET utility.
// It reads content from /dev/stdin as UTF-8.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/*
 * Function to create a multi-dimensional array.
 * xArray(initialValue, dim1, dim2, ..., dimN)
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * Uses eval for dynamic array creation, which can be a security risk
 * if 'v' comes from untrusted input, but here 'v' is controlled.
 */
function xArray ( v ) {
  var a = arguments ,                                                                 // All arguments passed to the function.
      l = a . length ,                                                                // Total number of arguments.
      r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ; // Innermost array creation.

  // Loop to build up the nested array creation string.
  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  return eval ( r ) ; // Evaluate the dynamically constructed string.
}

// Call the main function and log its result to the console.
console . log ( main ( ) ) ;

/*
 * The main function orchestrates the program logic.
 * It reads input, builds an adjacency list for a tree,
 * and then determines if the "Second" or "First" player wins
 * based on the tree's diameter modulo 3.
 */
function main ( ) {

  var n = o . a ( ) ; // Read the number of nodes (N).

  // Initialize a placeholder array 'u' (unused in this specific problem logic, but present).
  var u = xArray ( 1 , n ) ;

  // Initialize an adjacency list 'e' for the tree, filled with empty arrays.
  var e = xArray ( "[]" , n ) ;

  // Loop to read N-1 edges and build the adjacency list.
  for ( var i = 1 ; i < n ; i ++ ) {

    // Read an edge (two nodes), map them to 0-indexed values.
    var t = o . l ( ) . map ( a => a - 1 ) ;

    // Add connections to the adjacency list (undirected graph).
    e [ t [ 0 ] ] . push ( t [ 1 ] ) ;
    e [ t [ 1 ] ] . push ( t [ 0 ] ) ;
  }

  // Calculate the tree diameter, then check its remainder when divided by 3.
  // If (diameter % 3) is 1, "Second" wins; otherwise, "First" wins.
  return treeDia ( e ) % 3 === 1 ? "Second" : "First" ;
}

/*
 * Function to calculate the diameter of a tree using two Breadth-First Searches (BFS).
 * The diameter is the longest path between any two nodes in the tree.
 * 'e' represents the adjacency list of the tree.
 */
function treeDia ( e ) {

  var v1 = 0 , // Starting node for the first BFS (arbitrary node, usually 0).
      l ;      // Variable to store the maximum level/distance found.

  // Perform two BFS traversals to find the diameter.
  // The first BFS finds the farthest node from an arbitrary start.
  // The second BFS finds the farthest node from the result of the first BFS.
  for ( var i = 0 ; i < 2 ; i ++ ) {

    l = 0 ; // Reset level for each BFS.

    // Initialize BFS queues: q for current level, q2 for next level.
    // Each element is [node, parent_node] to avoid going backward.
    var q = [ [ v1 , - 1 ] ] ,
        q2 = [ ] ;

    // Continue BFS as long as there are nodes to visit.
    while ( q . length || q2 . length ) {

      // If the current level queue is empty, move to the next level.
      if ( q . length === 0 ) {
        l ++ ;       // Increment level.
        q = q2 ;     // Current level becomes the next level.
        q2 = [ ] ;   // Clear the next level queue.
        v1 = q [ 0 ] [ 0 ] ; // The first node in the new 'q' becomes the new 'v1' (farthest node).
      }

      // Dequeue a node: t is [current_node, parent_node].
      var t = q . pop ( ) ,
          v = t [ 0 ] , // Current node.
          p = t [ 1 ] ; // Parent node.

      // Iterate through neighbors of the current node 'v'.
      for ( var j = 0 ; j < e [ v ] . length ; j ++ ) {

        // Skip if the neighbor is the parent (avoid going back).
        if ( p === e [ v ] [ j ] ) { continue ; }

        // Add the neighbor to the next level queue.
        q2 . push ( [ e [ v ] [ j ] , v ] ) ;
      }
    }
  }

  return l ; // Return the maximum level reached (which is the diameter).
}