const   { parse }   =   require ( "path" ) ; // Import the 'parse' function from the 'path' module. This line is actually not used in the provided code.

/**
 * Main function to process the input and calculate the result.
 * @param {string} input - The raw string input from stdin.
 */
function   Main ( input )
{
    // Process input: trim, split by newline, then split each line by space.
    input = input . trim ( ) . split ( "\n" ) . map ( function ( x ) { return x . split ( " " ) } ) ;


    // Extract the first number from the processed input.
    var   N   =   input [ 0 ] [ 0 ] ;

    // Calculate the length of the string representation of N.
    var   l   =   N . length ;

    // Convert the string N into an array of integers.
    var   vec_N   =   N . split ( '' ) . map ( e   =>   parseInt ( e ,   10 ) ) ;

    // Initialize a boolean array 'vec_tf' of the same length as N, all set to false.
    var   vec_tf   =   Array . from ( { length : l } ,   ( )   =>   false ) ;

    // Declare variables for use within the loops.
    var   num ,   j ;


    // This loop identifies specific patterns (sequences of 5s and 4s) in vec_N.
    // The 'whole_loop' label allows continuing the outer loop from inside nested blocks.
    whole_loop:
    for   ( var   i   =   0 ;   i   <   l ;   i++ )
    {
        num   =   vec_N [ i ] ; // Get the current digit.

        // Check if the current digit is 5.
        if   ( num   ===   5 )
        {
            j   =   1 ; // Initialize 'j' to start checking subsequent digits.

            // This inner loop looks for a sequence of 4s and 5s.
            while   ( true )
            {
                // If the next digit is 4, increment j and continue the check.
                if   ( vec_N [ i   +   j ]   ===   4 )
                    j++ ;
                else
                    break ; // If not 4, break the inner while loop.

                // If the next digit is 5, increment j and continue the check.
                if   ( vec_N [ i   +   j ]   ===   5 )
                    j++ ;
                else
                    break ; // If not 5, break the inner while loop.
            }

            // After the while loop, check the condition for skipping or marking.
            if   ( i   +   j   >=   l   ||   vec_N [ i   +   j ]   <=   4 )
            {
                i   +=   j ; // If condition met, advance 'i' by 'j' and continue the outer loop.
                continue   whole_loop ;
            }
            else
            {
                // If condition not met, mark the segment from 'i' to 'i + j' as true in vec_tf.
                for   ( var   k   =   i ;   k   <=   i   +   j ;   k++ )
                {
                    vec_tf [ k ]   =   true ;
                }
            }
        }
    }


    // Initialize the answer variable and a carry-like flag.
    var   ans   =   0 ;
    var   tmpKuriage   =   false ; // 'tmpKuriage' likely means 'temporary carry-up' or 'borrow'.

    // Second main loop to calculate the final answer based on digits and the 'vec_tf' array.
    for   ( var   i   =   0 ;   i   <   l ;   i++ )
    {
        num   =   vec_N [ i ] ; // Get the current digit.

        // Case 1: Current digit is 6 or greater.
        if   ( num   >=   6 )
        {
            if   ( tmpKuriage )
                ans   -=   2 ; // Adjust answer if a carry was pending.
            vec_tf [ i ]   =   tmpKuriage   =   true ; // Mark current position and set carry flag.
            ans   +=   ( 11   -   num ) ; // Add the modified value (e.g., 6 becomes 5, 7 becomes 4, etc. effectively (10-num)+1).
        }
        // Case 2: Current digit is 3 or less.
        else   if   ( num   <=   3 )
        {
            tmpKuriage   =   false ; // No carry needed.
            ans   +=   num ; // Add the digit directly.
        }
        // Case 3: Current digit is 5.
        else   if   ( num   ===   5 )
        {
            if   ( tmpKuriage )
            {
                ans   -=   2 ; // Adjust answer due to pending carry.
                vec_tf [ i ]   =   true ; // Mark current position.
                ans   +=   ( 11   -   num ) ; // Add the modified value.
            }
            else
            {
                // Sub-case: No pending carry.
                if   ( vec_N [ i   +   1 ]   >=   5 )
                {
                    vec_tf [ i ]   =   tmpKuriage   =   true ; // Set carry if next digit is 5 or more.
                    ans   +=   ( 11   -   num ) ; // Add modified value.
                }
                else   if   ( vec_N [ i   +   1 ]   <=   3 )
                {
                    ans   +=   num ; // Add digit directly if next is 3 or less.
                }
                else   if   ( vec_tf [ i ] )   // This branch is for vec_N[i + 1] === 4, if vec_tf[i] is true.
                {
                    tmpKuriage   =   true ; // Set carry.
                    ans   +=   ( 11   -   num ) ; // Add modified value.
                }
                else
                {
                    ans   +=   num ; // Default: add digit directly.
                }
            }
        }
        // Case 4: Current digit is 4. (This is the 'else' for num === 4)
        else
        {
            if   ( tmpKuriage )
            {
                // Sub-case: Pending carry.
                if   ( vec_N [ i   +   1 ]   >=   5 )
                {
                    ans   -=   2 ; // Adjust answer.
                    vec_tf [ i ]   =   true ; // Mark current position.
                    ans   +=   ( 11   -   num ) ; // Add modified value.
                }
                else
                {
                    tmpKuriage   =   false ; // No carry needed.
                    ans   +=   num ; // Add digit directly.
                }
            }
            else
            {
                ans   +=   num ; // Default: add digit directly.
            }
        }
    }


    // Output the final calculated answer to the console.
    console . log ( ans ) ;
}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;