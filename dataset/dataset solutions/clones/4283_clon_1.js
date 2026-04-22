// This is a JavaScript program designed to find a specific character sequence.
// It serves as an example of a Type I code clone,
// where only whitespace and comments are altered.

"use strict" ;


const main =  arg  =>  {

  arg  =  arg . trim ( ) . split ( "\n" ) ; // First, process the raw input string.

  const S  =  arg [ 0 ] . split ( "" ) ; // Then, extract the first line and convert it into an array of characters.

  let previous  =  null ; // Initialize a variable to keep track of the character encountered just before the current one.


  for  ( let i in S )  { // Iterate through each character in the array S.

      if  ( previous  ===  "A"  &&  S [ i ]  ===  "C" )  { // Check if the previous character was 'A' and the current one is 'C'.

          console . log ( "Yes" ) ; // If the "AC" pattern is found, print "Yes".

          return ; // And terminate the program immediately.

      }

      previous  =  S [ i ] ; // If the pattern is not found, update 'previous' to the current character for the next iteration.

  }

  console . log ( "No" ) ; // If the loop completes without finding the "AC" pattern, print "No".

}


// The main function is invoked here, reading its input from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;