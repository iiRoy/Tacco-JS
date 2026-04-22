// This script reads input from standard input, processes it, and finds a minimum value.

// 's' will store the content read from /dev/stdin as a UTF-8 string.
s = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;


// The core logic calculates a minimum absolute difference.
// It iterates through substrings of length 3 from the input string 's'.
// For each substring, it converts it to an integer (using |0 for coercion).
// Then it calculates the absolute difference between this integer and 753.
// Finally, it finds the minimum of all these absolute differences using Math.min.apply.
Math . min . apply (
    null ,
    // Generate an array of values to map over.
    // The length is s.length - 2, corresponding to the number of possible 3-character slices.
    [
        ... Array ( s . length - 2 )
    ]
    . map (
        // For each index 'i' (representing the start of a 3-character slice)...
        ( _ , i ) =>
        {
            // Extract a 3-character substring from 's' starting at the current index 'i'.
            // Convert the substring to an integer using the bitwise OR operator with 0.
            // This is a common JavaScript trick for efficient integer coercion.
            // Then calculate the absolute difference between this integer value and 753.
            return Math . abs ( ( s . slice ( i , i + 3 ) | 0 ) - 753 ) ;
        }
    )
) ;