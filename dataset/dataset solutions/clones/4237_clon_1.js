/*
 * This is the main program entry point.
 * It processes input from stdin and calculates a result.
 */
function Main ( input )
{
  // Split the input string by newline characters to get an array of lines.
  input = input . split ( "\n" ) ;

  // Parse the first number from the first line of input.
  // This represents the variable 'n'.
  var n = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;

  // Parse the second number from the first line of input.
  // This represents the variable 'm'.
  var m = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

  /*
   * Calculate the final answer 'ans' based on the given formula.
   * The formula is: 2^m * (1900*m + 100*(n-m))
   * Math.pow(base, exponent) calculates base raised to the power of exponent.
   */
  var ans = Math . pow ( 2 , m ) * ( 1900 * m + 100 * ( n - m ) ) ;

  // Output the calculated answer to the console.
  // The '%s' format specifier ensures it's treated as a string.
  console . log ( '%s' , ans ) ;

} // End of Main function definition

// Call the Main function with the content of the standard input.
// require("fs").readFileSync("/dev/stdin", "utf8") reads the entire
// standard input as a UTF-8 encoded string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;