/*
 * This file contains a JavaScript program designed to process input
 * and perform a specific character check.
 * The input is read, parsed, and then a custom `check` function
 * is used to validate a pattern.
 *
 * This is a Type I clone, preserving all original identifiers
 * and logic, but with extensive changes to whitespace and comments
 * to alter its visual appearance.
 */

let inputCnt ; // Counter for input array access. Initialized to zero later.

/**
 * The main function responsible for processing the input string.
 * @param {string} input - The raw input data as a single string.
 */
function Main( input )
{

    // Replace all newline characters with spaces to flatten the input string.
    input = input.replace( /\n/g , " " ) ;

    // Split the flattened string by spaces to get an array of individual tokens.
    input = input.split( " " ) ;

    // The following line was commented out in the original code,
    // it's kept as a commented-out line here as well.
    // for(var i = 0; i < input.length; i++)console.log('%s',input[i]);

    // Read a string token using the helper function.
    let s = inS( ) ;

    /*
     * Perform the core logic check:
     * Compare the result of `check(s[0])` with `s[3]`
     * AND the result of `check(s[1])` with `s[2]`.
     * If both conditions are true, output "Yes"; otherwise, output "No".
     */
    if ( check( s[0] ) == s[3] && check( s[1] ) == s[2] )
    {
        out( "Yes" ) ;
    }
    else
    {
        out( "No" ) ;
    }

} // End of Main function.


/**
 * Custom helper function to transform specific characters.
 * It maps 'd' to 'b', 'b' to 'd', and 'p' to 'q'.
 * Note: The original code had 'p' to 'q' listed twice, which is redundant
 * but functionally harmless. This redundancy is preserved here.
 * @param {string} t - The character to check.
 * @returns {string|undefined} The transformed character or undefined if no match.
 */
function check ( t )
{
    if ( t == "d" )
        return "b" ;

    if ( t == "b" )
        return "d" ;

    if ( t == "p" )
        return "q" ;

    // This condition is a duplicate of the previous one.
    if ( t == "p" )
        return "q" ;
} // End of check function.


/*
 * This function is typically used for local debugging purposes
 * when running the code in a browser environment.
 * It reads input from a DOM element, resets the input counter,
 * and then calls the Main function.
 */
function debug ( )
{
    input = document.getElementById( "input" ).value ;
    inputCnt = 0 ; // Reset the counter for new input.
    Main( input ) ;
} // End of debug function.

/**
 * Outputs the given string to the console.
 * This is a wrapper around `console.log`.
 * @param {string} output - The string to be logged.
 */
function out ( output )
{
    console.log( output ) ;
} // End of out function.

/**
 * Reads the next input token as an integer.
 * It uses `inS()` to get the string token and then `parseInt()` to convert it.
 * @returns {number} The parsed integer value.
 */
function inI ( )
{
    return parseInt( inS( ) , 10 ) ; // Base 10 is specified for parsing.
} // End of inI function.

/**
 * Reads the next input token as a floating-point number.
 * It uses `inS()` to get the string token and then `parseFloat()` to convert it.
 * @returns {number} The parsed float value.
 */
function inF ( )
{
    return parseFloat( inS( ) ) ;
} // End of inF function.

/**
 * Reads and returns the next string token from the global `input` array.
 * It also increments the `inputCnt` for the next read.
 * @returns {string} The next string token.
 */
function inS ( )
{
    return input[ inputCnt ++ ] ;
} // End of inS function.


// This section handles the standard input/output for competitive programming environments.
// Do not modify any code below this line, as it's part of the standard setup.
inputCnt = 0 ; // Ensure the input counter is reset before the main execution.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;
// The `Main` function is called with content read from standard input.