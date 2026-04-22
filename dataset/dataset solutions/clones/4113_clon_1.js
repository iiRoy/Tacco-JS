// This JavaScript file contains a program that reads a numerical input,
// performs a specific calculation, and then prints the result to the console.

'use strict' // This directive enables strict mode, enforcing stricter parsing and error handling.


/**
 *   The primary function of this script. It takes a string input,
 *   converts it to a number, performs a calculation, and outputs the result.
 *
 *   @param   {string}   s   The input string, expected to represent a number.
 */
function   main   (   s   )
{

    // Declare a constant variable 'm' and assign it the numerical value
    // obtained by converting the input string 's' using the Number() constructor.
    const   m   =   Number(   s   )   ;


    // Calculate the answer based on the formula (24 - m) + 24.
    // This expression is kept exactly as specified for Type I cloning.
    // It could be simplified to 48 - m, but the structure must remain.
    const   ans   =   (   24   -   m   )   +   24   ;


    // Print the final calculated answer to the standard output.
    console   .   log(   ans   )   ;

}


// Execute the main function.
// The input string is obtained by reading the content of "/dev/stdin"
// using Node.js's 'fs' module in a synchronous manner, encoded as UTF-8.
main   (   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;