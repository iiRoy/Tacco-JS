/*
 * This JavaScript program reads two space-separated words from standard input,
 * compares them lexicographically, and then prints an operand ('=', '<', or '>')
 * indicating the result of the comparison.
 */

// Utilize the Node.js 'fs' module to read synchronous file system operations.
// Specifically, read the entire content of '/dev/stdin' as a UTF-8 string.
var     input   =   require (  "fs"  ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   ;



// Split the obtained input string by a single space character.
// This operation is expected to produce an array of strings, where each element
// corresponds to a word from the input.
var     words   =   input . split (  ' '  )   ;


// Declare a variable named 'operand'.
// This variable will store the character representing the comparison result.
var     operand     ;

// Begin conditional logic to determine the appropriate operand.

if  ( words [  0  ]   ===   words [  1  ] )
{
  // If the first element (first word) is strictly equal to the second element (second word).
  // In this case, the words are identical.
  operand   =   '='   ;
}
else    if  ( words [  0  ]   <   words [  1  ] )
{
  // Else, if the first element is lexicographically less than the second element.
  // This means the first word comes before the second word in dictionary order.
  operand   =   '<'   ;
}
else
{
  // Otherwise (if not equal and not less than), the first element must be
  // lexicographically greater than the second element.
  operand   =   '>'   ;
}

// Output the determined operand character to the standard output console.
console . log (  operand  )   ;