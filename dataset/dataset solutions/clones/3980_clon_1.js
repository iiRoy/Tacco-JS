function Main(  input  ) {
  // This function processes the input to solve a graph-related problem.
  // The input string is first cleaned and parsed into an array of arrays.

  input = input .trim() .split( "\n" ) .map( function( x ) { return x .split( " " ) } ) ;

  // N represents the number of elements or nodes in the problem.
  var N = parseInt( input[ 0 ][ 0 ], 10 ) ;

  /*
   * arr_ab will store the 'red' points (a, b).
   * arr_cd will store the 'blue' points (c, d).
   */
  var arr_ab = [ ] ;
  var arr_cd = [ ] ;

  // Loop to populate the red and blue point arrays.
  for ( var i = 0 ; i < N ; i++ ) {
    arr_ab .push( input[ i + 1 ] .map( e => parseInt( e, 10 ) ) ) ;
    arr_cd .push( input[ i + N + 1 ] .map( e => parseInt( e, 10 ) ) ) ;
  }

  // Initialize arrays to store connections and their counts.
  // arr_redConnection[i] will store indices of blue points that red point 'i' can connect to.
  var arr_redConnection = Array .from( { length: N }, ( ) => [ ] ) ;

  // arr_blueConnection[j] will store indices of red points that blue point 'j' can connect from.
  var arr_blueConnection = Array .from( { length: N }, ( ) => [ ] ) ;

  // arr_redConnectionCount[i] stores the number of blue points red point 'i' can connect to.
  var arr_redConnectionCount = Array .from( { length: N }, ( ) => 0 ) ;

  // arr_blueConnectionCount[j] stores the number of red points blue point 'j' can connect from.
  var arr_blueConnectionCount = Array .from( { length: N }, ( ) => 0 ) ;

  // remainedPaths keeps track of the total number of possible connections.
  var remainedPaths = 0 ;

  // Nested loops to determine all possible connections between red and blue points.
  // A red point (a, b) can connect to a blue point (c, d) if a < c and b < d.
  for ( var i = 0 ; i < N ; i++ ) {
    for ( var j = 0 ; j < N ; j++ ) {
      // Check the connection condition.
      if ( arr_ab[ i ][ 0 ] < arr_cd[ j ][ 0 ] && arr_ab[ i ][ 1 ] < arr_cd[ j ][ 1 ] ) {
        // If connected, add to respective connection lists and increment counts.
        arr_redConnection[ i ] .push( j ) ;
        arr_redConnectionCount[ i ] ++ ;
        arr_blueConnection[ j ] .push( i ) ;
        arr_blueConnectionCount[ j ] ++ ;
        remainedPaths ++ ; // Increment total possible paths.
      }
    }
  }

  /*
   * Variables for the main matching algorithm.
   * tmp: Temporary variable used to find the minimum sum of connection counts.
   * whichIsChosen: Stores the indices [red_point_idx, blue_point_idx] of the chosen connection.
   * ans: The final answer, representing the maximum number of matched pairs.
   * exclude: A 2D array to mark red (index 0) and blue (index 1) points as 'excluded' (matched).
   */
  var tmp ;
  var whichIsChosen = [ -1, -1 ] ;
  var ans = 0 ;
  var exclude = [ Array .from( { length: N }, ( ) => 0 ), Array .from( { length: N }, ( ) => 0 ) ] ;

  // Main loop: continues as long as there are potential paths.
  while ( remainedPaths > 0 ) {
    tmp = 2 * N ; // Initialize tmp with a value larger than any possible sum of counts.

    // Find the connection (i, j) that minimizes (arr_redConnectionCount[i] + arr_blueConnectionCount[j]).
    for ( var i = 0 ; i < arr_redConnection .length ; i++ ) {
      if ( exclude[ 0 ][ i ] === 1 ) continue ; // Skip if red point 'i' is already matched.

      for ( var j of arr_redConnection[ i ] ) {
        if ( exclude[ 1 ][ j ] === 1 ) continue ; // Skip if blue point 'j' is already matched.

        // If current sum of counts is less than or equal to tmp, update tmp and whichIsChosen.
        if ( ( arr_redConnectionCount[ i ] + arr_blueConnectionCount[ j ] ) <= tmp ) {
          tmp = arr_redConnectionCount[ i ] + arr_blueConnectionCount[ j ] ;
          whichIsChosen[ 0 ] = i ; // Store red point index.
          whichIsChosen[ 1 ] = j ; // Store blue point index.
        }
      }
    }

    // Update remainedPaths by subtracting the number of connections removed by this match.
    // Each match removes one path and potentially others connected to the matched points.
    remainedPaths -= ( tmp - 1 ) ;

    ans ++ ; // Increment the count of matched pairs.

    // Update connection counts and lists for blue points connected to the chosen red point.
    // The chosen red point 'whichIsChosen[0]' is now matched.
    for ( var i of arr_redConnection[ whichIsChosen[ 0 ] ] ) {
      // Remove the chosen red point from blue point 'i's connection list.
      arr_blueConnection[ i ] = arr_blueConnection[ i ] .filter( n => n !== whichIsChosen[ 0 ] ) ;
      arr_blueConnectionCount[ i ] -- ; // Decrement count for blue point 'i'.
    }

    // Update connection counts and lists for red points connected to the chosen blue point.
    // The chosen blue point 'whichIsChosen[1]' is now matched.
    for ( var i of arr_blueConnection[ whichIsChosen[ 1 ] ] ) {
      // Remove the chosen blue point from red point 'i's connection list.
      arr_redConnection[ i ] = arr_redConnection[ i ] .filter( n => n !== whichIsChosen[ 1 ] ) ;
      arr_redConnectionCount[ i ] -- ; // Decrement count for red point 'i'.
    }

    // Mark the chosen red and blue points as excluded (matched).
    exclude[ 0 ][ whichIsChosen[ 0 ] ] = 1 ;
    exclude[ 1 ][ whichIsChosen[ 1 ] ] = 1 ;

    // For simplicity or a specific graph representation,
    // the connection list for the chosen red point is updated to just its match.
    // And its count is reset to 1 (representing the single match).
    arr_redConnection[ whichIsChosen[ 0 ] ] = whichIsChosen[ 1 ] ;
    arr_redConnectionCount[ whichIsChosen[ 0 ] ] = 1 ;

    // Similarly for the chosen blue point.
    arr_blueConnection[ whichIsChosen[ 1 ] ] = whichIsChosen[ 0 ] ;
    arr_blueConnectionCount[ whichIsChosen[ 1 ] ] = 1 ;
  }

  // Output the final answer.
  console .log( ans ) ;
}

// Call the Main function with input read from standard input.
Main( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) ) ;