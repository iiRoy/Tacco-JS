/*
 * This JavaScript file processes input to count occurrences of a specific character.
 * It's a demonstration of Type I code cloning, where only whitespace and comments
 * are altered, leaving the core logic and structure identical.
 */
'use strict' ; // Enforces strict parsing and error handling rules for the script.

/**
 * The primary function responsible for handling the application logic.
 * It takes an input string, processes it, and outputs a result.
 *
 * @param {string} input - The raw input string provided to the program, typically from stdin.
 */
function   Main ( input )   {

    // Declare a variable 'line' to store the calculated result.
    // The logic:
    // 1. input.split("\n")[0] - Takes the first line of the input string.
    // 2. .split("1") - Splits this first line by every occurrence of the character "1".
    // 3. .length - Gets the number of segments after splitting.
    // 4. - 1 - Subtracts 1 from the length to get the actual count of "1"s.
    var   line   =   input . split ( "\n" ) [ 0 ] . split ( "1" ) . length   -   1 ;

    // Output the final calculated value to the standard console.
    console . log ( line ) ;

} // End of the Main function definition.

// This line executes the Main function immediately upon script loading.
// It reads the entire content of the standard input stream ('/dev/stdin')
// as a UTF-8 encoded string and passes it to the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ; // Invoke the main processing routine.