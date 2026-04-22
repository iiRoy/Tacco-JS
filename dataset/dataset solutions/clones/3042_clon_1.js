/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * to create a visually distinct but functionally identical version.
 */
"use strict" ;

// Main function definition, processing the input
function Main ( input )
{
    // Initialize an Inputer object to parse the input string
    let cin = new Inputer ( input ) ;

    // Read integer n and an array 'a' of n integers
    let n = cin . getInt ( ) ,
        a = cin . getIntArray ( n ) ;

    // Define constants: Maxn for array sizes and p for modulo operations
    const Maxn = 305 ,
          p    = 998244353 ;

    // Initialize 'sum' array to store prefix sums, sum[0] is 0
    let sum = new Array ( Maxn ) ;
    sum [ 0 ] = 0 ;

    // Initialize dynamic programming arrays 'dp' and 'dp2' with zeros
    let dp  = new Array ( Maxn * Maxn ) . fill ( 0 ) ;
    let dp2 = new Array ( Maxn * Maxn ) . fill ( 0 ) ;

    // Helper function for modular addition
    const add = ( a , b ) => ( a % p + b % p ) % p ;

    // Helper function for integer division by 2
    const div2 = ( a ) => Math . floor ( a / 2 ) ;

    // Another helper function for general integer division (unused in this specific logic, but present)
    const div = ( a , b ) => Math . floor ( a / b ) ;


    // Sort array 'a' in ascending order
    a . sort ( ( a , b ) => a - b ) ;

    // Prepend a zero to array 'a' for 1-based indexing convenience
    a . unshift ( 0 ) ;


    // Calculate prefix sums for array 'a'
    for ( let i = 1 ; i <= n ; i ++ )
    {
        sum [ i ] = sum [ i - 1 ] + a [ i ] ;
    }


    // Initialize dp[0] and dp2[0] based on problem logic
    dp [ 0 ] = Math . pow ( 2 , n ) ;
    dp2 [ 0 ] = 1 ;


    // Main dynamic programming loop
    for ( let i = 1 ; i <= n ; i ++ ) {
        for ( let j = sum [ i ] ; j >= a [ i ] ; j -- ) {
            // Update dp[j] using modular arithmetic and a specific constant
            dp [ j ] = add ( dp [ j ] , 499122177 * dp [ j - a [ i ] ] ) ;

            // Update dp2[j] for a related calculation
            dp2 [ j ] = add ( dp2 [ j ] , dp2 [ j - a [ i ] ] ) ;
        }
    }


    // Initialize the answer variable
    let ans = 0 ;

    // Conditional calculation if total sum is even
    if ( ! ( sum [ n ] % 2 ) )
    {
        ans += dp [ div2 ( sum [ n ] ) ] - dp2 [ div2 ( sum [ n ] ) ] ;
    }

    // Accumulate answer for values greater than half the total sum
    for ( let i = div2 ( sum [ n ] ) + 1 ; i <= sum [ n ] ; i ++ )
    {
        ans = add ( ans , dp [ i ] ) ;
    }

    // Multiply the current answer by 3
    ans *= 3 ;

    // Final modular arithmetic calculation for the result
    ans = ( ( Math . pow ( 3 , n ) - ans ) % p + p ) % p ;

    // Output the final answer to the console
    console . log ( ans ) ;

} // End of Main function


// Definition of the Inputer class for parsing input data
class Inputer {

    // Constructor initializes counter and splits input string
    constructor ( t )
    {
        this . cnt   = 0 ;
        this . items = t . split ( /\n|\s/ ) ;
    }

    // Method to get the next integer from the input stream
    getInt ( )
    {
        return this . items [ this . cnt ++ ] - 0 ;
    }

    // Method to get an array of 't' integers
    getIntArray ( t )
    {
        let r = new Array ( t ) ;
        for ( let e = 0 ; e < t ; e ++ )
        {
            r [ e ] = this . getInt ( ) ;
        }
        return r ;
    }

    // Method to get the next string from the input stream
    getStr ( )
    {
        return this . items [ this . cnt ++ ] ;
    }

    // Method to get an array of 't' strings
    getStrArray ( t )
    {
        let r = new Array ( t ) ;
        for ( let e = 0 ; e < t ; e ++ )
        {
            r [ e ] = this . getStr ( ) ;
        }
        return r ;
    }

} // End of Inputer class


// Entry point for execution, handles environment differences (browser vs Node.js)
if ( typeof window == "undefined" )
{
    // If running in Node.js (not in a browser environment)
    // Read input from stdin and pass it to the Main function
    Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
}