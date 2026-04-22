"use strict"
// This directive enables strict mode for the entire script.
;

// The I class (Input parser) is defined here.
function  I (s,   f )
{
  this._s = s.split( "\n" ) ; // Source string split by newlines
  this._c = 0 ;               // Current column index
  this._l = 0 ;               // Current line index
  this._f = f || Number       ; // Function to parse values (defaults to Number)
}


// Prototype method 'a' for reading a single value.
I.prototype.a = function ()
{
    var   l = this._s[this._l] ; // Get the current line
    if ( !l )
        return ; // If no more lines, return undefined

    var t = l.trim().split(" "); // Trim and split the line by spaces
    var a = t[this._c];          // Get the value at the current column

    this._c++;                   // Increment column counter

    if (t.length === this._c) { // If all values on the line have been read
        this._c = 0;             // Reset column counter
        this._l++;               // Move to the next line
    }

    return this._f(a);           // Parse and return the value
};


// Prototype method 'l' for reading an entire line of values.
I.prototype.l = function ()
{
    var l = this._s[this._l] ; // Get the current line again
    if ( !l )
        return ; // If no more lines, return undefined

    this._c = 0 ; // Reset column for this line
    this._l++ ;   // Move to the next line

    // Split the line, map each part using the parsing function, and return the array.
    return l.split(" ").map( this._f ) ;
};


// Function to compute prime numbers up to a given limit using the Sieve of Eratosthenes.
function sieveOfEratosthenes(e)
{
    const t = new Array( e + 1 ).fill( !0 ) ; // Boolean array, initially all true
    t[0] = !1 ; // 0 is not prime
    t[1] = !1 ; // 1 is not prime

    const n = [] ; // Array to store prime numbers

    // Iterate from 2 up to the limit 'e'
    for ( let r = 2 ; r <= e ; r += 1 )
    {
        if ( !0 === t[r] ) // If 'r' is marked as prime
        {
            n.push( r ) ; // Add 'r' to the list of primes

            let f = r * r ; // Start marking multiples from r*r

            // Mark all multiples of 'r' as not prime
            for ( ; f <= e ; )
            {
                t[f] = !1 ; // Mark as not prime
                f += r ;    // Move to the next multiple
            }
        }
    }
    return n ; // Return the list of primes
}


// Pre-calculate primes up to 100,000 for later use.
var primes = sieveOfEratosthenes(100000);


// Main function where the core logic of the program resides.
function main( input )
{
    // Initialize the input parser.
    var   o = new I( input ) ;

    // Read the first integer, which is 'n'.
    var n = o.a() ;

    // Initialize an array 'a' to store subsequent inputs.
    var a = [] ;

    // Read 'n + 1' integers into array 'a'.
    for ( var i = 0 ; i <= n ; i++ )
    {
        a.push( o.a() ) ;
    }

    // Reverse the array 'a'.
    a = a.reverse() ;

    // Calculate the greatest common divisor (GCD) of all elements in 'a'.
    let agcd = a[0] ;
    for ( var i = 1 ; i <= n ; i++ )
    {
        agcd = Math.abs( gcd( agcd , a[i] ) ) ;
    }

    // Divide each element in 'a' by the calculated GCD.
    a = a.map( x => x / agcd ) ;


    // Initialize an array 'ans' to store the final answer.
    var ans = [] ;

    // Filter primes that are less than or equal to 'n' and iterate through them.
    primes.filter( p => p <= n ).forEach( prime =>
    {
        // If the first element of 'a' is not divisible by the current prime, skip it.
        if ( a[0] % prime !== 0 )
            return ;

        // Check conditions for other elements based on the prime.
        for ( var i = 1 ; i < prime ; i++ )
        {
            var j = i ;
            var ajsum = 0 ;

            // Sum elements at specific indices.
            while ( j <= n )
            {
                ajsum += a[j] ;
                j += prime - 1 ;
            }

            // If the sum is not divisible by the prime, skip this prime.
            if ( ajsum % prime !== 0 )
                return ;
        }

        // If all conditions pass, add the prime to the answer list.
        ans.push( prime ) ;
    } ) ;

    // Factorize the GCD (agcd) and add its prime factors to the answer.
    var i = 0 ;
    while ( agcd > 1 && i < primes.length )
    {
        if ( agcd % primes[i] === 0 )
        {
            ans.push( primes[i] ) ;
            while( agcd % primes[i] === 0 )
            {
                agcd = agcd / primes[i] ;
            }
        }
        i += 1 ;
    }
    // If after division, agcd is still greater than 1, it must be a prime factor itself.
    if ( agcd > 1 )
    {
        ans.push( agcd ) ;
    }

    // Sort the final answer array in ascending order.
    ans.sort( ( a , b ) => a - b ) ;

    // Print unique elements of the answer array.
    var prev ;
    for ( var i = 0 ; i < ans.length ; i++ )
    {
        if ( prev !== ans[i] )
        {
            console.log( ans[i] ) ;
        }
        prev = ans[i] ;
    }
}


// Helper function to compute the Greatest Common Divisor (GCD) using Euclidean algorithm.
function gcd( a , b )
{
    if ( b === 0 )
        return a ; // Base case: if b is 0, a is the GCD
    return gcd( b , a % b ) ; // Recursive step
}


// Call the main function with input read from stdin.
main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;