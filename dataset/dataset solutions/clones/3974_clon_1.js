"use strict" ; // Enable strict mode for better error handling and cleaner code.


// Implements a binary search to find the lower bound of a value 'v' in a sorted array 'a'.
// It returns the index of the first element greater than or equal to 'v'.
function lowerBound ( a , v )
{
    let l = 0 , r = a . length - 1 ; // Initialize left and right pointers for the search range.

    // Continue the search as long as the range is valid.
    while ( r - l >= 0 )
    {
        let c = Math . floor ( ( l + r ) / 2 ) ; // Calculate the middle index.

        // If the value at the middle index is greater than or equal to 'v',
        // it means 'v' could be in the left half (including 'c').
        if ( v <= a [ c ] )
        {
            r = c - 1 ; // Narrow the search to the left half.
        }
        else
        {
            // Otherwise, 'v' must be in the right half.
            l = c + 1 ; // Narrow the search to the right half.
        }
    }
    return l ; // 'l' will be the insertion point or the index of the first element >= 'v'.
}


// The main function that processes the input and solves the problem.
function Main ( input )
{
    let cin = new Inputer ( input ) ; // Create an Inputer instance to parse input.

    // Read N, and two arrays A and B of size N.
    let N = cin . getInt ( ) , A = cin . getIntArray ( N ) , B = cin . getIntArray ( N ) ;

    // Initialize auxiliary arrays 'a' and 'b' and the answer variable.
    let a = new Array ( N ) , b = new Array ( N ) ;
    let ans = 0 ;

    // This loop iterates 30 times, essentially processing each bit position from 0 to 29.
    for ( let k = 0 ; k < 30 ; k ++ )
    {
        let count = 0 ; // Initialize a counter for each bit position.
        // Calculate a mask to extract bits up to (k+1) from the numbers.
        let mask = ( 1 << ( k + 1 ) ) - 1 ;

        // Apply the mask to elements of A and B, storing results in 'a' and 'b'.
        for ( let i = 0 ; i < N ; i ++ )
        {
            a [ i ] = A [ i ] & mask ;
            b [ i ] = B [ i ] & mask ;
        }

        // Sort the masked 'b' array to enable binary search (lowerBound).
        b . sort ( ( a , b ) => a - b ) ;

        // 'T' represents 2^k, used for defining ranges for the lower bound search.
        let T = 1 << k ;

        // Iterate through each element of the masked 'a' array.
        for ( let i = 0 ; i < N ; i ++ )
        {
            // Find lower bounds for specific ranges in 'b' based on 'a[i]' and 'T'.
            let f1 = lowerBound ( b , 1 * T - a [ i ] ) ;
            let t1 = lowerBound ( b , 2 * T - a [ i ] ) ;
            let f2 = lowerBound ( b , 3 * T - a [ i ] ) ;
            let t2 = lowerBound ( b , 4 * T - a [ i ] ) ;

            // Accumulate counts and take modulo 2 to check parity.
            count += t1 - f1 ;
            count %= 2 ;
            count += t2 - f2 ;
            count %= 2 ;
        }

        // If the final count for this bit position 'k' is odd, set the k-th bit in 'ans'.
        if ( count == 1 )
        {
            ans |= 1 << k ;
        }
    }
    // Output the final calculated answer.
    console . log ( ans ) ;
}


// A utility class for parsing input from a string.
class Inputer
{
    // Constructor takes the input string (e.g., from stdin).
    constructor ( t )
    {
        // Ensure an input string is provided.
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（stdin）を省略できません！' ) ; // Error if stdin is missing.
        this . cnt = 0 , this . items = t . split ( /\n|\s/ ) ; // Split input by newlines or spaces.
    }

    // Reads and returns the next integer from the input stream.
    getInt ( )
    {
        return this . items [ this . cnt ++ ] - 0 ; // Convert string to number.
    }

    // Reads and returns an array of 't' integers.
    getIntArray ( t )
    {
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（1以上）を省略できません！' ) ; // Error if size is missing.
        let r = new Array ( t ) ;
        for ( let e = 0 ; e < t ; e ++ )
            r [ e ] = this . getInt ( ) ;
        return r ;
    }

    // Reads and returns the next string from the input stream.
    getStr ( )
    {
        return this . items [ this . cnt ++ ] ;
    }

    // Reads and returns an array of 't' strings.
    getStrArray ( t )
    {
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（1以上）を省略できません！' ) ; // Error if size is missing.
        let r = new Array ( t ) ;
        for ( let e = 0 ; e < t ; e ++ )
            r [ e ] = this . getStr ( ) ;
        return r ;
    }
}


// Check if the code is running in a Node.js environment (not in a browser).
if ( typeof window == "undefined" )
    // If in Node.js, read from standard input and pass to Main function.
    Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;