/*
 * This is a JavaScript code snippet.
 * It defines a main function to process some input.
 * The purpose is to demonstrate Type I code cloning.
 */

// Define the main function that takes 'input' as an argument.
// This function will perform a specific calculation.
  function    Main (    input    ) // Function signature and parameter definition
{
  // First, process the input string.
  // The input is expected to be a string containing space-separated values.
  input    =    input .   split  (   " "   )   ; // Split the input string by spaces into an array.
                                                 // The result is stored back into the 'input' variable,
                                                 // effectively reassigning it from a string to an array.

  // Now, perform the core calculation and print the result to the console.
  // We access the first and second elements of the 'input' array.
  // Each element is treated as a number, 1 is subtracted from it,
  // and then these two results are multiplied together.
  console  .  log   (   (   input[0]    -    1   )    *    (   input[1]    -    1   )   )   ; // Output the calculated value.
} // End of the Main function definition.

// This section handles reading input from the standard input
// and then calls the Main function with that input.
// It uses Node.js 'fs' module to read the file.
Main (    require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ; // Execute the Main function.
// The 'require("fs")' gets the file system module.
// 'readFileSync("/dev/stdin", "utf8")' reads the content of stdin synchronously as UTF-8.
// The result of readFileSync is then passed as the 'input' argument to the Main function.