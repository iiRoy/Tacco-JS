/*
 * This is a Type I clone of an existing JavaScript code snippet.
 * The purpose is to demonstrate how whitespace and comments
 * can be altered without changing the core logic or structure.
 * Every identifier, operator, and expression remains exactly the same.
 */

// Define the main function that processes the input string.
function   Main   (   input   )
{
    // The input string is first converted into an array of characters.
    // This operation splits the string at each character, creating an array.
    input  =  input .  split  (  ''  )  ;


    // Calculate a 'sum' value based on the length of the character array.
    // This 'sum' essentially represents the count of characters between the first and last.
    sum   =   input .  length   -   2   ;


    // Output a string composed of three parts:
    // 1. The very first character of the input.
    // 2. The calculated 'sum' (which is actually a number).
    // 3. The very last character of the input array.
    console .  log  (  input  [  0  ]   +   sum   +   input  [  input .  length   -   1  ]  )  ;

} // End of the Main function definition.

// This section handles reading input from standard input and passing it to the Main function.
// It uses Node.js's 'fs' module to synchronously read the file from '/dev/stdin' as UTF-8.
Main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;

// EOF - End of File.