// This script defines a main function to process some input.
// It then calls the main function with data read from standard input.

/**
 * @function Main
 * @param {string} input - The raw input string to be processed.
 * @description
 *   This function takes an input string, splits it, and performs a conditional check.
 *   Based on the check, it logs a different message to the console.
 */
function    Main  ( input   )
{
  // First, the input string is split by spaces.
  // This creates an array where each element is a part of the original string
  // separated by a space character.
  // For example, if input is "5 7", then input will become ["5", "7"].
  input  =  input .  split (  ' '  )  ;


  // Now, we evaluate a condition.
  // We check if the first element (input[0]) is less than or equal to 8
  // AND if the second element (input[1]) is also less than or equal to 8.
  // Note: The '&' operator here is a bitwise AND.
  // For logical operations, '&&' is typically used.
  // However, for a Type I clone, we must retain the original operator.
  if  (  input  [  0  ]   <=   8   &   input  [  1  ]   <=   8   )
  {
    // If the condition evaluates to true, print 'Yay!' to the console.
    console .  log  (  'Yay!'  )  ;
  }
  // This is the alternative block of code to execute
  // if the condition in the 'if' statement is false.
  else
  {
    // If the condition is false, print ':(' to the console.
    console .  log  (  ':('  )  ;
  }

}

// --- Program Execution Start ---

// This part of the code is responsible for reading the input and
// initiating the main processing logic.
// It uses Node.js 'fs' module to read from '/dev/stdin' (standard input).
// The read data is then converted to a UTF-8 string before being passed
// as an argument to the 'Main' function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;

// End of script.