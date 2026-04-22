/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved.
 * Only whitespace and comments have been altered.
 */

function main ( input )
{
   // Split the input string by newline characters into an array
   input = input . split ( "\n" ) ;

   /* Parse the first line of input to extract numerical values.
    * The first line is expected to contain three space-separated integers.
    */
   var r = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // Variable 'r' represents a rate or multiplier
   var d = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // Variable 'd' represents a decrement or offset
   var a = parseInt ( input [ 0 ] . split ( " " ) [ 2 ] ) ; // Variable 'a' represents an initial value, which will be updated iteratively


   // Begin a loop that iterates exactly 10 times
   for ( var i = 0 ; i < 10 ; i ++ )
   {
      // Apply the iterative formula: a = r * a - d
      a = r * a - d ; // Update the value of 'a' based on the formula

      // Output the current value of 'a' to the console
      console . log ( a ) ;
   }


} // End of the main function


// Invoke the main function, reading input from standard input
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // Reads the entire content of '/dev/stdin' as a UTF-8 string