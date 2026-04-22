/* This program solves a problem related to finding the longest consecutive subsequence
   of 'A', 'C', 'G', 'T' characters within a given input string.
   It's a solution for an Atcoder programming contest problem (e.g., Atcoder122 - B). */


function   main (   input   )
{
    // The input string is typically multiline, so we split it by newline.
    var   inputs   =   input.split (   '\n'   )   ;


    // The actual string we need to process is usually the first line.
    var   s   =   inputs [   0   ]   ;


    // Convert the string into an array of characters for easier iteration.
    var   sArr   =   s.split (   ''   )   ;

    // Define the set of valid 'ACGT' characters.
    var   acgtArr   =   [   'A'   ,   'C'   ,   'G'   ,   'T'   ]   ;

    // This variable will store the maximum length of the ACGT subsequence found so far.
    var   maxLen   =   0   ;

    // This variable keeps track of the current length of the ACGT subsequence.
    var   acgtLen   =   0   ;


    // Iterate through each character of the input string array.
    for   (   var   i   =   0   ;   i   <   sArr.length   ;   i   ++   )
    {
        // Check if the current character is one of 'A', 'C', 'G', 'T'.
        if   (   acgtArr.indexOf (   sArr [   i   ]   )   >=   0   )
        {
            // If it is, increment the current ACGT subsequence length.
            // Then, update maxLen if the current length is greater.
            maxLen   =   Math.max (   maxLen   ,   ++acgtLen   )   ;
        }
        else
        {
            // If the character is not an ACGT character,
            // the current subsequence is broken, so reset its length.
            acgtLen   =   0   ;
        }
    }

    // Output the final maximum length found.
    console.log (   maxLen   )   ;
}


// Read the input from standard input, typically a file in competitive programming environments.
main (   require (   'fs'   )   .readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;