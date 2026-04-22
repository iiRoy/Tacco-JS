/*
 * This JavaScript file contains a function to validate specific string patterns.
 * It's structured to process input, apply validation rules, and return a boolean-like result.
 */

// Core constants definition for string manipulation.
const BKRT = "\n" ; // Represents the newline character.
const SPAC = " "  ; // Represents a single space character.
const NOSP = ""   ; // Represents an empty string, often used for no-operation or default.


/**
 * The primary function responsible for processing input and performing validation.
 *
 * @param {string} input - The raw input string provided to the program.
 * @returns {string} - "Yes" if the input string conforms to the expected pattern, "No" otherwise.
 */
function     Main (   input   )
{
    // Step 1: Pre-process the input string.
    // It splits the input by newlines, then each resulting line by spaces,
    // and flattens all parts into a single array for sequential consumption.
    input = [ ] . concat ( ... input . split ( BKRT ) . map ( a => a . split ( SPAC ) ) ) ;


    // Helper function: Extracts (shifts) the next string token from the input array.
    const strShift = ( ) => input . shift ( ) ;

    // Helper function: Extracts (shifts) the next token and converts it to an integer.
    // The '~~' bitwise operator is used for a quick and dirty floor-like integer conversion.
    const intShift = ( ) => ~~ input . shift ( ) ;


    // Step 2: Read the expected lengths for the string parts.
    // A represents the required length for the first segment.
    var A = intShift ( ) ;
    // B represents the required length for the second segment.
    var B = intShift ( ) ;


    // Step 3: Read the actual string to be validated and split it by the hyphen.
    var C = strShift ( ) . split ( "-" ) ;


    // Step 4: Perform validation checks on the split string.

    // Check 4.1: Ensure the string was split into exactly two parts by the hyphen.
    if ( C . length != 2 )
    {
        return "No" ; // Incorrect number of segments.
    }


    // Check 4.2: Verify the length of the first segment matches the expected length A.
    if ( C [ 0 ] . length != A )
    {
        return "No" ; // First segment length mismatch.
    }


    // Check 4.3: Verify the length of the second segment matches the expected length B.
    if ( C [ 1 ] . length != B )
    {
        return "No" ; // Second segment length mismatch.
    }


    // If all validation checks pass successfully, the input string is considered valid.
    return "Yes" ;
}


// ---------------------------------------------------------------------------------------------------------------------
// The following code block is an Immediately Invoked Function Expression (IIFE)
// designed to handle the execution environment, either Node.js or a browser-like setting.
// It abstracts away the input/output mechanism for convenience, especially in competitive programming contexts.
// ---------------------------------------------------------------------------------------------------------------------

( ( b , c , d ) =>
    "undefined" != typeof require
        ?
        console . log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) )
        :
        [
            // Process the raw input string for non-Node environments (e.g., browser testing).
            // It removes the first and last lines (often empty or metadata) and rejoins.
            b = b . split ( "\n" ) . slice ( 1 , -1 ) . join ( "\n" ) ,

            // Execute the Main function and capture its output or any error.
            c = function ( ) {
                try {
                    return Main ( b )
                } catch ( f ) {
                    return f . stack || f . message
                }
            } ( ) , // Self-invoking function to get the result.

            // Determine the data type of the result 'c'.
            d = typeof c ,

            // If 'c' is not a string, convert it to a JSON string for display purposes.
            "string" == d || ( c = JSON . stringify ( c ) ) ,

            // Dynamically create and append HTML elements (form, textareas, breaks)
            // to display the input, its type, and the final output in a browser.
            $ ( "<form>" ) . append (
                [
                    [ 10 , b ] , // Display input content in a 10-row textarea.
                    0 ,          // Insert a break.
                    [ 1 , d ] ,  // Display result type in a 1-row textarea.
                    0 ,          // Insert another break.
                    [ 10 , c ]   // Display result content in a 10-row textarea.
                ] . map ( f => $ ( f ? "<textarea>" : "<br>" , f && { rows : f [ 0 ] , cols : 40 , text : f [ 1 ] } ) )
            ) . appendTo ( "body" )
        ]
) (
`
3 4
269-66-0
`
) ;