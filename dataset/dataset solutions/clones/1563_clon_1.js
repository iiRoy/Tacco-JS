const SieveOfEratosthenes = ( n ) =>
{

    let flg = ( new Array(n) ) .fill(0) /* This flag array tracks composite numbers; 0 for prime/unvisited, 1 for composite. */ ;
    let primes = [ ] /* This list will store all prime numbers found up to 'n'. */ ;

    for ( let i = 2 ; i * i <= n ; i ++ )
    {
        // If 'i' has not been marked as composite yet, it is a prime number.
        if ( !flg[i] )
        {
            primes.push( i ) ; // Add 'i' to our list of primes.

            // Mark all multiples of 'i' as composite.
            for ( let j = i ; j * j <= n ; j += i )
            {
                flg[j] = 1 ; // Mark 'j' as composite.
            }
        }
    }

    return primes ; // Return the list of primes.
}


const factorizationBySoE = ( n , primes ) =>
{
    // Note: The commented-out line below was part of the original thought process but is not used in the final logic.
    // const primes = SieveOfEratosthenes(n) ;

    let factors = { } ; // Initialize an empty object to store prime factors and their counts.

    // Iterate through the pre-calculated primes.
    primes . some ( p =>
    {
        // Optimization: If current prime 'p' exceeds 'n', no further primes can be factors.
        if ( n < p ) return true ;

        // If 'p' divides 'n', it's a prime factor.
        if ( n % p === 0 ) factors[p] = 1 ; // Store the factor (count is 1 in this simplified version).
    } ) ;

    // Another commented-out block from original development, not part of the final, simpler logic.
    // primes.some(p => {
    //     if(n < p) return true
    //     while(n%p===0) {
    //         if(!factors[p])factors[p]=1
    //         else factors[p]++
    //         n/=p
    //     }
    // })

    // If 'n' is still greater than 1 after checking all primes, the remaining 'n' itself is a prime factor.
    if ( n > 1 ) factors[n] = 1 ;

    return factors ; // Return the object containing prime factors.
}



const getGCD = ( a , b ) =>
{
    // Base case: If 'b' is 0, the GCD is 'a'.
    if ( b === 0 ) return a ;

    // Base case: If 'a' is 0, the GCD is 'b'.
    else if ( a === 0 ) return b ;

    // Recursive step: Use Euclidean algorithm.
    return getGCD( b , a % b ) ;
}


const main = ( arg ) =>
{
    const N = Number( arg . split("\n")[0] ) ; // Parse the first line for N.
    const a = arg . split("\n")[1] . split(" ") . map(Number) ; // Parse the second line for array 'a'.

    const MAX_A = 10**6 + 1 ; // Define the maximum value to consider for sieve.

    // --- Section 1: Check for pairwise coprimality ---

    // Generate primes up to MAX_A using Sieve of Eratosthenes.
    const primes = SieveOfEratosthenes( MAX_A ) ;

    // Create a set (represented by an array) to track encountered prime factors.
    let set = [ ...new Array(MAX_A) ] . fill(0) ;

    let isPairCoprime = true ; // Assume pairwise coprime initially.

    // Iterate through each number in array 'a'.
    for ( let i = 0 ; i < N ; i ++ )
    {
        // Get prime factors for the current number a[i].
        const factors = Object . keys ( factorizationBySoE( a[i] , primes ) ) ;

        // Check each prime factor.
        for ( let j = 0 ; j < factors . length ; j ++ )
        {
            // Original console logs, commented out.
            // console.log(`i=${i}, j=${j}, ${factors[j]}`)
            // console.log(factors)

            // If this prime factor has been seen before in another number, it's not pairwise coprime.
            if ( set[ factors[j] ] === 1 )
            {
                isPairCoprime = false ; // Set flag to false.
            }
            set[ factors[j] ] = 1 ; // Mark this prime factor as seen.
        }
    }

    // This block of commented-out code represents an alternative approach for checking pairwise coprimality,
    // which was not used in the final version.
    // for(let i=0; i<MAX_A; i++) {
    //     set[a[i]] = 1
    // }
    // for(let i=2; i<MAX_A; i++) {
    //     let cnt=0
    //     for(let j=i; j<MAX_A; j+=i) {
    //         cnt+=set[j]
    //     }
    //     if(cnt>1) {
    //         isPairCoprime = false
    //     }
    // }

    // If it's pairwise coprime, print the result and exit.
    if ( isPairCoprime )
    {
        console.log("pairwise coprime") ;
        return ;
    }

    // --- Section 2: Check for setwise coprimality if not pairwise coprime ---

    // Calculate the greatest common divisor (GCD) of all numbers in 'a'.
    let gcd = 0 ; // Initialize GCD.
    for ( let i = 0 ; i < a . length ; i ++ )
    {
        gcd = getGCD( gcd , a[i] ) ; // Update GCD with each element.
    }

    // If the overall GCD is 1, it's setwise coprime.
    if ( gcd === 1 )
    {
        console.log("setwise coprime") ;
        return ;
    }

    // --- Section 3: If neither, print "not coprime" ---

    // If neither pairwise nor setwise coprime, then it's just "not coprime".
    console.log("not coprime") ;
}

// Execute the main function, reading input from stdin.
main( require("fs") . readFileSync("/dev/stdin", "utf8") ) ;