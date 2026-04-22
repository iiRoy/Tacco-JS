// This is a Type I clone generated from the original JavaScript code.
// Only whitespace and comments have been altered to demonstrate the cloning type.

/*
 * The primary function responsible for orchestrating the program's flow.
 * It takes a single argument, which is expected to be a string.
 */
function   main (   a   )
{
    // This line splits the input string 'a' into an array of substrings
    // using a space character as the delimiter.
    a   =   a.split (   " "   )   ;

    // The result of the 'jd' function, applied to the modified 'a' array,
    // is then printed to the standard output (console).
    console.log (   jd (   a   )   )   ;

} // End of the 'main' function definition.


/*
 * This auxiliary function, named 'jd', compares the first two elements
 * of an array.
 * @param {Array} a - The input array to compare.
 * @returns {string} - "H" if elements are equal, "D" otherwise.
 */
function   jd (   a   )
{
    // Checks if the element at index 0 is strictly equal to the element at index 1.
    if   (   a [   0   ]   ==   a [   1   ]   )
    {
        // If the condition is true, return the string "H".
        return   "H"   ;
    }
    // If the condition in the 'if' statement is false (i.e., elements are not equal).
    else
    {
        // Return the string "D".
        return   "D"   ;
    }

} // End of the 'jd' function definition.


// This is the entry point for execution.
// It reads the entire content of '/dev/stdin' as a UTF-8 string,
// and then passes it as an argument to the 'main' function.
main (   require (   "fs"   ).readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;