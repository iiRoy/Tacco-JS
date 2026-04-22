"use strict"
/* This script uses strict mode for enhanced error handling and cleaner code. */
var input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ;

var cin = input . split( / |\n/ ) ,
    cid = 0 ; /* Current index for input array. */


/*
 * Helper function to retrieve the next number from the input stream.
 * Increments the internal cursor 'cid'.
 */
const next = ( ) => + cin [ cid ++ ] ;


/*
 * Helper function to retrieve the next string from the input stream.
 * Increments the internal cursor 'cid'.
 */
const nextstr = ( ) => cin [ cid ++ ] ;


/*
 * Helper function to retrieve the next BigInt from the input stream.
 * Increments the internal cursor 'cid'.
 */
const nextbig = ( ) => BigInt ( cin [ cid ++ ] ) ;


/*
 * Helper function to retrieve an array of 'n' elements from the input stream.
 * The 'a' parameter determines if elements should be treated as strings or numbers.
 * If 'a' is true, elements are strings; otherwise, they are converted to numbers.
 */
const nexts = ( n , a ) =>
    a
        ? cin . slice ( cid , ( cid += n ) )
        : cin . slice ( cid , ( cid += n ) ) . map ( ( a ) => + a ) ;


/*
 * Helper function to retrieve a 2D array (matrix) of dimensions h x w.
 * The 'a' parameter determines if elements should be treated as strings or numbers.
 * If 'a' is true, elements are strings; otherwise, they are converted to numbers.
 */
const nextm = ( h , w , a ) =>
{
    var r = [ ] ,
        i = 0 ;

    if ( a )
    {
        for ( ; i < h ; i ++ )
        {
            r . push ( cin . slice ( cid , ( cid += w ) ) ) ;
        }
    }
    else
    {
        for ( ; i < h ; i ++ )
        {
            r . push ( cin . slice ( cid , ( cid += w ) ) . map ( ( a ) => + a ) ) ;
        }
    }
    return r ;
} ;


/*
 * Helper function to create a multi-dimensional array.
 * The first argument 'v' is the initial value for the innermost array elements.
 * Subsequent arguments define the dimensions of the array (e.g., a1, a2, a3 for a 3D array).
 * Example: xArray(0, 2, 3, 4) creates a 2x3x4 array initialized with zeros.
 */
const xArray = ( ... args ) =>
{
    var a = args ,
        l = a . length ,
        r = "Array(a[" + -- l + "]).fill().map(x=>{return " + a [ 0 ] + ";})" ;

    while ( -- l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }
    return eval ( r ) ;
} ;


// The main program execution starts here.
// It calls the 'main' function and converts its result to a string for output.
console . log ( main ( ) . toString ( ) ) ;


/*
 * The primary logic of the program resides in the 'main' function.
 * It reads input values and performs calculations based on them.
 */
function main ( )
{
    let N = next ( ) ; // Number of switches.
    let M = next ( ) ; // Number of light bulbs.


    let K = xArray ( 0 , M ) ; // Array to store the number of switches connected to each bulb.
    let S = xArray ( 0 , N , M ) ; // 2D array to store which switches are connected to each bulb.


    // Populate K and S arrays from input.
    for ( let i = 0 ; i < M ; i ++ )
    {
        K [ i ] = next ( ) ; // Read number of switches for bulb 'i'.
        // Read 'K[i]' switch indices for bulb 'i' and adjust to 0-based indexing.
        S [ i ] = nexts ( K [ i ] ) . map ( ( v ) => v - 1 ) ;
    }


    let P = nexts ( M ) ; // Array to store the required parity (0 or 1) for each bulb.


    let ans = 0 ; // Initialize the counter for valid switch patterns.

    // Array to store the state (on/off) of each switch for a given pattern.
    let pat_bits = Array ( N ) ;


    // Iterate through all possible switch patterns.
    // 2^N total patterns, where N is the number of switches.
    for ( let pat = 0 ; pat < 2 ** N ; pat ++ )
    {
        // Convert the current pattern integer 'pat' into individual switch states (0 or 1).
        // The n-th bit of 'pat' corresponds to the state of the n-th switch.
        for ( let n = 0 ; n < N ; n ++ )
        {
            pat_bits [ n ] = ( pat >> n ) % 2 ;
        }


        let flag = true ; // Flag to track if the current pattern satisfies all bulb conditions.


        // Check each light bulb against the current switch pattern.
        for ( let i = 0 ; i < M ; i ++ )
        {
            let value = 0 ; // Accumulator for the sum of states of switches connected to bulb 'i'.

            // Sum the states of switches connected to the current bulb 'i'.
            for ( let n = 0 ; n < K [ i ] ; n ++ )
            {
                value += pat_bits [ S [ i ] [ n ] ] ;
            }


            // Check if the parity of 'value' matches the required parity 'P[i]' for bulb 'i'.
            if ( value % 2 != P [ i ] )
            {
                flag = false ; // If not, this pattern is invalid.
                break ;        // No need to check further bulbs for this pattern.
            }
        }


        // If the 'flag' is still true after checking all bulbs,
        // it means this pattern is a valid solution.
        if ( flag )
        {
            ans ++ ; // Increment the count of valid patterns.
        }
    }


    return ans ; // Return the total number of valid switch patterns.
}