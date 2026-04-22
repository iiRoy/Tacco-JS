/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive changes in whitespace and comments
 * while maintaining the exact same functional logic and identifiers.
 *
 * All variable names, function names, operators, and expressions
 * remain completely unchanged.
 */


// Define the main processing function
function    MainC (   input   )
{

    // Convert the provided input string into a numerical value
    const   N    =    Number( input ) ;


    // Calculate an intermediate numerical value 'num'
    // This value is derived from N using multiplication and subtraction
    const   num   =   N * N   -   N   ;


    // Output the final result to the console.
    // The result is 'num' modulo (10^9 + 7).
    console.log (   num   %   (   10 ** 9 + 7   )   ) ;

} // End of the MainC function definition


// Execute the MainC function immediately with input from standard input.
// The input is read synchronously from '/dev/stdin',
// decoded as a UTF-8 string, and then any leading/trailing whitespace is removed.
MainC ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . trim ( ) ) ;

// --- End of the JavaScript program ---