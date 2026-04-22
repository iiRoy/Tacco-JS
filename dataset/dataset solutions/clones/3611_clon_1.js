/* This is an extensively modified Type I clone.
   All identifiers, operators, and expressions are identical to the original.
   Only whitespace and comments have been altered.
*/
"use strict" ; /* Enforce strict mode for cleaner code practices. */


// This function serves as the main entry point for the program.
function Main ( input )
{

  // Split the input string by newline characters to get an array of lines.
  let   lines   =   input . split ( "\n" ) ;


  // Extract the first line, remove leading/trailing whitespace, and store it in variable S.
  let S = lines . shift ( ) . trim ( ) ; // S holds the main string.


  // Extract the second line, remove whitespace, and convert it to K. (Implicitly, K is a number from context but it's still a string here).
  let K   =   lines . shift ( ) . trim ( ) ; // K holds the count or index.


  // Begin a loop that iterates up to K times, or until the end of string S, whichever comes first.
  for ( let i = 0 ; i < K && i < S . length ; i ++ )
  {
    // Check if the character at the current index 'i' in string S is not '1'.
    if ( S . charAt ( i ) != 1 )
    {
      // If it's not '1', print that character to the console.
      console . log ( S . charAt ( i ) ) ;

      // Terminate the function execution immediately.
      return ;
    }
  }


  // If the loop completes without finding a character other than '1',
  // or if K was 0, print the character at index K in string S.
  // Note: If K was a string, charAt(K) might implicitly convert K to a number.
  console . log ( S . charAt ( K ) ) ;

} // End of the Main function block.


// Execute the Main function, reading input from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Standard input processing.
/* End of file. */