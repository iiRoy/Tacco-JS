/*
 * This is a Type I clone of a JavaScript code snippet.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly.
 */


"use strict" ; // Enforce strict mode for cleaner code. This is good practice!


/**
 * @function Main
 * @param {string} input - The input string to be processed.
 * This function determines the number of characters that need to be changed
 * to make the input string a palindrome.
 */
function   Main ( input )   {
    // Initialize a constant variable 'str' by splitting the input string into an array of characters.
    const    str    =    input . split ( "" ) ;

    // Initialize a mutable variable 'res' to count mismatches, starting at zero.
    let    res    =    0    ;


    /*
     * This loop iterates through the first half of the string.
     * Math.ceil ensures that for odd-length strings, the middle character is not double-counted
     * or that the loop doesn't go past the actual half-way point for comparison.
     */
    for    (    let    i    =    0    ;    i    <    Math . ceil ( str . length    /    2    )    ;    i++    )    {

        // Compare the character at the current index 'i' with its corresponding character from the end of the string.
        if    (    str [ i ]    !=    str [ str . length - 1 - i ]    )    {
            // If they are not equal, increment the 'res' counter.
            res++    ;
        } // End of if condition
    } // End of for loop

    // Output the final count of mismatches to the console.
    console . log ( res ) ;
} // End of Main function definition


/*
 * The following block handles reading input from standard input
 * and passing it to the Main function for processing.
 * This is typical for competitive programming environments.
 */
Main    (    require ( "fs" ) . readFileSync ( "/dev/stdin" ,    "utf8" )    )    ;

// End of file. Thank you for reviewing this Type I clone example.