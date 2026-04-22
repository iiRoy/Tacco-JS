/*
 * This is the primary function responsible for processing program input.
 * It takes a single string argument and performs operations on it.
 */
function   Main   (   input   )
{
    // Step 1: Normalize the input string.
    // We assume the input might contain multiple lines,
    // and we are only interested in the very first line provided.
    // The '\n' character is used as a delimiter for splitting.
    input   =   input   .   split   (   "\n"   )   [   0   ]   ;


    // Step 2: Perform the core logic of the program.
    // The processed 'input' string is expected to contain
    // at least two space-separated components.
    // We extract the second component, then the first, and concatenate them.
    // The ' ' (space) character is used as a delimiter for splitting.
    console   .   log   (   input   .   split   (   " "   )   [   1   ]   +   input   .   split   (   " "   )   [   0   ]   )   ;
}


// Program execution entry point.
// This block ensures the 'Main' function is called with the necessary data.
// It reads the entire content of standard input using Node.js 'fs' module
// and passes it as a UTF-8 encoded string to the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;