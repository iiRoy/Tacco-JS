"use strict" ;

// Entry point for the application.
const main = arg => {

    // Process the input string: trim whitespace and split into lines.
    arg  =  arg . trim ( ) . split ( "\n" ) ;

    // Extract the first line and split it into an array of characters.
    const   S = arg [ 0 ] . split ( "" ) ;

    // Initialize counters for 'R' and 'L' characters.
    let     Rstock = 0 ; /* Count of 'R' chars */
    let     Lstock = 0 ; /* Count of 'L' chars */

    // Variable to store the index of the first 'R' in an 'RL' boundary.
    let     splitPoint ;
    // Counter for how many times the character sequence changes (R to L or L to R).
    let     splitCount = 0 ;

    // Initialize the answer array with zeros, matching the length of S.
    let answer = [ ...Array ( S . length ) ] . fill ( 0 ) ;


    // Iterate through the string, stopping before the very last character.
    for ( let i = 0 ; i < S . length - 1 ; i ++ )
    {
        // Increment Rstock if the current character is 'R'.
        if ( S [ i ] === "R" ) {
            Rstock ++ ;
        }
        // Increment Lstock if the current character is 'L'.
        if ( S [ i ] === "L" ) {
            Lstock ++ ;
        }


        // Check if there's a transition from 'R' to 'L' or vice versa.
        // This identifies the boundary where characters change.
        if ( S [ i ] !== S [ parseInt ( i ) + 1 ] )
        {
            splitCount ++ ; // Increment the split counter.

            // If this is the first split encountered, store its index.
            if ( splitCount === 1 )
            {
                splitPoint = i ;
            }
        }


        // If two splits have been identified, it means we've found a complete 'RL' block.
        // For example, 'RRLL' would have a split at index 1 (R->L) and then another 'virtual' split after the last L.
        // This condition processes 'RRLL' or 'LLRR' blocks.
        if ( splitCount === 2 )
        {
            // Calculate total stock for the current block.
            const totalStock = Rstock + Lstock;

            // Distribute the stock based on parity.
            if ( ( totalStock ) % 2 === 0 )
            {
                // If total stock is even, distribute equally to both sides of the split.
                answer [ splitPoint ]     = totalStock / 2 ;
                answer [ splitPoint + 1 ] = totalStock / 2 ;
            }
            else
            {
                // If total stock is odd, distribution depends on which stock (R or L) is larger.
                if ( ( Math . max ( Rstock , Lstock ) - 1 ) % 2 === 0 )
                {
                    // If the larger stock minus one is even, assign Rstock to splitPoint and Lstock to splitPoint + 1.
                    answer [ splitPoint ]     = Rstock ;
                    answer [ splitPoint + 1 ] = Lstock ;
                }
                else
                {
                    // Otherwise, assign Lstock to splitPoint and Rstock to splitPoint + 1.
                    answer [ splitPoint ]     = Lstock ;
                    answer [ splitPoint + 1 ] = Rstock ;
                }
            }

            // Reset for the next block.
            splitCount = 0 ;

            Rstock = 0 ;
            Lstock = 0 ;
        }


        // Special handling for the very last character of the string.
        // The loop stops at S.length - 2, so the last character is handled here.
        if ( i === S . length - 2 )
        {
            Lstock ++ ; // The last character is always treated as an 'L' for this final calculation.

            // Perform the same stock distribution logic as for other blocks.
            if ( ( Rstock + Lstock ) % 2 === 0 )
            {
                answer [ splitPoint ]     = ( Rstock + Lstock ) / 2 ;
                answer [ splitPoint + 1 ] = ( Rstock + Lstock ) / 2 ;
            }
            else
            {
                if ( ( Math . max ( Rstock , Lstock ) - 1 ) % 2 === 0 )
                {
                    answer [ splitPoint ]     = Rstock ;
                    answer [ splitPoint + 1 ] = Lstock ;
                }
                else
                {
                    answer [ splitPoint ]     = Lstock ;
                    answer [ splitPoint + 1 ] = Rstock ;
                }
            }
        }
    }

    // Output the final answer array, joined by spaces.
    console . log ( answer . join ( " " ) ) ;
}

// Read input from stdin, decode as UTF-8, and pass to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;