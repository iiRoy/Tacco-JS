/*
 * This JavaScript program reads input from standard input,
 * processes each line according to specific rules,
 * evaluates the modified string as a JavaScript expression,
 * and prints the integer result to the console for each line.
 *
 * This is a Type I clone, preserving all functional logic
 * while extensively modifying whitespace and comments.
 */


//  Import the 'fs' module to allow reading from the file system.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


//  Process the raw input:
//  1. Trim any leading or trailing whitespace from the entire input.
//  2. Split the trimmed input string into an array of strings,
//     where each element represents a line from the input.
var   Arr   =   ( input . trim ( ) ) . split ( "\n" ) ;


//  The first element of the 'Arr' array is expected to be a number,
//  indicating how many subsequent lines need to be processed.
//  'shift()' removes this element from the array and returns it.
//  The '-0' is a common idiom to explicitly convert the string to a number.
var   L   =   Arr . shift ( ) - 0 ;


//  Loop through the remaining elements in the 'Arr' array,
//  up to the count specified by 'L'.
for   ( var   i   =   0 ;   i   <   L ;   i ++ )
{
    //  Retrieve the current line (string) to be processed.
    var   str   =   Arr [ i ] ;

    //  Remove the last character from the current string.
    //  This might be a newline character or some other trailing symbol.
    str   =   str . slice ( 0 , -1 ) ;

    //  Apply a regular expression replacement:
    //  Find any sequence of one or more digits followed by a period and then
    //  one or more digits (e.g., "123.45").
    //  Replace it with just the integer part (the captured group $1).
    //  The 'g' flag ensures all occurrences in the string are replaced.
    str   =   str . replace ( / ( \d+ ) \. \d+ / g ,   "$1" ) ;

    //  Evaluate the modified string as a JavaScript expression.
    //  WARNING: Use of 'eval()' can introduce security vulnerabilities
    //  if the input source is untrusted, as it executes arbitrary code.
    var   num   =   eval ( str ) ;

    //  Convert the evaluated result to an integer (base 10)
    //  and print it to the standard output, followed by a newline.
    console . log ( parseInt ( num ,   10 ) ) ;
}