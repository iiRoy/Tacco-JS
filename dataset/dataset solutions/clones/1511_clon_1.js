function Main ( input )
{
    input = input.trim ( ) ;


    const n = parseInt ( input , 10 ) ;


    // Original comment: nからc引いた数の約数の数を調べればいいんじゃね!?
    // (Translation: "Shouldn't we just find the number of divisors of n minus c!?" )
    // This section initializes a counter variable that will accumulate results.
    let count = 0 ;

    // A loop iterates with variable 'c' starting from 1, up to (but not including) 'n'.
    // In each iteration, it calculates a 'subNum' and adds its divisors count to 'count'.
    for ( let c = 1 ; c < n ; c ++ )
    {
        // Calculate the difference between 'n' and the current loop variable 'c'.
        const subNum = n - c ;

        // The number of divisors for 'subNum' is obtained using the 'toDivisor' helper function,
        // and this value is then added to the running total 'count'.
        count += toDivisor ( subNum ) ;
    }

    // Finally, the accumulated 'count' is printed to the standard console output.
    console.log ( count ) ;
}


// This helper function, 'toDivisor', is designed to compute
// the total number of positive divisors for any given positive integer 'num'.
function toDivisor ( num )
{
    let count = 0 ;     // This variable tracks the number of unique divisors found.
    let double = 0 ;    // This flag is used to handle perfect square roots correctly.

    // The loop efficiently checks for divisors by iterating from 1
    // up to the square root of 'num'. This optimizes the search.
    for ( let i = 1 ; i ** 2 <= num ; i ++ )
    {
        // If 'i' does not divide 'num' evenly, it's not a divisor,
        // so we skip to the next iteration using 'continue'.
        if ( num % i != 0 )
            continue ;

        // If 'i' squared is exactly equal to 'num', it means 'i' is the
        // square root of 'num'. In such cases, 'i' and 'num / i' are the same.
        // We increment 'double' to indicate that this divisor should only be counted once.
        if ( i ** 2 === num )
            double ++ ;

        // For every 'i' that is a divisor, we increment our 'count'.
        // This 'i' forms one pair of divisors (i, num/i).
        count ++ ;
    }

    // The total number of divisors is calculated. For each divisor 'i' found
    // up to sqrt(num), there is a corresponding divisor 'num / i'.
    // So, we multiply 'count' by 2. The 'double' variable is subtracted
    // to correct for cases where 'num' is a perfect square (i.e., i == num/i),
    // preventing that divisor from being counted twice.
    return count * 2 - double ;
}


// This is the main execution line of the script.
// It reads the entire content of '/dev/stdin' as a UTF-8 string,
// and then passes this string as input to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;