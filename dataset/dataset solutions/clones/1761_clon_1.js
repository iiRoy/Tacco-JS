"use strict" ; // Enforces strict mode for cleaner, safer JavaScript code execution.

// --- Input Reading Utilities ---

/*
 * Reads the entire content of standard input synchronously.
 * This is a common pattern in competitive programming environments.
 */
var input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ;

/*
 * Splits the input string into an array of strings,
 * using spaces or newlines as delimiters.
 * 'cid' acts as an index pointer for consuming elements.
 */
var cin = input . split( / |\n/ ) ;
var cid = 0 ;

/**
 * Retrieves the next number from the input array.
 * Converts the string to a number using the unary plus operator.
 * @returns {number} The next numeric value.
 */
function next ( ) {
    return + cin [ cid ++ ] ;
}

/**
 * Retrieves the next string token from the input array.
 * @returns {string} The next string value.
 */
function nextstr ( ) {
    return cin [ cid ++ ] ;
}

/**
 * Retrieves the next BigInt from the input array.
 * Useful for handling very large integer values.
 * @returns {BigInt} The next BigInt value.
 */
function nextbig ( ) {
    return BigInt ( cin [ cid ++ ] ) ;
}

/**
 * Reads 'n' elements from the input array.
 * If 'a' is true, returns them as strings; otherwise, converts them to numbers.
 * @param {number} n - The number of elements to read.
 * @param {boolean} [a] - If true, return strings; otherwise, return numbers.
 * @returns {Array<number|string>} An array of the read elements.
 */
function nexts ( n , a ) {
    return a
           ? cin . slice( cid , cid += n )
           : cin . slice( cid , cid += n ) . map( a => + a ) ;
}

/**
 * Reads a 2D matrix of dimensions h x w from the input.
 * If 'a' is true, elements are strings; otherwise, they are numbers.
 * @param {number} h - Height of the matrix.
 * @param {number} w - Width of the matrix.
 * @param {boolean} [a] - If true, return string elements; otherwise, return numbers.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function nextm ( h , w , a ) {
    var r = [ ] ;
    var i = 0 ;

    if ( a ) {
        for ( ; i < h ; i ++ ) {
            r . push( cin . slice( cid , cid += w ) ) ;
        }
    } else {
        for ( ; i < h ; i ++ ) {
            r . push( cin . slice( cid , cid += w ) . map( a => + a ) ) ;
        }
    }
    return r ;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments after the initial value.
 * Uses `eval` for dynamic array creation, which should be used with caution.
 * @param {*} v - The initial value for all elements.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments ;
    var l = a . length ;
    var r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;

    while ( -- l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }
    return eval ( r ) ;
}


// --- Mathematical Utilities for Modular Arithmetic ---

/*
 * Global constant for modulo operations.
 * This is a prime number often used in competitive programming for modular arithmetic.
 */
var mod = 998244353 ;

/**
 * Performs modular multiplication for an arbitrary number of arguments.
 * Uses a specific optimization for faster modular multiplication (Schrage's method approximation or similar).
 * @param {...number} args - Numbers to multiply.
 * @returns {number} The modular product of all arguments.
 */
function mul ( ) {
    var a = arguments ;
    var r = a [ 0 ] ; // Initialize result with the first argument.

    for ( var i = a . length ; -- i ; ) {
        // Optimized modular multiplication to avoid intermediate overflow for numbers up to 2^31 - 1
        // (r * a[i]) % mod
        r = ( ( r >> 16 ) * a [ i ] % mod * 65536 + ( r & 65535 ) * a [ i ] ) % mod ;
    }
    return r ;
}

// Arrays for precomputing factorials, inverse factorials, inverse numbers, and powers of 2.
var fac = [ ] ;
var finv = [ ] ;
var invs = [ ] ; // Array for inverse numbers (currently unused/commented out in fset).
var pow2 = [ ] ; // Array for powers of 2 (currently unused/commented out in fset).

/**
 * Precomputes factorials and inverse factorials up to 'n' modulo 'mod'.
 * @param {number} n - The maximum value for which to precompute.
 */
function fset ( n ) {
    // Initialize factorial array.
    fac . length = n + 1 ;
    fac [ 0 ] = fac [ 1 ] = 1 ;

    // Calculate factorials iteratively.
    for ( var i = 2 ; i <= n ; ) {
        fac [ i ] = mul ( fac [ i - 1 ] , i ++ ) ;
    }

    // Initialize inverse factorial array.
    finv . length = n + 1 ;
    finv [ 0 ] = finv [ 1 ] = 1 ;

    // Calculate inverse of the largest factorial using modular inverse.
    finv [ n ] = inv ( fac [ n ] ) ;

    // Calculate remaining inverse factorials backwards.
    for ( i = n ; 2 < i ; ) {
        finv [ i - 1 ] = mul ( finv [ i ] , i -- ) ;
    }

    /*
     * The following blocks are commented out in the original code,
     * but show potential for precomputing other sequences.
     */

    // // Precompute modular inverses of numbers.
    // invs.length=n+1,invs[0]=invs[1]=1;
    // for(i=2;i<=n;)invs[i]=mul(fac[i-1],finv[i++]);

    // // Precompute powers of 2 modulo mod.
    // pow2.length=n+1,pow2[0]=1;
    // for(i=1;i<=n;i++)pow2[i]=pow2[i-1]*2%mod;
}

/**
 * Computes the modular multiplicative inverse of 'b' modulo 'mod' using the Extended Euclidean Algorithm.
 * Assumes 'mod' is a prime number.
 * @param {number} b - The number for which to find the inverse.
 * @returns {number} The modular inverse of 'b'.
 */
function inv ( b ) {
    var a = mod ;
    var u = 0 ;
    var v = 1 ;
    var t ;

    while ( b ) {
        t = a / b | 0 ; // Integer division.
        a -= t * b ;
        u -= t * v ;

        t = a ;
        a = b ;
        b = t ;

        t = u ;
        u = v ;
        v = t ;
    }

    u %= mod ; // Ensure result is within [0, mod-1].
    return u < 0 ? u + mod : u ;
}

/**
 * Computes 'a' raised to the power 'n' modulo 'mod' using binary exponentiation (exponentiation by squaring).
 * @param {number} a - The base.
 * @param {number} n - The exponent.
 * @returns {number} (a^n) % mod.
 */
function pow ( a , n ) {
    var r = 1 ; // Initialize result.

    while ( n ) {
        if ( n & 1 ) { // If the current bit of n is 1.
            r = mul ( a , r ) ;
        }
        a = mul ( a , a ) ; // Square the base.
        n >>= 1 ; // Move to the next bit of n.
    }
    return r ;
}

/**
 * Computes "n choose r" (binomial coefficient) modulo 'mod'.
 * Requires factorials and inverse factorials to be precomputed using `fset`.
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to choose.
 * @returns {number} C(n, r) % mod.
 */
function ncr ( n , r ) {
    return mul ( fac [ n ] , finv [ r ] , finv [ n - r ] ) ;
}

/**
 * Computes "n permute r" (permutations) modulo 'mod'.
 * Requires factorials and inverse factorials to be precomputed using `fset`.
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to permute.
 * @returns {number} P(n, r) % mod.
 */
function npr ( n , r ) {
    return mul ( fac [ n ] , finv [ n - r ] ) ;
}

/**
 * Ensures a number is positive and within the [0, mod-1] range.
 * Useful for handling negative results from modular arithmetic operations.
 * @param {number} n - The number to normalize.
 * @returns {number} The normalized number.
 */
function mput ( n ) {
    return ( n % mod + mod ) % mod ;
}


// --- Main Program Execution ---

// Execute the main logic of the program and store its return value.
var myOut = main ( ) ;

/*
 * If the main function returns a value (i.e., not undefined),
 * print it to standard output, followed by a newline.
 */
if ( myOut !== undefined ) {
    console . log ( myOut ) ;
}


/**
 * The primary function containing the problem's solution logic.
 * This specific implementation appears to solve a dynamic programming problem.
 * @returns {number} The final calculated result.
 */
function main ( ) {
    /*
     * Read four integer inputs representing problem parameters.
     * These likely define ranges or starting points for the DP.
     */
    var [ a , b , c , d ] = nexts ( 4 ) ;

    /*
     * Initialize a 2D dynamic programming table with dimensions (c+1) x (d+1).
     * All cells are initialized to 0.
     */
    var dp = xArray ( 0 , c + 1 , d + 1 ) ;

    // Set the base case for the DP: dp[a][b] is initialized to 1.
    dp [ a ] [ b ] = 1 ;

    /*
     * Iterate through the DP table, filling it based on previous states.
     * The outer loop iterates through 'y' (rows) from 'a' to 'c'.
     */
    for ( var y = a ; y <= c ; y ++ ) {
        /*
         * The inner loop iterates through 'x' (columns) from 'b' to 'd'.
         * This order ensures that dp[y-1][x], dp[y][x-1], and dp[y-1][x-1]
         * are already computed when needed for dp[y][x].
         */
        for ( var x = b ; x <= d ; x ++ ) {
            // DP state transition formula.
            // This formula calculates dp[y][x] based on its neighbors,
            // applying modular arithmetic for intermediate calculations.
            dp [ y ] [ x ] += dp [ y - 1 ] [ x ] * x
                            + dp [ y ] [ x - 1 ] * y
                            - mul ( dp [ y - 1 ] [ x - 1 ] , y - 1 , x - 1 ) ;

            // Ensure the result remains within the modulo range after each addition.
            dp [ y ] [ x ] %= mod ;
        }
    }

    // Return the final result from the DP table, ensuring it's positive and within modulo.
    return mput ( dp [ c ] [ d ] ) ;
}