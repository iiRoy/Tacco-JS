/*
 *  This file contains utility functions for competitive programming.
 *  It includes an input parser, array generation, modular arithmetic,
 *  and combinatorics functions.
 */

"use strict" ; // Enforce strict mode for cleaner code.

// Input parsing module (GET) - Immediately Invoked Function Expression (IIFE)
var GET = ( function ( ) {

    /**
     *  Factory function to create a new G reader instance.
     *  @param {string} s - The raw input string.
     *  @returns {g} A new G instance.
     */
    function f ( s ) {
        return new g ( s ) ;
    }

    /**
     *  Constructor for the G reader.
     *  Initializes the input buffer and current line pointer.
     *  @param {string} s - The raw input string.
     */
    function g ( s ) {
        this . _s = s . trim ( ) . split ( "\n" ) ; // Split input into lines, trim overall whitespace.
        this . _y = 0 ; // Current line index.
    }

    /**
     *  Reads a single token (number or string) from the current line.
     *  If the current line is not yet processed into tokens, it will be.
     *  @param {boolean} [f=false] - If true, returns the token as a string. Otherwise, as a number.
     *  @returns {string|number} The read token.
     */
    g . prototype . a = function ( f ) {
        var s = this . _s , // Reference to the lines array.
            y = this . _y , // Current line index.
            r ; // Result variable.

        // If the current line is still a raw string, split it into tokens and reverse for stack-like pop.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        r = s [ y ] . pop ( ) ; // Get the last token (first in original order).

        // If the current line is exhausted, advance to the next line.
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        return f ? r : + r ; // Return as string or number.
    } ;

    /**
     *  Reads an entire line of tokens.
     *  Advances the line pointer.
     *  @param {boolean} [f=false] - If true, returns tokens as strings. Otherwise, as numbers.
     *  @returns {Array<string|number>} An array of tokens from the line.
     */
    g . prototype . l = function ( f ) {
        // Get the current line, split by space, then advance line pointer.
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;
        return f ? s : s . map ( a => + a ) ; // Return as strings or numbers.
    } ;

    /**
     *  Reads 'n' lines, each as an array of tokens.
     *  Advances the line pointer by 'n'.
     *  @param {number} n - The number of lines to read.
     *  @param {boolean} [f=false] - If true, returns tokens as strings. Otherwise, as numbers.
     *  @returns {Array<Array<string|number>>} A 2D array of tokens.
     */
    g . prototype . m = function ( n , f ) {
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ; // Slice 'n' lines, split each.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ; // Return as strings or numbers.
    } ;

    /**
     *  Reads 'n' lines, each as a single token (or raw string).
     *  Advances the line pointer by 'n'.
     *  @param {number} n - The number of lines to read.
     *  @param {boolean} [f=false] - If true, returns raw strings. Otherwise, converts to numbers.
     *  @returns {Array<string|number>} An array of tokens.
     */
    g . prototype . r = function ( n , f ) {
        var r = this . _s . slice ( this . _y , this . _y += n ) ; // Slice 'n' lines.
        return f ? r : r . map ( a => + a ) ; // Return as strings or numbers.
    } ;

    return f ; // Return the factory function.

} ) ( ) ; // Execute the IIFE immediately.


// Initialize the input reader 'o' by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 *  Generates a multi-dimensional array initialized with a value or expression.
 *  Uses `eval` for dynamic array creation.
 *  @param {*} v - The initial value or an expression string for array elements.
 *  @param {...number} dimensions - The dimensions of the array (e.g., `xArray(0, 2, 3)` creates a 2x3 array of zeros).
 *  @returns {Array} The generated multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , // All arguments passed to the function.
        l = a . length , // Total number of arguments.
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ; // Innermost array creation.

    // Build the string for nested array creation.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    return eval ( r ) ; // Evaluate the dynamically constructed string to create the array.
}


// Global modulus for modular arithmetic operations.
var mod = 998244353 ;


/**
 *  Performs modular multiplication of multiple numbers.
 *  Optimized for numbers up to `mod` size to prevent intermediate overflow.
 *  @param {...number} arguments - Numbers to multiply.
 *  @returns {number} The product modulo `mod`.
 */
function mul ( ) {
    for ( var a = arguments , // All arguments.
              r = a [ 0 ] , // Initialize result with the first argument.
              i = a . length ; // Loop counter, starting from total arguments.
          -- i ; ) { // Iterate from the second argument onwards.
        // Optimized modular multiplication: (A * B) % M
        // A = (r >> 16) * 65536 + (r & 65535)
        // ( ( (r >> 16) * 65536 % mod ) * a[i] % mod + ( (r & 65535) % mod ) * a[i] % mod ) % mod
        // This effectively breaks 'r' into two 16-bit parts to handle larger numbers before modulo.
        r = ( ( r >> 16 ) * a [ i ] % mod * 65536 + ( r & 65535 ) * a [ i ] ) % mod ;
    }
    return r ; // Return the final modular product.
}


// Global variables for factorials and inverse factorials (precomputed).
var facn = 1 , // Stores n! (factorial of n).
    finv = [ ] ; // Stores inverse factorials.


/**
 *  Precomputes factorials and inverse factorials up to 'n' for combinations.
 *  Handles different calculation strategies based on 'n' size.
 *  @param {number} n - The maximum number for which to compute factorials.
 */
function fset ( n ) {
    // If 'n' is within a certain range, use direct calculation.
    if ( n < 8500000 ) {
        // Calculate facn (n!)
        for ( var i = 2 ; i <= n ; i ++ ) {
            facn = facn * i % mod ;
        }

        // Initialize finv array.
        finv . length = n + 1 ;
        finv [ 0 ] = finv [ 1 ] = 1 ;

        // Calculate inv(n!) using modular inverse.
        finv [ n ] = inv ( facn ) ;

        // Calculate inverse factorials in descending order: inv((i-1)!) = inv(i!) * i
        for ( i = n ; 2 < i ; i -- ) {
            finv [ i - 1 ] = finv [ i ] * i % mod ;
        }
    }
    // For larger 'n', use an optimized approach (possibly precomputed large values or different multiplication).
    else {
        // A specific precomputed value for facn at 8500000.
        facn = 488985182 ;

        // Continue calculating facn from 8500001 up to n using the 'mul' function.
        for ( var i = 8500001 ; i <= n ; i ++ ) {
            facn = mul ( facn , i ) ;
        }

        // Initialize finv array.
        finv . length = n + 1 ;
        finv [ 0 ] = finv [ 1 ] = 1 ;

        // Calculate inv(n!) using modular inverse.
        finv [ n ] = inv ( facn ) ;

        // Calculate inverse factorials in descending order using 'mul'.
        for ( i = n ; 2 < i ; i -- ) {
            finv [ i - 1 ] = mul ( finv [ i ] , i ) ;
        }
    }
}


/**
 *  Computes the modular multiplicative inverse of 'a' modulo `mod` using the Extended Euclidean Algorithm.
 *  @param {number} a - The number to find the inverse of.
 *  @returns {number} The modular inverse of 'a'.
 */
function inv ( a ) {
    var b = mod , // The modulus.
        u = 1 , // Coefficient for 'a'.
        v = 0 , // Coefficient for 'b'.
        t ; // Temporary variable.

    // Extended Euclidean Algorithm loop.
    for ( ; b ; ) {
        t = a / b | 0 ; // Integer division.
        a -= t * b ; // Update a.
        u -= t * v ; // Update u.

        // Swap (a, b) and (u, v) using temporary variable 't'.
        t = a ; a = b ; b = t ;
        t = u ; u = v ; v = t ;
    }

    u %= mod ; // Ensure u is within the modulus range.
    return u < 0 ? u + mod : u ; // Adjust negative results to be positive.
}


/**
 *  Computes modular exponentiation (a^n % mod).
 *  Uses binary exponentiation (exponentiation by squaring).
 *  @param {number} a - The base.
 *  @param {number} n - The exponent.
 *  @returns {number} (a^n) % mod.
 */
function pow ( a , n ) {
    var r = 1 ; // Initialize result to 1.

    // Loop while exponent 'n' is greater than 0.
    for ( ; n ; ) {
        a = mul ( a , a ) ; // Square the base.
        n >>= 1 ; // Halve the exponent.

        // If the current bit of 'n' is 1, multiply 'r' by 'a'.
        if ( n & 1 ) {
            r = mul ( a , r ) ;
        }
    }
    return r ; // Return the final result.
}


/**
 *  Computes "n choose r" (nCr) modulo `mod`.
 *  Assumes `fset(n)` has been called to precompute factorials.
 *  nCr = n! / (r! * (n-r)!) = n! * (r!)^(-1) * ((n-r)!)^(-1)
 *  @param {number} n - The total number of items.
 *  @param {number} r - The number of items to choose.
 *  @returns {number} (nCr) % mod.
 */
function ncr ( n , r ) {
    // Handle invalid cases (r < 0 or r > n).
    if ( r < 0 || r > n ) return 0 ;
    // nCr = facn * finv[r] * finv[n-r] % mod.
    // The global 'facn' already holds n!.
    // 'finv[r]' holds (r!)^(-1).
    // 'finv[n-r]' holds ((n-r)!)^(-1).
    return mul ( facn , finv [ r ] , finv [ n - r ] ) ;
}


// Main execution block: call the main function and print its result.
console . log ( main ( ) ) ;


/**
 *  Main function for the problem logic.
 *  Reads input, performs calculations, and returns the final answer.
 *  This particular problem seems to involve combinatorics and modular arithmetic
 *  related to powers of 3 and combinations.
 *  @returns {number} The calculated answer modulo `mod`.
 */
function main ( ) {
    var n = o . a ( ) ; // Read the integer 'n' from input.
    var ans = pow ( 3 , n ) ; // Initialize answer with 3^n.

    fset ( n ) ; // Precompute factorials and inverse factorials up to 'n'.

    var p2 = 1 ; // Initialize p2 (power of 2) to 2^0 = 1.

    // Loop from i = n down to n/2 + 1 (m is n>>1, which is floor(n/2)).
    // The condition 'm < i' means i > n/2.
    for ( var i = n ,
              m = n >> 1 ;
          m < i ;
          i -- ) {
        p2 += p2 ; // p2 = p2 * 2 (equivalent to p2 <<= 1).
        if ( mod <= p2 ) { // If p2 exceeds modulus, wrap it around.
            p2 -= mod ;
        }

        // Subtract nCr(n, i) * p2 from ans.
        // This pattern suggests some form of inclusion-exclusion or a specific combinatorial identity.
        ans -= mul ( ncr ( n , i ) , p2 ) ;
    }

    ans %= mod ; // Ensure the final answer is within the modulus.
    return ans < 0 ? ans + mod : ans ; // Adjust negative results to be positive.
}