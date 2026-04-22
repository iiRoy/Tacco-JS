/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered.
 */
( function (   input   )   { // Immediately Invoked Function Expression (IIFE) starts here

    // Declare and initialize variables for processing input.
    // 'inputs' will hold lines of text.
    // 'str' is an array to temporarily store two lines for comparison.
    // 's' and 'l' will hold the shorter and longer strings, respectively.
    // 'tmp' is declared but unused in this specific version of the code.
    // 'count' tracks the length of common substrings.
    // 'max' stores the maximum common substring length found.
    var inputs  =  input . replace ( / \r /g ,  '' ) . split ( " \n " ) ,
        str = [ ] ,
        s ,
        l ,
        tmp , // This variable is declared but not used in the current logic.
        count ,
        max ;

    // Main processing loop. It continues indefinitely until an empty string is encountered.
    while (   true   )   {

        // Initialize max common substring length for the current pair of strings.
        max  =  0 ;

        // Get the first string from the 'inputs' array.
        // The shift() method removes the first element from an array and returns that element.
        str [ 0 ]   =   inputs . shift ( ) ;

        // Check if the first string is empty. If so, it signifies the end of input.
        if (   str [ 0 ]   ===   ''   )   {
            // Exit the loop.
            break ;
        }

        // Get the second string from the 'inputs' array.
        str [ 1 ]   =   inputs . shift ( ) ;

        // Determine which string is shorter ('s') and which is longer ('l').
        // This optimization helps in the nested loop by iterating over the shorter string.
        if (   str [ 0 ] . length   <   str [ 1 ] . length   )   {
            s   =   str [ 0 ] ; // 's' gets the shorter string
            l   =   str [ 1 ] ; // 'l' gets the longer string
        }   else   {
            s   =   str [ 1 ] ; // 's' gets the shorter string
            l   =   str [ 0 ] ; // 'l' gets the longer string
        }


        // Iterate through the shorter string ('s') to find the longest common substring.
        for (   var   i   =   0 ,   len   =   s . length ;   i   <   len ;   i ++   )   {
            // Initialize count for the current starting position 'i'.
            count   =   1 ;

            // While loop to extend the common substring.
            // It checks if s[i+count] exists (to prevent out-of-bounds access)
            // AND if the substring from 's' (s.slice(i, i + count)) is found in 'l'
            // at an index greater than 0 (meaning it's not at the very beginning,
            // but `indexOf` returns the *first* occurrence, so `> 0` is not strictly
            // correct for finding *any* common substring, but it's part of the original logic).
            // A common substring can start at index 0. The original logic `> 0`
            // implies it's looking for a common substring that doesn't start at the very
            // beginning of `l`. This might be a specific problem constraint.
            while (   s [ i   +   count ]   &&   l . indexOf (   s . slice (   i ,   i   +   count   )   )   >   0   )   {
                count ++ ; // Increment the length of the current common substring candidate.
            }

            // If the current common substring length (count - 1 because count is incremented one too many times)
            // is greater than the previously recorded maximum, update 'max'.
            if (   count   >   max   )   {
                max   =   count   -   1 ; // The actual length is count - 1 because the loop increments one more time after the condition fails.
            }
        }

        // Output the maximum common substring length found for the current pair of strings.
        console . log (   max   ) ;
    } // End of the while(true) loop.

// The IIFE is immediately invoked with the result of reading from stdin.
// `require("fs").readFileSync("/dev/stdin", "utf8")` reads the entire standard input
// as a UTF-8 encoded string.
} ) (   require ( "fs" ) . readFileSync ( " /dev/stdin " ,   "utf8" )   ) ;
// End of the entire script.