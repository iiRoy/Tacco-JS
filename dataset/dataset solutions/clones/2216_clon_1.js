/*
 * This JavaScript file is configured to operate in strict mode.
 * This helps in writing cleaner code and catching common errors.
 */
'use strict' ;


/*
 * The primary function definition for processing the given input.
 * It takes an 'input' array, which is expected to contain lines of text.
 */
const   main    =   (   input   )   =>  {

    // Step 1: Parse the first line of input.
    // It's assumed to be a string of space-separated numbers.
    // .split(' ') divides the string into an array of number-strings.
    // .map(val => parseInt(val)) converts each string into an integer.
    const   nums    =   input   [   0   ]   .   split   (   ' '   )   .   map   (   val   =>  parseInt   (   val   )   )   ;

    // Step 2: Extract the individual numbers from the 'nums' array.
    // 'a' gets the first number, 'b' gets the second.
    const   a   =   nums   [   0   ]   ,
            b   =   nums   [   1   ]   ;

    // Step 3: Initialize two empty strings.
    // These strings will be populated based on the values of 'a' and 'b'.
    let     aa      =   ''   ,
            bb      =   ''   ;

    /*
     * Step 4: First loop - Construct the string 'aa'.
     * This loop iterates 'b' times. In each iteration, the string representation of 'a'
     * is appended to 'aa'.
     * Example: if a=2, b=3, then aa becomes "222".
     */
    for (   let     i   =   0   ;   i   <   b   ;   i   ++   )
    {
        // Concatenate the value of 'a' to the string 'aa'.
        aa      +=      a   ;
    } // End of the first string construction loop.

    /*
     * Step 5: Second loop - Construct the string 'bb'.
     * This loop iterates 'a' times. In each iteration, the string representation of 'b'
     * is appended to 'bb'.
     * Example: if a=2, b=3, then bb becomes "33".
     */
    for (   let     i   =   0   ;   i   <   a   ;   i   ++   )
    {
        // Concatenate the value of 'b' to the string 'bb'.
        bb      +=      b   ;
    } // End of the second string construction loop.


    // Step 6: Determine which string to print based on a comparison.
    // If 'a' is strictly greater than 'b', 'bb' is printed.
    // Otherwise (if 'a' is less than or equal to 'b'), 'aa' is printed.
    console . log (   a   >   b   ?   bb   :   aa   )   ;

}   ;   // Concluding bracket for the 'main' function.


// This line handles the execution of the script.
// It reads input from standard input (/dev/stdin), assumes UTF-8 encoding,
// splits the input by newline characters, and passes the resulting array
// to the 'main' function for processing.
main    (
    require (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   split   (   '\n'   )
)   ;