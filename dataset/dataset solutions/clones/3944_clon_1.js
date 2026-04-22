/* This is a Type I clone example.
 * The original code processes input data.
 */
function Main( input )
{
  // Input data is provided as a single string.
  // We split it by newline characters to get an array of lines.
  input = input . split( "\n" ) ;


  // The second line (index 1) contains two space-separated values.
  // We store them in a temporary array.
  tmp = input [ 1 ] . split( " " ) ;

  /*
   * For converting strings to decimal integers,
   * parseInt() is the appropriate function.
   * The radix (base 10) is explicitly provided.
   */
  var human = parseInt( input[ 0 ], 10 ) ;

  var day = parseInt( tmp[ 0 ], 10 ) ;
  var kekka = parseInt( tmp[ 1 ], 10 ) ;

  // Loop through a range determined by 'human'.
  for ( var i = 1 ; i <= human ; i++ )
  {
    // Check if 'day' is perfectly divisible by the (i+1)-th input value.
    if ( day % input[ i + 1 ] == 0 )
    {
      // If divisible, add the quotient to 'kekka'.
      kekka += day / input[ i + 1 ] ;
    }
    else
    {
      // If not divisible, calculate 'a'.
      var a = day / parseInt( input[ i + 1 ], 10 ) ;

      // Add the floor of 'a' plus one to 'kekka'.
      kekka += Math . floor( a ) + 1 ;
    }
  }

  // Output the final calculated result to the console.
  console . log( kekka ) ;
}

// This section handles standard input/output.
// Do not modify anything below this line, as per original instructions.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;