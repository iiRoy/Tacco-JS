// This is the primary function responsible for handling the application logic.
function Main ( input )
{
  // The raw input string is first divided into individual lines.
  input = input . split ( '\n' ) ;

  // The very first line of the input is then discarded.
  // This is a common pattern when the first line contains metadata like a total count.
  input . shift ( ) ;

  // Subsequent processing involves transforming each line into an array of integers.
  input = input . map ( function ( e ) {
    // Each line string 'e' is split by spaces to yield an array of string numbers.
    return e . split ( ' ' ) . map ( function ( e ) {
      // Each string number 'e' is then converted into its integer representation.
      return parseInt ( e , 10 ) ; // Base 10 is explicitly specified.
    } ) ;
  } ) ;

  // A variable 'r' is initialized to zero; it will accumulate the final result.
  var r = 0 ;

  // We iterate through the now-parsed input data.
  input . forEach ( function ( e ) { // For every element 'e' (which is now [start, end])...
    // The range length (inclusive) is calculated and added to 'r'.
    // The formula (end - start + 1) correctly counts all numbers in the range.
    r += ( e [ 1 ] - e [ 0 ] + 1 ) ;
  } ) ;

  // Finally, the computed total 'r' is printed to the console.
  console . log ( '%d' , r ) ;

} // End of the Main function definition.

// The Main function is invoked here, supplying input from standard input.
// This uses Node.js's 'fs' module to synchronously read '/dev/stdin'.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;