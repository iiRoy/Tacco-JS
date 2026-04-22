/*
 * This is a Type I clone of the original JavaScript program.
 * It processes input to modify a character at a specific position
 * based on an index provided in the input.
 * All logical components, identifiers, and operations remain
 * precisely the same as in the original code.
 * Only whitespace (spacing, indentation, blank lines) and comments
 * have been altered to create a visually distinct but functionally identical version.
 */

function   Main  (  input  ) { // Definition of the primary function named Main begins here.

  // The 'char' variable stores the second line of the input.
  // It's obtained by splitting the input by newline and taking the element at index 1.
  var    char = input . split ( "\n" ) [ 1 ] ;


  // The 'K' variable is extracted from the first line of the input.
  // It's the second space-separated token from the first line.
  var K    =  input.split("\n")[0] . split (  " "  )  [  1  ] ; // K represents the 0-based index to modify.

  // Convert the 'char' string into an array of individual characters.
  // This allows for modification of specific characters by index.
  var   char1   =   char . split ( "" ) ;


  // Retrieve the character at the (K-1)th position from the 'char' string.
  // Convert this character to its lowercase equivalent.
  // Note: K is likely 1-based in the problem statement, hence K-1 for 0-based array access.
  var   a   =   char [ K - 1 ] . toLowerCase ( ) ;


  // Modify the 'char1' array:
  // At index (K-1), remove 1 element and insert the lowercase character 'a'.
  char1 . splice ( K - 1 , 1 , a ) ;

  // Join the characters in the 'char1' array back into a single string.
  // Then, print this resulting string to the console (standard output).
  console . log ( char1 . join ( "" ) ) ;

}   // The Main function concludes here.

// This line executes the Main function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's 'fs' module and passes it as the 'input' argument.
  Main  (  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )  ) ;