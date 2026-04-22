/*
 * This is an extensively modified Type I clone
 * of the original JavaScript code.
 * Whitespace and comments have been altered
 * to create a visually distinct but functionally
 * identical version.
 */
function   Main   (   input   )
{

    // Declare a variable to hold the split input string
    var   split   =   input   .   split   (   ' '   )   ;   // Split the input by space delimiter

    var   value   =   +   split   [   0   ]   ;

    /*
     * This variable will store the base for conversion,
     * which is the second number from the input.
     */
    var   digit   =   +   split   [   1   ]   ;

    var   result   =   ''   ;

    // Loop until the value becomes zero, performing base conversion
    while   (   value   >   0   )
    {
            result   +=   value   %   digit   ;   // Append the remainder (the next digit) to the result string

            value   =   Math   .   floor   (   value   /   digit   )   ;   // Update value for the next iteration

    }

    // Output the length of the resulting string, which is the number of digits in the new base
    console   .   log   (   result   .   length   )   ;

}
/*
 * Do not modify the following line. It handles standard input/output.
 * It reads the entire content from stdin and passes it to the Main function.
 */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;