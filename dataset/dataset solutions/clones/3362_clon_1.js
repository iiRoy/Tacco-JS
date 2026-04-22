var lines = [ ] ;
// This array will store all input lines.
var   a ; // A general-purpose variable, currently unused.

// Require the 'readline' module for input processing.
var readline = require ( "readline" ) ;
var rl = readline . createInterface ( {
  input: process.stdin ,
  output: process.stdout
} ) ;

// Event handler for each line of input received.
rl . on ( "line" , function ( x )
  {
    lines . push ( x ) ; // Add the current line to the 'lines' array.
  }
) ;

// Event handler for when the input stream closes.
rl . on ( "close" , function ( )
{
  // Process the first line to get L and N values.
  var   tmp = lines . shift ( ) . split ( " " ) ;
  var L = Number ( tmp [ 0 ] ) ; // L represents the length or limit.
  var N = Number ( tmp [ 1 ] ) ; // N represents the number of elements.

  // Initialize an array X of size N.
  var X = Array ( N ) ;
  // Populate array X with numbers from subsequent input lines.
  for ( var i = 0 ; i < N ; i++ )
  {
    X [ i ] = Number ( lines [ i ] ) ;
  }

  // Sort the array X in ascending order.
  X . sort ( function ( a , b ) { return ( a - b ) ; } ) ;

  // Initialize result and pointers for the algorithm.
  var result = 0 ;
  var center = 0 ;
  var right = 0 ;
  var left = N - 1 ;

  // Calculate initial 'a_l' and 'a_r' based on sorted X.
  var a_l = L - X [ left ] ;
  var a_r = X [ right ] ;

  // Main loop to iterate N times.
  for ( var counter = 0 ; counter < N ; counter ++ )
  {
    // Check if moving right is more beneficial or equal.
    if ( a_r <= a_l )
    {
      // If moving right is preferred or equal, add 'a_l' to result.
      result += a_l ;
      center = X [ left ] ; // Update center to the current left element.
      left -- ; // Move left pointer inward.
      a_l = center - X [ left ] ; // Recalculate a_l.
      a_r = L - ( center - X [ right ] ) ; // Recalculate a_r.
    }
    // Otherwise, moving left is more beneficial.
    else
    {
      result += a_r ; // Add 'a_r' to result.
      center = X [ right ] ; // Update center to the current right element.
      right ++ ; // Move right pointer inward.
      a_l = L - ( X [ left ] - center ) ; // Recalculate a_l.
      a_r = X [ right ] - center ; // Recalculate a_r.
    }
  }
  // Output the final calculated result.
  console . log ( result ) ;
} ) ;