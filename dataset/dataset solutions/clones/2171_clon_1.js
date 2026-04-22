/*
 * This is a JavaScript program.
 * It reads input from stdin, processes it, and prints output.
 */

function    Main  (  arg  ) // Define the main function that handles program logic.
{
    // Declare a local variable 'S' and assign the input argument 'arg' to it.
    // 'S' will hold the string content passed to the function.
    var    S    =    arg    ;


    // Use console.log to print a string of 'x' characters.
    // The number of 'x' characters is determined by the length of the string 'S'.
    // String.prototype.repeat() creates a new string consisting of the specified number of copies of the string on which it was called.
    console.log (  "x" .  repeat (  S .  length  )  ) ; // Output the result to the standard output.


    // The function explicitly returns, though it's not strictly necessary for functions that don't return a meaningful value.
    return    ;
} // End of the Main function definition.


// This section of the code executes the Main function immediately.
// It reads the entire content of standard input synchronously.
// require("fs") loads the Node.js file system module.
// .readFileSync("/dev/stdin", "utf8") reads the file at /dev/stdin (standard input)
// and decodes it as a UTF-8 string.
// The resulting string is then passed as an argument to the Main function.
Main  (  require (  "fs"  ) .  readFileSync (  "/dev/stdin"  ,  "utf8"  )  )  ; // Call the main function with the input.