/*
 * This file contains the primary logic for processing a string input.
 * It determines the number of characters that differ between the first
 * and second halves of the provided string. This is essentially checking
 * for palindrome-like properties, counting mismatches.
 */

// Define the main function that takes an array as input.
// The first element of this array is expected to be the string to analyze.
function   main (   input   )
{
    // Extract the string from the first element of the input array.
    var   n   =   input[   0   ]   ;

    // Calculate the length of the string 'n'.
    var   len   =   n.length   ;


    // Initialize a counter for the number of differing characters.
    var   ans   =   0   ;

    // Loop through the first half of the string.
    // Math.trunc(len/2) correctly handles both even and odd length strings
    // by ensuring the loop iterates only up to the middle character (exclusive for odd lengths).
    for   (   var   i   =   0   ;   i   <   Math.trunc (   len   /   2   )   ;   i   ++   )
    {
        // Get the character from the beginning of the string (at index 'i').
        var   a   =   n[   i   ]   ;
        // Get the corresponding character from the end of the string.
        // The index is calculated as len - i - 1.
        var   b   =   n[   len   -   i   -   1   ]   ;

        // Check if the character from the beginning does not match
        // its corresponding character from the end.
        if   (   a   !=   b   )
        {
            // If they do not match, increment the answer counter.
            ans   ++   ;   // Increment the count of mismatches.
        }
    }

    // Print the final count of differing characters to the console.
    console.log   (   ans   )   ;
}


// This part of the code handles reading the input from standard input,
// processing it, and then passing it to the 'main' function.
// It uses Node.js 'fs' module to read the file, converts it to UTF-8,
// removes leading/trailing whitespace, and splits it by newlines.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   ) .   trim (   ) .   split (   "\n"   )   )   ;