/*
 * This is the primary function responsible for processing the program's input.
 * It accepts a single string parameter, which represents the raw input data.
 */
function   Main   (   input   )
{
  // The input string is tokenized by spaces, creating an array of string representations of numbers.
  var   inputary   =   input . split   (   " "   ) ;

  // The first element of the parsed input array is converted from a string to an integer base 10.
  var   a   =   parseInt   (   inputary [   0   ] ,   10   ) ;

  // The second element of the parsed input array is converted from a string to an integer base 10.
  var   b   =   parseInt   (   inputary [   1   ] ,   10   ) ;

  // The third element of the parsed input array is converted from a string to an integer base 10.
  var   c   =   parseInt   (   inputary [   2   ] ,   10   ) ;


  // Evaluate the condition: Are all three numerical variables strictly equal to each other?
  if   (   a   ===   b   &&   b   ===   c   )
  {
    // If the condition holds true (all numbers are identical), output "Yes".
    console . log   (   "Yes"   ) ;
  }
  else
  {
    // Otherwise, if the numbers are not all identical, output "No".
    console . log   (   "No"   ) ;
  }
} // End of the Main function block.


// This line reads data from standard input, typically a file, and then invokes the Main function with that data.
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin" ,   "utf8"   )   ) ;