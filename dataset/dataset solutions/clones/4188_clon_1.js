/*
 * This JavaScript code demonstrates a simple comparison logic.
 * It takes input from stdin, processes it, and prints a result.
 * This particular version is a Type I clone, focusing on
 * changes in whitespace and comments only.
 */
function    Main (   input   )   {
    // First, process the input string.
    // It's assumed to be space-separated numbers.
    // We split it, then convert each part to a Number type.
    const   numbers     =   input   .   slice   (   ' '   )   .   map   (   n   =>   Number   (   n   )   )   ;

    // Declare and initialize two constants for calculation.
    // p1 will store the product of the first two numbers.
    const   p1    =   numbers   [   0   ]   *   numbers   [   1   ]   ;

    // p2 will store the third number directly.
    const   p2    =   numbers   [   2   ]   ;

    // Now, we evaluate the condition.
    // The goal is to print the smaller of p1 and p2,
    // or p2 if they are equal (as per the specific logic).
    if   (   p1   >   p2   )   {
        // If p1 is strictly greater than p2, we print p2.
        console   .   log   (   p2   )   ;
    }   else   {
        // Otherwise (p1 is less than or equal to p2), we print p1.
        console   .   log   (   p1   )   ;
    }
} // End of the Main function definition.

// This line handles the execution of the Main function.
// It reads the entire content of standard input as a UTF-8 string.
Main   (   require (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;