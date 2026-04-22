"use strict"; // This directive enables strict mode for the entire script.

/*
 * This JavaScript file contains a solution for comparing two strings
 * based on the frequency of their characters.
 * It determines if two strings are "anagrams" in a generalized sense,
 * meaning they contain the same count of each character, regardless of order.
 */


const   main   =   (   arg   )   =>
{
    // Step 1: Pre-process the input argument.
    // Trim any leading/trailing whitespace and split the string by newline characters.
    arg   =   arg . trim ( ) . split ( "\n" ) ;


    // Step 2: Extract the two input strings, S and T, from the processed array.
    const   S   =   arg [ 0 ] ; // The first string to be analyzed.
    const   T   =   arg [ 1 ] ; // The second string to be analyzed.


    /*
     * Step 3: Initialize two frequency maps (arrays) for character counts.
     * Each array will have 26 elements, one for each lowercase English letter (a-z).
     * All elements are initialized to zero.
     */
    const   map1   =   [   ...   Array   (   26   )   ] . fill   (   0   )   ; // Frequency map for string S.
    const   map2   =   [   ...   Array   (   26   )   ] . fill   (   0   )   ; // Frequency map for string T.


    // Step 4: Iterate through both strings simultaneously to populate the frequency maps.
    for   (   let   i   =   0   ;   i   <   S . length   ;   i ++   )
    {
        // For string S:
        // Get the ASCII code of the character at index 'i', subtract 97 (ASCII of 'a')
        // to get a 0-based index (0 for 'a', 1 for 'b', etc.), and increment its count.
        map1 [   S . charCodeAt   (   i   )   -   97   ] ++   ;

        // For string T:
        // Perform the same operation as above to populate map2.
        map2 [   T . charCodeAt   (   i   )   -   97   ] ++   ;
    }


    /*
     * Step 5: Sort both frequency maps.
     * Sorting ensures that if the strings have the same character counts,
     * their sorted frequency maps will be identical.
     * The sort function (a, b) => a - b sorts numbers in ascending order.
     */
    map1 . sort   (   (   a   ,   b   )   =>   a   -   b   )   ; // Sort map1.
    map2 . sort   (   (   a   ,   b   )   =>   a   -   b   )   ; // Sort map2.


    // Step 6: Compare the sorted frequency maps.
    // Convert each sorted map to a string by joining its elements without a separator.
    // Then, compare these two resulting strings for exact equality.
    if   (   map1 . join   (   ""   )   ===   map2 . join   (   ""   )   )
    {
        // If the joined strings are identical, it means both original strings
        // have the same character frequencies.
        console . log   (   "Yes"   )   ;
    }
    else
    {
        // If they are not identical, the character frequencies differ.
        console . log   (   "No"   )   ;
    }
}   ;


// Step 7: Invoke the main function with the input.
// Read the entire content of '/dev/stdin' as a UTF-8 string.
// This is a common pattern for competitive programming in Node.js.
main   (   require   (   'fs'   ) . readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;