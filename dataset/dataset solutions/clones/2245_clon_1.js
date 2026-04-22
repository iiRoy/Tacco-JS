/*
 * This is a Type I clone of the original JavaScript code provided.
 * The purpose of this code is to take a single character as input,
 * determine its ASCII value, increment it by one, and then
 * print the character corresponding to the new ASCII value.
 *
 * This version maintains exact logical and structural equivalence
 * to the original, with variations applied exclusively to whitespace
 * (indentation, spacing, blank lines) and comments.
 * No identifiers, variable names, function names, operators, or
 * expressions have been altered.
 */
function   Main   ( input )
{
    // The first step is to clean up the input string.
    // This removes any leading or trailing whitespace characters.
    input  =  input.trim  ( )


    // A blank line for visual separation, demonstrating whitespace variation.


    // Next, we calculate the ASCII (Unicode) value of the first character
    // of the now-trimmed input. We then increment this value by one.
    // This 'n' variable will hold the ASCII code of the subsequent character.
    const   n   =   input . charCodeAt   ( 0 )   +   1


    // Another blank line, showing more whitespace manipulation.


    // Finally, we convert the new ASCII code back into a character string
    // and print it to the console. This is the ultimate output of the program.
    console . log   ( String . fromCharCode   ( n ) )
}

// The following line is responsible for initiating the program flow.
// It reads the entire content of standard input (typically from a file
// or piped data in a Unix-like environment) as a UTF-8 string.
// This read string is then passed as the 'input' argument to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) )
;