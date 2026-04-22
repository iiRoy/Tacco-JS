/*
 * This JavaScript module defines a main function to process input.
 * It's designed for competitive programming contexts where input
 * is read from standard input and output is written to standard output.
 */
function   Main   (   input   )
{

    // First, the entire input string is split into an array of individual lines.
    // Each element in the 'lines' array will correspond to one line of the input.
    lines   =   input   .   split   (   "\n"   )


    // The problem statement implies that the first line of input
    // contains two space-separated numerical values.
    // We extract the first value (at index 0 after splitting by space)
    // and assign it to the variable 'N'.
    N   =   lines   [   0   ]   .   split   (   ' '   )   [   0   ]


    // Following the same logic, we extract the second value
    // (at index 1 after splitting by space) from the first line
    // and assign it to the variable 'K'.
    K   =   lines   [   0   ]   .   split   (   ' '   )   [   1   ]


    // Now, we determine the final output based on a conditional expression.
    // If the value of K is strictly equal to 1, the result is 0.
    // Otherwise, the result is calculated as N minus K.
    // The 'console.log' function prints this result to standard output.
    console   .   log   (   K   ==   1   ?   0   :   N   -   K   )

}   // End of the Main function block.


/*
 * This section handles the execution of the program.
 * It reads the entire content of standard input synchronously
 * using Node.js file system capabilities, and then passes
 * this content as a string to the 'Main' function for processing.
 */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;