/*
 * This is a Type I clone of the original JavaScript code.
 *
 * It demonstrates how whitespace and comments can be altered
 * significantly without changing the code's functionality
 * or underlying structure.
 *
 * All identifiers, operators, and expressions remain identical.
 */


function   Main   (   s   )
{

  // Declare a constant 'n'. This constant will store
  // the total number of characters in the input string 's'.
  const   n   =   s   .   length   ;


  // Declare another constant 'p'.
  // This constant will hold the count of occurrences
  // of the character 'p' within the input string 's'.
  // Note: If 'p' is not found, s.match(/p/g) returns null,
  // and accessing .length on null will cause a runtime error.
  // This behavior is preserved as per Type I cloning rules.
  const   p   =   s   .   match   (   /p/g   )   .   length   ;


  // Finally, log the computed result to the console.
  // The calculation involves:
  // 1. Dividing the string length 'n' by 2.
  // 2. Subtracting the count of 'p' characters from the result.
  // 3. Taking the floor of the final calculated value.
  console   .   log   (   Math   .   floor   (   n   /   2   -   p   )   )   ;

} // End of the Main function.


// This section handles the program's execution entry point.
// It reads input from standard input, processes it, and then
// passes the processed string to the 'Main' function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;