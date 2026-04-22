/* This is a Type I clone of the provided JavaScript code.
 * It strictly adheres to the definition: only whitespace and comments
 * have been altered. All identifiers, operators, and expressions
 * remain exactly as in the original source. */

// Initialize an empty array 'a' to store counts of numbers.
a = [] ;
// Initialize 'c' to 0; this variable will track the maximum frequency found.
c = 0 ;

// Use the 'fs' module to read input.
require ( "fs" )
    // Synchronously read the file from standard input.
    . readFileSync (
          "/dev/stdin" // Path to standard input.
        , "utf8"       // Specify UTF-8 encoding for the input.
    )
    // Split the entire input content into an array of strings,
    // using the newline character as a delimiter.
    . split ( '\n' )
    /*
     * Iterate over each line of the input.
     * The 'some' method is used here, but its boolean return value
     * is not utilized in this specific code structure.
     */
    . some (
        function ( i ) { // 'i' represents the current line (string) being processed.

            // Convert the string 'i' to a number and assign it to 'j'.
            // The unary plus operator '+' is used for type conversion.
            j = + i ;

            // Check if 'j' is a truthy value (i.e., not 0, null, undefined, NaN, or an empty string).
            // This effectively skips empty lines or lines that don't parse to a valid number.
            if ( j ) {

                /*
                 * This is a conditional assignment.
                 * If 'a[j]' is NaN (meaning this number 'j' has not been encountered before),
                 * set its count to 1. Otherwise, increment its existing count.
                 * Note: 'a[j]++' is a post-increment, so 'a[j]' is evaluated *before* incrementing
                 * for the comparison with 'c' in the next line.
                 */
                a [ j ] = a [ j ] == NaN
                    ? 1
                    : a [ j ] ++ ;

                // Update 'c' (the maximum frequency) if the current count 'a[j]'
                // is greater than the previously recorded maximum.
                c = a [ j ] > c
                    ? a [ j ]
                    : c ;
            }
        }
    ) ; // End of the first .some() call.

/*
 * After processing all input lines and determining the maximum frequency 'c',
 * iterate through the 'a' array again to find all numbers
 * that have this maximum frequency.
 */
a . some (
    function ( i , j ) { // 'i' here is the count for the number 'j' (the index).

        // If the count 'i' of the current number 'j' matches the overall maximum frequency 'c'...
        if ( i == c ) {
            // Print the number 'j' to the console.
            console . log ( j ) ;
        }
    }
) ; // End of the second .some() call.

// This concludes the Type I clone.