'use strict' ; /*
                      * This directive enforces stricter parsing and error handling in the code.
                      * It helps prevent common coding mistakes and "unsafe" actions.
                      */


/*
 * The primary function that processes the input string.
 * It determines if the input string meets specific palindrome criteria.
 */
function   Main   (   input   )
{
    // First, clean up the input: trim any leading/trailing whitespace and split it into an array of individual characters.
    input   =   input.trim (   ) .split (   ""   )   ;


    /*
     * Declare and initialize several variables.
     * These will be crucial for calculating indices and partitioning the input string.
     */
    let   n       =   input.length   ; // Total length of the input character array.
    let   l       =   (   n   -   1   )   /   2   ; // Calculated left boundary index.
    let   r       =   (   n   +   3   )   /   2   ; // Calculated right boundary index.
    let   left    =   [ ]   ; // An empty array to store the left segment of the string.
    let   right   =   [ ]   ; // An empty array to store the right segment of the string.


    /*
     * Perform the initial palindrome check on the *entire* input string.
     * We iterate from the beginning up to the middle, comparing characters with their counterparts from the end.
     */
    for
    (
        let   i   =   0
        ;
        i   <   Math.floor (   input.length   /   2   )
        ;
        i++
    )
    {
        // Calculate the corresponding index from the end of the string.
        let   e   =   input.length   -   1   -   i   ;

        // If characters at symmetric positions do not match, it's not a palindrome.
        if
        (
            input [   i   ]   !==   input [   e   ]
        )
        {
            console.log (   'No'   )   ; // Output 'No' to standard output.
            return   ; // Immediately exit the Main function.
        }
    }


    /*
     * Populate the 'left' array.
     * This loop extracts characters from the beginning of the input string
     * up to the index 'l' (exclusive).
     */
    for
    (
        let   i   =   0
        ;
        i   <   l
        ;
        i++
    )
    {
        left.push (   input [   i   ]   )   ;
    }


    /*
     * Populate the 'right' array.
     * This loop extracts characters from the input string
     * starting from index 'r-1' up to the very end of the string.
     */
    for
    (
        let   i   =   r   -   1
        ;
        i   <   n
        ;
        i++
    )
    {
        right.push (   input [   i   ]   )   ;
    }


    /*
     * Conduct the second palindrome check: on the 'left' segment.
     * We apply the same palindrome logic to the 'left' array.
     */
    for
    (
        let   i   =   0
        ;
        i   <   Math.floor (   left.length   /   2   )
        ;
        i++
    )
    {
        // Determine the symmetric index from the end of the 'left' array.
        let   e   =   left.length   -   1   -   i   ;

        // If characters in the 'left' array do not match symmetrically.
        if
        (
            left [   i   ]   !==   left [   e   ]
        )
        {
            console.log (   'No'   )   ; // Output 'No'.
            return   ; // Terminate the function.
        }
    }


    /*
     * Execute the third and final palindrome check: on the 'right' segment.
     * This loop verifies if the 'right' array itself forms a palindrome.
     */
    for
    (
        let   i   =   0
        ;
        i   <   Math.floor (   right.length   /   2   )
        ;
        i++
    )
    {
        // Find the corresponding character index from the end of the 'right' array.
        let   e   =   right.length   -   1   -   i   ;

        // If any pair of characters in 'right' array doesn't match.
        if
        (
            right [   i   ]   !==   right [   e   ]
        )
        {
            console.log (   'No'   )   ; // Output 'No'.
            return   ; // Exit the function immediately.
        }
    }

    // If all three palindrome checks pass successfully, then the string satisfies all conditions.
    console.log (   'Yes'   )   ; // Output 'Yes'.

} /* End of the Main function block. */



// The following line is for handling input/output in a specific environment.
// It reads data from standard input (/dev/stdin) and passes it to the Main function.
// This part should generally not be modified.
Main (   require (   "fs"   ) .readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;