// This is the main function that processes the input received from standard input.
function Main( input ) {
  // First, the entire input string is split into an array of lines based on newline characters.
  input = input . split( "\n" ) ;

  /*
   * This multi-line comment block contains code that appears to be
   * an alternative or previous way of parsing input for 'n' and an array 'a'.
   * It has been commented out, indicating it's not currently in use for this specific problem.
   *
   * var n = parseInt(input[0],10);
   * var a = input[1].split(" ");
   *
   * for(var i = 0;i < n;i++){
   *     a[i] = parseInt(a[i],10);
   * }
   */

  // The first line of input contains three space-separated integers: N, L, and T.
  input[0] = input[0] . split( " " ) ;

  // Parse N (number of elements), L (length parameter), and T (time parameter).
  var n    = parseInt( input[0][0], 10 ) ;
  var l    = parseInt( input[0][1], 10 ) ;
  var t    = parseInt( input[0][2], 10 ) ;

  // Declare arrays that will store X-coordinates, weights (directions),
  // final X-coordinates after time 't' (afx), and change counts.
  var x, w, afx, change ;

  // Initialize these arrays with a fixed size, assuming N will not exceed 100000.
  x      = new Array( 100001 ) ;
  w      = new Array( 100001 ) ;
  afx    = new Array( 100001 ) ;
  change = new Array( 100001 ) ;

  // Loop through the subsequent input lines (from index 1 to N) to populate
  // the 'x' and 'w' arrays for each of the 'n' elements.
  for ( var i = 0 ; i < n ; i ++ ) {
    input[ i + 1 ] = input[ i + 1 ] . split( " " ) ; // Split each element's line by space.
    x[ i ]         = parseInt( input[ i + 1 ][0], 10 ) ; // X-coordinate of the i-th element.
    w[ i ]         = parseInt( input[ i + 1 ][1], 10 ) ; // Weight/direction of the i-th element (1 or 2).
    change[ i ]    = 0 ;                                 // Initialize the change counter for this element to zero.
  }


  // Calculate the 'afx' (after-time-x) positions for all elements.
  // These are their final positions after time 't', considering wrap-around.
  for ( var i = 0 ; i < n ; i ++ ) {
    var a ; // 'a' will be the direction multiplier.
    if ( w[ i ] == 1 ) {
      a = 1 ; // If weight is 1, move in positive direction.
    } else {
      a = -1 ; // If weight is 2, move in negative direction.
    }
    // Calculate the new position: (current_x + time * direction) modulo L.
    afx[ i ] = ( x[ i ] + t * a ) % l ;
    // Ensure the result is non-negative by adding L if it's negative.
    if ( afx[ i ] < 0 ) {
      afx[ i ] += l ;
    }
  }

  // This loop calculates how many times the first element (index 0)
  // effectively 'crosses' other elements due to their relative movement.
  for ( var i = 1 ; i < n ; i ++ ) {
    if ( w[0] == w[i] ) {
      // If the first element and the current element move in the same direction,
      // they never cross each other relatively within a single cycle.
      change[ i ] = 0 ;
    } else {
      // If they move in opposite directions, calculate potential crossings.
      var d = t * 2 ; // This represents the total relative distance covered.

      var b, c ; // Temporary variables to store positions for comparison.

      if ( w[0] == 1 ) {
        // If the first element moves right.
        b = x[0] ; // b is the first element's position.
        c = x[i] ; // c is the current element's position.
      } else {
        // If the first element moves left.
        b = x[i] ; // b is the current element's position.
        c = x[0] ; // c is the first element's position.
      }
      change[ i ] = 0 ; // Initialize change count for the current element.

      if ( c >= b ) {
        // If 'c' is ahead of or at 'b' (in the direction of 'b's movement).
        d -= c - b ;
      } else {
        // If 'c' is behind 'b' (considering wrap-around).
        d -= l - b + c ;
      }

      if ( d >= 0 ) {
        change[ i ] ++ ; // If 'd' is non-negative, they cross at least once.
      } else {
        d = 0 ; // Otherwise, no crossings.
      }
      // Add the number of full cycles of crossings.
      change[ i ] += d / l | 0 ; // Using bitwise OR 0 for integer division.
    }
  }

  // Sum up all the individual 'change' counts to get a total shift.
  var sum = 0 ;

  for ( var i = 1 ; i < n ; i ++ ) {
    sum += change[ i ] ;
  }
  sum %= n ; // Take modulo 'n' as the shifts effectively cycle through positions.

  // If the first element moves left (w[0] == 2), adjust the sum.
  if ( w[0] == 2 ) {
    sum = ( n - sum ) % n ;
  }

  // Store the final position of the first element (afx[0]) as a reference.
  var rem = afx[0] ;

  // Add a very large sentinel value at index 'n' to the afx array.
  // This helps ensure elements at the true end are properly handled during sorting.
  afx[ n ] = 10000000000 ;

  // Sort the 'afx' array in ascending order.
  // The custom comparison function ensures stable sorting for numbers.
  afx . sort( function( a, b ) {
    if ( a < b ) {
      return -1 ; // 'a' comes before 'b'.
    }
    if ( a > b ) {
      return 1 ; // 'b' comes before 'a'.
    }
    return 0 ; // 'a' and 'b' are equal.
  } ) ;

  // Find the 'start' index in the sorted 'afx' array from which to begin printing.
  // This accounts for the original position of the first element and its total shift.
  var start ;
  // Add a very small sentinel value at index 'n' (overwriting the previous large one).
  // This is likely used to simplify boundary checks in the loop.
  afx[ n ] = -1000 ;

  for ( var i = 0 ; i < n ; i ++ ) {
    // Look for the unique position of 'rem' (afx[0]'s final position).
    if ( afx[ i ] == rem && afx[ ( i + 1 ) % n ] != rem ) {
      start = i ;
      break ; // Found the starting point.
    }
    // Handle cases where 'rem' might appear multiple times in the sorted array.
    else if ( afx[ i ] == rem && afx[ ( i + 1 ) % n ] == rem ) {
      if ( w[0] == 1 ) {
        start = i + 1 ; // If moving right, take the next identical position.
      } else {
        start = i ;     // If moving left, take the current identical position.
      }
      break ; // Found the starting point.
    }
  }

  // Adjust the 'start' index further based on the aggregated 'sum' of changes.
  // This effectively rotates the sorted array to align with the original first element's final position.
  start = ( n + start - sum ) % n ;

  // Finally, print the elements of the sorted 'afx' array, starting from the calculated 'start' index.
  // The output wraps around if 'start' reaches the end of the array.
  for ( var i = 0 ; i < n ; i ++ ) {
    console . log( afx[ start ++ ] ) ; // Print element and then increment 'start'.
    if ( start == n ) {
      start = 0 ; // If 'start' goes past the last element, reset to 0 to wrap around.
    }
  }
} // End of the Main function definition.


// This line executes the Main function by reading input from standard input.
// 'require('fs').readFileSync('/dev/stdin', 'utf8')' reads the entire content
// of the standard input stream as a UTF-8 encoded string.
Main( require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ) ;