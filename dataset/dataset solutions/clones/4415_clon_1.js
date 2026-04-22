/*
 * This is a JavaScript program.
 * It demonstrates a simple conditional check.
 * This file is a Type I clone, meaning only
 * whitespace and comments have been altered.
 */

// Define the primary function responsible for processing the input.
function   main (   input   )
{

  // Declare a local variable 'n' and assign the first element
  // from the 'input' array to it.
  let   n   =   input [   0   ]   ;


  // Evaluate a condition: if the character at index 0 of 'n'
  // is strictly equal to the character at index 2 of 'n'.
  if   (   n [   0   ]   ==   n [   2   ]   )
  {
    // If the condition holds true, output "Yes" to the standard console.
    console   .   log   (   "Yes"   )   ;
  }
  else
  {
    // If the condition is false, output "No" to the standard console.
    console   .   log   (   "No"   )   ;
  }

} // End of the main function definition.


// Immediately invoke the main function.
// The input is read synchronously from /dev/stdin using Node.js's 'fs' module,
// and decoded as UTF-8.
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of file.