/* This is a Type I clone of an original JavaScript program.
 * It processes input lines, sums their digits, and prints the result.
 * The program terminates if a line containing '0' is encountered.
 *
 * This version includes extensive whitespace modifications and comments
 * to visually differentiate it from the original, while maintaining
 * identical functionality and structure.
 */


// Declare an immediately invoked function expression (IIFE).
// This function takes 'input' as its sole argument.
( function ( input )
  {

    // Split the entire input string by newline characters
    // to get an array where each element is a line from the input.
    var p = input . split ( '\n' ) ;

    // Initialize a loop counter 'i' and iterate through each line in the 'p' array.
    for ( var i = 0 ; i < p . length ; i ++ )
    {
        // Assign the current line from the array to variable 'x'.
        var x = p [ i ] ;

        // Check if the current line 'x' is numerically equal to zero.
        // This acts as a termination condition for the program.
        if ( x == 0 )
        {
            // If '0' is encountered, exit the anonymous function,
            // effectively stopping further processing.
            return ;
        }


        // If 'x' is not '0', proceed to calculate the sum of its digits.
        // This is done by:
        // 1. Splitting the string 'x' into an array of individual characters (digits).
        // 2. Using the 'reduce' method to sum these characters.
        console . log ( x . split ( '' ) . reduce ( function ( a , b )
        {
            // Inside the reduce callback:
            // 'a' is the accumulator (the running total).
            // 'b' is the current character (digit) from the split array.
            // Both 'a' and 'b' are converted to numbers before addition
            // to ensure numerical summation rather than string concatenation.
            return Number ( a ) + Number ( b ) ;

        } ) ) ; // Close of reduce() and console.log().

    } // Close of the for loop.

  }
)
// Immediately invoke the function with the content of '/dev/stdin'.
// 'require('fs')' imports the Node.js file system module.
// '.readFileSync('/dev/stdin', 'utf8')' reads the standard input synchronously
// and decodes it using UTF-8 encoding.
( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;


// End of the Type I cloned code.