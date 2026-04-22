"use strict" ; /* This directive enables strict mode for the entire script, helping to write cleaner and safer code. */


var input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ; /* The file system module is used to synchronously read the entire content of standard input ("/dev/stdin") as a UTF-8 encoded string. */


var cin = input . split( / |\n/ ) , cid = 0 ; /* The raw input string is split by spaces or newlines into an array 'cin'. 'cid' acts as a cursor for reading elements from 'cin'. */


function next ( ) {
    // This helper function retrieves the next element from the 'cin' array and attempts to convert it to a number using the unary plus operator.
    return + cin[ cid ++ ] ;
}


function nextstr ( ) {
    // This function simply retrieves the next element from 'cin' as a string, without any type conversion.
    return cin[ cid ++ ] ;
}


function nextbig ( ) {
    // This function retrieves the next element from 'cin' and converts it into a BigInt, suitable for very large integer arithmetic.
    return BigInt ( cin[ cid ++ ] ) ;
}


/*
 * The 'nexts' function is designed to read a specified number 'n' of elements from the input stream.
 * It has an optional boolean parameter 'a':
 *   - If 'a' is true, it returns the elements as strings.
 *   - If 'a' is false (or undefined), it converts the elements to numbers.
 */
function nexts ( n , a ) {
    return a
        ? cin . slice( cid , cid += n ) // Return as strings.
        : cin . slice( cid , cid += n ) . map( a => + a ) ; // Convert to numbers.
}


/*
 * The 'nextssort' function reads 'n' elements, converts them to numbers, and then sorts them.
 * The 'a' parameter determines the sort order:
 *   - If 'a' is true, it sorts in descending order (b - a).
 *   - If 'a' is false (or undefined), it sorts in ascending order (a - b).
 */
function nextssort ( n , a ) {
    return a
        ? cin . slice( cid , cid += n ) . map( a => + a ) . sort( ( a , b ) => b - a )
        : cin . slice( cid , cid += n ) . map( a => + a ) . sort( ( a , b ) => a - b ) ;
}


/*
 * The 'nextm' function is used to read a 2D matrix (or array of arrays) of dimensions 'h' (height) by 'w' (width).
 * The 'a' parameter again controls the type of elements:
 *   - If 'a' is true, matrix elements are stored as strings.
 *   - If 'a' is false, matrix elements are converted to numbers.
 */
function nextm ( h , w , a ) {
    var r = [ ] , i = 0 ; // Initialize an empty array 'r' to store rows and a counter 'i'.
    if ( a ) {
        // If 'a' is true, push slices of strings directly.
        for ( ; i < h ; i ++ ) {
            r . push( cin . slice( cid , cid += w ) ) ;
        }
    } else {
        // Otherwise, push slices of numbers (after mapping).
        for ( ; i < h ; i ++ ) {
            r . push( cin . slice( cid , cid += w ) . map( a => + a ) ) ;
        }
    }
    return r ; // Return the constructed 2D array.
}


/*
 * The 'xArray' function dynamically creates multi-dimensional arrays initialized with a given value 'v'.
 * Its arguments should be: xArray(initial_value, dimension1, dimension2, ..., dimensionN).
 * It constructs a string representing nested Array.fill().map() calls and then evaluates it.
 */
function xArray ( v ) {
    var a = arguments , l = a . length , r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ; // Start with the innermost dimension.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ; // Wrap with outer dimensions.
    }
    return eval( r ) ; // Evaluate the generated string to create the array.
}


var streams = [ ] ; // An array to buffer output strings that are intended to be printed at the end.

function print ( s ) {
    // This function adds a given string 's' to the 'streams' array.
    streams . push( s ) ;
}


var mod = 1e9 + 7 ; // A common prime number used as a modulo in competitive programming (1,000,000,007).


/*
 * The 'mul' function performs modular multiplication for an arbitrary number of arguments.
 * It uses a technique to prevent intermediate overflows when multiplying large numbers before applying the modulo.
 * This specific algorithm splits numbers into 16-bit chunks.
 */
function mul ( ) {
    for ( var a = arguments , r = a[ 0 ] , i = a . length ; -- i ; ) {
        // This calculation is equivalent to (r * a[i]) % mod but handles large numbers.
        r = ( ( r >> 16 ) * a[ i ] % mod * 65536 + ( r & 65535 ) * a[ i ] ) % mod ;
    }
    return r ; // Returns the product modulo 'mod'.
}


var fac = [ ] , finv = [ ] , invs = [ ] , pow2 = [ ] ; // Arrays declared globally to store precomputed factorials, inverse factorials, modular inverses, and powers of 2.


/*
 * The 'fset' function precomputes factorials and inverse factorials up to 'n' modulo 'mod'.
 * This is crucial for efficient calculation of combinations (nCr) and permutations (nPr).
 */
function fset ( n ) {
    fac . length = n + 1 ; // Resize factorial array.
    fac[ 0 ] = fac[ 1 ] = 1 ; // Base cases for factorials.

    for ( var i = 2 ; i <= n ; ) {
        fac[ i ] = mul( fac[ i - 1 ] , i ++ ) ; // Calculate factorials iteratively.
    }

    finv . length = n + 1 ; // Resize inverse factorial array.
    finv[ 0 ] = finv[ 1 ] = 1 ; // Base cases for inverse factorials.
    finv[ n ] = inv( fac[ n ] ) ; // Calculate inverse of factorial[n] using modular inverse.

    for ( i = n ; 2 < i ; ) {
        finv[ i - 1 ] = mul( finv[ i ] , i -- ) ; // Calculate other inverse factorials iteratively from finv[n].
    }

    // The following lines were commented out in the original code, indicating they are not currently used but might be for other problems.
    /* invs.length = n + 1; invs[0] = invs[1] = 1; */
    /* for(i=2; i<=n; ) invs[i] = mul(fac[i-1], finv[i++]); */
    /* pow2.length = n + 1; pow2[0] = 1; */
    /* for(i=1; i<=n; i++) pow2[i] = pow2[i-1]*2%mod; */
}


/*
 * The 'inv' function calculates the modular multiplicative inverse of 'b' modulo 'mod'.
 * It uses the extended Euclidean algorithm to find 'x' such that (b * x) % mod = 1.
 */
function inv ( b ) {
    for ( var a = mod , u = 0 , v = 1 , t ; b ; v = t ) {
        t = a / b | 0 ; // Integer division.
        a -= t * b ;
        u -= t * v ;
        t = a ; a = b ; b = t ; // Swap a and b.
        t = u ; u = v ; // Swap u and v.
    }
    u %= mod ; // Ensure u is within modulo range.
    return u < 0 ? u + mod : u ; // Adjust negative results to be positive.
}


/*
 * The 'pow' function calculates (a^n) % mod efficiently using binary exponentiation (also known as exponentiation by squaring).
 * This method significantly reduces the number of multiplications required.
 */
function pow ( a , n ) {
    for ( var r = 1 ; n ; a = mul( a , a ) , n >>= 1 ) { // Loop while n > 0; square 'a' and halve 'n' in each step.
        if ( n & 1 ) { // If the current bit of 'n' is 1.
            r = mul( a , r ) ; // Multiply 'r' by 'a'.
        }
    }
    return r ; // Return the result (a^n) % mod.
}


/*
 * The 'ncr' function calculates "n choose r" (combinations) modulo 'mod'.
 * It requires the 'fset' function to have been called previously to precompute factorials and inverse factorials.
 * Formula: nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1 (mod mod).
 */
function ncr ( n , r ) {
    return mul( fac[ n ] , finv[ r ] , finv[ n - r ] ) ;
}


/*
 * The 'npr' function calculates "n permute r" (permutations) modulo 'mod'.
 * It also requires 'fset' to have been called.
 * Formula: nPr = n! / (n-r)! = n! * ((n-r)!)^-1 (mod mod).
 */
function npr ( n , r ) {
    return mul( fac[ n ] , finv[ n - r ] ) ;
}


/*
 * The 'mput' function ensures that a number 'n' is always positive and within the modulo range [0, mod-1].
 * It handles cases where 'n' might be negative after operations.
 */
function mput ( n ) {
    return ( n % mod + mod ) % mod ;
}


// --- Main Execution Logic --- //

// Call the 'main' function, which contains the core problem-solving logic.
var myOut = main ( ) ;

// If the 'main' function returns a defined value, print it to the console.
if ( myOut !== undefined ) {
    console . log( String( myOut ) ) ;
}

// If any output was buffered in the 'streams' array, join it with newlines and print it.
if ( streams . length ) {
    console . log( streams . join( "\n" ) ) ;
}


/*
 * The 'main' function implements the specific algorithm to solve the problem.
 * In this case, it appears to be a dynamic programming problem related to counting ways to form a sum.
 */
function main ( ) {
    var s = next ( ) ; // Read the target sum 's' from the input.
    var dp = xArray( 0 , s + 1 ) ; // Initialize a DP array of size (s + 1) with all elements set to 0.

    dp[ 0 ] = 1 ; // Base case: There is one way to make a sum of 0 (by choosing no numbers).

    // Iterate through all possible previous sums 'i' from 0 up to 's - 1'.
    for ( var i = 0 ; i < s ; i ++ ) {
        // Iterate through possible numbers 'j' that can be added, starting from 3.
        // The problem likely involves sums using numbers 3 or greater.
        for ( var j = 3 ; j <= s ; j ++ ) {
            // If adding 'j' to the current sum 'i' would exceed the target 's',
            // then further increments of 'j' will also exceed 's', so we break this inner loop.
            if ( i + j > s ) {
                break ;
            }
            // Update the DP array: The number of ways to reach 'i + j' is increased by
            // the number of ways to reach 'i' (since we are adding 'j' to 'i').
            dp[ i + j ] += dp[ i ] ;
            // Apply modulo operation to keep the result within the defined range.
            dp[ i + j ] %= mod ;
        }
    }
    // The final answer is the number of ways to reach the target sum 's'.
    return dp[ s ] ;
}