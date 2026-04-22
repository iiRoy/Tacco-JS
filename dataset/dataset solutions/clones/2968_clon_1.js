var   input  =  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ; // This line reads input from standard input, processes it, and splits it into an array of lines.

// Define a custom object to manage input processing, simulating an iterator.
var obj = {
  "list" : input , // The array of input lines.
  "index" : 0 ,    // Current position in the input list.
  "max" : input.length , // Total number of input lines.

  /**
   * Retrieves the next element from the input list.
   * Throws an error if there are no more elements.
   * @returns {string} The next input line.
   */
  "next" : function ( ) {
    // Check if there are more elements before attempting to retrieve one.
    if ( ! this . hasNext ( ) ) {
      // If no next element, throw a specific error.
      throw "NoSuchElementException:次に要素は無いよ" ;
    }
    // Get the current element.
    var   returnObj   =   this . list [ this . index ] ;
    // Advance the index to the next position.
    this . index ++ ;
    // Return the retrieved element.
    return   returnObj ;
  } ,

  /**
   * Checks if there are more elements available in the input list.
   * @returns {boolean} True if there are more elements, false otherwise.
   */
  "hasNext" : function ( ) {
    // Compare the current index with the maximum number of elements.
    return   ( this . index   <   this . max ) ;
  }
} ;

// Call the main function to start program execution.
Main ( ) ;

/**
 * Global helper function to get the next input element using the custom object.
 * @returns {string} The next input line.
 */
function   next ( ) {
  // Delegate the call to the 'obj' iterator.
  return   obj . next ( ) ;
}

/**
 * Global helper function to check if there are more input elements.
 * @returns {boolean} True if more elements, false otherwise.
 */
function   hasNext ( ) {
  // Delegate the call to the 'obj' iterator.
  return   obj . hasNext ( ) ;
}

/**
 * Prints the given argument to standard output.
 * @param {*} t The value to be printed.
 */
function   myout ( t ) {
  // Use console.log for standard output.
  console . log ( t ) ;
} // This is the standard output function.

/**
 * Prints the given argument to standard error.
 * @param {*} t The value to be printed.
 */
function   myerr ( t ) {
  // Use console.error for standard error.
  console . error ( t ) ;
} // This is the standard error function.

/*
 * This function provides various conversion utilities for input data.
 * The 'no' parameter specifies the type of conversion to perform.
 *
 * [no] Conversion Type Legend:
 *   - 1: Convert to integer (e.g., "123" -> 123)
 *   - 2: Split string by half-width space into an array of strings (e.g., "a b c" -> ["a", "b", "c"])
 *   - 4: Split string by half-width space and convert elements to numbers (e.g., "1 2 3" -> [1, 2, 3])
 *   - 6: Split string into an array of single characters (e.g., "abc" -> ["a", "b", "c"])
 *   - 7: Split string into single characters and convert to numbers (e.g., "123" -> [1, 2, 3])
 *   - 8: Join array elements with a half-width space (e.g., [1,2,3] -> "1 2 3")
 *   - 9: Join array elements with a newline character (e.g., [1,2,3] -> "1\n2\n3")
 *   - 0: Join array elements without any separator (e.g., [1,2,3] -> "123")
 *   - Default: Return the input 'i' unchanged if 'no' does not match any case.
 *
 * Error Handling: If any conversion fails, the original input 'i' is returned.
 */
function   myconv ( i ,   no ) {
  try {
    // Use a switch statement to handle different conversion types based on 'no'.
    switch ( no ) {
      case   1 :
        // Convert input to an integer.
        return   parseInt ( i ) ;
      case   2 :
        // Split the string by spaces.
        return   i . split ( " " ) ;
      case   4 :
        // Split by spaces and map each part to a Number.
        return   i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
      case   6 :
        // Split the string into individual characters.
        return   i . split ( "" ) ;
      case   7 :
        // Split into characters and map each to a Number.
        return   i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
      case   8 :
        // Join array elements with a space.
        return   i . join ( " " ) ;
      case   9 :
        // Join array elements with a newline.
        return   i . join ( "\n" ) ;
      case   0 :
        // Join array elements without any separator.
        return   i . join ( "" ) ;
      default :
        // If 'no' is not recognized, return the input as is.
        return   i ;
    }
  } catch ( e ) {
    // In case of any error during conversion, return the original input.
    return   i ;
  }
}

/**
 * The main function where the program's primary logic resides.
 * It reads graph data, builds an adjacency list, and counts connected components using DFS.
 */
function   Main ( ) {
  // Read the first line of input, convert it to an array of numbers.
  // This line typically contains N (number of nodes) and M (number of edges).
  var   one   =   myconv ( next ( ) ,   4 ) ;

  // Extract N (number of vertices/nodes) from the processed input.
  var   N   =   one [ 0 ] ;
  // Extract M (number of edges) from the processed input.
  var   M   =   one [ 1 ] ;

  // Initialize an array to represent the graph's adjacency list and visit status.
  var   list   =   new   Array ( N ) ;

  // Populate the 'list' array with initial node objects.
  // Each node has a 'child' array for its neighbors and a 'visit' flag.
  for ( var   i   =   0 ;   i   <   N ;   i ++ ) {
    list [ i ]   =   {
      "child" : [ ] ,   // An empty array to store neighbors (children).
      "visit" : false   // A flag to track if the node has been visited during traversal.
    } ;
  }

  // Read M lines of input, each representing an edge between two nodes.
  // Build the adjacency list for an undirected graph.
  for ( var   i   =   0 ;   i   <   M ;   i ++ ) {
    // Read an edge (two node indices), converted to numbers.
    var   tmp   =   myconv ( next ( ) ,   4 ) ;
    // Add the second node to the first node's children (adjusting for 0-based indexing).
    list [ tmp [ 0 ] - 1 ] . child . push ( tmp [ 1 ] - 1 ) ;
    // Add the first node to the second node's children (undirected graph).
    list [ tmp [ 1 ] - 1 ] . child . push ( tmp [ 0 ] - 1 ) ;
  }

  // Initialize a counter for connected components.
  var   count   =   0 ;

  // Iterate through all nodes to find unvisited nodes and start DFS.
  for ( var   i   =   0 ;   i   <   N ;   i ++ ) {
    // If the current node has not been visited yet, it's part of a new component.
    if ( ! list [ i ] [ "visit" ] ) {
      // Start a Depth First Search from this unvisited node.
      dfs ( i ) ;
      // Increment the component count after exploring a full component.
      count ++ ;
    }
  }

  /**
   * Performs a Depth First Search (DFS) starting from a given node.
   * Marks visited nodes and recursively explores their unvisited neighbors.
   * @param {number} parent The index of the current node being visited.
   */
  function   dfs ( parent ) {
    // Mark the current node as visited.
    list [ parent ] [ "visit" ]   =   true ;
    // Get the list of children (neighbors) for the current node.
    var   children   =   list [ parent ] [ "child" ] ;

    // Optional: Uncomment for debugging to see parent and its children.
    // myout(parent +" : "+children);

    // Iterate through all children (neighbors) of the current node.
    for ( var   i   =   0 ;   i   <   children . length ;   i ++ ) {
      // If a child has already been visited, skip it to avoid cycles in traversal.
      if ( list [ children [ i ] ] [ "visit" ] ) {
        continue ;
      }
      // This condition is generally for self-loops, but in an undirected graph
      // with no explicit self-loops, it might not be strictly necessary if
      // the graph generation ensures distinct endpoints for an edge.
      if ( children [ i ]   ==   parent ) {
        continue ;
      }
      // Recursively call DFS on the unvisited child.
      dfs ( children [ i ] ) ;
    }
  }

  // Output the total number of connected components found.
  myout ( count ) ;
}