/*
 * This JavaScript program reads a string and a number from standard input.
 * It then constructs a new string by taking characters from the first string
 * at intervals specified by the number. Finally, it prints the resulting string.
 */
'use strict' ; // Enforces strict mode, which helps catch common coding errors and "unsafe" actions.

/**
 * The primary function responsible for processing the input and generating the output.
 * @param   {string}   input   - The raw input string, typically read from standard input.
 */
function   Main   (   input   )   {
    // The input string is expected to contain at least two lines.
    // The first line is the source string 'S'.
    const   S   =   input .   split   (   '\n'   )   [   0   ]   ;

    // The second line is parsed as an integer 'w', which represents the step size.
    const   w   =   Number   (   input .   split   (   '\n'   )   [   1   ]   )   ;

    // Initialize an empty string to accumulate the characters for the final answer.
    let   answer   =   ''   ;

    /*
     * Iterate through the string 'S' starting from index 0.
     * In each step, increment the index 'i' by 'w'.
     * This effectively selects characters at regular intervals.
     */
    for   (   let   i   =   0   ;   i   <   S .   length   ;   i   +=   w   )   {
        // Extract a single character from 'S' at the current index 'i'.
        // The substr(index, length) method is used to get a substring of length 1.
        answer   +=   S .   substr   (   i   ,   1   )   ;
    }


    // Print the final constructed string to the console.
    console .   log   (   answer   )   ;
}

// This line handles reading input from /dev/stdin (standard input)
// in a Node.js environment, processes it, and then calls the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;

// End of the program.