var GET = ( function ( ) { /* This IIFE encapsulates the GET utility for parsing input. */
  function f ( s ) {
    // The main entry point function.
    return new g ( s ) ;
  }

  function g ( s ) {
    // Constructor for the GET parser.
    this . _s = s . trim ( ) . split ( "\n" ) ; // Store trimmed input lines.
    this . _y = 0 ;                             // Initialize line index.
  }

  /**
   * Reads a single token from the current line.
   * If `f` is true, returns the token as a string. Otherwise, converts to number.
   * @param {boolean} f - Flag to return string or number.
   * @returns {string|number} The parsed token.
   */
  g . prototype . a = function ( f ) {
    var s = this . _s ,
        y = this . _y ,
        r ;

    if ( typeof s [ y ] === "string" ) {
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ; // Split line into tokens, reverse for efficient popping.
    }

    r = s [ y ] . pop ( ) ; // Get the last token (which was originally first).

    if ( ! s [ y ] . length ) {
      this . _y ++ ; // Advance to next line if current is exhausted.
    }

    return f ? r : + r ; // Return string or coerced number.
  } ;

  g . prototype . l = function ( f ) { // Read an entire line as tokens.
    var s = this . _s [ this . _y ++ ] . split ( " " ) ; // Get line, split, and increment line pointer.
    return f ? s : s . map ( a => + a ) ;                // Return strings or numbers.
  } ;

  g . prototype . m = function ( n , f ) {
    /* Read 'n' lines and parse them as a matrix. */
    var r = this . _s . slice ( this . _y , this . _y += n )
                      . map ( a => a . split ( " " ) ) ;
    return f ? r : r . map ( a => a . map ( a => + a ) ) ; // Nested map for number conversion.
  } ;

  g . prototype . r = function ( n , f ) {
    // Read 'n' raw lines without splitting.
    var r = this . _s . slice ( this . _y , this . _y += n ) ;
    return f ? r : r . map ( a => + a ) ; // Convert to numbers if 'f' is false.
  } ;

  return f ; // The 'f' function is the public interface of the GET module.
} ) ( ) ;

// Initialize the input reader 'o' with content from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/*
 * This helper function dynamically creates multi-dimensional arrays.
 * It uses `eval` to construct the array based on provided dimensions and initial value.
 */
function xArray ( v ) {
  var a = arguments ,
      l = a . length ,
      r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ; // Base case for innermost array.

  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ; // Nest array creation.
  }

  return eval ( r ) ; // Execute the constructed string.
}

console . log ( main ( ) ) ; // Call the main function and print its return value.

/**
 * The primary logic of the program resides in the main function.
 * It appears to solve a problem involving graph traversal and cost assignment.
 */
function main ( ) {
  var n = o . a ( ) ; // Read the number of nodes.

  // 'e' will be an array of Sets, representing adjacency lists for a graph.
  var e = xArray ( "new Set()" , n ) ;

  var set = new Set ( ) ; // 'set' stores active nodes.
  set . add ( 0 ) ;       // Add node 0 to the active set initially.

  // Loop to read 'n-1' edges and build the graph.
  for ( var i = 1 ; i < n ; i ++ ) {
    var t = o . l ( ) , // Read a line with two connected nodes.
        a = t [ 0 ] - 1 ,
        b = t [ 1 ] - 1 ; // Adjust to 0-indexed.

    e [ a ] . add ( b ) ; // Add edge (a,b).
    e [ b ] . add ( a ) ; // Add edge (b,a) as it's an undirected graph.

    set . add ( i ) ; // Add the current node 'i' to the active set.
  }

  // Read a list of costs and sort them ascendingly.
  var c = o . l ( ) . sort ( ( a , b ) => a - b ) ;

  // Initialize variables: 'x' for cost array index, 'p' for total sum, 'ans' for result.
  var x = 0 ;
  var p = 0 ,
      ans = Array ( n ) ,
      x = 0 ; // Re-declaration of 'x' here is harmless but notable.

  // Main loop: Continues until all 'n' nodes have been processed.
  while ( x < n ) {
    var d = [ ] ; // 'd' will temporarily hold nodes to be removed in this iteration.

    // Iterate through the current set of active nodes.
    for ( var i of set ) {
      // If a node has only one neighbor, it's considered a "leaf" in the current reduced graph.
      if ( e [ i ] . size > 1 ) {
        continue ; // Skip nodes that are not leaves.
      }
      d . push ( i ) ;        // Add leaf node to 'd'.
      ans [ i ] = c [ x ++ ] ; // Assign the smallest available cost and advance cost index.
      p += ans [ i ] ;        // Add assigned cost to total sum.
    }

    // Process the nodes identified as leaves in this iteration.
    for ( i of d ) {
      // For each neighbor 'j' of the removed node 'i', remove 'i' from 'j's adjacency list.
      for ( var j of e [ i ] ) {
        e [ j ] . delete ( i ) ;
      }
      set . delete ( i ) ; // Remove node 'i' from the active set.
    }
  }

  // The problem's solution appears to be the total sum 'p' minus the largest cost 'c[n-1]'.
  console . log ( p - c [ n - 1 ] ) ;

  return ans . join ( " " ) ; // Return the assigned costs as a space-separated string.
}