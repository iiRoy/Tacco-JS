/*
 * This is a Type I clone of a JavaScript program.
 * It processes input to determine a specific pattern.
 * All identifiers and logic remain identical to the original.
 */

// Define the main function that processes the input.
function   main  (  input  )
{
  // First, declare a constant to hold the processed parameters.
  // The input string is trimmed of leading/trailing whitespace,
  // then split into an array of strings by newlines or spaces.
  // Finally, each string is converted to an integer using the bitwise NOT operator twice (~~).
  const   params   =   input .   trim   (   ) .   split   (   /[\n\s]/   ) .   map   (   str   =>   ~~str   )   ;

  // Initialize a mutable array 'tmp' with four zero values.
  // This array will act as a frequency counter for input values.
  var   tmp   =   [   0   ,   0   ,   0   ,   0   ]   ;

  // Iterate over each parameter obtained from the input.
  params .   forEach   (   param   =>
  {
    // Increment the counter in the 'tmp' array at the index corresponding to the parameter value.
    // Assuming parameters are 1-indexed (e.g., 1, 2, 3, 4), so we subtract 1 for 0-indexed array access.
    tmp   [   param   -   1   ]   ++   ; // Increment the count.
  }   )   ;

  // Sort the 'tmp' array in ascending order.
  // This is crucial for the subsequent pattern check.
  tmp .   sort   (   )   ;

  // Declare a constant 'res' to store the boolean result of the pattern check.
  // The pattern checks if the sorted counts are exactly 1, 1, 2, and 2 in that order.
  const   res   =   tmp   [   0   ]   ===   1   &&   tmp   [   1   ]   ===   1   &&   tmp   [   2   ]   ===   2   &&   tmp   [   3   ]   ===   2   ;


  // Output 'YES' to the console if the pattern matches, otherwise output 'NO'.
  console .   log   (   res   ?   'YES'   :   'NO'   )   ;
}

// --- Program Entry Point ---
// This part handles reading input from standard input and calling the main function.
// It uses Node.js 'fs' module to synchronously read the entire file from '/dev/stdin' as UTF-8.
main   (   require   (   'fs'   ) .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;
/* End of Type I cloned JavaScript code. */