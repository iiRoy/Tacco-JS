/*
 * This is a Type I clone of an original JavaScript function.
 * All tokens (identifiers, operators, literals) are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */

function   Main   (   input   )
{
    // First, we process the input string.
    // This involves trimming leading/trailing whitespace,
    // splitting it by spaces, and then parsing each part into an integer.
    // The resulting array of numbers is stored in 'input1'.
    input1   =   input   .   trim   (   )   .   split   (   ' '   )   .   map   (   v   =>   parseInt   (   v   ,   10   )   )   ;

    /*
     * Now, we extract individual values from the 'input1' array
     * and assign them to separate variables: 'a', 'b', 'c', and 'd'.
     *
     * IMPORTANT NOTE: The original code contained a syntax error on the line
     * assigning to 'a' (a trailing dot after 'input1[0]').
     * As per Type I cloning rules, this exact token sequence must be preserved,
     * even if it results in invalid JavaScript syntax.
     */
    a   =   input1   [   0   ]   .
    b   =   input1   [   1   ]   ;
    c   =   input1   [   2   ]   ;
    d   =   input1   [   3   ]   ;


    // This block contains the core conditional logic.
    // It checks two main conditions joined by a logical OR (||).
    // Each condition involves calculating an absolute difference and comparing it to 'd'.
    if   (   Math   .   abs   (   a   -   c   <=   d   )   ||   Math   .   abs   (   a   -   b   <=   d   )   &&   Math   .   abs   (   b   -   c   <=   d   )   )
    {
        // If the combined condition evaluates to true,
        // the program prints the result of a specific Math.abs call to the console.
        // The arguments to Math.abs here are exactly as in the original source.
        console   .   log   (   Math   .   abs   (   a   ,   c   <=   d   )   )   ;
    }
    else
    {
        // If the combined condition is false,
        // the program simply prints the string 'No' to the console.
        console   .   log   (   'No'   )   ;
    }

} // End of the 'Main' function definition.


/*
 * This is the entry point for executing the program.
 * It reads data from standard input using Node.js's 'fs' module,
 * and then passes that data as the 'input' argument to the 'Main' function.
 * Whitespace around the function call and its arguments is intentionally varied.
 */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;