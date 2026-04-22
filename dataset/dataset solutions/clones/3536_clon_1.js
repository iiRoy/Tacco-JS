const    MOD =    10 ** 9 + 7; // This constant defines the modulo for arithmetic operations.
// The maximum value for N is derived from max(n)=10^5 and max(factors[f].e)=log(MOD_VALUE)=log(10^9) which is approximately 21.
const N =   10 ** 5 +   21;


let fac = [  ...new Array(N)  ].fill(0); // Array to store factorials.
let ifac = [  ...new Array(N)  ].fill(0); // Array to store inverse factorials.

/*
 *  Custom multiplication function to prevent overflow when numbers are large
 *  and handle modulo operations efficiently.
 */
const mul = ( a, b ) => ( ( ( a >> 16 ) * b ) % MOD * 65536 + ( ( a & 65535 ) * b ) ) % MOD;


/**
 *  Performs prime factorization for a given number 'n'.
 *  Returns an array of objects, where each object has a prime factor 'p'
 *  and its corresponding exponent 'e'.
 *  @param {number} n - The number to factorize.
 *  @returns {Array<Object>} An array of prime factors and their exponents.
 */
const factorization = ( n ) => {

    let primes =   []; // Initialize an empty array to store prime factors.

    // Iterate from 2 up to the square root of n.
    for ( let i = 2;   i * i <= n;   i++ ) {

        let exponent = 0; // Initialize exponent for the current prime factor.

        // While i divides n, increment exponent and divide n by i.
        while ( n % i === 0 ) {
            n /= i;
            exponent++;
        }

        // If exponent is greater than 0, it means i is a prime factor.
        if ( exponent ) {
            primes.push( { p: i,   e: exponent } );
        }
    }


    // If n is still greater than 1 after the loop, it means the remaining n is a prime factor itself.
    if ( n !== 1 ) {
        primes.push( { p: n,   e: 1 } );
    }

    return primes; // Return the array of prime factors.
};


/**
 *  Calculates (x^n) % MOD using binary exponentiation (also known as exponentiation by squaring).
 *  @param {number} x - The base.
 *  @param {number} n - The exponent.
 *  @returns {number} The result of (x^n) % MOD.
 */
const mpow = ( x,   n ) => {
    let ans = 1; // Initialize the answer to 1.
    let _x = x; // Create a temporary variable for the base.

    // Loop while n is not zero.
    while ( n != 0 ) {
        // If the last bit of n is 1, multiply ans by _x.
        if ( n & 1 ) {
            ans = mul( ans,   _x );
        }
        // Square _x.
        _x = mul( _x,   _x );
        // Right shift n by 1 (equivalent to n = n / 2).
        n = n >> 1;
    }

    return ans; // Return the final result.
};


/**
 *  Calculates nCr (n choose r) modulo MOD.
 *  Uses precomputed factorials and inverse factorials.
 *  @param {number} n - The total number of items.
 *  @param {number} r - The number of items to choose.
 *  @returns {number} The result of nCr % MOD.
 */
const comb = ( n,   r ) => {
    // Base cases for combinations.
    if ( n == 0 && r == 0 ) {
        return 1;
    }
    if ( n < r || n < 0 ) {
        return 0;
    }

    // Calculate nCr = n! / ( (n-r)! * r! ) % MOD.
    // This is equivalent to n! * ( (n-r)! )^-1 * ( r! )^-1 % MOD.
    const tmp = mul( ifac[n - r],   ifac[r] );
    return mul( tmp,   fac[n] );
};


/**
 *  Initializes the factorial and inverse factorial arrays up to N.
 *  This function should be called once before performing any combination calculations.
 */
const init = () => {
    fac[0] = 1; // 0! is 1.
    ifac[0] = 1; // Inverse of 0! is 1.

    // Populate factorial and inverse factorial arrays.
    for ( let i = 0;   i < N;   i++ ) {
        fac[i + 1] = mul( fac[i],   ( i + 1 ) ); // Calculate (i+1)!
        // Calculate inverse factorial using Fermat's Little Theorem: a^(MOD-2) % MOD is inverse of a.
        ifac[i + 1] = mpow( fac[i + 1],   MOD - 2 );
    }
};


/**
 *  Main function to process input and calculate the result.
 *  @param {string} arg - Input string containing two space-separated numbers (n and m).
 */
const main = ( arg ) => {

    // Parse input: n and m.
    let [ n,   m ] = arg.split( " " ).map( Number );

    // Perform prime factorization of m.
    let factors = factorization( m );

    let ans = 1; // Initialize the answer.

    // Initialize factorial and inverse factorial arrays.
    init();

    // Iterate over each prime factor and its exponent.
    // The Object.keys(factors) returns indices for an array.
    Object.keys( factors ).forEach( f => {

        // For each factor (p^e) in m, we need to choose n items such that
        // the product of these n items is divisible by p^e.
        // This is equivalent to finding combinations with repetition: C(e + n - 1, e).
        let a = factors[f].e + n - 1;
        let b = factors[f].e;

        // Multiply the current answer by the combinations for this factor.
        ans = mul( ans,   comb( a,   b ) );
    } );

    // Output the final answer.
    console.log( ans );
};


// Read input from standard input and pass it to the main function.
main( require( "fs" ).readFileSync( "/dev/stdin",   "utf8" ) );