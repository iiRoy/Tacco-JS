"use strict" /* This directive enforces strict mode for the entire script. */ ;


var input = require("fs") . readFileSync ( "/dev/stdin" , "utf8" ) ; // Input is read from standard input.

var cin = input . split ( / |\n/ ) , cid = 0 ; /* Tokens are separated by space or newline. cid is the current index. */


function next ( )
{
    // Retrieves the next numeric token from the input array.
    return + cin [ cid ++ ] ;
}


function nextstr ( )
{
    // Fetches the next string token from the input.
    return cin [ cid ++ ] ;
}


function nextbig ( )
{
    // Converts the next token into a BigInt type.
    return BigInt ( cin [ cid ++ ] ) ;
}


function nexts ( n , a )
{ /* This function reads 'n' elements from the input.
     If 'a' is truthy, elements are returned as strings.
     Otherwise, they are converted to numbers. */
    return a ? cin . slice ( cid , cid += n ) : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}



function nextm ( h , w , a )
{
    var r = [ ] , i = 0 ; // 'r' will store the 2D array, 'i' is the row counter.

    if ( a )
    { // If 'a' is true, elements are treated as strings.
        for ( ; i < h ; i ++ )
        {
            r . push ( cin . slice ( cid , cid += w ) ) ; // Each row is a slice of string tokens.
        }
    }
    else
    { // Otherwise, elements are converted to numbers.
        for ( ; i < h ; i ++ )
        {
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ; // Each row is a slice of number tokens.
        }
    }
    return r ; // Returns the generated 2D array.
}


function xArray ( v )
{ /* Dynamically creates a multi-dimensional array.
     The dimensions are passed as additional arguments.
     'v' is the initial value for the innermost elements. */
    var a = arguments , l = a . length , r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ; // Constructs the innermost array creation string.
    while ( -- l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ; // Wraps the string for higher dimensions.
    }
    return eval ( r ) ; // Executes the constructed string to create the array.
}


var mod = 1e9 + 7 ; /* This is our global modulo constant, used for arithmetic operations. */


function mul ( )
{ // Performs modular multiplication of multiple arguments.
    for ( var a = arguments , r = a [ 0 ] , i = a . length ; -- i ; )
    {
        /* The multiplication is optimized to prevent overflow before modulo,
           especially for large numbers that might exceed standard integer limits. */
        r = ( ( r >> 16 ) * a [ i ] % mod * 65536 + ( r & 65535 ) * a [ i ] ) % mod ;
    }
    return r ; // Returns the final modular product.
}


var fac = [ ] , finv = [ ] , invs = [ ] , pow2 = [ ] ; // Global arrays for precomputed values (factorials, inverse factorials, etc.).


function fset ( n )
{ /* Precomputes factorials and inverse factorials up to 'n'
     for efficient combination and permutation calculations. */
    fac . length = n + 1 ; // Sets the size of the factorial array.
    fac [ 0 ] = fac [ 1 ] = 1 ; // Base cases for factorial (0! = 1, 1! = 1).
    for ( var i = 2 ; i <= n ; )
    {
        fac [ i ] = mul ( fac [ i - 1 ] , i ++ ) ; // Calculates factorial iteratively.
    }

    finv . length = n + 1 ; // Sets the size of the inverse factorial array.
    finv [ 0 ] = finv [ 1 ] = 1 ; // Base cases for inverse factorial.
    finv [ n ] = inv ( fac [ n ] ) ; // Computes the modular inverse of fac[n].
    for ( i = n ; 2 < i ; )
    {
        finv [ i - 1 ] = mul ( finv [ i ] , i -- ) ; // Calculates inverse factorials in reverse order.
    }
}


function inv ( b )
{ /* Computes the modular multiplicative inverse of 'b' modulo 'mod'
     using the extended Euclidean algorithm. */
    for ( var a = mod , u = 0 , v = 1 , t ; b ; v = t )
    {
        t = a / b | 0 ; // Integer division.
        a -= t * b ; // Update 'a' based on Euclidean algorithm.
        u -= t * v ; // Update 'u' for inverse calculation.
        t = a ; a = b ; b = t ; // Swap 'a' and 'b'.
        t = u ; u = v ; // Swap 'u' and 'v'.
    }
    u %= mod ; // Normalize 'u' to be within the modulo range.
    return u < 0 ? u + mod : u ; // Ensure the result is positive.
}


function pow ( a , n )
{ /* Calculates 'a' raised to the power 'n' modulo 'mod'
     using binary exponentiation (exponentiation by squaring). */
    for ( var r = 1 ; n ; a = mul ( a , a ) , n >>= 1 )
    {
        if ( n & 1 )
        {
            r = mul ( a , r ) ; // If 'n' is odd, include current 'a' in the result.
        }
    }
    return r ; // Returns the modular exponentiation result.
}


function ncr ( n , r )
{ /* Calculates "n choose r" (combinations) modulo 'mod'.
     Relies on precomputed factorials and inverse factorials. */
    return mul ( fac [ n ] , finv [ r ] , finv [ n - r ] ) ;
}


function npr ( n , r )
{ /* Calculates "n permute r" (permutations) modulo 'mod'.
     Uses precomputed factorials and inverse factorials. */
    return mul ( fac [ n ] , finv [ n - r ] ) ;
}


function mput ( n )
{ /* Ensures that a number 'n' is positive and within the modulo range.
     Useful for consistently handling results from modular arithmetic. */
    return ( n % mod + mod ) % mod ;
}


var myOut = main ( ) ; /* Executes the main program logic and stores its return value. */

if ( myOut !== undefined )
{
    // If the main function produced a result, it is converted to a string and printed.
    console . log ( String ( myOut ) ) ;
}


function main ( )
{ /* This is the primary function containing the problem's solution logic. */
    var n = next ( ) ; // Reads the initial integer 'n'.
    var a1 = nextbig ( ) , a2 = nextbig ( ) ; // Reads two BigInt values, 'a1' and 'a2'.
    var x = 0n ; // Initializes a BigInt variable 'x' to zero.

    // Loop to calculate the XOR sum of the remaining 'n-2' BigInts.
    for ( var i = 2 ; i < n ; i ++ )
    {
        x ^= nextbig ( ) ; // XORs each subsequent BigInt into 'x'.
    }

    var ans = 0n , a = a1 ^ a2 ^ x ; // Initializes 'ans' (answer) and calculates the initial 'a'.

    // The core loop of the algorithm, continues as long as 'a' is not zero.
    while ( a )
    {
        if ( a1 === 1 )
        {
            return -1 ; // If 'a1' is 1, a solution is impossible under these conditions.
        }

        // Iterates through bit positions from 40 down to 0.
        for ( var i = 40 ; i >= 0 ; i -- )
        {
            var k = 1n << BigInt ( i ) ; // 'k' represents 2^i as a BigInt.
            if ( ( a & k ) === 0n )
            {
                continue ; // If the i-th bit of 'a' is zero, skip to the next bit.
            }

            var u ; // Declares a temporary BigInt variable 'u'.
            u = ( a1 & ( k - 1n ) ) + 1n ; // Calculates a potential value for 'u' based on 'a1' and 'k'.
            u = min ( u , k - ( a2 & ( k - 1n ) ) ) ; // Adjusts 'u' using 'a2' and 'k' to find the minimum valid step.

            if ( u < a1 )
            {
                ans += u ; // Adds 'u' to the total answer.
                a1 -= u ; // Decreases 'a1' by 'u'.
                a2 += u ; // Increases 'a2' by 'u'.
                break ; // Breaks from the inner loop to re-evaluate 'a'.
            }
            else
            {
                return -1 ; // If 'u' is not a valid step (i.e., u >= a1), a solution is impossible.
            }
        }
        a = a1 ^ a2 ^ x ; // Recalculates 'a' with the updated 'a1' and 'a2'.
    }
    return ans ; // Returns the final accumulated answer.
}


function min ( a , b )
{
    // A simple helper function to determine the minimum of two BigInts.
    return a > b ? b : a ;
}