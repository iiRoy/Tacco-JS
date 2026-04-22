"use strict" ;

/*
 * This is the main function that processes the input argument.
 * It calculates and prints the final answer based on the input string.
 */
const main = arg =>
{
        // First, trim any leading/trailing whitespace from the input string.
        // Then, split the string by newline characters.
        arg = arg.trim() .split( "\n" ) ;

        // The problem expects the first line of input to be the string S.
        // We split S into an array of individual characters for easier access.
        const S = arg[0] .split( "" ) ;


        // Initialize variables for tracking 'R' and 'L' character counts.
        let Rstock = 0 ;
        let Lstock = 0 ;

        // 'splitPoint' will store the index of the first 'R' in an 'RL' boundary.
        let splitPoint ;

        // 'splitCount' helps identify the 'RL' boundary.
        // It should increment when a character differs from its successor.
        let splitCount = 0 ;


        // Initialize the 'answer' array with zeros. Its length matches the input string S.
        // This array will store the final counts for each position.
        let answer = [ ... Array( S .length ) ] .fill( 0 ) ;


        /*
         * Iterate through the string S, up to the second-to-last character.
         * The logic within this loop identifies 'RL' transitions and
         * distributes counts based on the current 'R' and 'L' stocks.
         */
        for ( let i = 0 ; i < S .length - 1 ; i ++ )
        {
                // Increment Rstock if the current character is 'R'.
                if ( S[i] === "R" )
                {
                        Rstock ++ ;
                }

                // Increment Lstock if the current character is 'L'.
                if ( S[i] === "L" )
                {
                        Lstock ++ ;
                }


                // Check if there's a character transition (e.g., R -> L or L -> R).
                // This is crucial for identifying potential 'RL' boundaries.
                if ( S[i] !== S[ parseInt(i) + 1 ] )
                {
                        // A transition has been detected. Increment the split counter.
                        splitCount ++ ;

                        // If this is the *first* transition in the current segment,
                        // mark the current index as the 'splitPoint'.
                        // This 'splitPoint' is where the 'R' character of the 'RL' boundary is.
                        if ( splitCount === 1 )
                        {
                                splitPoint = i ;
                        }
                }


                // If 'splitCount' reaches 2, it means we have found an 'RLRL' pattern (or similar).
                // More specifically, it signifies that we have processed a complete block
                // that ends with an 'RL' boundary and are about to start a new one.
                if ( splitCount === 2 )
                {
                        // Distribute the accumulated 'Rstock' and 'Lstock' to the 'splitPoint' and 'splitPoint + 1'.
                        // The distribution depends on whether the total count is even or odd.
                        if ( ( Rstock + Lstock ) % 2 === 0 )
                        {
                                // If the total is even, distribute equally.
                                answer[ splitPoint ]     = ( Rstock + Lstock ) / 2 ;
                                answer[ splitPoint + 1 ] = ( Rstock + Lstock ) / 2 ;
                        }
                        else
                        {
                                // If the total is odd, distribute unevenly.
                                // The exact formula here is specific to the problem's logic.
                                answer[ splitPoint ]     = Math.ceil( Lstock / 2 ) + 1 ;
                                answer[ splitPoint + 1 ] = Math.ceil( Rstock / 2 ) + 1 ;
                        }

                        // Reset 'splitCount' to prepare for the next segment.
                        splitCount = 0 ;

                        // Reset 'Rstock' and 'Lstock' as they have been distributed.
                        Rstock = 0 ;
                        Lstock = 0 ;
                }


                // Special handling for the very last character in the string.
                // The loop goes up to S.length - 2, so the last character (S.length - 1)
                // is not processed in the main loop body for stock counting.
                if ( i === S .length - 2 )
                {
                        // Increment Lstock for the very last character.
                        // This assumes the last character contributes to Lstock in the final segment.
                        Lstock ++ ;

                        // Apply the same distribution logic as above for the final segment.
                        if ( ( Rstock + Lstock ) % 2 === 0 )
                        {
                                answer[ splitPoint ]     = ( Rstock + Lstock ) / 2 ;
                                answer[ splitPoint + 1 ] = ( Rstock + Lstock ) / 2 ;
                        }
                        else
                        {
                                answer[ splitPoint ]     = Math.ceil( Lstock / 2 ) + 1 ;
                                answer[ splitPoint + 1 ] = Math.ceil( Rstock / 2 ) + 1 ;
                        }
                }
        }

        // After processing the entire string, print the elements of the 'answer' array,
        // joined by spaces, to the console.
        console .log( answer .join( " " ) ) ;
}

// Call the main function, reading input from /dev/stdin.
// This is a common pattern for competitive programming in Node.js.
main( require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' ) ) ;