"use strict"; /* This directive enforces stricter parsing and error handling in the code. */


const main = arg =>
{
    // Process input argument: trim whitespace and split into lines.
    arg = arg . trim() . split( "\n" ) ;

    // Parse N and K from the first line of input.
    const N = parseInt( arg[0].split( " " )[0] ) ;
    const K = parseInt( arg[0].split( " " )[1] ) ;


    // Convert the second line of input into an array of integers.
    const S = arg[1] . split( "" ) . map( n => parseInt( n ) ) ;


    /*
     * Prepare a list to store counts of consecutive 1s (at odd indices)
     * and consecutive 0s (at even indices). This is a crucial step for the
     * problem's logic.
     */
    let list = [ ] ;


    // Edge case: If there are no zeros in the sequence, the answer is N.
    if ( S . indexOf( 0 ) === -1 )
    {
        console . log( N ) ;
        return ;
    }


    // Edge case: If there are no ones in the sequence, the answer is N.
    if ( S . indexOf( 1 ) === -1 )
    {
        console . log( N ) ;
        return ;
    }


    // Prepend a 0 if the sequence doesn't start with 1.
    // This helps in normalizing the 'list' generation logic for streaks.
    if ( S[0] !== 1 )
    {
        list . push( 0 ) ;
    }


    // Append a 0 if the sequence doesn't end with 1.
    // This ensures proper termination of streaks, as S[S.length] is undefined,
    // and undefined !== 1 is always true, so S.push(0) will always execute here.
    if ( S[ S.length ] !== 1 )
    {
        S . push( 0 ) ;
    }


    // Initialize streak counter.
    let streak = 0 ;


    // Iterate through the modified sequence to build the 'list' of streak lengths.
    for ( let i = 1 ; i <= S . length ; i++ )
    {
        if ( S[i] === S[i - 1] )
        {
            streak ++ ; // Continue current streak.
        }
        else
        {
            streak ++ ;             // End of streak, include the last element in count.
            list . push( streak ) ; // Store the length of the completed streak.
            streak = 0 ;            // Reset for the new streak.
        }
    }


    /*
     * Calculate the maximum sum of elements in 'list' considering the K parameter.
     * This section aggregates values based on a sliding window concept,
     * effectively simulating the "flipping K zeros" operation.
     */
    let temp = 0 ;       // Temporary sum for the current window.
    let answer = 0 ;     // Stores the maximum sum found.


    // Iterate through the generated list of streak lengths.
    for ( let i in list )
    {
        temp += list[i] ; // Add the current streak length to the temporary sum.

        // Check if the current segment's index aligns with the K-related window size.
        // The expression (K + (K + 1)) seems to indicate a window related to K flips.
        if ( ( parseInt(i) + 1 ) % ( K + ( K + 1 ) ) === 0 )
        {
            answer = Math . max( answer , temp ) ; // Update the maximum answer if current temp is greater.
            temp = 0 ;                             // Reset temporary sum for the next window.
        }
    }


    // After the loop, there might be a remaining 'temp' value that needs to be compared.
    answer = Math . max( answer , temp ) ;


    // Output the final calculated answer.
    console . log( answer ) ;
}


// Read input from standard input and pass it to the main function.
main( require('fs') . readFileSync( '/dev/stdin' , 'utf8' ) ) ;