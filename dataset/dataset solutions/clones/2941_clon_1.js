/*
 * This is a JavaScript module for input processing,
 * mathematical utilities, and a main program logic.
 *
 * Input handling is done via a custom GET object.
 * Mathematical functions include modular arithmetic,
 * combinations, and modular inverse.
 *
 * The main function calculates a specific result
 * based on input dimensions (n, m, k) and a
 * precomputed 2D array 'a'.
 */

var GET = ( /* This defines the input parsing utility */ function ( ) {

    // Inner function 'f' acts as the constructor factory for 'g'
    function f ( s ) {
        return new g ( s ) ;
    }

    // Constructor 'g' for the input object
    function g ( s ) {
        // Store lines of input, trimmed and split by newline
        this . _s = s . trim ( ) . split ( "\n" ) ;
        // Initialize line pointer
        this . _y = 0 ;
    }

    // Prototype method 'a' to read a single item (either number or string)
    g . prototype . a = function ( f ) {
        var s = this . _s ,
            y = this . _y ,
            r ;

        // If the current line hasn't been processed into tokens yet, do it
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ; // Reverse for efficient pop
        }

        r = s [ y ] . pop ( ) ; // Get the last item

        // If the current line is now empty, advance to the next line
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        // Return as string if 'f' is true, otherwise as number
        return f ? r : + r ;
    } ;

    // Prototype method 'l' to read an entire line of items
    g . prototype . l = function ( f ) {
        var s = this . _s [ this . _y ++ ] . split ( " " ) ; // Get line, split, advance pointer
        // Return as strings if 'f' is true, otherwise map to numbers
        return f ? s : s . map ( a => + a ) ;
    } ;

    // Prototype method 'm' to read a matrix (n rows)
    g . prototype . m = function ( n , f ) {
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ; // Slice n rows, split each into tokens
        // Return as strings if 'f' is true, otherwise map all elements to numbers
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    // Prototype method 'r' to read raw 'n' lines
    g . prototype . r = function ( n , f ) {
        var r = this . _s . slice ( this . _y , this . _y += n ) ; // Slice n rows
        // Return as strings if 'f' is true, otherwise map each line to a number
        return f ? r : r . map ( a => + a ) ;
    } ;

    return f ; // Return the factory function
} ) ( ) ;


// Initialize the input object by reading from stdin
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Helper function to create multi-dimensional arrays initialized with a value
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ; // Innermost array creation

    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ; // Wrap with outer array creations
    }
    return eval ( r ) ; // Evaluate the constructed string to create the array
}


// Define the modulus for modular arithmetic operations
var mod = 1e9 + 7 ;


// Function for modular multiplication of multiple arguments
function abmod ( ) {
    var a = arguments ,
        r = a [ 0 ] ,
        i = 1 ;

    while ( i < a . length ) {
        // Perform multiplication using properties of modular arithmetic to avoid overflow
        r = ( ( r >> 16 ) * a [ i ] % mod * 65536 + ( r & 65535 ) * a [ i ++ ] ) % mod ;
    }
    return r ;
}


// Precompute factorials up to a certain point
var fact = [ 1 , 1 ] ;


// Function to get factorial modulo 'mod'
function factmod ( n ) {
    for ( var i = fact . length ; i <= n ; i ++ ) {
        fact [ i ] = abmod ( fact [ i - 1 ] , i ) ; // Compute next factorial
    }
    return fact [ n ] ;
}


// Function to calculate nCr modulo 'mod'
function nCrmod ( n , r ) {
    // nCr = n! / (r! * (n-r)!) mod P
    //     = n! * (r!)^(-1) * ((n-r)!)^(-1) mod P
    return abmod ( factmod ( n ) , modinv ( factmod ( r ) ) , modinv ( factmod ( n - r ) ) ) ;
}


// Function to calculate modular multiplicative inverse using extended Euclidean algorithm
function modinv ( a ) {
    var b = mod ,
        u = 1 ,
        v = 0 ,
        t ;

    while ( b ) {
        t = a / b | 0 ; // Integer division
        a -= t * b ;
        u -= t * v ;

        // Swap (a, b) and (u, v)
        t = a ;
        a = b ;
        b = t ;

        t = u ;
        u = v ;
        v = t ;
    }

    u %= mod ; // Ensure u is within [0, mod-1]
    return u < 0 ? u + mod : u ;
}


// Output the result of the main function
console . log ( main ( ) ) ;


// Main program logic
function main ( ) {
    // Read input values for n, m, and k
    var n = o . a ( ) ; // First input integer
    var m = o . a ( ) ; // Second input integer
    var k = o . a ( ) ; // Third input integer

    // Create a 2D array 'a' of size n x m, initialized with zeros
    var a = xArray ( 0 , n , m ) ;

    // Populate the array 'a' based on specific calculations
    for ( var x = 0 ; x < m ; x ++ ) {
        for ( var y = 0 ; y < n ; y ++ ) {
            // First part of the calculation for a[y][x]
            a [ y ] [ x ] = ( f ( x + 1 ) + f ( m - x ) ) * n ;
            // Second part of the calculation for a[y][x]
            a [ y ] [ x ] += ( f ( y + 1 ) + f ( n - y ) ) * m ;
        }
    }

    // Calculate the sum of all elements in array 'a'
    var ans = 0 ;
    for ( var x = 0 ; x < m ; x ++ ) {
        for ( var y = 0 ; y < n ; y ++ ) {
            ans += a [ y ] [ x ] ;
        }
    }

    // Apply modulo to the accumulated sum
    ans %= mod ;

    // Final calculation using modular arithmetic utilities
    // The result is (ans * nCrmod(n*m-2, k-2) * modinv(2)) % mod
    return abmod ( ans , nCrmod ( n * m - 2 , k - 2 ) , modinv ( 2 ) ) ;
}


// Helper function 'f' for a simple arithmetic calculation: a * (a - 1) / 2
function f ( a ) {
    return a * ( a - 1 ) / 2 ;
}