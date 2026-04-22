/*
 * This JavaScript program processes a specific input format
 * from standard input (/dev/stdin).
 *
 * It generates a string based on the input, then iteratively
 * removes all instances of "()" from that string.
 *
 * Finally, it outputs "YES" if the resulting string is empty,
 * and "NO" otherwise.
 */


// --- Module Imports ---
// The 'fs' module provides functionality for interacting with the file system.
var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' );


// --- Input Processing ---
// Trim any leading or trailing whitespace from the raw input.
// Then, split the input string into an array of lines, using the newline character as a delimiter.
var Arr = ( input . trim() ) . split( "\n" );


// Extract the first element from the 'Arr' array.
// This element represents the total number of data entries to process.
// The '-0' is a concise way to explicitly convert the string to a numeric type.
var n = Arr . shift() - 0;


// Initialize an empty string. This string will be built up
// based on the processed input data.
var str = "";


// --- Main Data Processing Loop ---
// Iterate 'n' times, processing each data line from the 'Arr' array.
for ( var i = 0; i < n; i++ )
{
    // For the current line (Arr[i]), split it by spaces.
    // This assumes each data line contains at least two space-separated parts.
    var arr = Arr[ i ] . split( " " );

    // The first part of the split line is assigned to variable 'a'.
    // This 'a' will be the character/string to be repeated.
    var a = arr[ 0 ];

    // The second part is assigned to variable 'b', and converted to a number.
    // This 'b' represents the number of times 'a' should be repeated.
    var b = arr[ 1 ] - 0;

    // Concatenate the repeated string 'a' to the 'str' variable.
    // Array(b+1).join(a) effectively repeats 'a' 'b' times.
    // For example, if b=3 and a="X", Array(4).join("X") results in "XXX".
    str += Array( b + 1 ) . join( a );
}


// --- Post-Processing: Parentheses Removal ---
// Continuously remove all occurrences of "()" from the 'str' string.
// This loop runs as long as the pattern "()" can be found in 'str'.
while ( str . match( /\(\)/ ) )
{
    // Replace all global occurrences of "()" with an empty string.
    // The 'g' flag ensures all matches are replaced, not just the first.
    str = str . replace( /\(\)/g, "" );
}


// --- Final Output Decision ---
// After all processing, check if the 'str' variable is empty.
if ( str == "" )
{
    // If 'str' is empty, it means all "()" pairs were successfully removed
    // and no other characters remained.
    console . log( "YES" );
}
else // If 'str' is not empty, it implies unmatchable characters or
     // characters other than "()" were present initially or remained.
{
    console . log( "NO" );
}