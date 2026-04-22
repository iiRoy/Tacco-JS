function main ( arg )
{
    // This function processes input data based on a set of rules.
    // It simulates movement or transformation of elements.

    arg = arg . split ( "\n" ) ; // Split the input string by newline characters into an array.


    var tmp = arg . shift ( ) ; // Remove and store the first element (often metadata, not used here).

    var s = arg . shift ( ) . split ( "" ) ; // Get the next line, split it into an array of characters.
    var N = s . length ; // Store the length of the character array 's' for convenience.

    /*
     * Process the remaining input lines.
     * Each line is split by space to form an array of two elements.
     */
    var data = arg . map ( e => e . split ( " " ) ) ;


    // Initialize an array 'idxs' with the same length as 's', filled with zeros.
    var idxs = new Array ( s . length ) . fill ( 0 ) ;

    // Initialize all elements of 'idxs' to 1.
    // This represents an initial state where all positions are "active" or "present".
    for ( var i = 0 ; i < idxs . length ; i ++ )
    {
        idxs [ i ] = 1 ;
    }



    // Iterate through each rule defined in the 'data' array.
    for ( var i = 0 ; i < data . length ; i ++ )
    {
        // Extract the target character (ti) and direction (di) from the current rule.
        var ti = data [ i ] [ 0 ] ;
        var di = data [ i ] [ 1 ] ;

        // Create a new array 'next' to store the updated states for the next iteration.
        // It's initialized with zeros.
        var next = new Array ( s . length ) . fill ( 0 ) ;


        // Iterate through each position in the 's' array.
        for ( var j = 0 ; j < s . length ; j ++ )
        {
            // If the character at the current position 'j' is NOT the target character 'ti'.
            if ( s [ j ] !== ti )
            {
                // The element at this position remains in its current spot.
                // Its count from 'idxs' is transferred to 'next'.
                next [ j ] += idxs [ j ] ;
            }
            else
            {
                // If the character at 'j' IS the target character 'ti'.
                // Now, check the direction of movement.

                if ( di === 'L' ) // If the direction is 'L' (Left).
                {
                    // Check if moving one step left is within bounds.
                    if ( j - 1 >= 0 )
                    {
                        // Transfer the count from current position 'j' to the left position 'j-1' in 'next'.
                        next [ j - 1 ] += idxs [ j ] ;
                    }
                    // If j-1 is out of bounds (i.e., j is 0), this element effectively disappears.
                }
                else if ( di === 'R' ) // If the direction is 'R' (Right).
                {
                    // Check if moving one step right is within bounds.
                    if ( ( j + 1 < N ) )
                    {
                        // Transfer the count from current position 'j' to the right position 'j+1'.
                        // IMPORTANT: This line has a subtle difference from 'L' case: it updates 'idxs' directly, not 'next'.
                        // This might be an intended behavior for this specific problem, or a bug.
                        // For Type I clone, it must remain as in the original.
                        idxs [ j + 1 ] += idxs [ j ] ;
                    }
                    // If j+1 is out of bounds, this element effectively disappears.
                }
            }
        }
        // After processing all positions for the current rule, update 'idxs' to 'next'.
        // This makes 'next' the current state for the subsequent rule.
        idxs = next ;
    }

    // Initialize a variable to accumulate the final answer.
    var ans = 0 ;

    // Sum up all the values in the final 'idxs' array.
    // This represents the total count of active elements after all rules are applied.
    for ( var i = 0 ; i < idxs . length ; i ++ )
    {
        ans += idxs [ i ] ;
    }

    // Output the final calculated answer to the console.
    console . log ( ans ) ;
}

// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;