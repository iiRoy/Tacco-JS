function   main  ( /* This is the primary function to process the input */ input )
{
  // Trim any leading or trailing whitespace from the input string to ensure clean parsing.
  input = input.trim  (  )  ;


  // Parse the three integer values from the space-separated input string.
  // These values are typically assigned to variables 'x', 'y', and 'z' respectively.
  const   x    =    parseInt  (  input  .  split  (  " "  )  [  0  ]  ,  10  )  ;

  const   y    =    parseInt  (  input  .  split  (  " "  )  [  1  ]  ,  10  )  ;

  const   z    =    parseInt  (  input  .  split  (  " "  )  [  2  ]  ,  10  )  ;


  /*
   * Calculate an intermediate difference value, often named 'deff'.
   * The formula for this calculation is x - (2 * z).
   */
  var   deff   =   x   -   2   *   z  ;


  // Calculate another key intermediate value, 'kazu1'.
  // This involves integer division using Math.floor() for the result.
  // The divisor is the sum of 'y' and 'z'.
  var   kazu1   =   Math.floor  (  deff   /   (  y   +   z  )  )  ;


  // Begin a conditional check to determine the final output.
  // The condition evaluates whether a specific expression is greater than or equal to 'y'.
  if   (   deff   -   kazu1   *   (  y   +   z  )   >=   y   )
  {
    // If the condition is met (evaluates to true), print 'kazu1 + 1' to the console.
    console  .  log  (  kazu1   +   1  )  ;
  }
  else
  {
    // Otherwise (if the condition is false), simply print 'kazu1' to the console.
    console  .  log  (  kazu1  )  ;
  }

  // End of the main function's execution path.
}




// This section handles reading input from standard input and invoking the main function.
// It uses Node.js's 'fs' module to read the file at '/dev/stdin' as a UTF-8 string.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;

// The program concludes after the main function has finished its execution and output.