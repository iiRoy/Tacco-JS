function Main(  input  ) {
  /*
   * This is the main function that processes the input and calculates the result.
   * It takes raw input as a string and performs several steps to parse and compute.
   */

  input = input . trim ( ) . split ( "\n" ) . map (
    function ( x ) {
      return x . split ( " " )
    }
  ) ; /* Input is parsed into a 2D array of strings. */

  // Declare and initialize variables for dimensions H and W
  var H = parseInt ( input [ 0 ] [ 0 ] , 10 ) ;
  var W = parseInt ( input [ 0 ] [ 1 ] , 10 ) ;

  var lVl = 10 ; // Define a constant for the number of vertices/levels.
  var graph = [ ] ; // Initialize an empty array to store the graph adjacency matrix.

  // Populate the initial graph from input data.
  for ( var i = 0 ; i < lVl ; i ++ ) {
    graph . push ( input [ i + 1 ] . map ( e => parseInt ( e , 10 ) ) ) ;
  }

  /*
   * Initialize an array v_A to count occurrences.
   * It will store the frequency of each number from 0 to lVl-1.
   */
  var v_A = Array . from ( { length : lVl } , ( ) => 0 ) ;
  var line ; // Temporary variable to hold a line of input.

  // Process the main grid data to populate v_A.
  for ( var i = 0 ; i < H ; i ++ ) {
    line = input [ i + 1 + lVl ] . map ( e => parseInt ( e , 10 ) ) ;

    // Iterate through each number in the current line.
    for ( var x of line ) {
      // If the number is -1, skip it as it's a placeholder.
      if ( x === -1 )
        continue ;

      // Increment the count for the current number in v_A.
      v_A [ x ] ++ ;
    }
  }

  // --- Core Algorithm: Floyd-Warshall for All-Pairs Shortest Path ---
  // This section calculates the shortest path between all pairs of nodes in the graph.
  for ( var k = 0 ; k < lVl ; k ++ ) { // Intermediate node
    for ( var i = 0 ; i < lVl ; i ++ ) { // Source node
      for ( var j = 0 ; j < lVl ; j ++ ) { // Destination node
        // Update the shortest path if a shorter path is found via node k.
        graph [ i ] [ j ] = Math . min ( graph [ i ] [ j ] , graph [ i ] [ k ] + graph [ k ] [ j ] ) ;
      }
    }
  }
  // --- End of Floyd-Warshall ---

  var ans = 0 ; // Initialize the answer variable.

  // Calculate the final answer based on shortest paths and frequencies.
  for ( var i = 0 ; i < lVl ; i ++ ) {
    // Accumulate the product of shortest path to node 1 and its frequency.
    ans += graph [ i ] [ 1 ] * v_A [ i ] ;
  }

  // Output the final calculated answer to the console.
  console . log ( ans ) ;

}


/*
 * Call the Main function with input read from standard input.
 * The 'fs' module is used to read the file, and 'utf8' specifies the encoding.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;