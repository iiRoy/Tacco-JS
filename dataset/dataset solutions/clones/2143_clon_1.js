function nCm ( n , m )
{
    // This function calculates "n choose m" (combinations) recursively.
    // It handles base cases for combinations.
    if   ( m === 0 )
        return 1 ;

    if ( n === 0 )
        return 1 ;

    // Recursive step for n choose m.
    return   n * nCm ( n - 1 , m - 1 ) / m ;
}


function Main ( arg )
{
    // Parse input arguments from the string.
    // N, a, and b are extracted from the first line of the input.
    var N = arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 0 ] - 0 ;
    var a = arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 1 ] - 0 ;
    var b = arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 2 ] - 0 ;

    // Initialize an array `tmp` to store intermediate combination results.
    // The size is N+1, and all elements are initially 0.
    var tmp = new Array ( N + 1 ) . fill ( 0 ) ;

    // Calculate combinations nCm for i from 0 to N/2 and store them.
    // Due to symmetry, nCm(N, i) = nCm(N, N-i).
    for ( var i = 0 ; i <= N / 2 ; i ++ )
    {
        // Calculate nCm(N, i) and take modulo 1000000007.
        var q = ( nCm ( N , i ) % ( 1000000007 ) ) ;
        tmp [ i ] = q ; // Store result for i
        tmp [ N - i ] = q ; // Store result for N-i (due to symmetry)
    }

    // If N is odd, the middle element (Math.floor(N/2) + 1) needs special handling
    // as it's not covered by the symmetry loop where i != N-i.
    if ( N % 2 === 1 )
    {
        tmp [ Math . floor ( N / 2 ) + 1 ] = nCm ( N , Math . floor ( N / 2 ) + 1 ) % ( 1000000007 ) ;
    }

    // Exclude specific combination values at indices 'a' and 'b' by setting them to 0.
    tmp [ a ] = 0 ;
    tmp [ b ] = 0 ;

    // Initialize the answer variable.
    var ans = 0 ;

    // Sum up all the values in the 'tmp' array from index 1 to N,
    // taking modulo 1000000007 at each step to prevent overflow.
    for ( var i = 1 ; i <= N ; i ++ )
    {
        ans += ( tmp [ i ] ) ; // Add current tmp value to ans
        ans = ans % ( 1000000007 ) ; // Apply modulo
    }

    // Output the final calculated answer to the console.
    console . log ( ans ) ;
    return ; // End of Main function execution.
}

// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;