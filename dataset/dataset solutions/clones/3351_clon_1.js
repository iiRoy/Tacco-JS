function Main ( input ) {
  // This function processes the main logic based on the provided input string.

  input = input . split ( "\n" ) ; // Split the input string into an array of lines.

  var N = parseInt ( input [ 0 ] ) ; // Parse the first line as an integer N.
                                     // N represents the number of nodes in the graph.

  var edge = new Array ( N ) ; // Initialize an array to store adjacency lists for graph edges.
                               // Each element `edge[i]` will be an array of neighbors for node `i`.

  var dp = new Array ( N ) ; // Initialize a dynamic programming array.
                             // `dp[i]` will store a pair of values related to node `i`.

  var mod = Math.pow ( 10 , 9 ) + 7 ; // Define a modulo constant for calculations to prevent overflow.

  // Loop to read N-1 edges and build the adjacency list.
  for ( var i = 0 ; i < N - 1 ; i ++ ) {
    // Read each edge from the input.
    // Each line (after the first) describes an edge.
    tmp = input [ i + 1 ] . split ( " " ) . map ( i => parseInt ( i ) ) ;

    // Initialize adjacency lists if they are undefined for the current nodes.
    if ( edge [ tmp [ 0 ] - 1 ] == undefined ) {
      edge [ tmp [ 0 ] - 1 ] = [ ] ;
    }

    if ( edge [ tmp [ 1 ] - 1 ] == undefined ) {
      edge [ tmp [ 1 ] - 1 ] = [ ] ;
    }

    // Add connections for an undirected graph.
    // Node indices are 0-based, so subtract 1.
    edge [ tmp [ 0 ] - 1 ] . push ( tmp [ 1 ] - 1 ) ;
    edge [ tmp [ 1 ] - 1 ] . push ( tmp [ 0 ] - 1 ) ;
  }


  var flag = new Array ( N ) . fill ( 0 ) ; // An array to keep track of visited nodes or state during traversal.

  // Handle the base case where N is not equal to 1.
  if ( N != 1 ) {

    flag [ 0 ] = 1 ; // Mark the starting node (node 0) as visited/processed.

    // Initialize DP values for leaf nodes.
    for ( var i = 0 ; i < N ; i ++ ) {
      if ( edge [ i ] . length == 1 ) { // If a node has only one neighbor, it's a leaf (or root in a 2-node graph).
        dp [ i ] = [ 1 , 1 ] ; // Initialize DP values for this leaf node.
        flag [ i ] = 1 ; // Mark this leaf node as processed.
      } else {
        dp [ i ] = [ 0 , 0 ] ; // Otherwise, initialize with zeros.
      }
    }

    dp [ 0 ] = [ 0 , 0 ] ; // Re-initialize DP for node 0, as it might have been set as a leaf.

    var stack = [ 0 ] ; // Initialize a stack for a depth-first-like traversal. Start from node 0.

    // Main loop for the tree traversal and DP calculation.
    while ( stack . length != 0 ) {
      var term = 0 ; // A flag to indicate if a new node was pushed onto the stack.
      var white = 1 ; // Accumulator for 'white' paths.
      var black = 1 ; // Accumulator for 'black' paths.

      var length = stack . length - 1 ; // Get the index of the top element of the stack.

      // Iterate through neighbors of the current node (top of the stack).
      for ( var i = 0 ; i < edge [ stack [ length ] ] . length ; i ++ ) {

        // Check if the neighbor has not been visited yet.
        if ( flag [ edge [ stack [ length ] ] [ i ] ] == 0 ) {
          flag [ edge [ stack [ length ] ] [ i ] ] = 1 ; // Mark neighbor as visited.
          stack . push ( edge [ stack [ length ] ] [ i ] ) ; // Push neighbor onto stack to explore.
          term = 1 ; // Set term flag, indicating a new node was pushed.
        } else {
          // If the neighbor has been visited, it means we are returning from a child.
          // Use its DP values to update current node's DP.
          var sub1 = Math . max ( 1 , ( dp [ edge [ stack [ length ] ] [ i ] ] [ 0 ] + dp [ edge [ stack [ length ] ] [ i ] ] [ 1 ] ) % mod ) ;
          var sub2 = Math . max ( 1 , dp [ edge [ stack [ length ] ] [ i ] ] [ 0 ] ) ;

          white = ( white * sub1 ) % mod ; // Update white path count.
          black = ( black * sub2 ) % mod ; // Update black path count.
        }
      }

      // If no new node was pushed (meaning all neighbors were already visited, or it's a leaf),
      // then we can compute DP for the current node and pop it.
      if ( term == 0 ) {
        dp [ stack [ length ] ] = [ white , black ] ; // Store computed DP values.
        stack . pop ( ) ; // Remove current node from stack.
      }
    }

    // The final answer is the sum of DP values for node 0.
    var ans = ( dp [ 0 ] [ 0 ] + dp [ 0 ] [ 1 ] ) % mod ;

  } else {
    // Special case: if N is 1 (a single node graph).
    var ans = 2 ; // A single node can be colored in 2 ways (white or black).
  }

  console . log ( '%s' , ans ) ; // Output the final answer.

  return ans ; // Return the calculated answer.
}

// This is a debug function, likely used in an online judge environment.
// It's not part of the core algorithm.
function debug ( n ) {
  var input = document . getElementById ( "input" + n ) . value ; // Get input from a DOM element.
  var ans = Main ( input ) ; // Run the main logic.
  var result = "WA" ; // Initialize result as "Wrong Answer".

  // Compare the calculated answer with the expected output from a DOM element.
  if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] ) {
    result = "AC" ; // If they match, it's "Accepted".
  }

  document . getElementById ( "result" + n ) . innerHTML = result ; // Display the result.
}

// This line is for running the Main function in a Node.js environment,
// reading input from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;