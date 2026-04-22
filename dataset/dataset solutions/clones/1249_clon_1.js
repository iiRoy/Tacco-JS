// This script is designed to process arithmetic operations provided through standard input.
// It reads each line, parses operands and an operator, performs the calculation,
// and then concatenates the result into a final string.

/*
 *  The 'fs' module is a core Node.js module that provides an API for interacting
 *  with the file system. Here, it's used to read input synchronously from stdin.
 */
var input = require( 'fs' ) . readFileSync( '/dev/stdin' ,  'utf8' ) ;


// The input string is split into an array of strings, where each element
// represents a single line from the input.
var Arr = input . split( "\n" ) ;


// Initialize an empty string variable. This variable will accumulate
// the results of all arithmetic operations.
var str = "" ;


// Begin a loop that iterates through each line (element) in the 'Arr' array.
// The loop continues as long as 'i' is less than the total number of lines.
for ( var i = 0 ;  i < Arr . length ;  i ++ )
{
  // Inside the loop, each line is further split by spaces to separate
  // the first operand, the operator, and the second operand.
  var arr = Arr[ i ] . split( " " ) ;

  // The first element of the split line is converted to a number.
  // The '-0' is a common JavaScript trick to force numeric conversion.
  var a = arr[ 0 ] - 0 ;

  // The second element is the operator, which remains a string.
  var b = arr[ 1 ] ;

  // The third element is also converted to a number.
  var c = arr[ 2 ] - 0 ;


  // This conditional statement checks if the operator is a question mark.
  // A question mark typically signals the end of input data for processing.
  if ( b === "?" )
    break ; // If it's a question mark, the loop is terminated immediately.


  // Conditional block for addition. If the operator is '+', perform addition.
  if ( b === "+" )
  {
    str += a + c ; // Add 'a' and 'c', then append the result to 'str'.
  }

  // Conditional block for subtraction. If the operator is '-', perform subtraction.
  if ( b === "-" )
  {
    str += a - c ; // Subtract 'c' from 'a', then append the result to 'str'.
  }

  // Conditional block for multiplication. If the operator is '*', perform multiplication.
  if ( b === "*" )
  {
    str += a * c ; // Multiply 'a' by 'c', then append the result to 'str'.
  }

  // Conditional block for division. If the operator is '/', perform integer division.
  if ( b === "/" )
  {
    // Math.floor is used to ensure that the division result is an integer,
    // effectively performing floor division.
    str += Math . floor( a / c ) ;
  }


  // After each operation, a newline character is appended to 'str'.
  // This ensures that each result appears on a new line in the final output.
  str += "\n" ;
}


// Finally, the accumulated string 'str' is printed to the console.
// The .trim() method is called to remove any leading or trailing whitespace
// from the string, which would typically remove the last appended newline
// if no other content follows it.
console . log( str . trim( ) ) ;

// End of the program execution.