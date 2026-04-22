const MOD = 10**9 + 7;
// This constant represents the modulo value often used in competitive programming
// for calculations involving large numbers to prevent overflow.
// It is set to 1,000,000,007, a common large prime number.

// The comment below provides context for the size of N:
// factors[f].e+n-1、において max(n)=10**5, max(factors[f].e)=log(M)=log(10**9)=29.89..=30
// Based on the maximum possible values for `n` (10^5) and `factors[f].e` (approx. 30),
// N is chosen to accommodate array sizes for factorials and inverse factorials.
const N = 10**5 + 30;

// Initialize two arrays, `fac` for factorials and `ifac` for inverse factorials.
// They are pre-filled with zeros and will be populated in the `init` function.
let fac = [ ... new Array(N) ].fill(0);
let ifac = [ ... new Array(N) ].fill(0);

// Helper function for modular multiplication.
// It uses a bit-shifting trick to handle large numbers and ensure intermediate products
// do not exceed standard integer limits before applying the modulo.
const mul = ( a, b ) => ( ( a >> 16 ) * b % MOD * 65536 + ( a & 65535 ) * b ) % MOD ;


// Function to perform prime factorization of a given number 'n'.
// It returns an array of objects, where each object contains a prime factor 'p'
// and its corresponding exponent 'e'.
const factorization = ( n ) => {

    let primes = [ ] ; // Array to store prime factors and their exponents.

    // Loop from 2 up to the square root of 'n'.
    for ( let i = 2 ; i * i <= n ; i ++ ) {

        let exponent = 0 ; // Initialize exponent for the current prime candidate 'i'.

        // While 'i' divides 'n', increment exponent and divide 'n' by 'i'.
        while ( n % i === 0 ) {
            n /= i ;
            exponent ++ ;
        }

        // If 'i' was a factor (exponent > 0), add it to the primes array.
        if ( exponent ) {
            primes.push( { p : i , e : exponent } ) ;
        }
    }
    
    // If 'n' is still greater than 1 after the loop, it means the remaining 'n'
    // is a prime number itself (or the original 'n' was prime).
    if ( n !== 1 ) {
        primes.push( { p : n , e : 1 } ) ;
    }

    return primes ; // Return the list of prime factors.
} ;


// Function for modular exponentiation (x^n % MOD).
// This uses the "binary exponentiation" or "exponentiation by squaring" method
// for efficiency.
const mpow = ( x, n ) => {

    let ans = 1 ; // Initialize the result to 1.
    let _x = x ; // Use a temporary variable for the base.

    // Loop until the exponent 'n' becomes 0.
    while ( n != 0 ) {

        // If the least significant bit of 'n' is 1, multiply 'ans' by '_x'.
        if ( n & 1 ) {
            ans = mul( ans, _x ) ;
        }

        // Square '_x' in each iteration.
        _x = mul( _x, _x ) ;
        // Right-shift 'n' by 1, effectively dividing it by 2.
        n = n >> 1 ;
    }

    return ans ; // Return the final modular exponentiation result.
} ;


// Function to calculate combinations (nCr) modulo MOD.
// It uses precomputed factorials and inverse factorials.
// nCr = n! / (r! * (n-r)!) = n! * (r!)^(-1) * ((n-r)!)^(-1) (mod MOD)
const comb = ( n, r ) => {

    // Base cases for combinations.
    if ( n == 0 && r == 0 ) return 1 ;
    if ( n < r || n < 0 ) return 0 ;

    // Calculate nCr using precomputed inverse factorials.
    // mul(ifac[n], mul(fac[r], ifac[n-r])) seems to be incorrect according to the formula above.
    // It should be mul(fac[n], mul(ifac[r], ifac[n-r])).
    // However, since the problem asks for a Type I clone, I must keep the original expression.
    // This implies that the original code might have a different definition or be used in a specific context.
    // For a standard nCr, it should be: return mul(fac[n], mul(ifac[r], ifac[n-r]));
    // But adhering strictly to Type I, I'm keeping the original.
    return mul( ifac[n], mul( fac[r], ifac[n-r] ) ) ;
} ;


// Function to initialize factorial and inverse factorial arrays.
// This is a one-time setup function.
const init = ( ) => {

    fac[0] = 1 ; // 0! = 1.
    ifac[0] = 1 ; // Inverse of 0! = 1.

    // Populate `fac` and `ifac` arrays up to N-1.
    for ( let i = 0 ; i < N ; i ++ ) {

        // Calculate fac[i+1] = (i+1)! = i! * (i+1)
        fac[i+1] = mul( fac[i], ( i + 1 ) ) ;

        // Calculate ifac[i+1] = ( (i+1)! )^(-1) mod MOD
        // This is done using Fermat's Little Theorem: a^(MOD-2) % MOD is a^(-1) % MOD
        ifac[i+1] = mpow( fac[i+1], MOD - 2 ) ;
    }
} ;


// Main function to process input and calculate the final answer.
const main = ( arg ) => {

    // Parse input: 'n' and 'm' from a space-separated string.
    let [ n, m ] = arg.split( " " ).map( Number ) ;

    // Perform prime factorization on 'm'.
    let factors = factorization( m ) ;

    let ans = 1 ; // Initialize the answer.

    init( ) ; // Initialize factorials and inverse factorials once.

    // Iterate over the prime factors of 'm'.
    // The `Object.keys(factors)` part is a bit unusual if `factors` is an array.
    // If `factors` is an array, `Object.keys(factors)` would return ["0", "1", "2", ...].
    // This means `f` will be the string index, not the object itself.
    // The access `factors[f].e` suggests `f` is indeed an index.
    Object.keys( factors ).forEach( f => {

        // Calculate 'a' and 'b' for the combination formula.
        // These values are derived from the problem's specific requirements.
        let a = factors[f].e + n - 1 ;
        let b = factors[f].e ;

        // Multiply the current answer by the combination C(a, b) modulo MOD.
        ans = mul( ans, comb( a, b ) ) ;
    } ) ;

    // Output the final calculated answer.
    console.log( ans ) ;
} ;


// Read input from standard input and pass it to the main function.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;