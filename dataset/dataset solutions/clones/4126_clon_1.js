"use strict";

function Main( input ) {

    let lines = input.split( "\n" ) ;

    // This section implements the Sieve of Eratosthenes algorithm
    // to efficiently find all prime numbers up to a certain limit.
    const MAX = 101010; // Define the upper limit for prime number generation.

    let isPrime = new Array( MAX ).fill( 1 ); // Initialize an array, assuming all numbers are prime (1).

    isPrime[0] = 0; // 0 is not a prime number.
    isPrime[1] = 0; // 1 is not a prime number.

    for ( let i = 2; i < MAX; i++ )
    {
        if ( !isPrime[i] )
        {
            continue; // If 'i' is already marked as not prime, skip it.
        }

        // Mark all multiples of 'i' (starting from i*2) as not prime.
        for ( let j = i * 2; j < MAX; j += i )
        {
            isPrime[j] = 0;
        }
    }


    // This part determines if a number is a "2017-like" number.
    // A number 'x' is 2017-like if 'x' is prime and (x+1)/2 is also prime.
    let a = new Array( MAX ).fill( 0 ); // Array to store 2017-like indicators (1 if true, 0 if false).

    for ( let i = 0; i < MAX; ++i )
    {
        // 2017-like numbers must be odd, because (i+1)/2 needs to be an integer.
        // If 'i' is even, (i+1) is odd, so (i+1)/2 would not be an integer.
        if ( i % 2 == 0 )
        {
            continue;
        }

        // Check if 'i' is prime AND if '(i + 1) / 2' is also prime.
        if ( isPrime[i] && isPrime[( i + 1 ) / 2] )
        {
            a[i] = 1; // Mark 'i' as a 2017-like number.
        }
    }


    // Calculate the cumulative sum (prefix sum) of the 'a' array.
    // This allows for efficient querying of sums within ranges.
    let s = new Array( MAX + 1 ).fill( 0 ); // 's[k]' will store the sum of 'a[0]' through 'a[k-1]'.

    for ( let i = 0; i < MAX; ++i )
    {
        s[i + 1] = s[i] + a[i]; // Accumulate the sum.
    }


    // Process the queries provided in the input.
    // The first line of input contains the total number of queries (Q).
    let Q = lines.shift().trim().split( /\s/ )[0] - 0;

    for ( let q = 0; q < Q; ++q )
    {
        // Each subsequent line contains two integers: 'l' and 'r',
        // representing the start and end of a query range.
        let lr = lines.shift().split( /\s/ ).map( ( v ) => v - 0 );

        let l = lr[0]; // Lower bound of the query range.
        let r = lr[1]; // Upper bound of the query range.

        // Adjust 'r' for 0-based indexing of the cumulative sum array.
        // The problem asks for values in [l, r] inclusive.
        // s[r+1] gives the count up to 'r'. s[l] gives count up to 'l-1'.
        ++r;

        // Output the count of 2017-like numbers in the range [l, r].
        console.log( s[r] - s[l] );
    }
}

// Read the entire input from standard input (/dev/stdin)
// and pass it to the Main function for processing.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );