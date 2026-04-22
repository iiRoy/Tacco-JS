/*
 * This file contains a JavaScript program.
 * It's a Type I clone, meaning its functionality and structure are identical
 * to an original source, with only whitespace and comments altered.
 * The purpose is to demonstrate visual difference while maintaining
 * exact logical equivalence.
 */

// Define the primary function that takes 'input' as its argument.
function    main   (  input  )

{

  // Declare a constant 'args' and assign it the result of splitting the 'input' string.
  // The split operation uses a space character as the delimiter.
  const    args    =    input.split   (   ' '   )


  // Parse the first element of 'args' into a number and store it in 'a'.
  const    a    =    Number   (   args [ 0 ]   )

  // Parse the second element of 'args' into a number and store it in 'b'.
  const    b    =    Number   (   args [ 1 ]   )

  // Parse the third element of 'args' into a number and store it in 'c'.
  const    c    =    Number   (   args [ 2 ]   )

  // Parse the fourth element of 'args' into a number and store it in 'k'.
  const    k    =    Number   (   args [ 3 ]   )


  // Initialize a mutable variable 't' with the value of 'k'.
  let    t    =    k


  // Decrement the value of 't' by 'a'.
  t    -=    a


  // Start of the main conditional logic block.
  // Check if the value of 'k' is less than or equal to zero.
  if   (   k   <=   0   )
  {
    // If the condition is true, log the value of 'k' to the console.
    console.log   (   k   )

  }
  else
  {
    // If the initial condition (k <= 0) is false, proceed here.
    // Decrement the value of 't' further by 'b'.
    t    -=    b

    // This nested conditional check for 'k <= 0' appears
    // to be unreachable if the outer 'else' block is executed,
    // as it implies 'k' was initially greater than 0.
    // However, it is part of the original code and must be preserved.
    if   (   k   <=   0   )
    {
      // If this (unlikely) condition is met, log the value of 'a'.
      console.log   (   a   )
    }
    else
    {
      // If 'k' is still positive (as expected after the outer 'else'),
      // evaluate 't' against 'c'.
      if   (   t   <   c   )
      {
        // If 't' is less than 'c', calculate 'a - t' and log the result.
        console.log   (   a   -   t   )
      }
      else
      {
        // If 't' is not less than 'c', calculate 'a - t' and log the result.
        // Note: Both branches of this inner 'if' statement yield the same output.
        console.log   (   a   -   t   )
      }
    }
  }

  // End of the main function's execution block.
}


// This section handles the execution of the program.
// It reads input from standard input, typically '/dev/stdin' in Unix-like systems.
// The 'require' function is used to import the 'fs' (file system) module.
// 'readFileSync' reads the file synchronously.
// The 'utf8' encoding is specified for the input.
// The result of this file read is then passed as an argument to the 'main' function.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )

// This concludes the Type I clone of the JavaScript code.