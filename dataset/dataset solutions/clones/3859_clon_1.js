console.log( (  args => {
    /*
     * This script processes a number from stdin to find a sequence of primes.
     * Specifically, it finds N numbers that are prime and also satisfy i % 5 === 1.
     * The result is a space-separated string of these numbers.
     */
    const N = args | 0; // N is the target count of numbers to find.

    // Initialize a boolean array 'e' for a sieve of Eratosthenes.
    // All elements are initially true, indicating potential primality.
    // The size 55555 is a fixed upper bound for prime checking.
    const e = Array ( 55555 ).fill ( true );


    const m1 = [ ]; // m1 will store the numbers that meet the criteria.

    // Outer loop: Iterate from 2 up to the limit to find primes.
    for ( let i = 2; i < 55555; i ++ )
    {
        // If e[i] is false, 'i' is not prime (it was marked by a previous prime).
        if ( ! e[i] )
            continue; // Skip to the next number.

        // Inner loop: Mark multiples of 'i' as not prime.
        for ( let j = i + i; j < 55555; j += i )
        {
          e[j] = false; // Mark j as not prime.
        }

        // Check if the current prime 'i' also satisfies the modulo condition.
        if ( i % 5 === 1 )
        {
          m1.push( i ); // Add 'i' to the result array.

          // If we have found N numbers, we can stop.
          if ( m1.length === N )
          {
            break; // Exit the outer loop.
          }
        }
    }

    // Join the collected numbers into a space-separated string and return.
    return m1.join` `;

  } ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) )
);