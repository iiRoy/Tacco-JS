"use strict"; // Enable strict mode for better error handling and cleaner code.


var input = require("fs") .readFileSync( "/dev/stdin", "utf8" ); // Read input from standard input.

var cin = input.split( / |\n/ ), cid = 0; // Tokenize input by spaces or newlines, initialize cursor.


function next() { // Parses the next token as a number.
    return +cin[cid++];
}

function nextstr() { // Retrieves the next token as a string.
    return cin[cid++];
}

function nextbig() { // Converts the next token to a BigInt.
    return BigInt(cin[cid++]);
}

function nexts( n, a ) { // Reads 'n' tokens. If 'a' is true, returns strings; otherwise, numbers.
    return a
        ? cin.slice( cid, cid += n )
        : cin.slice( cid, cid += n ) .map( a => +a );
}

function nextssort( n, a ) { // Reads 'n' tokens, converts to numbers, and sorts them.
    // If 'a' is true, sorts in descending order; otherwise, ascending.
    return a
        ? cin.slice( cid, cid += n ) .map( a => +a ) .sort( ( a, b ) => b - a )
        : cin.slice( cid, cid += n ) .map( a => +a ) .sort( ( a, b ) => a - b );
}

function nextm( h, w, a ) { // Reads a matrix of h rows and w columns.
    var r = [], i = 0;
    if ( a ) { // If 'a' is true, elements are strings.
        for ( ; i < h; i++ ) {
            r.push( cin.slice( cid, cid += w ) );
        }
    } else { // Otherwise, elements are numbers.
        for ( ; i < h; i++ ) {
            r.push( cin.slice( cid, cid += w ) .map( a => +a ) );
        }
    }
    return r;
}

function xArray( v ) { // Creates a multi-dimensional array with initial value 'v'.
    var a = arguments, l = a.length,
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";
    while ( --l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }
    return eval( r ); // Uses eval, be cautious!
}

var streams = []; // Stores output lines for later printing.
function print( s ) {
    streams.push( s ); // Adds a string to the output stream.
}


var mod = 1e9 + 7; // A common modulus for modular arithmetic operations.

function mul() { // Multiplies multiple numbers modulo 'mod'.
    for ( var a = arguments, r = a[0], i = a.length; --i; ) {
        r = ( ( r >> 16 ) * a[i] % mod * 65536 + ( r & 65535 ) * a[i] ) % mod;
    }
    return r;
}

var fac = [], finv = [], invs = [], pow2 = []; // Arrays for factorials, inverse factorials, etc.

function fset( n ) { // Precomputes factorials and inverse factorials up to 'n'.
    fac.length = n + 1;
    fac[0] = fac[1] = 1;
    for ( var i = 2; i <= n; ) {
        fac[i] = mul( fac[i - 1], i++ );
    }
    finv.length = n + 1;
    finv[0] = finv[1] = 1;
    finv[n] = inv( fac[n] );
    for ( i = n; 2 < i; ) {
        finv[i - 1] = mul( finv[i], i-- );
    }
    /*
    // Optional precomputation for inverse numbers and powers of 2.
    invs.length = n + 1;
    invs[0] = invs[1] = 1;
    for ( i = 2; i <= n; ) {
        invs[i] = mul( fac[i - 1], finv[i++] );
    }
    pow2.length = n + 1;
    pow2[0] = 1;
    for ( i = 1; i <= n; i++ ) {
        pow2[i] = pow2[i - 1] * 2 % mod;
    }
    */
}

function inv( b ) { // Computes the modular multiplicative inverse of 'b' using extended Euclidean algorithm.
    for (
        var a = mod, u = 0, v = 1, t;
        b;
        v = t
    ) {
        t = a / b | 0;
        a -= t * b;
        u -= t * v;
        t = a;
        a = b;
        b = t;
        t = u;
        u = v;
    }
    u %= mod;
    return u < 0 ? u + mod : u;
}

function pow( a, n ) { // Computes (a^n) modulo 'mod' using binary exponentiation.
    for ( var r = 1; n; a = mul( a, a ), n >>= 1 ) {
        if ( n & 1 ) {
            r = mul( a, r );
        }
    }
    return r;
}

function ncr( n, r ) { // Calculates "n choose r" modulo 'mod'.
    return mul( fac[n], finv[r], finv[n - r] );
}

function npr( n, r ) { // Calculates "n permute r" modulo 'mod'.
    return mul( fac[n], finv[n - r] );
}

function mput( n ) { // Ensures a number is within the [0, mod-1] range.
    return ( ( n % mod ) + mod ) % mod;
}


// Execute the main logic of the program.
var myOut = main();

if ( myOut !== undefined ) {
    console.log( String( myOut ) ); // Print the result of main() if it returns a value.
}

if ( streams.length ) {
    console.log( streams.join( "\n" ) ); // Print any accumulated output from the 'print' function.
}


function main() { // The primary function containing the problem's solution.
    var n = next();

    // Calculate the answer using modular exponentiation.
    var ans = pow( 10, n );
    ans -= pow( 9, n );
    ans -= pow( 9, n );
    ans += pow( 8, n );

    return mput( ans ); // Return the result, ensuring it's positive and within mod.
}