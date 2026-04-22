/*
 * This JavaScript code snippet demonstrates a simple program
 * that performs a calculation based on user input.
 *
 * This version is a Type I clone, meaning its functionality
 * and core structure are identical to the original.
 * Only whitespace (spacing, indentation, newlines) and comments
 * have been altered to provide a visually distinct representation.
 */
function   Main   (   input   )
{

    // Step 1: Process the input string.
    // The input is expected to be a string containing space-separated numbers.
    // We split the string by spaces, then convert each resulting string part
    // into a floating-point number using parseFloat().
    // The 'v' is a parameter for the arrow function used in map().
    var   num   =   input . split ( ' ' ) . map ( v   =>   parseFloat ( v ) )   ;


    // Step 2: Perform the core calculation.
    // We take the first two numbers from the 'num' array (at index 0 and 1)
    // and multiply them together.
    // The result of this multiplication is stored in the 'res' variable.
    var   res   =   num [ 0 ]   *   num [ 1 ]   ;


    // Step 3: Output the final result.
    // We use Math.ceil() to round the 'res' value up to the nearest whole integer.
    // This final integer result is then printed to the console.
    console . log ( Math . ceil ( res ) )   ;

} // End of the Main function definition.


// This line initiates the program by calling the Main function.
// It reads input from standard input (typically a file or piped data)
// using Node.js's file system module ('fs').
// The input is read synchronously as a UTF-8 encoded string.
Main   (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;