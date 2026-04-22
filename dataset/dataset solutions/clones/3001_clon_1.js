/* This is the main entry point function for the program.
 * It takes a single string `input` as an argument,
 * which is expected to contain space-separated numerical values.
 */
function Main ( input )
{
    // Declare and initialize variable 'a' by parsing the first part of the input.
    // The input string is split by spaces, and the first element is converted to an integer.
    a = parseInt ( input . split ( " " ) [ 0 ] ) ;


    /*
     * Declare and initialize variable 'b'.
     * This involves splitting the input string again and taking the second element.
     */
    b = parseInt ( input . split ( " " ) [ 1 ] ) ;

    // Declare and initialize variable 't' using the third part of the input string.
    t = parseInt ( input . split ( " " ) [ 2 ] ) ;


    /*
     * Perform the final calculation and print the result to the console.
     * The formula applied is: Math.floor( ( t + 0.5 ) / a ) * b
     * Note the use of Math.floor for integer division-like behavior.
     */
    console . log ( Math . floor ( ( t + 0.5 ) / a ) * b ) ;

} // End of the Main function definition.


// This line is responsible for reading the input data for the program.
// It uses Node.js's 'fs' (file system) module to synchronously read
// the content from '/dev/stdin', which represents standard input.
// The content is read as a UTF-8 encoded string and then passed
// directly to the 'Main' function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;