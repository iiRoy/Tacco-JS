/*
 * This is a JavaScript program designed to compare two numbers.
 * It reads input from standard input, processes it, and then
 * prints "Yes" or "No" based on the comparison.
 *
 * This file is a Type I clone, meaning its functionality and
 * structure are identical to an original, with only
 * whitespace and comments altered extensively.
 */

function   Main  (  input  )

{
  // The primary function to execute the program logic.
  // It takes a single 'input' string as an argument.


  // Split the input string by spaces to get an array of string numbers.
  const   inputArr   =   input  .  split  (  " "  )   ;


  // Convert the first element of the array to a number and assign it to N.
  const   N   =   Number  (  inputArr  [0]  )   ;


  // Convert the second element of the array to a number and assign it to M.
  const   M   =   Number  (  inputArr  [1]  )   ;


  // Now, we proceed to compare the two numbers, N and M.
  if   (  N   ===   M  )
  {
    // If N is strictly equal to M, print "Yes" to the console.
    console  .  log  (  'Yes'  )   ;
  }

  else
  {
    // Otherwise (if N is not strictly equal to M), print "No".
    console  .  log  (  'No'  )   ;
  }

  // End of the Main function logic.
}


/*
 *  -------------------------------------------------------------------------
 *  DO NOT MODIFY THE CODE BELOW THIS LINE.
 *  This section handles reading input from stdin and invoking the Main function.
 *  It ensures compatibility with typical competitive programming environments.
 *  -------------------------------------------------------------------------
 */

// This line reads the entire standard input synchronously.
// It uses Node.js's 'fs' module to read from '/dev/stdin' (standard input file).
// The content is then decoded as UTF-8 and passed to the Main function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )   ;

// EOF
// This marks the end of the JavaScript file.