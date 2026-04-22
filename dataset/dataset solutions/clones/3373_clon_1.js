function main ( input ) /* Main function entry point */ {


    const args = input . split ( '\n' ) ; // Split input by newlines to get arguments array
    const Num = args [ 0 ] . split ( ' ' ) ; // Split the first argument by space to get N and P


    // Parse N and P from the input strings
    const N = parseInt ( Num [ 0 ] ) ; // Number N
    const P = parseInt ( Num [ 1 ] ) ; // Number P

    /*
     * Handle edge case where N is 1.
     * If N is 1, the answer is N itself.
     */
    if ( N === 1 ) {
        console . log ( N ) ;
        return 0 ;
    }

    // Initialize an array to store prime factors (though not used directly later)
    var PrimeFactors = [ ] ;

    // Variables for optimized prime factorization (wheel factorization starting from 7)
    var prime = 7 ; // Current prime candidate
    var step = 4 ; // Step for the wheel factorization (alternates 2, 4)

    /**
     * Recursive function to get all prime factors of a given number n.
     * Uses trial division with optimizations for 2, 3, 5 and then wheel factorization.
     * @param {number} n - The number to factorize.
     * @returns {number[]} An array of prime factors.
     */
    const getPrimeFactors = n => {
        if ( n < 2 ) return [ ] ; // Base case: numbers less than 2 have no prime factors
        if ( n === 2 || n === 3 || n === 5 ) return [ n ] ; // Base cases: 2, 3, 5 are primes
        if ( n % 2 === 0 ) return [ 2 , ... getPrimeFactors ( n / 2 ) ] ; // Handle factor 2
        if ( n % 3 === 0 ) return [ 3 , ... getPrimeFactors ( n / 3 ) ] ; // Handle factor 3
        if ( n % 5 === 0 ) return [ 5 , ... getPrimeFactors ( n / 5 ) ] ; // Handle factor 5

        const limit = Math . sqrt ( n ) ; // Optimization: only check primes up to sqrt(n)

        while ( prime <= limit ) { // Loop for prime candidates starting from 7
            if ( n % prime === 0 ) return [ prime , ... getPrimeFactors ( n / prime ) ] ; // Found a factor
            prime += step ; // Move to the next prime candidate
            step = 6 - step ; // Alternate step between 2 and 4 (6-4=2, 6-2=4)
        }
        return [ n ] ; // If no factors found up to limit, n itself is prime
    } ;

    // Get prime factors of P
    PF = getPrimeFactors ( P ) ;

    // Object to store counts of each prime factor
    var counts = { } ;

    // Count occurrences of each prime factor
    for ( var i = 0 ; i < PF . length ; i ++ ) {
        var key = PF [ i ] ; // Current prime factor
        counts [ key ] = ( counts [ key ] ) ? counts [ key ] + 1 : 1 ; // Increment count or initialize to 1
    }

    // This line seems like a debug or incorrect statement in the original logic,
    // as counts.length would be 0 or 1 for an object.
    // However, as per Type I definition, it must remain unchanged.
    console . log ( counts . length ) ;

    // If no prime factors were found (e.g., P=1, or P is prime and getPrimeFactors logic differs slightly)
    if ( counts . length === 0 ) {
        console . log ( P ) ; // Output P itself
        return 0 ; // Exit
    }

    // Initialize answer variable
    var ans = 1 ;

    // Get an array of unique prime factors (keys of the counts object)
    var key = Object . keys ( counts ) ;

    // Iterate through unique prime factors
    for ( var i = 0 ; i < key . length ; i ++ ) {
        // If the count of a prime factor is greater than or equal to N
        if ( parseInt ( counts [ key [ i ] ] ) >= N ) {
            ans = ans * parseInt ( key [ i ] ) ; // Multiply it into the answer
        }
    }

    // Output the final calculated answer
    console . log ( ans ) ;
}

/*
 * Read input from standard input and pass it to the main function.
 * This is a common pattern for competitive programming in Node.js.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;