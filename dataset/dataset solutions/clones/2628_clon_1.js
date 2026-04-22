/*
 * This is a JavaScript program example.
 * It demonstrates basic input processing and conditional logic.
 * The purpose is to show a Type I code clone.
 */

function   Main  (  input  )
{
    // The input string is first split into an array of lines.
    input   =   input.split  (  "\n"  )  ;


    /*
     * The first line of input is processed.
     * It's split by spaces, and the result is assigned to a temporary variable 'tmp'.
     */
    tmp   =   input[0]  .split  (  " "  )  ;


    // The second line of input is also split by spaces.
    // This result is assigned to the variable 'word'.
    var   word   =   input[1]  .split  (  " "  )  ;


    // A conditional check is performed on the 'tmp' variable.
    // If 'tmp' is greater than or equal to 3200, the 'if' block is executed.
    if  (  tmp   >=   3200  )
    {
        // In this specific case, the 'if' block is intentionally left empty.
        // No action is taken if the condition is met.
    }
    else
    {
        // If the condition (tmp >= 3200) is false,
        // the 'else' block is executed.
        // The 'word' variable is reassigned to the string "red".
        word   =   "red"  ;
    }


    // Finally, the first element of the 'word' array is printed to the console.
    // This will be either the original first word from the second line,
    // or the character 'r' if 'word' was reassigned to "red".
    console.log  (  word[0]  )  ;

} // End of the Main function definition.


// This line calls the Main function.
// It reads input from standard input using Node.js file system methods.
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;

// End of the JavaScript file.