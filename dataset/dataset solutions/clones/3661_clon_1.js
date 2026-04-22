var toInt = x => parseInt( x , 10 ) ; // Converts a string to an integer with base 10.

var toIntArr = arr => arr . map( x => toInt( x ) ) ; // Maps an array of strings to an array of integers.

var abs = x => x > 0 ? x : -x ; // A custom absolute value function.

function min ( ) {
  // This function finds the minimum value among its arguments.
  var rest = arguments ;
  var val = rest[ 0 ] ;

  for ( var i = 1 ; i < rest . length ; i++ ) {
    if ( rest[ i ] < val ) {
      val = rest[ i ] ;
    }
  }
  return val ;
}

function max ( ) {
  // This function finds the maximum value among its arguments.
  var rest = arguments ;
  var val = rest[ 0 ] ;

  for ( var i = 1 ; i < rest . length ; i++ ) {
    if ( rest[ i ] > val ) {
      val = rest[ i ] ;
    }
  }
  return val ;
}

// Main execution block: reads input from stdin and calls the Main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;


function Main( input ) {
  // The primary logic of the program resides here.

  // Split the input string by newlines to get an array of lines.
  var input = input . split( '\n' ) ;

  // Process the first line to get N and M.
  var temp1 = input[ 0 ] . split( ' ' ) ;
  var n = toInt( temp1[ 0 ] ) ; // N represents some upper bound or size.
  var m = toInt( temp1[ 1 ] ) ; // M represents the number of intervals or operations.

  // Initialize an array to store pairs of values.
  var abs = [ ] ; // Renamed from original for clarity within this scope.

  // Loop M times to populate the 'abs' array.
  for ( var i = 0 ; i < m ; i++ ) {
    // Read each line, split by space, and convert to integers.
    c = toIntArr( input[ i + 1 ] . split( ' ' ) ) ;
    a = c[ 0 ] ; // First element of the pair.
    b = c[ 1 ] ; // Second element of the pair.
    abs[ i ] = [ a , b ] ; // Store the pair.
  }

  // Initialize left (l) and right (r) pointers for an interval.
  var l = 0 ;
  var r = n - 1 ; // Initial interval spans from 0 to N-1.

  var ab ; // Temporary variable to hold a pair from 'abs'.

  var ans = 1 ; // Initialize the answer counter.

  // Iterate through the stored pairs.
  for ( var i = 0 ; i < m ; i++ ) {
    ab = abs[ i ] ; // Get the current pair [a, b].

    // Check if the current interval [ab[0], ab[1]] is completely outside the current [l, r] interval.
    if ( ab[ 1 ] <= l || r <= ab[ 0 ] ) {
      ans++ ; // If outside, increment the answer.
      l = ab[ 0 ] ; // Update the left pointer to the current pair's left.
      r = ab[ 1 ] ; // Update the right pointer to the current pair's right.
    } else {
      // If there is an overlap, update the interval [l, r] to be the intersection.
      l = max( l , ab[ 0 ] ) ; // New left is the maximum of current l and ab[0].
      r = min( r , ab[ 1 ] ) ; // New right is the minimum of current r and ab[1].
    }
  }

  // Output the final calculated answer.
  console . log( ans ) ;
}