// This is the primary function responsible for processing the given input data.
function main ( input )
{
    // The raw input string is first split into an array of lines, based on the newline character.
    input = input . split ( "\n" )

    /*
     * Declare and initialize a variable 'a'.
     * Its value is derived by parsing the very first element (line) of the 'input' array
     * as an integer, using base 10 for the conversion.
     */
    var a = parseint ( input[0] , 10 )


    // Initialize two critical variables: 'b' which acts as a counter, and 'result' to store calculations.
    var b = 0
    var result = 0


    // This loop iteratively calculates squares until 'result' potentially exceeds 'a'.
    // It continues as long as 'a' remains strictly greater than the current 'result'.
    while ( a > result )
    {
        // Increment the counter 'b' for the next iteration.
        b ++

        /*
         * Compute the square of 'b'.
         * This new squared value is then assigned to the 'result' variable.
         */
        result = b * b
    } // End of the 'while' loop block.


    // After the loop, it's possible that 'result' (b*b) might have just become greater than 'a'.
    // This conditional check addresses that specific scenario.
    if ( result > a )
    {
        // If 'result' indeed overshot 'a', we must decrement 'b' to revert to the previous, valid state.
        b --

        // With the corrected 'b', recalculate 'result' to ensure it represents the largest square
        // that is less than or equal to 'a'.
        result = b * b
    } // Concludes the 'if' block.


    // Finally, the computed 'result' is printed to the standard output console.
    console . log ( result )

} // Concludes the definition of the 'main' function.


/*
 * This is the entry point for the script execution.
 * It reads data from the standard input file system path (/dev/stdin).
 * The 'fs' module is used for file system operations, and 'readfilesync' reads the file synchronously.
 * The content is expected to be encoded in 'utf8'.
 * The entire content read from the file is then passed as an argument to the 'main' function for processing.
 */
main ( require ( "fs" ) . readfilesync ( "/dev/stdin" , "utf8" ) )