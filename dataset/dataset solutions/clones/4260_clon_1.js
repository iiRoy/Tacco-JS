/*
 * This is a JavaScript program designed to solve a specific algorithmic problem.
 * It utilizes the 'readline' module for input processing.
 * The core logic involves sorting arrays and performing binary searches.
 */

    var lines = [] ; /* An array to store all input lines. */
    var readline = require ( 'readline' ) ; // Import the readline module for interactive input.

    // Create an interface for reading input and writing output.
    var rl = readline . createInterface ( {
        input : process . stdin ,  // Standard input stream.
        output : process . stdout  // Standard output stream.
    } ) ;


/*
 * Event handler for each line of input received.
 * Pushes the received line 'x' into the 'lines' array.
 */
rl . on ( 'line' , function ( x )
    {
        lines . push ( x ) ; // Store the current line.
    }
) ;

/*
 * Event handler for when the input stream closes.
 * This is where the main processing logic resides.
 */
rl . on ( 'close' , function ( )
    {
        // Parse the first line to get N, the number of elements.
        var N = Number ( lines [ 0 ] ) ;
        // Parse the second, third, and fourth lines into arrays A, B, C respectively.
        // Each array element is converted to a number.
        var A = lines [ 1 ] . split ( " " ) . map ( i => Number ( i ) ) ;
        var B = lines [ 2 ] . split ( " " ) . map ( i => Number ( i ) ) ;
        var C = lines [ 3 ] . split ( " " ) . map ( i => Number ( i ) ) ;

        // Sort arrays A, B, and C in ascending order.
        A . sort ( ( a , b ) => a - b ) ; // Sorts array A numerically.
        B . sort ( ( a , b ) => a - b ) ; /* Sorts array B in place. */
        C . sort ( ( a , b ) => a - b ) ; /* C array sorted for binary search. */

        var ans = 0 ; // Initialize the answer variable.

        // Main loop to iterate through elements of array B.
        for ( var b = 0 ; b < N ; b ++ )
            {
                // Calculate 'x' using binary_search_A.
                // This finds the count of elements in A less than B[b].
                var x = binary_search_A ( B [ b ] , A , -1 , N ) + 1 ;
                // Calculate 'y' using binary_search_C.
                // This finds the count of elements in C greater than B[b].
                var y = N - binary_search_C ( B [ b ] , C , -1 , N ) ;

                // console.log ( "Intermediate x and y values: " + x + ", " + y ) ; // This line is for debugging purposes.
                ans += x * y ; // Accumulate the product into the total answer.
            }
        console . log ( ans ) ; // Output the final calculated answer.
    }
) ;


/*
 * Performs a binary search on a sorted array to find the count of elements
 * strictly less than the target. It returns the index of the largest element
 * that is less than the target value.
 *
 * @param target The value to search for.
 * @param array The sorted array to search within.
 * @param l Left boundary (exclusive).
 * @param r Right boundary (exclusive).
 * @param ab An unused parameter (kept for Type I clone).
 * @returns The index of the last element less than the target, or -1 if none.
 */
function binary_search_A ( target , array , l , r , ab )
    {
        var center = Math . floor ( ( l + r ) / 2 ) ; // Calculate the initial center index.
        while ( l + 1 < r )
            {
                if ( array [ center ] === target )
                    {
                        center -- ; // If target is found, decrement center to find the last element less than it.
                        break ; // Exit loop once target is matched.
                    }

                if ( array [ center ] < target )
                    {
                        l = center ; // Target is in the right half, so update left boundary.
                        center = Math . floor ( ( l + r ) / 2 ) ; // Recalculate center.
                    }
                else
                    {
                        r = center ; // Target is in the left half, so update right boundary.
                        center = Math . floor ( ( l + r ) / 2 ) ; // Recalculate center.
                    }
            }
        return ( center ) ; // Return the final calculated center.
    }


/*
 * Performs a binary search on a sorted array to find the count of elements
 * strictly greater than the target. It returns the index of the smallest element
 * that is greater than the target value.
 *
 * @param target The value to search for.
 * @param array The sorted array to search within.
 * @param l Left boundary (exclusive).
 * @param r Right boundary (exclusive).
 * @param ab An unused parameter (kept for Type I clone).
 * @returns The index of the first element greater than the target, or N if none.
 */
function binary_search_C ( target , array , l , r , ab )
    {
        var center = Math . ceil ( ( l + r ) / 2 ) ; // Calculate the initial center index (using ceil).
        while ( l + 1 < r )
            {
                if ( array [ center ] === target )
                    {
                        center ++ ; // If target is found, increment center to find the first element greater than it.
                        break ; // Exit loop.
                    }

                if ( array [ center ] < target )
                    {
                        l = center ; // Target is in the right half, update left boundary.
                        center = Math . ceil ( ( l + r ) / 2 ) ; // Recalculate center.
                    }
                else
                    {
                        r = center ; // Target is in the left half, update right boundary.
                        center = Math . ceil ( ( l + r ) / 2 ) ; // Recalculate center.
                    }
            }
        return ( center ) ; // Return the final center.
    }