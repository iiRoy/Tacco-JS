/*
 *  This is a JavaScript program designed to evaluate a specific character pattern.
 *  It reads input from standard input, processes the first line, and outputs
 *  "Yes" or "No" based on certain conditions.
 *
 *  Developed as a Type I clone example, demonstrating extensive whitespace and comment variations.
 *  No semantic or structural changes have been made.
 */

// The primary function that orchestrates the logic.
// It takes 'input' as a single string argument, which typically comes from stdin.
function   Main   ( input )
{
    // First, we process the raw input string.
    // It's split into an array of strings, where each element is a line from the input.
    input   =   input .   split   (   "\n"   )   ;


    // We are interested in the very first line of input.
    // This line (at index 0) is then further split into an array of individual characters.
    // The 'str' variable will now hold an array of characters from the first line.
    str   =   input [   0   ] .   split   (   ""   )   ;


    // Now, we begin the conditional checks to determine the output.
    // This is the outer condition: We check if the character at index 2
    // is exactly the same as the character at index 3 within the 'str' array.
    if   (   str [   2   ]   ==   str [   3   ]   )
    {
        // If the outer condition is true, we proceed to check the inner condition.
        // This checks if the character at index 4 is exactly the same as the
        // character at index 5 within the 'str' array.
        if   (   str [   4   ]   ==   str [   5   ]   )
        {
            // Both conditions (the outer one and this inner one) are met.
            // Therefore, we print the string "Yes" to the standard output.
            console .   log   (   "Yes"   )   ;
        }
        else    // This branch is executed ONLY if the inner condition (str[4] == str[5]) is FALSE.
        {
            // In this scenario, the outer condition was true, but the inner condition was false.
            // So, we print the string "No" to the standard output.
            console .   log   (   "No"   )   ;
        }
    }
    // If the outer condition (str[2] == str[3]) was false, this block is skipped entirely,
    // and nothing is printed to the console by this function. The program would then exit
    // or continue if there were more code outside this function.

} // End of the Main function definition block.


// This is the actual entry point of the script execution.
// It calls the Main function, supplying it with data read from standard input.
// The 'require("fs")' statement imports the Node.js File System module.
// 'readFileSync("/dev/stdin", "utf8")' reads the entire content of the
// standard input stream as a UTF-8 encoded string.
Main   (   require   (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;