const checkLoop = ( tmp , n , mod ) =>
{
    // This function attempts to find a value 'mod' within the 'tmp' array
    // up to index 'n'.
    for ( let i = 0 ; i < n ; i ++ )
    {
        /*
         *   Check if the current element of 'tmp' matches 'mod'.
         *   If a match is found, its index is returned.
         */
        if ( tmp [ i ] === mod )
        {
            return i ; // Return the index where 'mod' was found
        }
    }

    // If the loop completes without finding 'mod', it means 'mod' is not present
    // within the first 'n' elements of 'tmp'.
    return n ; // Return 'n' to indicate no match was found
}


const main = ( arg ) =>
{
    // Deconstruct the input string into N, X, and M.
    // The input is expected to be space-separated numbers.
    const [ N , X , M ] = arg . split ( " " ) . map ( Number ) ;

    /*
     *   Initialize two arrays: 'tmp' to store the sequence generated,
     *   and 'mods' to keep track of the last seen index for each modulo value.
     *   Both are initialized with M elements, filled with zeros.
     */
    let tmp = [ ... new Array ( M ) ] . fill ( 0 ) ;
    let mods = [ ... new Array ( M ) ] . fill ( 0 ) ;

    // The first element of the sequence is X.
    tmp [ 0 ] = X ;
    // Record that X was first seen at index 0.
    mods [ X ] = 0 ;

    // Initialize loop variables
    let i = 1 , loopStart = 0 ;

    // This loop generates the sequence and detects cycles.
    // It runs up to M iterations, as a cycle must occur within M elements for modulo M.
    for ( ; i < M ; i ++ )
    {
        // Calculate the next element in the sequence: (previous element)^2 % M
        tmp [ i ] = tmp [ i - 1 ] ** 2 % M ;

        // Check if the current value 'tmp[i]' has been encountered before.
        if ( mods [ tmp [ i ] ] !== 0 )
        {
            // A loop (cycle) has been detected!
            // 'mods[tmp[i]]' holds the index where 'tmp[i]' was first seen.
            loopStart = mods [ tmp [ i ] ] ;
            break ; // Exit the loop as the cycle is found
        }
        else
        {
            // If it's a new value, record its first occurrence index.
            mods [ tmp [ i ] ] = i ;
        }
    }

    // 'i' now holds the index where the loop was detected (the first repeated element).
    const loopEnd = i ;
    // Calculate how many times the detected loop will repeat completely within N.
    const loopCount = Math . floor ( N / ( i - loopStart ) ) ;

    // Initialize the answer variable.
    let ans = 0 ;
    // Variable to store the sum of elements within one full cycle.
    let sumOfLoop = 0 ;

    // Calculate the sum of elements within the detected loop.
    for ( i = loopStart ; i < loopEnd ; i ++ )
    {
        sumOfLoop += tmp [ i ] ;
    }

    // Add the sum of the loop, multiplied by the number of full repetitions, to the answer.
    ans += sumOfLoop * loopCount ;

    // Add the elements that appear before the loop starts.
    for ( i = 0 ; i < loopStart ; i ++ )
    {
        ans += tmp [ i ] ;
    }

    // Calculate the number of remaining elements after accounting for full loops and pre-loop elements.
    const rest = N - loopStart - ( loopEnd - loopStart ) * loopCount ;

    // Add the 'rest' of the elements from the beginning of the loop.
    for ( i = loopStart ; i < loopStart + rest ; i ++ )
    {
        ans += tmp [ i ] ;
    }

    // Output the final calculated answer.
    console . log ( ans ) ;
} ;

// Execute the main function with input read from standard input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;