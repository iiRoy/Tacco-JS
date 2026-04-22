'use strict';

// This file contains a JavaScript Array permutation generator utility.
// It has been optimized from an initial CoffeeScript implementation.
// For the original CoffeeScript source, please refer to ArrayPermutation.coffee.

( function ()
{
    // Inner helper function to recursively generate permutations.
    // perm: The array to store the generated permutations.
    // pre: The prefix of the current permutation being built.
    // post: The remaining elements to choose from.
    // n: The number of elements to permute (length of the desired permutation).
    var generatePermutation = function ( perm, pre, post, n )
    {
        var elem, i, rest, len; // Declare all local variables at the beginning.

        // Base case for the recursion: if n is greater than 0, we need to continue building.
        if ( n > 0 )
        {
            // Iterate through the 'post' array to pick the next element.
            for ( i = 0, len = post.length; i < len; ++i )
            {
                // Create a shallow copy of 'post' to avoid modifying the original during iteration.
                rest = post.slice( 0 );

                // Extract the current element to be added to the permutation.
                elem = rest.splice( i, 1 );

                // Recursively call generatePermutation with updated parameters.
                // - Add the chosen 'elem' to the 'pre' (prefix).
                // - Pass the 'rest' (remaining elements).
                // - Decrement 'n' as one element has been chosen.
                generatePermutation( perm, pre.concat( elem ), rest, n - 1 );
            }
        }
        else
        {
            // If n is 0, a complete permutation of length n has been formed.
            // Add the current prefix (which is now a complete permutation) to the result array.
            perm.push( pre );
        }
    };


    /*
     * Extends the built-in Array.prototype with a new 'permutation' method.
     * This method calculates all permutations of a specified length 'n' from the array elements.
     *
     * Example usage:
     * var originalArray = [0, 1, 2];
     * var permutationsOfLengthTwo = originalArray.permutation(2);
     * // permutationsOfLengthTwo will be: [[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]]
     */
    Array.prototype.permutation = function ( n )
    {
        // If 'n' is not provided or is null, default to the full length of the array.
        if ( n == null )
        {
            n = this.length;
        }

        // Initialize an empty array to store the resulting permutations.
        var perm = [];

        // Call the recursive helper to populate the 'perm' array.
        // - Start with an empty prefix '[]'.
        // - Use 'this' (the array itself) as the initial 'post' (elements to choose from).
        generatePermutation( perm, [], this, n );

        // Return the array containing all generated permutations.
        return perm;
    };

} )(); // End of the immediately invoked function expression (IIFE).


// --- Main Program Logic ---
// This section processes input and calculates the absolute difference between permutation indices.
const main = input =>
{
    // Parse the first line of input as an integer 'n'.
    const n = parseInt( input[0] );

    // Parse the second line of input: split by space, then map to integers for array 'p'.
    const p = input[1].split( ' ' ).map( val => parseInt( val ) );

    // Parse the third line of input: split by space, then map to integers for array 'q'.
    const q = input[2].split( ' ' ).map( val => parseInt( val ) );

    // Convert arrays 'p' and 'q' into string representations for comparison.
    let pStr = p.join( '' );
    let qStr = q.join( '' );

    // Generate all permutations of the array 'p' (using its length as default 'n').
    // Then, convert each permutation (which is an array of numbers) into a string.
    let str = p.permutation().map( val => val.join( '' ) );

    // Sort the resulting array of permutation strings alphabetically.
    str.sort();

    let pId, qId; // Variables to store the indices of pStr and qStr in the sorted permutations.

    // Iterate through the sorted permutations to find the indices of pStr and qStr.
    for ( let i = 0; i < str.length; i++ )
    {
        if ( pStr == str[i] )
        {
            pId = i; // Assign index if pStr matches.
        }
        if ( qStr == str[i] )
        {
            qId = i; // Assign index if qStr matches.
        }
    }

    // Output the absolute difference between the found indices.
    console.log( Math.abs( pId - qId ) );
};

// Read input from standard input, decode as UTF-8, split by newline, and pass to the main function.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).split( '\n' ) );