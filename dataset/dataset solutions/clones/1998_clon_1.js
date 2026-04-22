/*
 * This file contains the solution for the ABC 161 programming contest.
 * It reads input from standard input, processes it, and prints the result.
 */


// The primary function that processes the input data.
function   Main   (   input   )
{
    /*
     * The 'input' parameter holds the entire input string provided to the script.
     * We need to parse it to extract the necessary numerical values.
     */

    // Variables are assigned in BCA order from input, as specified by the problem.
    const   A    =    parseInt (   input . split (   " "   ) [   2   ]   ,   10   )   ;
    const   B    =    parseInt (   input . split (   " "   ) [   0   ]   ,   10   )   ;
    const   C    =    parseInt (   input . split (   " "   ) [   1   ]   ,   10   )   ;

    // After parsing, log the values in the requested format (A B C).
    console . log (   A   +   " "   +   B   +   " "   +   C   )   ;
}


// Call the Main function with the input read from standard input.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;