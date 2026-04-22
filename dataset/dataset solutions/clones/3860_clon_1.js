"use strict" ; /* This directive ensures strict mode for better error handling */

// Main function to process the input and find the desired sequence of numbers
function main( input )
{
    /* Define a constant for the maximum value to consider for prime numbers.
     * This value is used to size the sieve array. */
    const MAX = 55555 ;
    // Parse the input string into an integer 'n', specifying base 10
    const n = parseInt( input , 10 ) ;


    // Initialize a boolean array 'sieve' to mark prime numbers using Sieve of Eratosthenes
    const sieve = new Array( MAX ) ;
    // Populate the sieve, initially assuming all numbers are prime
    for ( let i = 0 ; i < MAX ; i ++ )
    {
        sieve[ i ] = true ;
    }

    // Calculate the square root of MAX, used as an optimization for the sieve algorithm
    let max = Math.floor( Math.sqrt( MAX ) ) ;

    // Mark 0 and 1 as not prime
    sieve[ 0 ] = false ;
    sieve[ 1 ] = false ;

    // Apply the Sieve of Eratosthenes algorithm to find all primes up to MAX
    for ( let i = 2 ; i <= max ; i ++ )
    {
        if ( sieve[ i ] ) // If 'i' is prime
        {
            // Mark all multiples of 'i' as not prime
            for ( var j = i * 2 ; j <= MAX ; j += i )
            {
                sieve[ j ] = false ;
            }
        }
    }


    // Array to store the found numbers that satisfy the conditions
    let nums = [ ] ;
    // Counter for iterating through numbers
    let i = 0 ;

    // Infinite loop to find the sequence of numbers
    while ( true )
    {
        // If the current number 'i' is prime
        if ( sieve[ i ] )
        {
            nums.push( i ) ; // Add it to the 'nums' array
        }

        // Check if we have gathered 'n' numbers
        if ( nums.length === n )
        {
            // If the current set of 'n' numbers is valid (i.e., no subset of 5 sums to a prime)
            if ( isValid( nums ) )
            {
                // Print the numbers joined by spaces and terminate
                console.log( nums.join( ' ' ) ) ;
                return ;
            }
            // If not valid, remove the first element and continue searching
            nums = nums.slice( 1 ) ;
        }
        // Increment the counter to check the next number
        i += 1 ;
    }

    // --- Nested Helper Function: isValid ---
    // Checks if a given array of 'values' is valid according to the problem's criteria.
    // A set of values is valid if no combination of 5 elements sums to a prime number.
    function isValid( values )
    {
        // Generate all combinations of 5 elements from the input 'values'
        let comb = combinations( values , 5 ) ;

        // Iterate through each combination
        for ( let i = 0 ; i < comb.length ; i += 1 )
        {
            // Calculate the sum of elements in the current combination
            const sum = comb[ i ].reduce( ( acc , val ) => acc + val ) ;

            // If the sum is a prime number (according to our sieve), then the set is invalid
            if ( sieve[ sum ] )
            {
                return false ;
            }
        }
        // If no invalid sum was found, the set of values is valid
        return true ;
    }
}


// --- Global Helper Function: combinations ---
// Generates all unique combinations of 'k' elements from a given 'set'.
function combinations( set , k )
{
    // Declare variables for loop counters and temporary storage
    var i , j , combs , head , tailcombs ;

    // Base case 1: If k is out of bounds (greater than set length or non-positive)
    if ( k > set.length || k <= 0 )
    {
        return [ ] ;
    }

    // Base case 2: If k is equal to the set length, there's only one combination (the set itself)
    if ( k == set.length )
    {
        return [ set ] ;
    }

    // Base case 3: If k is 1, return each element as a single-element array
    if ( k == 1 )
    {
        combs = [ ] ;
        for ( i = 0 ; i < set.length ; i ++ )
        {
            combs.push( [ set[ i ] ] ) ;
        }
        return combs ;
    }

    // Recursive step: Generate combinations
    combs = [ ] ;
    for ( i = 0 ; i < set.length - k + 1 ; i ++ )
    {
        // Take the current element as the 'head' of the combination
        head = set.slice( i , i + 1 ) ;
        // Recursively find combinations for the 'tail' (remaining elements)
        tailcombs = combinations( set.slice( i + 1 ) , k - 1 ) ;

        // Combine the 'head' with each 'tailcombination'
        for ( j = 0 ; j < tailcombs.length ; j ++ )
        {
            combs.push( head.concat( tailcombs[ j ] ) ) ;
        }
    }
    // Return the accumulated combinations
    return combs ;
}

// Read input from standard input and pass it to the main function.
// This line uses Node.js specific modules to handle file I/O.
main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;