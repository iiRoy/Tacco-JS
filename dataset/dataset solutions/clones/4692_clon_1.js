/* This is a Type I clone of an original JavaScript program.
 * The purpose is to demonstrate variations in whitespace and comments
 * while keeping the core logic and structure absolutely identical.
 */

// Define the main function that processes the input.
function   Main  (  input  )
{
    // The input string is first trimmed, then split by space,
    // and finally parsed as an integer.
    input   =   parseInt  (  input  .  trim  (  )  .  split  (  " "  )  )  ;

    // Calculate value x based on the parsed input.
    var   x   =   800   *   input  ;


    // Calculate value y, which involves a division by 15.
    var   y   =   200   *   (  input   /   15  )  ;

    // Output the difference between x and y to the console.
    console  .  log  (  x   -   y  )  ;
}

// Invoke the Main function with content read from standard input.
// The file system module is used to read data.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;

/* End of program.
 * All identifiers and expressions are preserved exactly.
 */