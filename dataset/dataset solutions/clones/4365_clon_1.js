// This is the main function that processes the input data.
function Main ( input ) {

  // First, the entire input string is split into an array of strings,
  // using the newline character as the delimiter.
  input = input . split ( '\n' ) ;

  // The 'shift()' method removes the first element from the array.
  // This is often done to discard a line containing metadata, like the number of test cases.
  input . shift ( ) ;

  // Now, the input array is transformed using the 'map' method.
  // Each string element is processed to become an array of integers.
  input = input . map ( function ( e ) {
    // Inside the first map, each line (string 'e') is split by spaces.
    // The resulting array of string numbers is then mapped again.
    return e . split ( ' ' ) . map ( function ( e ) {
      // The inner map converts each string number 'e' into an integer using 'parseInt'.
      // The '10' argument specifies base-10 parsing.
      return parseInt ( e , 10 ) ;
    } ) ;
  } ) ;

  // A variable 'r' is declared and initialized to 0.
  // This variable will accumulate the final result.
  var r = 0 ;

  // A standard 'for' loop iterates through each sub-array in the 'input' array.
  for ( var i = 0 ; i < input . length ; i ++ ) {
    // In each iteration, 'r' is incremented by a calculated value.
    // The calculation is (second_number - first_number + 1) from the current sub-array.
    // This typically represents the count of integers in a given range [first_number, second_number].
    r += ( input [ i ] [ 1 ] - input [ i ] [ 0 ] + 1 ) ;
  }

  // Finally, the accumulated result 'r' is printed to the console.
  // '%d' is a format specifier for an integer.
  console . log ( '%d' , r ) ;

} // End of the Main function definition.

// This line calls the Main function, passing it the content of standard input.
// 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the entire content
// of the standard input file synchronously as a UTF-8 encoded string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;