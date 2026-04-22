/*
 * This is the main function responsible for processing input and generating an array.
 * It takes a string 's' as input, parses it, performs calculations, and prints the result.
 */
function Main ( s )
{

  // Parse the input string 's' into an integer 'n'.
  const     n    =    parseInt( s )   ;


  // Initialize an array 'a' with two starting values.
  var a = [ 3 , 5 ] ;

  // Initialize a sum variable 'b' to zero.
  var b = 0    ;


  /*
   * Loop from index 2 up to (n - 2) (exclusive of n-1).
   * Inside the loop, calculate array elements and accumulate their sum.
   */
  for
  (
    var i = 2 ; // Loop counter initialization
    i < n - 1 ; // Loop condition
    i ++        // Loop increment
  )
  {
    // Calculate the value for the current array element.
    a [ i ] = i * 2 ;

    // Add the current array element's value to the sum 'b'.
    b += a [ i ]    ;
  }

  // Perform a complex calculation for the last element of the array 'a'.
  // This calculation involves ceiling division, modulo, and additions.
  a [ n - 1 ] = Math . ceil ( b / 30 ) * 30 - b % 30 + 22 ;


  // Print the elements of array 'a' joined by spaces to the console.
  console . log ( a . join ( " " ) ) ;

}

// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;