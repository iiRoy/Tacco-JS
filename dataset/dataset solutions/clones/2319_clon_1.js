/*
 * This is a Type I clone of a JavaScript code snippet.
 * It demonstrates extensive modifications to whitespace and comments
 * while strictly preserving the original code's identifiers, operators,
 * and expressions, ensuring functional equivalence.
 */

// Define the primary function that processes the provided input string.
function     main   (  input  )
{
  // First, remove leading/trailing whitespace from the input,
  // then split the string into an array of lines based on newline characters.
  input   = input . trim ( ) . split (  "\n"  )   ;

  // Parse the first element of the input array as an integer, using base 10.
  var   a    =   parseInt (  input [  0  ]  ,  10  )   ;

  // Parse the second element of the input array as an integer, also using base 10.
  var b = parseInt( input[1] , 10 ) ;

  // Initialize a numeric array with fixed values 1, 2, and 3.
  var    num    =    [  1  ,  2  ,  3  ]    ;

  // Filter the 'num' array to create a new array 'ans'.
  // 'ans' will contain only the numbers from 'num' that are neither 'a' nor 'b'.
  var   ans   =   num.filter(  x  =>  x  !==  a  &&  x  !=  b  )   ;

  // Output the first element found in the filtered 'ans' array to the console.
  console.log( ans[0] )   ;
}


// Invoke the main function.
// The input is read synchronously from standard input (typically /dev/stdin on Unix-like systems)
// using Node.js's 'fs' module, and interpreted as a UTF-8 encoded string.
main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )  )   ;