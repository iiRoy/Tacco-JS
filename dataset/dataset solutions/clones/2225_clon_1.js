/*
 * This JavaScript code calculates a specific sum based on prime factorizations
 * of numbers provided in the input. It utilizes modular arithmetic extensively.
 * The core logic involves finding the maximum exponent for each prime factor
 * across all input numbers and then calculating a value 'B' for each number
 * based on these maximum exponents and its own prime factorization.
 */

console.log( ( ( args ) => { // Start of an Immediately Invoked Function Expression (IIFE)
                               // This structure encapsulates the main logic and processes input.

    // Input parsing:
    // 1. `args.trim()` removes leading/trailing whitespace from the input string.
    // 2. `.split`\n`` splits the string into an array of lines.
    // 3. `.map(r => ...)` processes each line.
    //    a. `r.split` `` ` splits a line into an array of strings (space-separated values).
    //    b. `.map(v => 0 | v)` converts each string value to an integer using a bitwise OR 0.
    // 4. `const [[N],A]` destructures the result:
    //    - `N` will be the first element of the first line (the count of numbers).
    //    - `A` will be the array of numbers from the second line onwards.
    const [ [ N ] , A ] = args . trim ( ) . split `\n` . map ( r => r . split ( ` ` ) . map ( v => 0 | v ) ) ;



    // Define constants:
    // MOD: A large prime number used for modular arithmetic (10^9 + 7).
    // MAX: The maximum value present in the array `A`, used to optimize prime generation.
    const MOD = 1e9 + 7 , MAX = Math . max ( ... A ) ;


    // Helper function for modular multiplication:
    // This custom `mul` function handles multiplication of potentially large numbers `a` and `b`
    // while keeping the result within the `MOD` range. It's designed to prevent
    // JavaScript's floating-point precision issues with very large integers by
    // splitting numbers into 16-bit chunks.
    const mul = ( a , b ) => ( ( ( a >> 16 ) * b ) % MOD * 65536 + ( ( a & 65535 ) * b ) ) % MOD ;



    // Prime number generation using Sieve of Eratosthenes:
    // `isP` array: A boolean array where `isP[i]` is `true` if `i` is potentially prime, `false` otherwise.
    // It's initialized to `true` for all numbers up to 1,000,000 + 1.
    const isP = Array ( 1e6 + 1 ) . fill ( true ) ;

    // `px` map: Stores the global maximum exponent found for each prime factor
    // across all numbers processed so far. The key is the prime, the value is its max exponent.
    const px = new Map ( ) ;

    // Sieve algorithm loop:
    // Iterates from 2 up to `MAX` to identify prime numbers.
    for ( let p = 2 ; p <= MAX ; p ++ ) {

        // If `p` has already been marked as not prime, skip to the next number.
        if ( ! isP [ p ] ) {
            continue ;
        }

        // If `p` is prime, mark all its multiples (starting from `p*p`) as not prime.
        // We start from `p+p` (or `2*p`) because smaller multiples would have been
        // marked by smaller primes.
        for ( let i = p + p ; i <= MAX ; i = i + p ) {
            isP [ i ] = false ;
        }

        // Initialize the maximum exponent for this prime `p` to 0 in the `px` map.
        px . set ( p , 0 ) ;
    }


    // Prime factorization for each number in `A`:
    // `ap` array: An array where each element `ap[i]` is a `Map` representing the
    // prime factorization of `A[i]`. The key is the prime factor, the value is its exponent.
    const ap = [ ] ;

    // Loop through each number in the input array `A`.
    for ( let i = 0 ; i < N ; i ++ ) {

        let a = A [ i ] ; // Get the current number to factorize.
        ap . push ( new Map ( ) ) ; // Add a new Map to `ap` for the current number's factors.

        // Iterate through the primes found in `px`.
        for ( const [ p , x ] of px ) { // `p` is a prime, `x` is its current global max exponent.

            // Optimization: If `a` becomes 1, all its prime factors have been extracted.
            if ( a === 1 ) {
                break ;
            }

            let s = 0 ; // Initialize exponent counter for prime `p` in current number `a`.

            // Count how many times `p` divides `a`.
            while ( a % p === 0 ) {
                a /= p ; // Divide `a` by `p`.
                s ++ ;   // Increment the exponent.
            }

            // If `p` was a factor (i.e., `s` > 0), record it in `ap[i]`.
            if ( s ) {
                ap [ i ] . set ( p , s ) ;
            }

            // If the current exponent `s` is greater than the globally tracked maximum `x` for `p`,
            // update `px` with this new maximum.
            if ( s > x ) {
                px . set ( p , s ) ;
            }
        }
    }


    // Final calculation of the sum:
    let sum = 0 ; // Initialize the accumulator for the final sum.

    // Loop through each number's original index again.
    for ( let i = 0 ; i < N ; i ++ ) {

        let B = 1 ; // Initialize `B` for the current `A[i]` to 1.

        // Iterate through all prime factors and their globally maximum exponents (`q`) stored in `px`.
        for ( const [ p , q ] of px ) { // `p` is a prime, `q` is its global max exponent.

            // If the global maximum exponent `q` for prime `p` is 0, it means `p` was never a factor
            // of any number in `A`, so skip it.
            if ( ! q ) {
                continue ;
            }

            // Calculate the term `p ** (q - (exponent of p in A[i]))`.
            // `ap[i].get(p) || 0` retrieves the exponent of `p` in `A[i]`, defaulting to 0 if not found.
            // `B` is then updated by multiplying with this term, using the modular multiplication function.
            B = mul ( B , p ** ( q - ( ap [ i ] . get ( p ) | 0 ) ) ) ;
        }

        // Add the calculated `B` value to the `sum`, ensuring the result stays within the modulo.
        sum = ( sum + B ) % MOD ;
    }

    // The final calculated sum is the result of the IIFE.
    return sum ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // Read input from standard input using Node.js `fs` module.