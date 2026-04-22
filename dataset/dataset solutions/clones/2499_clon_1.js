"use strict"
/* This ensures strict mode for better error handling. */


// rmEl(array)(x) - Removes a single occurrence of 'x' from the 'array' and returns a new array.
const rmEl = xs => x => xs .filter( ( _, i, arr ) => i !== arr.indexOf( x ) ) ;


/*
 * This function checks if a given index in an array
 * satisfies a certain condition based on a key value.
 */
function isOK ( array , index , key )
{
    if ( array[ index ] >= key )
        return true ;
    else
        return false ;
}


/**
 * Implements a generic binary search algorithm.
 * It finds the smallest index 'ok' such that isOK(array, ok, key) is true.
 *
 * @param {Array<number>} array - The sorted array to search within.
 * @param {number} key - The value to search for.
 * @returns {number} The found index 'ok'.
 */
function binarySearch ( array, key )
{
    var ng = -1 ; // 'ng' (not good) is an index that definitely does NOT satisfy the condition. Initialized to -1 as index 0 might satisfy.
    var ok = array .length ; // 'ok' (good) is an index that definitely DOES satisfy the condition. Initialized to array.length as the last index might not satisfy.


    // Loop continues as long as there's uncertainty between 'ok' and 'ng'.
    while ( Math .abs( ok - ng ) > 1 )
    {
        var mid = Math .floor( ( ok + ng ) / 2 ) ; // Calculate the middle index.

        // Check if the middle index satisfies the condition.
        if ( isOK( array, mid, key ) )
            ok = mid ; // If it's good, 'mid' becomes the new 'ok'.
        else
            ng = mid ; // If it's not good, 'mid' becomes the new 'ng'.
    }

    return ok ; // Return the 'ok' index, which is the smallest index satisfying the condition.
}


const main = arg =>
{
    const input = arg .trim() .split( "\n" ) ;
    var N = parseInt( input[ 0 ], 10 ) ;
    var L = input[ 1 ] .split( " " ) ;

    // Convert string elements of L to integers
    for ( var i = 0 ; i < N ; i++ )
    {
        L[ i ] = parseInt( L[ i ], 10 ) ;
    }

    // Sort the array L in ascending order
    L .sort( function ( a, b ) { return a - b ; } ) ;

    var ans = 0 ; // Initialize answer accumulator
    var count = 0 ; // This variable is declared but not used in the final logic.
    var newlist = [] ; // Temporary list for calculations

    // Iterate through all possible pairs (L[i], L[j]) where i < j
    for ( var i = 0 ; i < N - 1 ; i++ )
    {
        for ( var j = i + 1 ; j < N ; j++ )
        {
            // Remove L[j], L[i], L[i]+L[j], and Math.abs(L[i]-L[j]) from L
            // This creates a list without the elements involved in the current triangle check.
            newlist = rmEl( rmEl( rmEl( rmEl( L )( L[ j ] ) )( L[ i ] ) )( L[ i ] + L[ j ] ) )( Math .abs( L[ i ] - L[ j ] ) ) ;

            // Calculate the number of valid 'k' values for the current (L[i], L[j]) pair.
            // This uses binary search to find elements within the range (abs(a-b), a+b).
            ans = ans + binarySearch( newlist, L[ i ] + L[ j ] ) - binarySearch( newlist, Math .abs( L[ i ] - L[ j ] ) ) ;
        }
    }

    // The problem context implies that each valid triangle is counted 3 times
    // (once for each side being the "third" side in the pair iteration).
    // So, divide the total count by 3 to get the unique number of triangles.
    console .log( Math .floor( ans / 3 ) ) ;
}

// Read input from standard input and pass it to the main function.
main( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) ) ;