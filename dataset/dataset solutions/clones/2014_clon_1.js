"use strict";
/*
 * This file contains utility functions and the main execution logic.
 * It calculates a specific sum based on divisors of an input number.
 */


/**
 * Computes an array of divisors for a given number `n`.
 * It includes 1, prime factors, and their corresponding cofactors.
 *
 * @param {number} n The integer for which to find divisors.
 * @returns {Array<number>} An array containing divisors of `n`,
 *                          starting with 1, then prime factors and their cofactors.
 */
function arrayOfDivisors( n )
{
    // Initialize an array to store divisors.
    // The first divisor is always 1.
    const divisor = new Array();
    divisor[ 0 ] = 1;


    // Iterate from 2 up to the square root of n to find prime factors.
    for ( let i = 2; i <= Math.sqrt( n ); i++ )
    {
        // If 'i' is a divisor of 'n', add it to the list.
        if ( n % i === 0 )
        {
            divisor.push( i );
        }
    }


    // 'p' stores the number of divisors found so far (up to sqrt(n)).
    const p = divisor.length;


    // Check if n is a perfect square or if the last found divisor
    // (which is the largest prime factor <= sqrt(n)) is not sqrt(n).
    // If it's not a perfect square, or if sqrt(n) itself wasn't added,
    // add the cofactor of the last prime factor found.
    // This handles cases where n is a perfect square, to avoid duplicates.
    if ( Math.sqrt( n ) !== divisor[ p - 1 ] )
    {
        divisor.push( n / divisor[ p - 1 ] );
    }


    // Add the remaining cofactors.
    // Iterate backwards through the already found divisors (excluding 1)
    // to find their corresponding cofactors (n / divisor[i]).
    for ( let i = p - 2; 0 <= i; i-- )
    {
        divisor.push( n / divisor[ i ] );
    }


    // Return the complete list of divisors.
    return divisor;
}


/*
 * The main execution block of the script.
 * This is an Immediately Invoked Function Expression (IIFE).
 * It reads input from stdin, processes it, and prints the result to stdout.
 */
( function main( input )
{
    // Convert the input string to a number, removing any trailing whitespace.
    const n = Number( input.trim() );


    // Calculate 'subOnly': the number of divisors of (n - 1), excluding 1.
    const subOnly = arrayOfDivisors( n - 1 ).length - 1;


    // Initialize a counter for 'divIncluded' cases.
    let divIncluded = 0;


    // Get all divisors of 'n'.
    const divOfN = arrayOfDivisors( n );
    // Remove the first divisor, which is always 1, as it's not relevant for subsequent calculations.
    divOfN.shift();

    // Iterate through each remaining divisor 'd' of 'n'.
    for ( let d of divOfN )
    {
        let n1 = n;
        // Repeatedly divide n1 by d until it's no longer divisible by d.
        // This effectively removes all factors of 'd' from 'n1'.
        do
        {
            n1 /= d;
        } while ( n1 % d === 0 );


        // If n1 becomes 1 after dividing by all factors of 'd',
        // it means 'n' was entirely composed of 'd' factors (e.g., n = d^k).
        if ( n1 === 1 )
        {
            divIncluded++;
        }
        // Otherwise, if (n1 - 1) has 'd' as a divisor, increment divIncluded.
        else if ( arrayOfDivisors( n1 - 1 ).indexOf( d ) > -1 )
        {
            divIncluded++;
        }
    }


    // Output the final sum of 'subOnly' and 'divIncluded'.
    console.log( subOnly + divIncluded );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );