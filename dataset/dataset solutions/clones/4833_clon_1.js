/* This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered for visual distinction.
 */
"use strict"
; // Enforce strict mode for better error handling and cleaner code

const main =  (  arg  )  =>
{
  // The primary function responsible for processing the input.

  const s  =  arg
    .split ( "\n" ) [0] // Split the input string by newline, then take the first element (first line).
    .split ( " " ) [1]  // Split the first line by space, then take the second element.
    .split ( "" ) [0]   // Split the second element into individual characters, then take the first character.
  ; // End of variable 's' assignment.

  console.log  (  "A"  +  s  +  "C"  )
  ; // Output the concatenated string to the standard console.
} // End of the 'main' function definition.

// Execute the main function with data read from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) )
; // The 'fs' module is used to read the file, and 'utf8' specifies the encoding.