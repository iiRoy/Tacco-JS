/* This script reads an integer from standard input
 * and determines if it is a perfect square.
 *
 * A perfect square is an integer that can be expressed
 * as the product of an integer by itself.
 */

// Utilize Node.js file system module to read input.
// The input is expected to come from /dev/stdin (standard input).
// It's read as UTF-8 and then any leading/trailing whitespace is removed.
const   input   =   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ;

// Declare a variable 'n' using 'var'.
// The input string is parsed into an integer.
// Any whitespace characters within the string are replaced before parsing.
// The radix (base) for parsing is specified as 10 (decimal).
var   n   =   parseInt ( input . replace ( / \s / , "" ) ,  10 ) ;


// Calculate the square root of the number 'n'.
// The result is stored in a constant variable named 'sqrt'.
const   sqrt   =   Math . sqrt ( n ) ;


// Check if the calculated square root is an integer.
// If it is, print "YES" to the console.
// Otherwise, print "No" to the console.
console . log ( Number . isInteger ( sqrt )  ?  "YES"  :  "No" ) ;

// End of program execution.