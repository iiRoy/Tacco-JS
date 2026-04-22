/*
 * This JavaScript file demonstrates a simple conditional logic.
 * It checks for the presence of a specific substring in the input.
 */

// Define the primary function named 'Main'.
// This function accepts a single argument, typically a string, referred to as 'input'.
function   Main  (  input   )
{
    // The core logic: an 'if-else' statement.
    // It evaluates whether the string "AC" exists within the 'input' string.
    // The 'indexOf()' method returns the first index at which a given element can be found in the string,
    // or -1 if it is not present.
    if  (  input  .  indexOf  (  "AC"  )   !=   -1   )
    {
        // If "AC" is found (i.e., indexOf does NOT return -1),
        // then print the string "Yes" to the standard output console.
        console  .  log  (  "Yes"  )  ;
    }
    else
    {
        // Otherwise (if "AC" is not found in the input string),
        // print the string "No" to the standard output console.
        console  .  log  (  "No"  )  ;
    }
} // End of the 'Main' function definition.

// --- Program Entry Point ---

// This line executes the 'Main' function.
// It reads input from the standard input stream ('/dev/stdin') using Node.js 'fs' module.
// 'require("fs")' loads the file system module.
// '.readFileSync("/dev/stdin", "utf8")' reads the entire content of the standard input
// synchronously and decodes it as a UTF-8 string.
// This string is then passed as the 'input' argument to the 'Main' function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;

// --- End of Script ---