/*
 * This function processes the entire input data provided as a string.
 */
function Main ( input )
{
  // Split the input string into lines based on the newline character.
  var   line = input .split ( "\n" ) ;


  // The first line contains space-separated values.
  var   tmp = line [ 0 ] .split ( " " ) ;


  // Parse the first value from the temporary array as N.
  var   N = Number ( tmp [ 0 ] ) ;


  // Parse the second value from the temporary array as M.
  var   M = Number ( tmp [ 1 ] ) ;


  // Calculate the initial answer using the absolute product of (M-2) and (N-2).
  var   ans = Math .abs ( ( M - 2 ) * ( N - 2 ) ) ;


  // Check if the calculated answer exceeds a very large number (10^15).
  if ( ans > 1000000000000000 )
  {
    // If it exceeds, perform a more elaborate calculation.
    // This likely handles cases where direct multiplication might overflow or
    // requires a string representation for extremely large results.
    var   Ntop = Math .floor ( N / 1000 ) ;
    var   Nbottom = N % 1000 ;

    var   ansbottom = ( Nbottom - 2 ) * Math .abs ( M - 2 ) ;

    // Reassign 'ans' by combining parts of the calculation as strings.
    var   ans = ( Ntop * Math .abs ( M - 2 ) + Math .floor ( ansbottom / 1000 ) ) + "" ;
    ans += ansbottom % 1000 + "" ;
  }


  // Output the final calculated answer to the console.
  console .log ( ans ) ;
}


/*
 *  DO NOT MODIFY THE CODE BELOW THIS LINE.
 *  It handles reading input from standard input and invoking the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;