/*
 * This is a JavaScript file.
 * It strictly adheres to modern coding practices.
 */
'use strict'
; /* Ensure strict mode is enforced throughout the script. */



// Define the primary function for processing input.
function   Main   (   stdin   )   {

  /*
   * Process the raw standard input.
   * Trim any leading/trailing whitespace.
   * Split the input string into an array of lines,
   * handling both Windows (\r\n) and Unix (\n) line endings.
   */
  const   input   =   stdin.trim ( ) .split (   / \r ? \n / g   )   ;


  // Extract the first string from the processed input array.
  const   S   =   input   [   0   ]   ;

  // Extract the second string from the processed input array.
  const   T   =   input   [   1   ]   ;


  // Initialize a counter to track differences between the strings.
  let   count   =   0   ;


  // Iterate through the characters of the first string (S).
  // Assuming both strings S and T have the same length for this problem context.
  for   (   let   i   =   0   ;   i   <   S.length   ;   i   ++   )   {

    // Compare the character at the current index 'i' in S with the character at 'i' in T.
    // If they are not identical, increment the difference counter.
    if   (   S.charAt   (   i   )   !==   T.charAt   (   i   )   )   count   ++   ;

  } /* End of for loop */


  // Output the final count of differing characters to the console.
  console.log   (   count   )   ;

} /* End of Main function definition */


// The following block of code is responsible for reading input from stdin
// and passing it to the Main function.
// It is intentionally kept fixed as per the problem's input mechanism.
// This part reads the entire content of standard input as a UTF-8 string.
Main   (   require (   "fs"   ) .readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;
// Execution concludes after the Main function completes.