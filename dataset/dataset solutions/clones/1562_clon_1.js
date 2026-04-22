const SieveOfEratosthenes = ( n ) => {
    // This function implements the Sieve of Eratosthenes algorithm
    // to find all prime numbers up to a given limit 'n'.

    let flg = ( new Array(n) ) .fill( 0 ) /* This flag array helps mark
                                         * composite numbers. A value of 0 means
                                         * potentially prime, 1 means composite. */ ;
    let primes = [ ] ; /* This list will store all prime numbers found
                        * up to 'n'. It starts empty. */

    for ( let i = 2 ; i * i <= n ; i ++ ) { // Loop from 2 up to sqrt(n)
        if ( ! flg [ i ] ) { // If 'i' is not marked as composite
            primes . push( i ) ; // Then 'i' is a prime number, add it to the list.
            for ( let j = i ; j * j <= n ; j += i ) { // Mark multiples of 'i' as composite
                flg [ j ] = 1 ; // Set the flag to 1, indicating 'j' is not prime.
            }
        }
    }
    return primes ; // Return the list of prime numbers.
} ;

const factorizationBySoE = ( n , primes ) => {
    // This function performs prime factorization of 'n' using a pre-computed list of primes.
    // const primes = SieveOfEratosthenes(n) // This line is commented out as primes are passed in.
    let factors = { } ; // An object to store prime factors and their counts.

    primes . some( p => {
        // Iterate through the provided prime numbers.
        if ( n < p )
            return true ; // Optimization: if n is smaller than the current prime,
                         // no further primes can be factors. Stop iterating.

        while ( n % p === 0 ) {
            // While 'p' divides 'n' evenly
            if ( ! factors [ p ] )
                factors [ p ] = 1 ; // If 'p' is a new factor, initialize its count to 1.
            else
                factors [ p ] ++ ; // Otherwise, increment its count.
            n /= p ; // Divide 'n' by 'p' to reduce it.
        }
    } ) ;

    if ( n > 1 )
        factors [ n ] = 1 ; // If 'n' is still greater than 1 after the loop,
                           // it means the remaining 'n' is a prime factor itself.
    return factors ; // Return the object containing prime factors and their exponents.
} ;


const getGCD = ( a , b ) => {
    // This function calculates the Greatest Common Divisor (GCD) of two numbers
    // using the Euclidean algorithm.
    if ( b === 0 )
        return a ; // Base case: if b is 0, then a is the GCD.
    else
        if ( a === 0 )
            return b ; // Base case: if a is 0, then b is the GCD.

    return getGCD( b , a % b ) ; // Recursive step: GCD(a, b) = GCD(b, a % b).
} ;

const main = ( arg ) => {
    // Main function to process input and determine coprimality.

    const N = Number( arg . split( "\n" ) [ 0 ] ) ; // First line: number of elements.
    const a = arg . split( "\n" ) [ 1 ] . split( " " ) . map( Number ) ; // Second line: array of numbers.

    const MAX_A = 10 ** 6 + 1 ; // Maximum possible value in array 'a', plus one for sieve size.

    // check if p is in {a} (paircoprime)
    // We will use a Sieve to precompute primes up to MAX_A.
    const primes = SieveOfEratosthenes( MAX_A ) ;
    //    return // This line was commented out in the original, keeping it as is.

    let set = [ ... new Array( MAX_A ) ] . fill( 0 ) ; // An array to track prime factors encountered.
    let isPairCoprime = true ; // Flag to determine if the array 'a' is pairwise coprime.

    for ( let i = 0 ; i < N ; i ++ ) { // Iterate through each number in array 'a'.
        const factors = Object . keys( factorizationBySoE( a [ i ] , primes ) ) ; // Get unique prime factors.

        for ( let j = 0 ; j < factors . length ; j ++ ) { // Iterate through prime factors of a[i].
            // console.log(`i=${i}, j=${j}, ${factors[j]}`) // Debugging comments, kept as is.
            // console.log(factors) // Debugging comments, kept as is.

            if ( set [ factors [ j ] ] === 1 ) {
                // If this prime factor has already been seen in another number,
                // then the array is not pairwise coprime.
                isPairCoprime = false ;
            }
            set [ factors [ j ] ] = 1 ; // Mark this prime factor as seen.
        }
    }
/*
    for(let i=0; i<N; i++) {
        set[a[i]]++
    }
//  return
    for(let i=2; i<MAX_A; i++) {
         let cnt=0
         for(let j=i; j<MAX_A; j+=i) {
             cnt+=set[j]
         }
        if(cnt>1) {
             isPairCoprime = false
         }
     }
 */ // This entire block of code is commented out in the original; preserving it.

    if ( isPairCoprime ) {
        console . log( "pairwise coprime" ) ; // If no common prime factors were found, it's pairwise coprime.
        return ; // Exit the main function.
    }
     // return // Another commented-out return, kept.
    // setcoprime // A standalone comment.

    // Calculate the GCD of all numbers in the array 'a'.
    // let gcd = getGCD(a[0], a[1]) // Original thought, replaced by loop.
    let gcd = 0 ; // Initialize GCD.

    for ( let i = 0 ; i < a . length ; i ++ ) {
        gcd = getGCD( gcd , a [ i ] ) ; // Accumulate GCD.
        // console.log(gcd) // Debugging comment.
    }

    if ( gcd === 1 ) {
        console . log( "setwise coprime" ) ; // If the overall GCD is 1, it's setwise coprime.
        return ; // Exit the main function.
    }

    console . log( "not coprime" ) ; // If neither pairwise nor setwise coprime, output this.
} ;

main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ; // Call the main function with input from stdin.