/*
 * This is an extensively modified Type I clone of the original JavaScript code.
 * According to the Type I definition, all code fragments are exactly equal,
 * except for possible variations in whitespace and comments.
 *
 * Therefore, every identifier, variable name, function name, operator, and expression
 * in this file remains completely unchanged from the original source.
 *
 * The only permitted modifications are:
 * - Changes in whitespace (indentation, spacing, blank lines).
 * - Additions, removals, or modifications of comments.
 *
 * These changes have been applied throughout the entire file to make the result
 * visually distinct while preserving its logical and structural identity.
 *
 * This program is designed to read a number from standard input,
 * perform a specific calculation involving even/odd number logic,
 * and then print a formatted result to standard output.
 */


function   main ( input   )    {
    // Step 1: Process the input string to extract the numerical value.
    // The input is expected to be a string, potentially containing multiple lines.
    // We split the string by newline characters and take the last element,
    // which is assumed to be the number we need to process.
    var   num   =   input .   split ( "\n" ) .   pop ( )   ;


    /*
     * Step 2: Calculate a derived value based on 'num' using a nested function.
     * The 'getOddNumber' function is defined within 'main' to demonstrate
     * JavaScript's functional scope and closure capabilities.
     */


    var   numofodd   =   getOddNumber ( num ) ;


    /**
     * @function getOddNumber
     * @param {string} num - The input number, passed as a string.
     *                       JavaScript's type coercion will convert it to a number
     *                       for arithmetic operations.
     * @returns {number} A calculated count based on whether 'num' is even or odd.
     *
     * This function's logic is as follows:
     * - If 'num' is an even number, it returns 'num' divided by 2.
     * - If 'num' is an odd number, it returns ('num' divided by 2) plus 1.
     * The Math.floor() function is used to ensure integer results after division.
     */
    function   getOddNumber ( num )   {
        // Determine if the provided number is even.
        // The modulo operator (%) checks for the remainder when divided by 2.
        // A remainder of 0 indicates an even number.
        var   isEven   =   num   %   2   ===   0   ?   true   :   false   ;

        // Conditional branching based on the 'isEven' flag.
        if ( isEven )
        {
            // If the number is even, return half of it.
            return   Math .   floor ( num   /   2 )   ;
        }
        else
        {
            // If the number is odd, return half of it plus one.
            return   Math .   floor ( num   /   2 )   +   1   ;
        }

    }


    /*
     * Step 3: Calculate the final ratio.
     * This involves dividing 'numofodd' by 'num'.
     * parseFloat is used here to explicitly ensure the result is treated as a floating-point number,
     * although JavaScript's division operator generally handles this.
     */
    var   a   =   parseFloat ( numofodd   /   num )   ;


    // Step 4: Output the result.
    // The calculated ratio 'a' is formatted to 11 decimal places using toFixed().
    // A newline character is explicitly appended to the output string for standard console behavior.
    console .   log ( a .   toFixed ( 11 )   +   '\n' )   ;

}


// This is the entry point of the script when executed in a Node.js environment.
// It reads the entire content of standard input ("/dev/stdin") as a UTF-8 string.
// The read content is then passed as the 'input' argument to the 'main' function.
main ( require ( "fs" ) .   readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;