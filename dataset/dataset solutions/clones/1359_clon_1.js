// This is a Type I clone of an original JavaScript program.
// It demonstrates basic file reading and conditional logic.

"use strict" ; // Enforce strict mode for cleaner code.


var    hoge = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ; // Read input from standard input.

// Split the input string by space to get individual numbers.
var   num   = hoge . split ( " " ) ;


var a     = num[0]  ; // First number from input.
var b     = num[1]  ; // Second number from input.

  /*
   * Start of conditional block to compare 'a' and 'b'.
   * This structure checks for equality, greater than, and less than.
   */
if (a  ==  b)
{
  console.log ( 'a == b' ) ; // Output if 'a' is equal to 'b'.
}
else if (a > b)
{
  console.log ( 'a > b' ) ; // Output if 'a' is greater than 'b'.
}
else
{
  console.log ( 'a < b' ) ; // Output if 'a' is less than 'b' (the default case).
}

// End of program logic.