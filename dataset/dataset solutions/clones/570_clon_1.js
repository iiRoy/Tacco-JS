/*
 * This JavaScript file processes input from /dev/stdin.
 * It counts occurrences of "JOI" and "IOI" substrings within the input.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */
var    input = require  (   'fs'   ) .   readFileSync  (    '/dev/stdin'   ,  'utf8'   )   ;

// The input string is trimmed to remove any leading or trailing whitespace.
input   =   input.trim   (   )   ;

var    cntA    =    0    ;   // This variable will store the count of "JOI" occurrences.
var    cntB    =    0    ;   // This variable will store the count of "IOI" occurrences.


// Loop through the input string to find all possible 3-character substrings.
// The loop condition `i < input.length - 3` ensures that `input[i+2]` is always valid.
for    (   var   i    =    0   ;   i   <   input.length   -   3   ;   i   ++   )
{
    // Concatenate three consecutive characters to form a potential substring.
    var currentSubstring = input   [   i   ]   +   input   [   i   +   1   ]   +   input   [   i   +   2   ]   ;

    // Check if the current substring matches "JOI".
    if (   currentSubstring   ==   "JOI"   )
    {
        cntA   ++   ;   // If it matches, increment the "JOI" counter.
    }

    // Check if the current substring matches "IOI".
    if (   currentSubstring   ==   "IOI"   )
    {
        cntB   ++   ;   // If it matches, increment the "IOI" counter.
    }
} /* End of the loop for counting substrings */


// Output the final count for "JOI" to the console.
console   .   log   (   cntA   )   ;
// Output the final count for "IOI" to the console.
console   .   log   (   cntB   )   ;