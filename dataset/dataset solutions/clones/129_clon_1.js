/*
 * This JavaScript code processes input data from standard input.
 * It reads lines, parses them, and increments global counters 'a' or 'b'
 * based on specific conditions derived from the parsed data.
 * Finally, it prints the accumulated counts.
 */


// Initialize counter variables 'a' and 'b' to zero.
// These variables will store the final counts.
a = b = 0 ;


// Use the 'fs' module to read from the file system.
// Specifically, read the entire content of standard input ('/dev/stdin').
require ( "fs" )

    // Read the file synchronously.
    // The second argument specifies the encoding as UTF-8.
    . readFileSync ( "/dev/stdin" , "utf8" )

    // Split the entire input string into an array of lines.
    // Each line is separated by a newline character.
    . split ( '\n' )

    // Iterate over each line in the array.
    // The 'map' function processes each element and returns a new array,
    // but in this case, the side effects (incrementing 'a' or 'b') are the primary goal.
    . map ( function ( i ) {

        // For each input line 'i':
        // 1. Split the line by a comma (',') to get an array of elements.
        // 2. Sort the resulting array in ascending order.
        // 3. Assign the sorted array to the local variable 'c'.
        c = i . split ( ',' ) . sort ( ) ;


        // Evaluate a nested ternary expression based on the elements of the sorted array 'c'.
        // This expression determines whether to increment 'a', 'b', or do nothing.
        c [ 2 ] == c [ 1 ]

            // If the third element (index 2) is equal to the second element (index 1):
            // The result of this branch is '0', effectively doing nothing to 'a' or 'b'.
            ?
                0

            // Otherwise (if c[2] is not equal to c[1]):
            // Proceed to the next ternary condition.
            :
                c [ 1 ] == c [ 2 ]

                    // If the second element (index 1) is equal to the third element (index 2):
                    // This condition is logically contradictory to the outer 'else' branch
                    // (where c[2] != c[1]), meaning this 'a++' will never be executed.
                    ?
                        a ++

                    // Else (if c[1] is not equal to c[2]):
                    // This is the branch that will be executed if c[2] != c[1].
                    // Increment the counter 'b'.
                    :
                        b ++
        ; // End of the ternary expression.
    } ) ; // End of the map function and method chain.


// Finally, print the values of 'b' and 'a' to standard output.
// They are separated by a newline character.
console . log ( b + '\n' + a ) ;