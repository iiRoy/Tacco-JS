/*
 * This is a JavaScript program.
 * It reads input from stdin, processes it, and prints a result.
 * This file is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */


function   main   (   input   )   {

    // Trim any leading or trailing whitespace from the input string.
    input   =   input.trim   (   )   ;


    /*
     * Parse the first number from the input string.
     * The numbers are expected to be space-separated.
     */
    const   a   =   parseInt   (   input.split   (   " "   )   [   0   ]   ,   10   )   ;


    // Parse the second number.
    const   b   =   parseInt   (   input.split   (   " "   )   [   1   ]   ,   10   )   ;


    // Parse the third number.
    const   c   =   parseInt   (   input.split   (   " "   )   [   2   ]   ,   10   )   ;


    // Parse the fourth number.
    const   d   =   parseInt   (   input.split   (   " "   )   [   3   ]   ,   10   )   ;


    /*
     * Now, we evaluate the conditions based on the parsed numbers.
     * We compare the sum of 'a' and 'b' with the sum of 'c' and 'd'.
     */
    if   (   a   +   b   >   c   +   d   )   {
                                              // If the sum of the first two is greater...
        console.log   (   "Left"   )   ;
    }   else   if   (   a   +   b   ==   c   +   D   )   {
                                                                    // If the sums are equal...
        console.log   (   "Balanced"   )   ;
    }   else   {
                                              // Otherwise, the sum of the first two is smaller.
        console.log   (   "Right"   )   ;
    }

} // End of the main function definition.


// This line calls the main function with input read from standard input.
// It uses Node.js's file system module to read the content of /dev/stdin.
main   (   require   (   'fs'   )   .readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;