/*
 * This file contains the primary logic for a specific task.
 * It's designed to read input from stdin, process it, and
 * then print a specific combination of characters to stdout.
 *
 * Date created: 2023-10-27
 * Version: 1.0.0
 * Author: Anonymous Developer
 */

// Define the main function that will encapsulate our application logic.
// This function takes a single argument, 'input', which is expected
// to be a string containing multiple lines of text.
function    Main    (   input   )
{
    // First, let's process the raw input string.
    // We assume that different data points are separated by newline characters.
    // The 'split' method will convert the single input string into an array
    // of strings, where each element represents a line from the original input.
    input   =   input .   split   (   "\n"   )   ;


    // Now, we will output a very specific combination of characters.
    // The 'console.log' function is used for this purpose.
    // The format string "%s%s%s" indicates that three string arguments
    // will be concatenated and printed without any separators.
    // Let's break down which characters are being selected:
    // 1. input[0][0]: The first character (index 0) of the first line (index 0).
    // 2. input[1][1]: The second character (index 1) of the second line (index 1).
    // 3. input[2][2]: The third character (index 2) of the third line (index 2).
    console .   log   (   "%s%s%s"   ,
                          input   [   0   ]   [   0   ]   ,   // Character from the first line
                          input   [   1   ]   [   1   ]   ,   // Character from the second line
                          input   [   2   ]   [   2   ]       // Character from the third line
                        )   ;

}   // End of the 'Main' function definition.


// This section handles the execution of our 'Main' function.
// It's responsible for acquiring the necessary input data.
// We are using Node.js specific functionalities here to read from standard input.
Main    (
            require (   "fs"   )   .   readFileSync (   "/dev/stdin"   ,   "utf8"   )
        )   ; // The entire content of /dev/stdin is read as a UTF-8 string and passed to Main.

/*
 * End of script.
 * No further operations are performed after the Main function call.
 */