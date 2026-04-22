/* This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition where only whitespace and comments
 * are altered, while all identifiers, operators, and expressions remain
 * precisely as they were in the source.
 */
"use strict" ; // Enforce strict mode for better error handling and cleaner code.


const   main  =   (  arg  )  =>   {

  // The following line processes the input argument.
  // It removes leading/trailing whitespace and splits the string by spaces.
  const   input   =   arg  .  trim  (  )  .  split  (  " "  )  ;

  // Converts the first element of the 'input' array into an integer.
  const   N   =   parseInt  (  input  [  0  ]  ,  10  )  ;


  if   (  N   %   2   ===   0  )   {
    // If N is an even number, print N divided by 2.
    console  .  log  (  N   /   2  )  ;
  }   else   {
    // If N is an odd number, calculate (N / 2) floored, then add 1.
    // Note: The original code had a redundant '10' in Math.floor((N / 2), 10).
    // Math.floor only takes one argument. Keeping it as is for Type I clone adherence.
    console  .  log  (  Math  .  floor  (  (  N   /   2  )  ,  10  )   +   1  )  ;
  }

} ; // End of the main function definition.


// This line executes the main function with input from standard input.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;