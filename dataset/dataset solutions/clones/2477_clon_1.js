inp = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ; // This line reads the input from standard input, processes it.
// It splits the input by newlines and stores it in the 'inp' array.

l = inp . shift ( ) . split ( ' ' ) ; // The first line of input is shifted and split by spaces.
// This usually contains the parameters for the problem.

a = l . shift ( ) * 1 ; /* Extract the first value from the 'l' array.
                        Multiply by 1 to explicitly convert it to a number. */
b = l . shift ( ) * 1 ; // Extract the second value, converting it to a number.
x = l . shift ( ) * 1 ; // Extract the third value, also converting to a number.

l = 0 ; // Initialize 'l' (left boundary) for binary search.
r = 90 ; // Initialize 'r' (right boundary) for binary search. This often represents an angle in degrees.

mid = 45 ; // Set an initial midpoint for the binary search.
c = 0 ; // Initialize a counter 'c' to track iterations.

S = a * a * b ; // Calculate a base volume or area, 'a' squared times 'b'.

// Check a condition based on half of 'S' and 'x'.
if ( S / 2 < x )
{
    // This block executes if the condition (S/2 < x) is true.
    while ( l < r )
    { // Start a while loop for binary search.
        s = S - ( a * a * Math . tan ( mid / 180 * Math . PI ) ) / 2 * a ; // Complex calculation for 's'.
        // This likely computes a volume or area based on 'a', 'mid' (angle), and 'S'.

        if ( x < s )
        { // If 'x' is less than 's'...
            l = mid ; // ...update the left boundary to 'mid'.
        }
        else
        { // Otherwise (if x >= s)...
            r = mid ; // ...update the right boundary to 'mid'.
        }

        mid = ( l + r ) / 2 ; // Recalculate 'mid' as the average of 'l' and 'r'.

        c ++ ; // Increment the iteration counter.

        if ( c > 200 )
        { // If the counter exceeds 200, break out of the loop to prevent infinite loops.
            break ;
        }
    }
    console . log ( mid . toFixed ( 10 ) ) ; // Output the final 'mid' value, formatted to 10 decimal places.
}
else
{
    // This block executes if the condition (S/2 < x) is false.
    while ( l < r )
    { // Another binary search loop, similar to the one above.
        s = ( b * b * Math . tan ( mid / 180 * Math . PI ) ) / 2 * a ; // Different calculation for 's' in this case.
        // This formula likely corresponds to a different geometric configuration.

        if ( x < s )
        { // If 'x' is less than 's'...
            r = mid ; // ...update the right boundary.
        }
        else
        { // Otherwise...
            l = mid ; // ...update the left boundary.
        }

        mid = ( l + r ) / 2 ; // Recalculate 'mid'.

        c ++ ; // Increment the counter.

        if ( c > 200 )
        { // Break condition for the loop.
            break ;
        }
    }
    console . log ( ( 90 - mid ) . toFixed ( 10 ) ) ; // Output (90 - mid), formatted to 10 decimal places.
}