/*
 * This JavaScript code reads integer pairs from standard input,
 * interpreting them as height (H) and width (W) to draw a rectangle
 * of '#' characters. The program terminates when it encounters
 * a line where both H and W are zero.
 */


function stdin ()
{
  // Synchronously read the entire content of standard input.
  // The '/dev/stdin' path is typical for Unix-like systems.
  // 'utf8' specifies the encoding for the input.
  var stdin = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

  // Split the input string into an array of lines.
  // The regex handles both Unix (\n) and Windows (\r\n) line endings.
  return stdin . split ( / \n \r? / ) ;
}



// The 'every' method is used here to iterate over each line
// and stop processing if the callback returns 'false'.
// This is a common pattern in competitive programming for problems
// with a "stop on 0 0" condition.
stdin ( ) . every ( function ( line )
{
  // Declare a temporary array to hold the split parts of the line.
  var tmp = line . split ( ' ' ) ,
      // Parse the first part as the height (H). The unary '+' converts string to number.
      H   =   + tmp [ 0 ] ,
      // Parse the second part as the width (W).
      W   =   + tmp [ 1 ] ;

  // Check for the termination condition: H is 0 AND W is 0.
  // If true, return 'false' to stop the 'every' loop.
  // Otherwise, proceed to print the rectangle.
  return ! H && ! W
    ? false
    // If not termination, construct and print the rectangle.
    // `new Array(W+1).join('#')` creates a row of 'W' '#' characters.
    // `+ "\n"` appends a newline to each row.
    // `new Array(H+1).join(...)` repeats this row 'H' times.
    // `!console.log(...)` prints the string and then returns 'true'
    // (since console.log returns undefined, !undefined is true),
    // allowing 'every' to continue to the next line.
    : ! console . log (
        new Array ( H + 1 ) . join (
          new Array ( W + 1 ) . join ( '#' ) + "\n"
        )
      ) ;
} ) ;