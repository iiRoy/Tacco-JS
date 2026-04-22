/*
 * This JavaScript code defines a primary function named 'Main'
 * which processes a single character input to determine an output string.
 * The logic is based on specific numeric character values.
 * This file is typically used for competitive programming challenges
 * where input is read from standard input and output is written to standard output.
 */

function   Main   (   input   )
{
    // Convert the given input argument into its string representation.
    // Then, split that string into an array of individual characters.
    const   inputChars   =   input
        .   toString   (   )
        .   split   (   ''   )   ;

    // Retrieve the very last character from the array of input characters.
    // This assumes there's at least one character in the input.
    const   lastChar   =   inputChars   [
        inputChars   .   length   -   1
    ]   ;

    // Declare a mutable variable 'text' and initialize it as an empty string.
    // This variable will store the final string determined by the logic.
    let   text   =   ''   ;


    // Begin conditional checks based on the value of 'lastChar'.

    // Check if 'lastChar' matches any of the characters '2', '4', '5', '7', or '9'.
    if
    (
            lastChar   ===   "2"   // Is the last character '2'?
        ||  lastChar   ===   "4"   // OR is it '4'?
        ||  lastChar   ===   "5"   // OR is it '5'?
        ||  lastChar   ===   "7"   // OR is it '7'?
        ||  lastChar   ===   "9"   // OR is it '9'?
    )
    {
        // If any of the above conditions are true, set 'text' to "hon".
        text   =   "hon"   ;
    }
    // Otherwise, if the first condition block was false, check this alternative set of characters.
    else   if
    (
            lastChar   ===   "0"   // Is the last character '0'?
        ||  lastChar   ===   "1"   // OR is it '1'?
        ||  lastChar   ===   "6"   // OR is it '6'?
        ||  lastChar   ===   "8"   // OR is it '8'?
    )
    {
        // If any of these conditions are true, set 'text' to "pon".
        text   =   "pon"   ;
    }
    // If neither of the preceding 'if' or 'else if' conditions were met.
    else
    {
        // For all other cases, set 'text' to the default value "bon".
        text   =   "bon"   ;
    }

    // Finally, print the determined 'text' string to the console (standard output).
    console   .   log   (   text   )   ;
}

// Call the 'Main' function immediately upon script execution.
// The input is asynchronously read from '/dev/stdin' using Node.js's 'fs' module.
// The content is read as a UTF-8 encoded string.
Main   (
    require   (   "fs"   )
        .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )
)   ;