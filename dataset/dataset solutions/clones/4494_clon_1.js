/**
 * This is the main function of the program.
 * It processes a given string 's' to find a specific pattern.
 *
 * @param {string} s - The input string, possibly containing multiple lines.
 * @returns {void}
 */
function   main  ( s )
{
    // First, we extract only the initial line from the input string.
    // This assumes that the relevant data is always on the first line.
    s  =  s.split ( "\n" ) [ 0 ] ;


    /*
     * Initialize a boolean flag 'z'.
     * This flag will be used to track if a specific condition is met
     * within the inner loop iterations.
     */
    var   z   =   true  ;


    // Outer loop: 'i' represents a potential length component.
    // It starts at 2 and increments by 2 in each step.
    for  ( var   i   =   2  ;   i   <   s.length  ;   i   +=   2  )
    {

        // Inner loop: 'j' is an index used for character comparison.
        // It iterates over a segment of the string defined by 's.length - i'.
        for  ( var   j   =   0  ;   j   <   ( s.length   -   i )   /   2  ;   ++j  )
        {
            // This conditional statement compares two characters in the string.
            // The positions are 'j' and 'j + (s.length - i) / 2'.
            // If the characters at these positions are not identical,
            // it means the current pattern check has failed.
            if  ( s [ j ]   !=   s [ j   +   ( s.length   -   i )   /   2 ] )
            {
                // Set the flag 'z' to false indicating a mismatch.
                z   =   false  ;
                // Break out of the inner loop as the pattern is already broken for this 'i'.
                break  ;
            }
        }


        // After the inner loop completes, check the status of 'z'.
        // If 'z' is still true, it means all character comparisons for the current 'i' were successful.
        if  ( z )
        {
            // Log the calculated value (s.length - i) to the console.
            console.log ( "%d" ,   s.length   -   i ) ;
            // Exit the main function immediately, as the desired result has been found.
            return  ;
        }

        // If 'z' was false (meaning a mismatch occurred),
        // reset it to true for the next iteration of the outer loop.
        z   =   true  ;
    }
}


/*
 * This is the entry point of the script.
 * It reads the entire content of standard input (stdin) as a UTF-8 string.
 * The 'require("fs")' statement loads the Node.js file system module.
 * 'readFileSync' reads the file synchronously.
 * The result is then passed as an argument to the 'main' function.
 */
main  ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;