/*
 * This JavaScript code snippet demonstrates a Type I clone.
 * As per the definition, this clone maintains the exact
 * logical and structural integrity of the original code.
 *
 * All identifiers, variable names, function names, operators,
 * and expressions are preserved without any alteration.
 *
 * The only modifications applied are extensive changes in
 * whitespace (including indentation, spacing, and blank lines)
 * and the addition of various comments (both block and single-line).
 * These changes are purely cosmetic, intended to make the code
 * visually distinct while remaining functionally identical.
 */


// Begin by requiring the 'fs' (file system) module from Node.js.
require ( "fs" )

    // Then, synchronously read the content of '/dev/stdin'.
    // This is typically used to capture standard input in a Unix-like environment.
    . readFileSync (
        "/dev/stdin" , // Path to the input source.
        "utf8"         // Encoding for reading the file content.
    )

    // After reading the entire input as a single string,
    // split it into an array of strings, using the newline character
    // as the delimiter. Each element in the resulting array 'i'
    // will be one line from the input.
    . split ( '\n' )


    /*
     * The 'some' array method is used here to iterate over each line.
     * While 'some' typically stops iteration and returns 'true' upon
     * the first element that satisfies the provided test function,
     * in this implementation, the function implicitly returns 'undefined'
     * (which is falsy). This ensures that all lines are processed,
     * effectively using 'some' as a 'forEach' loop.
     */
    . some (
        function ( i ) // 'i' represents the current line string being processed.
        {
            // Inside the callback function:
            // Split the current line 'i' by spaces.
            // The result is assigned to a global variable 'c'.
            // 'c' will be an array of strings, representing coordinates or numbers.
            c = i . split ( ' ' ) ;

            // Now, we perform a comparison and log the result.
            // The core logic calculates two slopes and compares them.
            // The coordinates are assumed to be in 'c' as follows:
            // c[0], c[1] = (x1, y1)
            // c[2], c[3] = (x2, y2)
            // c[4], c[5] = (x3, y3)
            // c[6], c[7] = (x4, y4)

            console . log (
                (
                    // Calculate the slope of the first line segment: (y2 - y1) / (x2 - x1)
                    (
                        ( c [ 3 ] - c [ 1 ] ) // Difference in y-coordinates for the first segment.
                        /                     // Division operator.
                        ( c [ 2 ] - c [ 0 ] ) // Difference in x-coordinates for the first segment.
                    )
                    . toFixed ( 6 )           // Format the first slope to 6 decimal places.

                    ==                        // Comparison operator: checks if the two fixed-point strings are equal.

                    // Calculate the slope of the second line segment: (y4 - y3) / (x4 - x3)
                    (
                        (
                            ( c [ 7 ] - c [ 5 ] ) // Difference in y-coordinates for the second segment.
                            /                     // Division operator.
                            ( c [ 6 ] - c [ 4 ] ) // Difference in x-coordinates for the second segment.
                        )
                        . toFixed ( 6 )           // Format the second slope to 6 decimal places.
                    )
                )
                ? 'YES' // If the formatted slopes are identical, output 'YES'.
                : 'NO'  // Otherwise, output 'NO'.
            ) ;
        }
    )
; // The semicolon marks the end of the entire statement chain.