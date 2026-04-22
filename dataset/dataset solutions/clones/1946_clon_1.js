/* This is a Type I clone of the original JavaScript code.
 * All logical elements, identifiers, and operators are preserved exactly.
 * Only whitespace and comments have been altered.
 */

function Main  ( input )
{
  // First, split the input string by newline characters to get an array of lines.
  const  result  =  input . split ( '\n' ) ;

  // Then, extract the first element as the count and convert it to an integer.
  // The shift() method also removes this element from the 'result' array.
  const   count   =   parseInt ( result . shift ( ) ) ;

  // Finally, filter the 'result' array to keep only unique elements.
  // This effectively removes duplicate lines from the remaining input.
  const    answer    =    result . filter ( ( item ,  index )   =>   result . indexOf ( item )    ===    index ) ;
} // End of the Main function definition.


/*
 * The following section handles standard input/output.
 * Please do not modify this part, as it's responsible for reading input
 * and invoking the 'Main' function with the provided data.
 * It reads the entire standard input at once and passes it to Main.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;