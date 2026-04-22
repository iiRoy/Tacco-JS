/*
 * This JavaScript file processes input data from standard input.
 * It's designed to handle multiple test cases, each involving a dictionary
 * and a set of words/phrases to translate using that dictionary.
 * The processing continues until a specific termination condition is met.
 */

var  input  =  require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ; // Reads the entire content of standard input as a UTF-8 string.

// Trim any leading/trailing whitespace from the input and then split it
// into an array of strings, where each string represents a line from the input.
var   Arr   =   (   input . trim   ()   ) . split   (   "\n"   ) ;

// The main processing loop. It continues as long as there are
// at least two lines remaining in the 'Arr' array, indicating
// more data blocks to process (dictionary size + at least one line for translation).
while   (   Arr . length   >   1   )   {
    /*
     * The first line of each data block specifies the number of entries
     * in the dictionary for the current test case.
     */
    var     AL     =     Arr . shift   () ; // Extracts and removes the first element (dictionary size) from 'Arr'.

    var     hash     =     {   } ; // Initializes an empty JavaScript object to serve as our dictionary (hash map).

    // Loop to read and populate the dictionary entries.
    for   (   var   i   =   0   ;   i   <   AL   ;   i   ++   )   {
        // Each dictionary entry line is trimmed and then split by space.
        // The first part is the key, the second part is the value.
        var     arr     =     (   Arr[i] . trim   ()   ) . split   (   " "   ) ;

        // Stores the key-value pair in the 'hash' object.
        hash   [   arr[0]   ]   =   arr[1] ;
    }

    // After reading all dictionary entries, remove them from the 'Arr' array.
    // 'slice(AL, Arr.length + 1)' effectively discards the first 'AL' elements.
    Arr   =   Arr . slice   (   AL   ,   Arr . length   +   1   ) ;

    /*
     * The next line in 'Arr' specifies the number of phrases that need
     * to be translated using the dictionary just built.
     */
    var     AL     =     Arr . shift   () ; // Re-uses 'AL' to store the count of phrases to translate.

    var     str     =     "" ; // Initializes an empty string to accumulate the translated output.

    // Loop through each phrase that needs translation.
    for   (   var   i   =   0   ;   i   <   AL   ;   i   ++   )   {
        var     k     =     Arr[i] . trim   () ; // Gets the current phrase to translate, trimming whitespace.

        // Checks if the phrase 'k' exists as a key in our 'hash' dictionary.
        // If it does, append its corresponding value to 'str'.
        // Otherwise, append the original phrase 'k' itself.
        str   +=   (   hash . hasOwnProperty   (   k   )   )   ?   hash[k]   :   k ;
    }

    // Once all phrases for the current block are processed, remove them from 'Arr'.
    Arr   =   Arr . slice   (   AL   ,   Arr . length   +   1   ) ;

    // Prints the final translated string for the current test case to standard output.
    console . log   (   str   ) ;

    // Termination condition: If the very next line in 'Arr' is "0",
    // it signifies the end of all test cases, and the loop breaks.
    if   (   Arr[0]   ==   "0"   )   break ;
} // End of the while loop for processing test cases.