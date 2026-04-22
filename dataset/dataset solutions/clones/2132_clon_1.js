/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered to make it visually distinct.
 */

// Start of the main Immediately Invoked Function Expression (IIFE)
(  function    Main   (   input   )    {

    // The 'input' parameter is a string read from stdin.
    // This line re-declares a local 'input' variable,
    // splitting the original string by space into an array of strings.
    var   input   =   input.split(' ')   ;

    // Extract the first element of the split input array.
    // The '- 0' operation explicitly converts the string to a number (N).
    var   N   =   input[0]   -   0   ;

    // Extract the second element of the split input array.
    // Similarly, convert this string to a number (R).
    var   R   =   input[1]   -   0   ;

    // Declare and initialize variable 'I' based on a conditional logic.
    // If N is greater than or equal to 10, 'I' is assigned the value of 'R'.
    // Otherwise, 'I' is calculated as R + (100 * (10 - N)).
    var   I   =   N   >=   10
                    ?   R
                    :   R   +   100   *   (   10   -   N   )   ;

    // Print the final calculated value of 'I' to the standard output.
    console.log   (   I   )   ;

}  )  (

    // This block provides the input to the IIFE.
    // It uses Node.js 'fs' module to read the entire content
    // of '/dev/stdin' (standard input) as a UTF-8 encoded string.
    require (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )

) ; // End of the IIFE execution.