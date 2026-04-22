/*
 * This JavaScript code reads pairs of lines from standard input,
 * treats each pair as two strings, and performs a specific
 * string comparison algorithm on them.
 *
 * It aims to find some kind of maximum match, though the exact
 * nature of the match is defined by the internal loops and conditions.
 *
 * The script will continue processing pairs of lines until
 * there are no more lines available in the input.
 */

//  --- Module Imports and Input Reading ---

// Import the 'fs' (file system) module, which is standard in Node.js
// for interacting with the file system, including standard I/O.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read the entire standard input as a UTF-8 string.


//  --- Input Processing ---

// Process the raw input string:
// 1. Trim any leading or trailing whitespace (like a final newline).
// 2. Split the string into an array of individual lines, using newline characters as delimiters.
var    arr   =   input . trim ( ) . split ( "\n" ) ;


//  --- Main Processing Loop ---

// This outer loop continuously processes pairs of strings.
// It will break only when there are no more input lines.
while (   true   )
{
    // Check if the array of input lines is empty.
    // If it is, there's nothing left to process, so we exit.
    if (   arr . length   ==   0   )
    {
        break   ; // Terminate the infinite loop.
    }


    //  --- Extracting Strings for Comparison ---

    // Take the first line from the array, split it into an array of characters.
    // This will be treated as the first string 'a'.
    var    a   =   arr . shift ( ) . split ( "" ) ;

    // Take the next line from the array, split it into an array of characters.
    // This will be treated as the second string 'b'.
    var    b   =   arr . shift ( ) . split ( "" ) ;


    //  --- Algorithm Initialization ---

    // 'ans' stores the overall maximum match length found so far across all comparisons.
    var    ans   =   0   ;

    // 'cnt' is a counter that changes with the outer loop, influencing the inner loop's range.
    var    cnt   =   0   ;


    //  --- Core Comparison Logic: Outer Loop ---

    // This loop iterates backwards through the characters of the first string 'a'.
    // 'i' represents the starting index in 'a' for a segment comparison.
    for (   var    i   =   a . length   -   1   ;   i   >=   0   ;   i--   )
    {
        cnt++   ; // Increment 'cnt' with each iteration of the outer loop.

        var    x   =   i   ; // 'x' is a pointer for string 'a', initialized to 'i'.
        var    max   =   0   ; // 'max' tracks the current consecutive match length for the inner loop.


        //  --- Core Comparison Logic: Inner Loop ---

        // This loop iterates forward, comparing segments of 'a' and 'b'.
        // 'j' represents the index in string 'b'.
        // The loop runs 'cnt' times.
        for (   var    j   =   0   ;   j   <   cnt   ;   j++   )
        {
            // Compare the character at 'a[x]' with 'b[j]'.
            if (   a [ x ]   ==   b [ j ]   )
            {
                max++   ; // If characters match, extend the current match length.
            }
            else
            {
                // If characters do not match, the current sequence of matches is broken.
                // Update the overall answer ('ans') if 'max' is greater.
                ans   =   Math . max ( ans , max )   ;
                max   =   0   ; // Reset 'max' because the match sequence was interrupted.
            }
            x++   ; // Move to the next character in string 'a' for the next comparison.
        }
        // IMPORTANT NOTE: The 'ans' variable is only updated inside the 'else' block.
        // This implies that if the longest match sequence ends with a successful comparison
        // at the very end of the inner loop (j == cnt - 1), its 'max' value will not be
        // propagated to 'ans' unless a mismatch occurs later or a specific problem
        // context makes this behavior intended. For Type I, the logic must be preserved.
    }


    //  --- Output Result ---

    // After processing all segments for the current pair of strings 'a' and 'b',
    // print the final calculated 'ans' to standard output.
    console . log ( ans ) ;
}

//  --- End of Script Execution ---